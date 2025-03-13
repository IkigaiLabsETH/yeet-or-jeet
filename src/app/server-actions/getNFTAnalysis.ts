"use server";

import { z } from "zod";
import { getCollectionDetails, getCollectionTokens, getUserNFTs } from "@/lib/reservoir";
import {
  askNebula,
  askPerplexity,
  formatQuestionsWithClaude,
  synthesizeResponses,
} from "@/lib/helpers/ai";
import { isAddress } from "thirdweb";

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

    console.log('Gathering NFT collection data...', {
      chainId: validatedInput.chainId,
      nftAddress: validatedInput.nftAddress,
      walletAddress: validatedInput.walletAddress
    });

    // Gather all necessary data in parallel
    const [collectionDetails, userHoldings, collectionTokens] = await Promise.all([
      getCollectionDetails(validatedInput.nftAddress),
      getUserNFTs(validatedInput.walletAddress),
      getCollectionTokens(validatedInput.nftAddress),
    ]);

    const collectionHoldings = userHoldings.tokens.filter(
      token => token.token.contract.toLowerCase() === validatedInput.nftAddress.toLowerCase()
    );

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
      holdersCount: collectionTokens.tokens.length, // Use total tokens as a proxy for holders
      marketCap: (collectionDetails.floorAsk?.price?.amount?.native || 0) * (collectionDetails.tokenCount || 0),
    };

    const initialQuestion = `
      You are an NFT market analyst with access to on-chain data. Analyze this NFT collection and the user's wallet:
      
      Collection Data:
      ${JSON.stringify(analysisData)}
      
      Wallet Address: ${validatedInput.walletAddress}
      
      Please analyze:
      1. The collection's market performance and trends
      2. The user's holdings and their rarity/value
      3. Recent sales activity and price movements
      4. Collection strength and long-term potential
      5. Any red flags or concerns (wash trading, suspicious activity)
      
      Based on the market data and user's current position (if any):
      - Should they buy, hold, or sell?
      - What's the collection's growth potential?
      - How rare/valuable are their current holdings?
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