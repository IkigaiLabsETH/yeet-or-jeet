import { z } from "zod";
import { getCollectionDetails, getCollectionTokens, getUserNFTs } from "@/lib/reservoir";

const inputSchema = z.object({
  chainId: z.number(),
  nftAddress: z.string(),
  walletAddress: z.string(),
});

export async function getNFTAnalysis(input: z.infer<typeof inputSchema>) {
  try {
    const validatedInput = inputSchema.parse(input);

    console.log('Fetching NFT analysis data...', {
      chainId: validatedInput.chainId,
      nftAddress: validatedInput.nftAddress,
      walletAddress: validatedInput.walletAddress
    });

    // Get collection details
    const collectionDetails = await getCollectionDetails(validatedInput.nftAddress);
    console.log('Collection details fetched:', {
      name: collectionDetails.name,
      symbol: collectionDetails.symbol,
      floorPrice: collectionDetails.floorAsk?.price?.amount?.native
    });

    // Get user's NFT holdings
    const userHoldings = await getUserNFTs(validatedInput.walletAddress);
    const collectionHoldings = userHoldings.tokens.filter(
      token => token.token.contract.toLowerCase() === validatedInput.nftAddress.toLowerCase()
    );

    console.log('User holdings fetched:', {
      totalNFTs: userHoldings.tokens.length,
      collectionNFTs: collectionHoldings.length
    });

    // Get collection tokens for analysis
    const collectionTokens = await getCollectionTokens(validatedInput.nftAddress);
    console.log('Collection tokens fetched:', {
      count: collectionTokens.tokens.length
    });

    // Format the response
    return {
      ok: true,
      data: {
        sections: [
          {
            section: "inputs",
            nftInfo: {
              address: validatedInput.nftAddress,
              name: collectionDetails.name || "Unknown Collection",
              symbol: collectionDetails.symbol || "???",
              floorPrice: collectionDetails.floorAsk?.price?.amount?.native?.toString() || "0",
              totalVolume: collectionDetails.volume24h?.toString() || "0",
            },
            walletInfo: {
              address: validatedInput.walletAddress,
              balance: "0", // ETH balance not needed for now
              holdings: collectionHoldings.length.toString(),
            },
          },
          {
            section: "verdict",
            type: collectionDetails.volume24h > 100 ? "buy" : "hold",
            title: "Collection Analysis",
            description: `${collectionDetails.name} shows ${collectionDetails.volume24h > 100 ? "strong" : "moderate"} trading activity with ${collectionDetails.volume24h} ETH 24h volume.`,
            actions: [],
          },
          {
            section: "details",
            content: `# NFT Collection Analysis

## Collection Overview
- Name: ${collectionDetails.name || "Unknown Collection"}
- Symbol: ${collectionDetails.symbol || "???"}
- Floor Price: ${collectionDetails.floorAsk?.price?.amount?.native || 0} ETH
- 24h Volume: ${collectionDetails.volume24h || 0} ETH
- Total Supply: ${collectionDetails.tokenCount || 0} NFTs

## Your Holdings
- Number of NFTs: ${collectionHoldings.length}
${collectionHoldings.map(nft => `- Token ID: ${nft.token.tokenId}`).join('\n')}

## Market Analysis
- Floor Price: ${collectionDetails.floorAsk?.price?.amount?.native || 0} ETH
- 24h Volume: ${collectionDetails.volume24h || 0} ETH
- Total Supply: ${collectionDetails.tokenCount || 0} NFTs
${collectionDetails.description ? `\n## Collection Description\n${collectionDetails.description}` : ''}
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