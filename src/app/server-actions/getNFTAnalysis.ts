import { z } from "zod";

const CIELO_API_KEY = process.env.CIELO_API_KEY;
const CIELO_API_BASE = "https://feed-api.cielo.finance/api/v1";

const inputSchema = z.object({
  chainId: z.number(),
  nftAddress: z.string(),
  walletAddress: z.string(),
});

export async function getNFTAnalysis(input: z.infer<typeof inputSchema>) {
  try {
    const validatedInput = inputSchema.parse(input);

    // First, get NFT collection stats
    const collectionStatsUrl = `${CIELO_API_BASE}/nft/${validatedInput.nftAddress}/stats`;
    const collectionStatsResponse = await fetch(collectionStatsUrl, {
      headers: {
        accept: "application/json",
        "X-API-KEY": CIELO_API_KEY || "",
      },
    });

    if (!collectionStatsResponse.ok) {
      console.error("Failed to fetch NFT collection stats:", await collectionStatsResponse.text());
      return { ok: false, error: "Failed to fetch NFT collection stats" };
    }

    const collectionStats = await collectionStatsResponse.json();

    // Then, get wallet's NFT holdings
    const walletHoldingsUrl = `${CIELO_API_BASE}/${validatedInput.walletAddress}/nft/holdings`;
    const walletHoldingsResponse = await fetch(walletHoldingsUrl, {
      headers: {
        accept: "application/json",
        "X-API-KEY": CIELO_API_KEY || "",
      },
    });

    if (!walletHoldingsResponse.ok) {
      console.error("Failed to fetch wallet NFT holdings:", await walletHoldingsResponse.text());
      return { ok: false, error: "Failed to fetch wallet NFT holdings" };
    }

    const walletHoldings = await walletHoldingsResponse.json();

    // Format the response
    return {
      ok: true,
      data: {
        sections: [
          {
            section: "inputs",
            nftInfo: {
              address: validatedInput.nftAddress,
              name: collectionStats.name || "Unknown Collection",
              symbol: collectionStats.symbol || "???",
              floorPrice: collectionStats.floor_price_eth?.toString() || "0",
              totalVolume: collectionStats.total_volume_eth?.toString() || "0",
            },
            walletInfo: {
              address: validatedInput.walletAddress,
              balance: "0", // TODO: Get ETH balance
              holdings: walletHoldings.length.toString() || "0",
            },
          },
          {
            section: "verdict",
            type: "hold", // TODO: Implement AI decision making
            title: "Analysis in Progress",
            description: "Detailed NFT analysis coming soon",
            actions: [],
          },
          {
            section: "details",
            content: `# NFT Collection Analysis

## Collection Overview
- Name: ${collectionStats.name || "Unknown Collection"}
- Floor Price: ${collectionStats.floor_price_eth || 0} ETH
- Total Volume: ${collectionStats.total_volume_eth || 0} ETH
- Unique Holders: ${collectionStats.num_owners || 0}

## Your Holdings
- Number of NFTs: ${walletHoldings.length || 0}
${walletHoldings.map((nft: any) => `- Token ID: ${nft.token_id}`).join('\n')}

## Market Analysis
Coming soon...
`,
          },
        ],
      },
    };
  } catch (error) {
    console.error("Error in getNFTAnalysis:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
} 