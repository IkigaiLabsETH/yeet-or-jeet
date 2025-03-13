const RESERVOIR_API_KEY = process.env.NEXT_PUBLIC_RESERVOIR_API_KEY;
const RESERVOIR_API_BASE = "https://api.reservoir.tools";

// Common headers for all Reservoir API requests
const getHeaders = () => {
  if (!RESERVOIR_API_KEY) {
    console.error('Reservoir API Key is missing! Please check your environment variables.');
  }
  
  return {
    'accept': '*/*',
    'x-api-key': RESERVOIR_API_KEY || "",
    'Content-Type': 'application/json',
  };
};

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
    // Validate API key
    if (!RESERVOIR_API_KEY) {
      throw new Error('Reservoir API key is not configured');
    }

    // Build URL with parameters
    const url = new URL(`${RESERVOIR_API_BASE}/collections/v7`);
    url.searchParams.append('sortBy', 'volume1h');  // Sort by 1h volume for more active collections
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('includeTopBid', 'true');  // Include top bid information
    url.searchParams.append('normalizeRoyalties', 'true');  // Normalize royalties across collections
    
    console.log('Fetching trending collections from Reservoir...', {
      url: url.toString(),
      apiKeyPresent: !!RESERVOIR_API_KEY,
    });
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      mode: 'cors',
      cache: 'no-cache',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Reservoir API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText,
        url: response.url
      });
      throw new Error(`Reservoir API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data.collections)) {
      console.error('Invalid API Response:', data);
      throw new Error('Invalid API response format');
    }

    // Filter out collections with missing critical data
    const validCollections = data.collections.filter((collection: ReservoirCollection) => 
      collection.primaryContract && 
      collection.name &&
      collection.symbol &&
      (collection.volume24h > 0 || collection.floorAsk?.price?.amount?.native > 0)
    );

    if (validCollections.length === 0) {
      console.warn('No valid collections found in API response');
      throw new Error('No valid collections found');
    }

    console.log('Successfully fetched collections:', {
      totalCount: data.collections.length,
      validCount: validCollections.length,
      firstCollection: validCollections[0]
    });

    return validCollections;
  } catch (error) {
    console.error('Error fetching trending collections:', {
      error,
      stack: error instanceof Error ? error.stack : undefined
    });
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
    if (!contract) {
      throw new Error('Contract address is required');
    }

    const url = new URL(`${RESERVOIR_API_BASE}/collections/v7`);
    url.searchParams.append('contract', contract);
    url.searchParams.append('includeTopBid', 'true');
    url.searchParams.append('normalizeRoyalties', 'true');

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      mode: 'cors',
      cache: 'no-cache',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Collection Details Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch collection details: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.collections?.[0]) {
      throw new Error('Collection not found');
    }

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