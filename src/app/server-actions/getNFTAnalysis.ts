"use server";

import { z } from "zod";
import { 
  getCollectionDetails, 
  getCollectionTokens, 
  getUserNFTs,
  getCollectionDailyVolumes,
  getCollectionTopTraders,
  type DailyVolume,
  type TopTrader,
  getCollectionBids,
  type ReservoirCollectionBid,
} from "@/lib/reservoir";
import {
  askNebula,
  askPerplexity,
  formatQuestionsWithClaude,
  synthesizeResponses,
} from "@/lib/helpers/ai";
import { isAddress } from "thirdweb";
import { getWalletStats } from "@/lib/helpers/cielo";

const inputSchema = z.object({
  chainId: z.number(),
  nftAddress: z.string(),
  walletAddress: z.string(),
});

export type NFTStartingData = {
  chainId: number;
  tokenAddress: string;
  userWalletAddress: string;
  contractABI?: string;
  name: string;
  symbol: string;
  description: string;
  floorPrice: number;
  volume24h: number;
  totalSupply: number;
  userBalance: number;
  recentTrades: Array<{
    price: number;
    timestamp: number;
  }>;
  holdersCount: number;
  marketCap: number;
  // New fields
  dailyVolumes: DailyVolume[];
  topTraders: TopTrader[];
  volumeTrend: {
    weeklyChange: number;
    monthlyChange: number;
  };
  tradingMetrics: {
    averageSalePrice: number;
    salesVelocity: number; // Sales per day
    uniqueBuyers: number;
    uniqueSellers: number;
  };
  collectionBids: ReservoirCollectionBid[];
  walletStats?: {
    realized_pnl_usd: number;
    realized_roi_percentage: number;
    tokens_traded: number;
    unrealized_pnl_usd: number;
    unrealized_roi_percentage: number;
    winrate: number;
    average_holding_time: number;
    combined_pnl_usd: number;
    combined_roi_percentage: number;
  };
};

export type NFTAnalysis = {
  summary: string;
  sections: Array<object>;
};

export type NFTAnalysisResponse =
  | {
      ok: true;
      data: NFTAnalysis;
    }
  | {
      ok: false;
      error: string;
    };

// Add type definitions for wallet stats
interface WalletStats {
  wallet: string;
  realized_pnl_usd: number;
  realized_roi_percentage: number;
  tokens_traded: number;
  unrealized_pnl_usd: number;
  unrealized_roi_percentage: number;
  winrate: number;
  average_holding_time: number;
  combined_pnl_usd: number;
  combined_roi_percentage: number;
}

interface WalletAnalysis {
  tradingProfile: {
    experience: "expert" | "experienced" | "intermediate" | "beginner" | "unknown";
    riskLevel: "conservative" | "moderate" | "aggressive" | "highly aggressive" | "unknown";
    averageHoldingPeriod: number;
    successRate: number;
  };
  performance: {
    totalPnL: number;
    averageROI: number;
    realizedPnL: number;
    unrealizedPnL: number;
  };
  riskMetrics: {
    winRate: number;
    averageHoldTime: number;
    tokensTraded: number;
    profitabilityScore: number;
  };
}

