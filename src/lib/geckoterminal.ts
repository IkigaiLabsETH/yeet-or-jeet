/* eslint-disable @typescript-eslint/no-explicit-any */
const BASE_URL = "https://api.geckoterminal.com/api/v2";
const API_VERSION = "20230302";

// TODO - remove explicit any, add proper types

const geckoNetworkMap: { [key: number]: string } = {
  1: "ethereum",
  // 137: "polygon_pos",
  // 42161: "arbitrum",
  // 10: "optimism",
  // 8453: "base",
  80094: "berachain",
  // 43114: "avalanche",
  // 56: "bsc",
  // 81457: "blast",
  // 42220: "celo",
  // 324: "zksync",
};

interface TokenInfoPool {
  address: string;
  name: string;
  volume_24h: number;
  liquidity: number;
  relationships: {
    baseToken: string;
    quoteToken: string;
  };
}

interface TokenPriceInfo {
  price_usd: string;
  price_change_24h: number;
  price_change_7d: number;
  price_change_30d: number;
  volume_24h: number;
  market_cap_usd: number;
}

interface TokenMarketData {
  price: TokenPriceInfo;
  market_data: {
    market_cap_usd: number;
    volume_24h: number;
    price_change_24h: number;
    price_change_7d: number;
    price_change_30d: number;
  };
  liquidity: {
    total_liquidity_usd: number;
    liquidity_change_24h: number;
  };
}

export interface TokenInfo {
  price?: string;
  network?: string;
  address?: string;
  name?: string;
  symbol?: string;
  pools?: TokenInfoPool[];
  trades?: any[];
  info?: any;
  marketData?: TokenMarketData;
  priceHistory?: {
    price_usd: string;
    timestamp: number;
  }[];
  topPools?: {
    address: string;
    name: string;
    volume_24h: number;
    liquidity: number;
    price_change_24h: number;
  }[];
  tokenHolders?: {
    address: string;
    balance: string;
    percentage: number;
  }[];
}

