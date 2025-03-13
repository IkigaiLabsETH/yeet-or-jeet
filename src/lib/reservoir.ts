const RESERVOIR_API_KEY = process.env.NEXT_PUBLIC_RESERVOIR_API_KEY;
const RESERVOIR_API_BASE = "https://api.reservoir.tools";

// Types for Reservoir API responses
export interface ReservoirCollection {
  id: string;
  name: string;
  symbol: string;
  image?: string;
  floorAsk: {
    price: {
      amount: {
        native: number;
      };
    };
  };
  volume24h: number;
  tokenCount: number;
  description?: string;
  primaryContract: string;
  attributes?: {
    key: string;
    kind: string;
    count: number;
  }[];
}

export interface ReservoirToken {
  token: {
    contract: string;
    tokenId: string;
    name: string;
    image?: string;
    collection: {
      id: string;
      name: string;
    };
    attributes?: {
      key: string;
      value: string;
    }[];
  };
  market: {
    floorAsk: {
      price: {
        amount: {
          native: number;
        };
      };
    };
  };
}

/**
 * Get trending NFT collections
 * @param limit Number of collections to return
 * @returns Array of trending collections
 */
export async function getTrendingCollections(limit = 12): Promise<ReservoirCollection[]> {
  try {
    const response = await fetch(
      `${RESERVOIR_API_BASE}/collections/v7?sortBy=volume&limit=${limit}`,
      {
        headers: {
          'accept': '*/*',
          'x-api-key': RESERVOIR_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch trending collections: ${response.status}`);
    }

    const data = await response.json();
    return data.collections;
  } catch (error) {
    console.error('Error fetching trending collections:', error);
    throw error;
  }
}

/**
 * Get collection details by contract address
 * @param contract Collection contract address
 * @returns Collection details
 */
export async function getCollectionDetails(contract: string): Promise<ReservoirCollection> {
  try {
    const response = await fetch(
      `${RESERVOIR_API_BASE}/collections/v7?contract=${contract}`,
      {
        headers: {
          'accept': '*/*',
          'x-api-key': RESERVOIR_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch collection details: ${response.status}`);
    }

    const data = await response.json();
    return data.collections[0];
  } catch (error) {
    console.error('Error fetching collection details:', error);
    throw error;
  }
}

/**
 * Get tokens from a collection
 * @param contract Collection contract address
 * @param limit Number of tokens to return
 * @param continuation Token for pagination
 * @returns Array of tokens and pagination info
 */
export async function getCollectionTokens(
  contract: string,
  limit = 20,
  continuation?: string
) {
  try {
    const url = new URL(`${RESERVOIR_API_BASE}/tokens/v7`);
    url.searchParams.append('contract', contract);
    url.searchParams.append('limit', limit.toString());
    if (continuation) {
      url.searchParams.append('continuation', continuation);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'accept': '*/*',
        'x-api-key': RESERVOIR_API_KEY || "",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch collection tokens: ${response.status}`);
    }

    const data = await response.json();
    return {
      tokens: data.tokens as ReservoirToken[],
      continuation: data.continuation,
    };
  } catch (error) {
    console.error('Error fetching collection tokens:', error);
    throw error;
  }
}

/**
 * Get collection stats
 * @param contract Collection contract address
 * @returns Collection statistics
 */
export async function getCollectionStats(contract: string) {
  try {
    const response = await fetch(
      `${RESERVOIR_API_BASE}/stats/v2?collection=${contract}`,
      {
        headers: {
          'accept': '*/*',
          'x-api-key': RESERVOIR_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch collection stats: ${response.status}`);
    }

    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Error fetching collection stats:', error);
    throw error;
  }
}

/**
 * Search for collections
 * @param query Search query
 * @param limit Number of results to return
 * @returns Array of matching collections
 */
export async function searchCollections(query: string, limit = 10) {
  try {
    const response = await fetch(
      `${RESERVOIR_API_BASE}/search/collections/v2?name=${encodeURIComponent(query)}&limit=${limit}`,
      {
        headers: {
          'accept': '*/*',
          'x-api-key': RESERVOIR_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to search collections: ${response.status}`);
    }

    const data = await response.json();
    return data.collections;
  } catch (error) {
    console.error('Error searching collections:', error);
    throw error;
  }
}

/**
 * Get user's NFT holdings
 * @param address User's wallet address
 * @param limit Number of results to return
 * @param continuation Token for pagination
 * @returns Array of tokens owned by the user
 */
export async function getUserNFTs(
  address: string,
  limit = 20,
  continuation?: string
) {
  try {
    const url = new URL(`${RESERVOIR_API_BASE}/users/${address}/tokens/v7`);
    url.searchParams.append('limit', limit.toString());
    if (continuation) {
      url.searchParams.append('continuation', continuation);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'accept': '*/*',
        'x-api-key': RESERVOIR_API_KEY || "",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user NFTs: ${response.status}`);
    }

    const data = await response.json();
    return {
      tokens: data.tokens as ReservoirToken[],
      continuation: data.continuation,
    };
  } catch (error) {
    console.error('Error fetching user NFTs:', error);
    throw error;
  }
} 