export async function getNFTAnalysis(input: z.infer<typeof inputSchema>): Promise<NFTAnalysisResponse> {
  try {
    const validatedInput = inputSchema.parse(input);

    // Input validation
    if (!isAddress(validatedInput.nftAddress)) {
      return {
        ok: false,
        error: "Invalid NFT collection address",
      };
    }

    if (!isAddress(validatedInput.walletAddress)) {
      return {
        ok: false,
        error: "Invalid wallet address",
      };
    }

    console.log('Gathering NFT collection and wallet data...', {
      chainId: validatedInput.chainId,
      nftAddress: validatedInput.nftAddress,
      walletAddress: validatedInput.walletAddress
    });

    // Fetch all data in parallel for better performance
    const [
      collectionDetails,
      userHoldings,
      collectionTokens,
      dailyVolumes,
      topTraders,
      collectionBids,
      walletStats
    ] = await Promise.all([
      getCollectionDetails(validatedInput.nftAddress),
      getUserNFTs(validatedInput.walletAddress),
      getCollectionTokens(validatedInput.nftAddress),
      getCollectionDailyVolumes(validatedInput.nftAddress),
      getCollectionTopTraders(validatedInput.nftAddress),
      getCollectionBids(validatedInput.nftAddress, 50),
      getWalletStats(validatedInput.walletAddress, "ethereum", "max") // Add wallet stats
    ]);

    const collectionHoldings = userHoldings.tokens.filter(
      token => token.token.contract.toLowerCase() === validatedInput.nftAddress.toLowerCase()
    );

    // Calculate volume trends
    const volumeTrend = calculateVolumeTrends(dailyVolumes);
    
    // Calculate trading metrics
    const tradingMetrics = calculateTradingMetrics(dailyVolumes, topTraders);

    // Prepare comprehensive data for AI analysis
    const analysisData: NFTStartingData = {
      chainId: validatedInput.chainId,
      tokenAddress: validatedInput.nftAddress,
      userWalletAddress: validatedInput.walletAddress,
      name: collectionDetails.name || "Unknown Collection",
      symbol: collectionDetails.symbol || "???",
      description: collectionDetails.description || "",
      floorPrice: collectionDetails.floorAsk?.price?.amount?.native || 0,
      volume24h: collectionDetails.volume24h || 0,
      totalSupply: collectionDetails.tokenCount || 0,
      userBalance: collectionHoldings.length,
      recentTrades: collectionTokens.tokens
        .filter(t => t.token.attributes?.some(attr => attr.key === 'lastSalePrice'))
        .map(t => ({
          price: Number(t.token.attributes?.find(attr => attr.key === 'lastSalePrice')?.value || 0),
          timestamp: Date.now(), // Use current timestamp as fallback
        }))
        .slice(0, 5),
      holdersCount: collectionTokens.tokens.length,
      marketCap: (collectionDetails.floorAsk?.price?.amount?.native || 0) * (collectionDetails.tokenCount || 0),
      // New data
      dailyVolumes,
      topTraders,
      volumeTrend,
      tradingMetrics,
      collectionBids: collectionBids.bids,
      walletStats: walletStats || undefined,
    };

    // Enhanced analysis with bid data and wallet performance
    const bidAnalysis = analyzeBids(analysisData.collectionBids);
    const walletAnalysis = analyzeWalletPerformance(walletStats);
    
    const initialQuestion = `
      You are an NFT market analyst with access to on-chain data and wallet performance history. 
      Analyze this NFT collection and the user's wallet:
      
      Collection Data:
      ${JSON.stringify({
        ...analysisData,
        bidMetrics: bidAnalysis,
        walletMetrics: walletAnalysis
      })}
      
      Wallet Address: ${validatedInput.walletAddress}
      
      Please analyze:
      1. The collection's market performance and trends
         - Volume trends (daily, weekly, monthly changes)
         - Trading velocity and liquidity
         - Price movements relative to market conditions
         - Bid-ask spread and floor bid analysis
      
      2. Trading patterns and whale activity
         - Top trader behaviors
         - Accumulation/distribution patterns
         - Wash trading indicators
         - Bidding patterns and concentration
      
      3. User's trading profile and holdings analysis
         - Overall trading performance (PnL, ROI, winrate)
         - Average holding periods and exit timing
         - Position value relative to floor
         - Historical performance in similar collections
         - Active bid opportunities
         - Risk management patterns
      
      4. Collection strength indicators
         - Holder distribution
         - Trading consistency
         - Community engagement
         - Relative market position
         - Bid depth and quality
      
      5. Risk assessment
         - Market manipulation indicators
         - Liquidity concerns
         - Whale concentration
         - Volume sustainability
         - Bid validity and reliability
         - User's risk profile alignment
      
      Based on the market data, wallet history, and user's current position:
      - Specific buy/hold/sell recommendation with price targets
      - Position sizing suggestion based on past performance
      - Risk mitigation strategies aligned with user's trading style
      - Potential catalysts and warning signs to monitor
      - Optimal bid/offer strategies considering user's track record
    `;

    console.log("Formatting questions with Claude");
    const questions = await formatQuestionsWithClaude(initialQuestion);

    if (!questions) {
      console.error("Failed to format questions with Claude");
      return {
        ok: false,
        error: "Failed to analyze NFT collection",
      };
    }

    console.log("Getting AI analysis...");
    const [nebulaAnswer, perplexityAnswer] = await Promise.all([
      askNebula(
        questions.nebulaQuestion,
        validatedInput.chainId,
        validatedInput.nftAddress,
        validatedInput.walletAddress,
      ),
      askPerplexity(questions.perplexityQuestion),
    ]);

    if (!nebulaAnswer && !perplexityAnswer) {
      console.error("AI services failed to respond");
      return {
        ok: false,
        error: "Failed to get AI analysis",
      };
    }

    console.log("Synthesizing AI responses");
    const synthesis = await synthesizeResponses(
      {
        chainId: analysisData.chainId,
        tokenAddress: analysisData.tokenAddress,
        userWalletAddress: analysisData.userWalletAddress,
      },
      nebulaAnswer || "",
      perplexityAnswer || "",
    );

    if (!synthesis) {
      console.error("Failed to synthesize responses");
      return {
        ok: false,
        error: "Failed to synthesize AI analysis",
      };
    }

    // Clean and parse the synthesis
    const cleanedSynthesis = synthesis
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .replace(/\\n/g, "\\n")
      .replace(/\\"/g, '\\"')
      .trim();

    try {
      const parsedSynthesis = JSON.parse(cleanedSynthesis) as NFTAnalysis;

      if (!parsedSynthesis.sections || !Array.isArray(parsedSynthesis.sections)) {
        throw new Error("Invalid synthesis structure");
      }

      console.log("NFT analysis completed successfully");
      return {
        ok: true,
        data: parsedSynthesis,
      };
    } catch (error) {
      console.error("Failed to parse analysis results:", error);
      return {
        ok: false,
        error: "Failed to parse analysis results",
      };
    }
  } catch (error) {
    console.error("Error in getNFTAnalysis:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

function calculateVolumeTrends(dailyVolumes: DailyVolume[]): { weeklyChange: number; monthlyChange: number } {
  if (!dailyVolumes.length) {
    return { weeklyChange: 0, monthlyChange: 0 };
  }

  // Sort volumes by date
  const sortedVolumes = [...dailyVolumes].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate weekly change
  const weeklyVolumes = sortedVolumes.slice(0, 7);
  const thisWeek = weeklyVolumes.reduce((sum, day) => sum + day.volume, 0);
  const lastWeek = sortedVolumes.slice(7, 14).reduce((sum, day) => sum + day.volume, 0);
  const weeklyChange = lastWeek ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;

  // Calculate monthly change
  const thisMonth = sortedVolumes.slice(0, 30).reduce((sum, day) => sum + day.volume, 0);
  const lastMonth = sortedVolumes.slice(30, 60).reduce((sum, day) => sum + day.volume, 0);
  const monthlyChange = lastMonth ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  return { weeklyChange, monthlyChange };
}

function calculateTradingMetrics(dailyVolumes: DailyVolume[], topTraders: TopTrader[]) {
  const recentVolumes = dailyVolumes.slice(0, 30); // Last 30 days

  const averageSalePrice = recentVolumes.reduce((sum, day) => {
    return day.salesCount > 0 ? sum + (day.volume / day.salesCount) : sum;
  }, 0) / recentVolumes.length;

  const salesVelocity = recentVolumes.reduce((sum, day) => sum + day.salesCount, 0) / recentVolumes.length;

  const uniqueBuyers = new Set(topTraders.filter(t => t.totalBought > 0).map(t => t.address)).size;
  const uniqueSellers = new Set(topTraders.filter(t => t.totalSold > 0).map(t => t.address)).size;

  return {
    averageSalePrice,
    salesVelocity,
    uniqueBuyers,
    uniqueSellers,
  };
}

function analyzeBids(bids: ReservoirCollectionBid[] | undefined) {
  try {
    // Handle undefined or null bids array
    if (!bids || !Array.isArray(bids)) {
      console.warn('No bids data available for analysis');
      return {
        uniqueBidders: 0,
        distribution: {
          min: 0,
          max: 0,
          average: 0,
          floorBid: 0
        },
        averageBidSize: 0,
        validityAnalysis: {
          active: 0,
          expired: 0,
          averageValidityPeriod: 0
        }
      };
    }

    // Filter out any invalid bid entries
    const validBidEntries = bids.filter(bid => 
      bid && 
      bid.maker && 
      bid.price?.amount?.usd !== undefined &&
      bid.validUntil !== undefined &&
      bid.validFrom !== undefined
    );

    if (validBidEntries.length === 0) {
      console.warn('No valid bids found for analysis');
      return {
        uniqueBidders: 0,
        distribution: {
          min: 0,
          max: 0,
          average: 0,
          floorBid: 0
        },
        averageBidSize: 0,
        validityAnalysis: {
          active: 0,
          expired: 0,
          averageValidityPeriod: 0
        }
      };
    }

    const uniqueBidders = new Set(validBidEntries.map(bid => bid.maker)).size;
    const currentTime = Date.now() / 1000;
    const validBids = validBidEntries.filter(bid => bid.validUntil > currentTime);
    
    const bidPrices = validBids.map(bid => bid.price.amount.usd);
    const distribution = {
      min: bidPrices.length ? Math.min(...bidPrices) : 0,
      max: bidPrices.length ? Math.max(...bidPrices) : 0,
      average: bidPrices.length ? bidPrices.reduce((a, b) => a + b, 0) / bidPrices.length : 0,
      floorBid: bidPrices.length ? Math.min(...bidPrices) : 0
    };

    return {
      uniqueBidders,
      distribution,
      averageBidSize: validBids.length 
        ? validBids.reduce((acc, bid) => acc + (bid.quantityRemaining || 0), 0) / validBids.length 
        : 0,
      validityAnalysis: {
        active: validBids.length,
        expired: validBidEntries.length - validBids.length,
        averageValidityPeriod: validBids.length
          ? validBids.reduce((acc, bid) => acc + (bid.validUntil - bid.validFrom), 0) / validBids.length
          : 0
      }
    };
  } catch (error) {
    console.error('Error analyzing bids:', error);
    return {
      uniqueBidders: 0,
      distribution: {
        min: 0,
        max: 0,
        average: 0,
        floorBid: 0
      },
      averageBidSize: 0,
      validityAnalysis: {
        active: 0,
        expired: 0,
        averageValidityPeriod: 0
      }
    };
  }
}

function analyzeWalletPerformance(walletStats: WalletStats | null): WalletAnalysis {
  if (!walletStats) {
    return {
      tradingProfile: {
        experience: "unknown",
        riskLevel: "unknown",
        averageHoldingPeriod: 0,
        successRate: 0
      },
      performance: {
        totalPnL: 0,
        averageROI: 0,
        realizedPnL: 0,
        unrealizedPnL: 0
      },
      riskMetrics: {
        winRate: 0,
        averageHoldTime: 0,
        tokensTraded: 0,
        profitabilityScore: 0
      }
    };
  }

  const profitabilityScore = calculateProfitabilityScore(walletStats);

  return {
    tradingProfile: {
      experience: categorizeTradingExperience(walletStats.tokens_traded),
      riskLevel: categorizeRiskLevel(walletStats.winrate, walletStats.average_holding_time),
      averageHoldingPeriod: walletStats.average_holding_time,
      successRate: walletStats.winrate
    },
    performance: {
      totalPnL: walletStats.combined_pnl_usd,
      averageROI: walletStats.combined_roi_percentage,
      realizedPnL: walletStats.realized_pnl_usd,
      unrealizedPnL: walletStats.unrealized_pnl_usd
    },
    riskMetrics: {
      winRate: walletStats.winrate,
      averageHoldTime: walletStats.average_holding_time,
      tokensTraded: walletStats.tokens_traded,
      profitabilityScore
    }
  };
}

function calculateProfitabilityScore(stats: WalletStats): number {
  if (!stats) return 0;
  
  // Weighted scoring system
  const weights = {
    winRate: 0.3,
    roi: 0.3,
    consistency: 0.2,
    volume: 0.2
  };

  const winRateScore = Math.min(stats.winrate / 100, 1);
  const roiScore = Math.min(Math.max(stats.combined_roi_percentage / 200, 0), 1);
  const consistencyScore = Math.min(stats.average_holding_time / (7 * 24 * 60 * 60), 1); // Normalize to 7 days
  const volumeScore = Math.min(stats.tokens_traded / 100, 1);

  return (
    winRateScore * weights.winRate +
    roiScore * weights.roi +
    consistencyScore * weights.consistency +
    volumeScore * weights.volume
  );
}

function categorizeTradingExperience(tokensTraded: number): WalletAnalysis['tradingProfile']['experience'] {
  if (tokensTraded >= 1000) return "expert";
  if (tokensTraded >= 100) return "experienced";
  if (tokensTraded >= 10) return "intermediate";
  return "beginner";
}

function categorizeRiskLevel(winRate: number, avgHoldTime: number): WalletAnalysis['tradingProfile']['riskLevel'] {
  const riskScore = (winRate / 100) * 0.7 + (Math.min(avgHoldTime / (30 * 24 * 60 * 60), 1)) * 0.3;
  if (riskScore >= 0.8) return "conservative";
  if (riskScore >= 0.6) return "moderate";
  if (riskScore >= 0.4) return "aggressive";
  return "highly aggressive";
} 