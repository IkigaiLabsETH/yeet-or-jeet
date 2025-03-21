const RESERVOIR_API_KEY = process.env.NEXT_PUBLIC_RESERVOIR_API_KEY;
const RESERVOIR_API_BASE = "https://api.reservoir.tools";

// Common headers for all Reservoir API requests
const getHeaders = () => {
  if (!RESERVOIR_API_KEY) {
    console.error('Reservoir API Key is missing! Please check your environment variables.');
  }
  
  const headers = {
    'accept': '*/*',
    'x-api-key': RESERVOIR_API_KEY || "",
  };
  
  console.log('Request Headers:', headers);
  return headers;
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
  volume30d: number;
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

export interface DailyVolume {
  date: string;
  volume: number;
  rank: number;
  salesCount: number;
}

export interface TopTrader {
  address: string;
  totalBought: number;
  totalSold: number;
  totalSpent: number;
  totalReceived: number;
  netAmount: number;
  tradesCount: number;
}

export interface ReservoirCollectionBid {
  id: string;
  price: {
    currency: {
      contract: string;
      name: string;
      symbol: string;
      decimals: number;
    };
    amount: {
      raw: string;
      decimal: number;
      usd: number;
      native: number;
    };
  };
  maker: string;
  validFrom: number;
  validUntil: number;
  quantityRemaining: number;
  source: {
    domain: string;
    name: string;
    icon: string;
  };
}

export interface ReservoirCollectionBidsResponse {
  bids: ReservoirCollectionBid[];
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
      console.error('API Key Missing:', {
        key: RESERVOIR_API_KEY,
        envValue: process.env.NEXT_PUBLIC_RESERVOIR_API_KEY
      });
      throw new Error('Reservoir API key is not configured');
    }

    // Build URL with parameters
    const url = new URL(`${RESERVOIR_API_BASE}/collections/v7`);
    url.searchParams.append('sortBy', '1DayVolume');  // Get top collections by 24h volume first
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('includeTopBid', 'true');
    url.searchParams.append('sortDirection', 'desc');
    
    console.log('API Request:', {
      url: url.toString(),
      apiKeyPresent: !!RESERVOIR_API_KEY,
      apiKeyPrefix: RESERVOIR_API_KEY?.substring(0, 8)
    });
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: url.toString()
      });
      throw new Error(`Reservoir API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data.collections)) {
      console.error('Invalid API Response Structure:', data);
      throw new Error('Invalid API response format');
    }

    // Filter out collections with missing critical data
    const validCollections = data.collections.filter((collection: ReservoirCollection) => 
      collection.primaryContract && 
      collection.name &&
      collection.symbol
    );

    // Fetch 30-day volumes for each collection in parallel
    const collectionsWithVolumes = await Promise.all(
      validCollections.map(async (collection: ReservoirCollection) => {
        try {
          const dailyVolumesUrl = new URL(`${RESERVOIR_API_BASE}/collections/daily-volumes/v1`);
          dailyVolumesUrl.searchParams.append('collection', collection.primaryContract);
          
          const volumeResponse = await fetch(dailyVolumesUrl, {
            headers: getHeaders(),
          });

          if (!volumeResponse.ok) {
            console.warn(`Failed to fetch daily volumes for ${collection.name}:`, volumeResponse.statusText);
            return collection;
          }

          const volumeData = await volumeResponse.json();
          const thirtyDayVolume = (volumeData.volumes || [])
            .slice(0, 30)
            .reduce((sum: number, day: DailyVolume) => sum + (day.volume || 0), 0);

          return {
            ...collection,
            volume30d: thirtyDayVolume
          };
        } catch (error) {
          console.warn(`Error fetching daily volumes for ${collection.name}:`, error);
          return collection;
        }
      })
    );

    // Sort collections by 30-day volume
    const sortedCollections = collectionsWithVolumes.sort((a, b) => 
      (b.volume30d || 0) - (a.volume30d || 0)
    );

    console.log('Collections with 30d volumes:', {
      total: sortedCollections.length,
      sample: sortedCollections.slice(0, 2).map(c => ({
        name: c.name,
        volume30d: c.volume30d,
        floor: c.floorAsk?.price?.amount?.native
      }))
    });

    if (sortedCollections.length === 0) {
      console.warn('No valid collections found in response');
      throw new Error('No valid collections found');
    }

    return sortedCollections;
  } catch (error) {
    console.error('Trending Collections Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
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

export async function getCollectionDailyVolumes(collectionId: string): Promise<DailyVolume[]> {
  try {
    const response = await fetch(
      `https://api.reservoir.tools/collections/daily-volumes/v1?collection=${collectionId}`,
      {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_RESERVOIR_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch daily volumes: ${response.statusText}`);
    }

    const data = await response.json();
    return data.volumes || [];
  } catch (error) {
    console.error('Error fetching daily volumes:', error);
    return [];
  }
}

export async function getCollectionTopTraders(collectionId: string): Promise<TopTrader[]> {
  try {
    const response = await fetch(
      `https://api.reservoir.tools/collections/${collectionId}/top-traders/v1`,
      {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_RESERVOIR_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch top traders: ${response.statusText}`);
    }

    const data = await response.json();
    return data.traders || [];
  } catch (error) {
    console.error('Error fetching top traders:', error);
    return [];
  }
}

export const getCollectionBids = async (
  collectionId: string,
  limit: number = 20
): Promise<ReservoirCollectionBidsResponse> => {
  try {
    console.log(`Fetching bids for collection ${collectionId}...`);
    const response = await fetch(
      `${RESERVOIR_API_BASE}/collections/${collectionId}/bids/v1?limit=${limit}`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch collection bids: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.bids?.length || 0} bids for collection ${collectionId}`);
    return data;
  } catch (error) {
    console.error('Error fetching collection bids:', error);
    return { bids: [] };
  }
};

/**
 * Get stats for a curated collection using the collections/v7 endpoint
 * @param collectionId Collection identifier (slug)
 * @returns Collection stats and metadata
 */
export async function getCuratedCollectionStats(collectionId: string) {
  try {
    if (!collectionId) {
      throw new Error('Collection ID is required');
    }

    const url = new URL(`${RESERVOIR_API_BASE}/collections/v7/${encodeURIComponent(collectionId)}`);
    
    const response = await fetch(url, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Curated Collection Stats Error:', {
        collectionId,
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch curated collection stats: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Reservoir data for ${collectionId}:`, JSON.stringify(data, null, 2));

    if (!data.collection) {
      throw new Error(`No collection data found for ${collectionId}`);
    }

    const collection = data.collection;
    const floorPrice = collection.floorAsk?.price?.amount?.native || 0;
    const totalSupply = collection.tokenCount || 0;
    const marketCap = floorPrice * totalSupply;

    return {
      floorPrice,
      totalVolume: collection.volume?.allTime || 0,
      marketCap,
      volume24h: collection.volume?.["1day"] || 0,
      imageUrl: collection.image || collection.imageUrl || null,
      tokenCount: totalSupply,
      name: collection.name,
      description: collection.description,
      totalSales: collection.salesCount || 0,
      floorAsk: collection.floorAsk,
      topBid: collection.topBid
    };
  } catch (error) {
    console.error('Error fetching curated collection stats:', error);
    throw error;
  }
} 