async function fetchGeckoTerminal(endpoint: string) {
  try {
    console.log(`Fetching GeckoTerminal API: ${BASE_URL}${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        Accept: `application/json;version=${API_VERSION}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("GeckoTerminal API error details:", {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        data: errorData,
        headers: Object.fromEntries(response.headers.entries()),
      });
      throw new Error(`GeckoTerminal API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`GeckoTerminal API response for ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error("GeckoTerminal API error:", error);
    throw error;
  }
}

export async function getTokenInfo(
  chainId: number,
  address: string,
): Promise<TokenInfo> {
  try {
    console.log(`Getting token info for chain ${chainId}, address ${address}`);
    const network = geckoNetworkMap[chainId];
    if (!network) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    // Convert address to lowercase for consistency
    const normalizedAddress = address.toLowerCase();
    console.log(`Normalized address: ${normalizedAddress}`);

    // Get token info first
    const tokenData = await fetchGeckoTerminal(`/networks/${network}/tokens/${normalizedAddress}`);
    
    if (!tokenData?.data) {
      throw new Error(`Token not found on ${network}`);
    }

    const tokenInfo: TokenInfo = {
      network,
      address: normalizedAddress,
      name: tokenData.data.attributes.name,
      symbol: tokenData.data.attributes.symbol,
      info: tokenData.data.attributes,
    };

    // Get price and market data
    try {
      const priceData = await fetchGeckoTerminal(`/networks/${network}/tokens/${normalizedAddress}/price`);
      if (priceData?.data?.attributes) {
        tokenInfo.marketData = {
          price: {
            price_usd: priceData.data.attributes.price_usd,
            price_change_24h: priceData.data.attributes.price_change_24h,
            price_change_7d: priceData.data.attributes.price_change_7d,
            price_change_30d: priceData.data.attributes.price_change_30d,
            volume_24h: priceData.data.attributes.volume_24h,
            market_cap_usd: priceData.data.attributes.market_cap_usd,
          },
          market_data: {
            market_cap_usd: priceData.data.attributes.market_cap_usd,
            volume_24h: priceData.data.attributes.volume_24h,
            price_change_24h: priceData.data.attributes.price_change_24h,
            price_change_7d: priceData.data.attributes.price_change_7d,
            price_change_30d: priceData.data.attributes.price_change_30d,
          },
          liquidity: {
            total_liquidity_usd: priceData.data.attributes.total_liquidity_usd,
            liquidity_change_24h: priceData.data.attributes.liquidity_change_24h,
          },
        };
        tokenInfo.price = priceData.data.attributes.price_usd;
      }
    } catch (error) {
      console.warn("Failed to fetch price data:", error);
    }

    // Get price history
    try {
      const priceHistoryData = await fetchGeckoTerminal(`/networks/${network}/tokens/${normalizedAddress}/price_history`);
      if (priceHistoryData?.data?.attributes?.price_history) {
        tokenInfo.priceHistory = priceHistoryData.data.attributes.price_history;
      }
    } catch (error) {
      console.warn("Failed to fetch price history:", error);
    }

    // Get top pools
    try {
      const poolsData = await fetchGeckoTerminal(`/networks/${network}/tokens/${normalizedAddress}/pools`);
      if (poolsData?.data) {
        tokenInfo.pools = poolsData.data.map((pool: any) => ({
          address: pool.attributes.address,
          name: pool.attributes.name,
          volume_24h: pool.attributes.volume_usd_24h,
          liquidity: pool.attributes.reserve_in_usd,
          relationships: {
            baseToken: pool.relationships.base_token.data.id
              .split("_")[1]
              .toLowerCase(),
            quoteToken: pool.relationships.quote_token.data.id
              .split("_")[1]
              .toLowerCase(),
          },
        }));

        // Get top pools with price change
        tokenInfo.topPools = poolsData.data
          .slice(0, 5)
          .map((pool: any) => ({
            address: pool.attributes.address,
            name: pool.attributes.name,
            volume_24h: pool.attributes.volume_usd_24h,
            liquidity: pool.attributes.reserve_in_usd,
            price_change_24h: pool.attributes.price_change_24h,
          }));
      }
    } catch (error) {
      console.warn("Failed to fetch pools data:", error);
    }

    // Get token holders
    try {
      const holdersData = await fetchGeckoTerminal(`/networks/${network}/tokens/${normalizedAddress}/holders`);
      if (holdersData?.data) {
        tokenInfo.tokenHolders = holdersData.data.map((holder: any) => ({
          address: holder.attributes.address,
          balance: holder.attributes.balance,
          percentage: holder.attributes.percentage,
        }));
      }
    } catch (error) {
      console.warn("Failed to fetch token holders:", error);
    }

    if (!tokenInfo.name || !tokenInfo.symbol) {
      throw new Error("Token data incomplete");
    }

    console.log("Final token info:", tokenInfo);
    return tokenInfo;
  } catch (error) {
    console.error("Error getting token info:", error);
    throw error;
  }
}

interface PoolToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  imageUrl: string;
}

export interface PoolInfo {
  chainId: number;
  address: string;
  token1: PoolToken;
  token2: PoolToken;
}

export async function getTokenInfoForPool(
  chainId: number,
  poolAddress: string,
): Promise<PoolInfo> {
  const network = geckoNetworkMap[chainId];
  const poolInfo = await fetchGeckoTerminal(
    `/networks/${network}/pools/${poolAddress}/info`,
  );

  return {
    chainId,
    address: poolAddress,
    token1: {
      address: poolInfo[0]?.attributes?.address,
      name: poolInfo[0]?.attributes?.name,
      symbol: poolInfo[0]?.attributes?.symbol,
      decimals: poolInfo[0]?.attributes?.decimals,
      imageUrl: poolInfo[0]?.attributes?.decimals,
    },
    token2: {
      address: poolInfo[1]?.attributes?.address,
      name: poolInfo[1]?.attributes?.name,
      symbol: poolInfo[1]?.attributes?.symbol,
      decimals: poolInfo[1]?.attributes?.decimals,
      imageUrl: poolInfo[1]?.attributes?.image_url,
    },
  };
}

export const fetchPoolInfo = async (
  chainId: number,
  poolAddress: string,
): Promise<PoolInfo> => {
  if (!poolAddress) throw new Error("Pool not found");
  const poolInfo = await getTokenInfoForPool(chainId, poolAddress);

  return poolInfo;
};

// Update the TopToken interface to include the additional metadata
export interface TopToken {
  address: string;
  name: string;
  symbol: string;
  price_usd: string;
  volume_24h: number;
  price_change_24h: number;
  market_cap_usd: number;
  // Additional metadata from the /info endpoint
  image_url?: string;
  description?: string;
  websites?: string[];
  discord_url?: string;
  telegram_handle?: string;
  twitter_handle?: string;
  categories?: string[];
  gt_score?: number;
  liquidity_usd?: number;
  trust_score?: number;
}

// Add this constant near the top of the file with other constants
const PRIORITY_TOKENS = new Set([
  '0x7838cec5b11298ff6a9513fa385621b765c74174',  // BER0
  '0x36e9fe653e673fda3857dbe5afbc884af8a316a2',  // HONEY
  '0x8f06863df59a042bcc2c86cc8ca1709ec1ee316b',  // STGBERA
  '0xa452810a4215fccc834ed241e6667f519b9856ec',  // BRGB
  '0x5c43a5fef2b056934478373a53d1cb08030fd382',  // BERADOGE
  '0x047b41a14f0bef681b94f570479ae7208e577a0c',  // HIM
  '0x1f7210257fa157227d09449229a9266b0d581337',  // BERAMO
  '0x6536cead649249cae42fc9bfb1f999429b3ec755',  // NAV
  '0xb749584f9fc418cf905d54f462fdbfdc7462011b',  // BM
  '0x949185d3be66775ea648f4a306740ea9eff9c567',  // PEPE
  '0xb8b1af593dc37b33a2c87c8db1c9051fc32858b7',  // RAMEN
  '0x08a38caa631de329ff2dad1656ce789f31af3142',  // YEET
  '0xb2f776e9c1c926c4b2e54182fac058da9af0b6a5'   // HENLO
].map(addr => addr.toLowerCase()));

// Update the isWrappedToken function to be more precise
function isWrappedToken(symbol: string, address: string): boolean {
  // Skip the check for priority tokens
  if (PRIORITY_TOKENS.has(address.toLowerCase())) {
    return false;
  }

  const wrappedSymbols = ['WETH', 'WBTC', 'WMATIC', 'WAVAX', 'WSOL'];
  return wrappedSymbols.includes(symbol.toUpperCase()) || 
         address.toLowerCase() === '0x5806E416dA447b267cEA759358cF22Cc41FAE80F'.toLowerCase(); // WETH address
}

// Update the isStablecoin function to respect priority tokens
function isStablecoin(symbol: string, address?: string): boolean {
  // Skip the check for priority tokens
  if (address && PRIORITY_TOKENS.has(address.toLowerCase())) {
    return false;
  }

  if (!symbol && !address) return false;
  
  // Specific token addresses to exclude from the homepage
  const excludedAddresses = [
    '0x1ce0a25d13ce4d52071ae7e02cf1f6606f4c79d3', // NECT
    '0x211cc4dd073734da055fbf44a2b4667d5e5fe5d2', // sUSD.e
    '0x2840f9d9f96321435ab0f977e7fdbf32ea8b304f', // sUSDa
    '0x9c39809dec7f95f5e0713634a4d0701329b3b4d2', // HONEY
    '0x4f6f57446c0e81a69d0afbd6d1f8e4b6c3b4b5e6', // MOOLA (placeholder)
  ];
  
  // Additional check for specific tokens from the screenshot
  if (address) {
    const lowerAddress = address.toLowerCase();
    // Check for Moola token from the screenshot
    if (lowerAddress.includes('moola') || symbol?.toUpperCase() === 'MOOLA' || symbol?.toUpperCase() === 'MO') {
      return true;
    }
  }
  
  // Check if the address matches any known excluded address
  if (address && excludedAddresses.includes(address.toLowerCase())) {
    return true;
  }
  
  // Check for specific tokens with very low volume that should be excluded
  // This is a special case for tokens like Moola that have extremely low volume
  if (symbol && (
    symbol.toUpperCase() === 'MOOLA' || 
    symbol.toUpperCase() === 'MO' || 
    symbol.toUpperCase() === 'MOOLA'
  )) {
    return true;
  }
  
  // Expanded list of stablecoins and their variations
  const stablecoins = [
    'NECT', 'HONEY', 'MOOLA' // Add MOOLA to the list of tokens to exclude
  ];
  
  // Check if the symbol contains any of the stablecoin identifiers
  if (symbol) {
    const upperSymbol = symbol.toUpperCase();
    
    // Direct match
    if (stablecoins.includes(upperSymbol)) return true;
    
    // Check for common patterns in stablecoin names
    if (upperSymbol.startsWith('USD') || 
        upperSymbol.endsWith('USD') || 
        upperSymbol.includes('USD') ||
        upperSymbol.startsWith('EUR') ||
        upperSymbol.endsWith('EUR') ||
        upperSymbol.includes('STABLE') ||
        upperSymbol.includes('PEG')) {
      return true;
    }
  }
  
  return false;
}

// Add cache interface and initialization
interface TokenCache {
  data: TopToken;
  timestamp: number;
}

const tokenCache = new Map<string, TokenCache>();
const CACHE_DURATION = 30 * 1000; // 30 seconds cache

// Define priority addresses from PRIORITY_TOKENS
const priorityAddresses: string[] = Array.from(PRIORITY_TOKENS);

export async function getTopTokens(): Promise<TopToken[]> {
  try {
    console.log("Fetching real-time top tokens data for Berachain");
    
    // First try to get pools data which includes most recent prices
    console.log("Fetching pools data from Berachain");
    const poolsData = await fetchGeckoTerminal("/networks/berachain/pools?page=1&page_size=100");
    
    if (!poolsData?.data) {
      throw new Error("Failed to fetch pools data");
    }
    
    console.log(`Successfully fetched ${poolsData.data.length} pools`);
    
    // Extract token information from pools
    const tokenMap = new Map<string, any>();
    const now = Date.now();
    
    // Process each pool to extract token information
    for (const pool of poolsData.data) {
      if (!pool.attributes) continue;
      
      // Process base and quote tokens
      const tokens = [
        {
          id: pool.relationships?.base_token?.data?.id,
          price: pool.attributes.base_token_price_usd,
          symbol: pool.attributes.base_token_symbol,
          name: pool.attributes.base_token_name,
          volume: pool.attributes.volume_usd?.h24 || 0,
          priceChange: pool.attributes.price_change_percentage?.h24 || 0
        },
        {
          id: pool.relationships?.quote_token?.data?.id,
          price: pool.attributes.quote_token_price_usd,
          symbol: pool.attributes.quote_token_symbol,
          name: pool.attributes.quote_token_name,
          volume: pool.attributes.volume_usd?.h24 || 0,
          priceChange: -1 * (pool.attributes.price_change_percentage?.h24 || 0)
        }
      ];

      for (const token of tokens) {
        if (!token.id) continue;
        
        const tokenAddress = token.id.split('_')[1].toLowerCase();
        
        // Skip if we've already processed this token
        if (tokenMap.has(tokenAddress)) continue;
        
        // Skip stablecoins and wrapped tokens
        if (isStablecoin(token.symbol, tokenAddress) || isWrappedToken(token.symbol, tokenAddress)) {
          continue;
        }
        
        // Check cache first
        const cached = tokenCache.get(tokenAddress);
        if (cached && (now - cached.timestamp) < CACHE_DURATION) {
          tokenMap.set(tokenAddress, cached.data);
          continue;
        }
        
        // Create token data
        const tokenInfo: TopToken = {
          address: tokenAddress,
          name: token.name || "Unknown",
          symbol: token.symbol || "???",
          price_usd: token.price || "0",
          volume_24h: token.volume || 0,
          price_change_24h: token.priceChange || 0,
          market_cap_usd: 0 // Will be enriched later
        };

        // Update cache and token map
        tokenCache.set(tokenAddress, { data: tokenInfo, timestamp: now });
        tokenMap.set(tokenAddress, tokenInfo);
      }
    }

    // Convert map to array
    let tokens = Array.from(tokenMap.values());

    // Enrich priority tokens with additional data in parallel
    const priorityTokenPromises = priorityAddresses.map(async (address) => {
      try {
        const tokenResponse = await fetchGeckoTerminal(`/networks/berachain/tokens/${address}`);
        if (!tokenResponse?.data?.attributes) return null;

        const attrs = tokenResponse.data.attributes;
        const existingToken = tokens.find(t => t.address.toLowerCase() === address.toLowerCase());
        
        if (existingToken) {
          // Update with more accurate data
          existingToken.market_cap_usd = attrs.market_cap_usd || attrs.fdv_usd || 0;
          
          // Try to get additional metadata
          try {
            const infoData = await fetchGeckoTerminal(`/networks/berachain/tokens/${address}/info`);
            if (infoData?.data?.attributes) {
              const infoAttrs = infoData.data.attributes;
              Object.assign(existingToken, {
                image_url: infoAttrs.image_url,
                description: infoAttrs.description,
                websites: infoAttrs.websites,
                discord_url: infoAttrs.discord_url,
                telegram_handle: infoAttrs.telegram_handle,
                twitter_handle: infoAttrs.twitter_handle,
                categories: infoAttrs.categories,
                gt_score: infoAttrs.gt_score
              });
            }
          } catch (infoError) {
            console.warn(`Failed to fetch additional info for priority token ${address}:`, infoError);
          }
        }
      } catch (error) {
        console.warn(`Failed to enrich priority token ${address}:`, error);
      }
    });

    // Wait for all priority token enrichment to complete
    await Promise.all(priorityTokenPromises);

    // Filter and sort tokens
    tokens = tokens.filter(token => {
      if (PRIORITY_TOKENS.has(token.address.toLowerCase())) return true;
      return token.volume_24h >= 100000 && 
             !isStablecoin(token.symbol, token.address) && 
             !isWrappedToken(token.symbol, token.address);
    }).sort((a, b) => {
      const aIsPriority = PRIORITY_TOKENS.has(a.address.toLowerCase());
      const bIsPriority = PRIORITY_TOKENS.has(b.address.toLowerCase());
      if (aIsPriority && !bIsPriority) return -1;
      if (!aIsPriority && bIsPriority) return 1;
      return b.volume_24h - a.volume_24h;
    });

    // Take top 12 tokens
    const result = tokens.slice(0, 12);
    console.log(`Returning ${result.length} tokens (including priority tokens)`);
    return result;

  } catch (error) {
    console.error("Error fetching real-time token data:", error);
    // Try to get data for priority tokens as fallback
    return getHardcodedTokens();
  }
}

async function getHardcodedTokens(): Promise<TopToken[]> {
  // Only hardcode the addresses of priority tokens
  const priorityAddresses = [
    "0x7838cec5b11298ff6a9513fa385621b765c74174", // BER0
    "0x6536cead649249cae42fc9bfb1f999429b3ec755", // NAV
    "0x047b41a14f0bef681b94f570479ae7208e577a0c", // HIM
    "0x8f06863df59a042bcc2c86cc8ca1709ec1ee316b", // STGBERA
    "0xa452810a4215fccc834ed241e6667f519b9856ec", // BRGB
    "0x5c43a5fef2b056934478373a53d1cb08030fd382", // BERADOGE
    "0x1f7210257fa157227d09449229a9266b0d581337", // BERAMO
    "0xb749584f9fc418cf905d54f462fdbfdc7462011b", // BM
    "0x949185d3be66775ea648f4a306740ea9eff9c567", // PEPE
    "0xb8b1af593dc37b33a2c87c8db1c9051fc32858b7", // RAMEN
    "0x08a38caa631de329ff2dad1656ce789f31af3142", // YEET
    "0xb2f776e9c1c926c4b2e54182fac058da9af0b6a5"  // HENLO
  ];

  const tokens: TopToken[] = [];

  // Fetch data for each priority token
  for (const address of priorityAddresses) {
    try {
      // Try to get token data from GeckoTerminal API
      const tokenResponse = await fetchGeckoTerminal(`/networks/berachain/tokens/${address}`);
      
      if (tokenResponse?.data?.attributes) {
        const attrs = tokenResponse.data.attributes;
        
        // Create token data with real-time values
        const tokenInfo: TopToken = {
          address: address,
          name: attrs.name || "Unknown",
          symbol: attrs.symbol || "???",
          price_usd: attrs.price_usd || "0",
          volume_24h: attrs.volume_usd?.h24 || 0,
          price_change_24h: attrs.price_change_percentage?.h24 || 0,
          market_cap_usd: attrs.market_cap_usd || attrs.fdv_usd || 0
        };

        // Try to get additional info
        try {
          const infoData = await fetchGeckoTerminal(`/networks/berachain/tokens/${address}/info`);
          
          if (infoData?.data?.attributes) {
            const infoAttrs = infoData.data.attributes;
            
            // Enrich token data with additional metadata
            tokenInfo.image_url = infoAttrs.image_url;
            tokenInfo.description = infoAttrs.description;
            tokenInfo.websites = infoAttrs.websites;
            tokenInfo.discord_url = infoAttrs.discord_url;
            tokenInfo.telegram_handle = infoAttrs.telegram_handle;
            tokenInfo.twitter_handle = infoAttrs.twitter_handle;
            tokenInfo.categories = infoAttrs.categories;
            tokenInfo.gt_score = infoAttrs.gt_score;
          }
        } catch (infoError) {
          console.warn(`Failed to fetch additional info for token ${address}:`, infoError);
        }

        tokens.push(tokenInfo);
      } else {
        // If API fails, add minimal token data
        tokens.push({
          address: address,
          name: "Unknown",
          symbol: "???",
          price_usd: "0",
          volume_24h: 0,
          price_change_24h: 0,
          market_cap_usd: 0
        });
      }
    } catch (error) {
      console.warn(`Failed to fetch data for token ${address}:`, error);
      // Add minimal token data on error
      tokens.push({
        address: address,
        name: "Unknown",
        symbol: "???",
        price_usd: "0",
        volume_24h: 0,
        price_change_24h: 0,
        market_cap_usd: 0
      });
    }
  }

  // Sort tokens by volume
  return tokens.sort((a, b) => b.volume_24h - a.volume_24h);
}
