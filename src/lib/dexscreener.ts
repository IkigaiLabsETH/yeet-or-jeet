const DEXSCREENER_BASE_URL = "https://api.dexscreener.com/latest/dex";

// Add this constant near the top of the file
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

// Interface for token data returned by DexScreener
export interface DexScreenerToken {
  address: string;
  name: string;
  symbol: string;
  price_usd: string;
  volume_24h: number;
  price_change_24h: number;
  market_cap_usd: number;
  image_url?: string;
  description?: string;
  websites?: string[];
  discord_url?: string;
  telegram_handle?: string;
  twitter_handle?: string;
  categories?: string[];
  trust_score?: number;
  liquidity_usd?: number;
  fdv_usd?: number;
}

// Interface for pair data returned by DexScreener
interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: {
      buys: number;
      sells: number;
    };
    h1: {
      buys: number;
      sells: number;
    };
    h6: {
      buys: number;
      sells: number;
    };
    h24: {
      buys: number;
      sells: number;
    };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
}

/**
 * Fetches data from the DexScreener API
 * @param endpoint The API endpoint to fetch from
 * @returns The JSON response from the API
 */
async function fetchDexScreener(endpoint: string) {
  try {
    console.log(`Fetching DexScreener API: ${DEXSCREENER_BASE_URL}${endpoint}`);
    const response = await fetch(`${DEXSCREENER_BASE_URL}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; BerachainTokenAnalyzer/1.0)'
      }
    });

    if (!response.ok) {
      console.error("DexScreener API error details:", {
        endpoint,
        status: response.status,
        statusText: response.statusText,
      });
      return null; // Return null instead of throwing an error
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("DexScreener API error:", error);
    return null; // Return null instead of throwing an error
  }
}

/**
 * Gets information about a specific token on Berachain
 * @param address The token address
 * @returns Token information
 */
export async function getTokenInfo(address: string): Promise<DexScreenerToken | null> {
  try {
    console.log(`Getting token info for address ${address}`);
    
    // Normalize address to lowercase
    const normalizedAddress = address.toLowerCase();
    
    // Fetch token pairs from DexScreener
    const data = await fetchDexScreener(`/tokens/berachain/${normalizedAddress}`);
    
    // If API call failed or no pairs found, return null
    if (!data || !data.pairs || data.pairs.length === 0) {
      console.warn(`No pairs found for token ${normalizedAddress}`);
      return null;
    }
    
    // Get the most liquid pair for this token
    const pairs = data.pairs as DexScreenerPair[];
    pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
    
    const topPair = pairs[0];
    const isBaseToken = topPair.baseToken.address.toLowerCase() === normalizedAddress;
    
    // Determine which token in the pair is our target token
    const tokenData = isBaseToken ? topPair.baseToken : topPair.quoteToken;
    
    // Calculate total volume across all pairs
    const totalVolume = pairs.reduce((sum, pair) => sum + (pair.volume?.h24 || 0), 0);
    
    // Get price change from the most liquid pair
    const priceChange = topPair.priceChange?.h24 || 0;
    
    // Create token info object
    const tokenInfo: DexScreenerToken = {
      address: normalizedAddress,
      name: tokenData.name || "Unknown",
      symbol: tokenData.symbol || "???",
      price_usd: topPair.priceUsd || "0",
      volume_24h: totalVolume,
      price_change_24h: priceChange,
      market_cap_usd: topPair.marketCap || topPair.fdv || 0,
      liquidity_usd: topPair.liquidity?.usd || 0,
      fdv_usd: topPair.fdv || 0
    };
    
    // Try to extract social info from the first pair's URL
    if (topPair.url) {
      const urlParts = topPair.url.split('/');
      const dexId = urlParts[urlParts.indexOf('dexscreener.com') + 1];
      
      if (dexId) {
        tokenInfo.websites = [`https://${dexId}.com`];
      }
    }
    
    console.log("Token info from DexScreener:", tokenInfo);
    return tokenInfo;
  } catch (error) {
    console.error("Error getting token info from DexScreener:", error);
    return null; // Return null instead of throwing an error
  }
}

// Update the isWrappedToken function to respect priority tokens
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
  
  // Specific stablecoin addresses to exclude from the homepage
  const stablecoinAddresses = [
    '0x1ce0a25d13ce4d52071ae7e02cf1f6606f4c79d3', // NECT
    '0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce', // HONEY
    '0x211cc4dd073734da055fbf44a2b4667d5e5fe5d2', // sUSD.e
    '0x2840f9d9f96321435ab0f977e7fdbf32ea8b304f', // sUSDa
  ];
  
  // Check if the address matches any known stablecoin address
  if (address && stablecoinAddresses.includes(address.toLowerCase())) {
    return true;
  }
  
  // Expanded list of stablecoins and their variations
  const stablecoins = [
    'USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'USDP', 'FRAX', 'LUSD', 'USDD', 'GUSD', 'USDJ',
    'UST', 'USDB', 'USDK', 'USDX', 'SUSD', 'CUSD', 'MUSD', 'DUSD', 'HUSD', 'OUSD',
    'USDN', 'USDH', 'USDL', 'USDR', 'USDV', 'USDW', 'USDY', 'USDZ',
    'EURT', 'EURS', 'EUROC', 'EURU', 'JEUR', 'SEUR',
    'CADC', 'XSGD', 'XIDR', 'NZDS', 'TRYB', 'BIDR', 'BRLC', 'CNHT', 'IDRT', 'KRWB',
    'MIM', 'USDM', 'USDS', 'USDE', 'USDEX', 'USDFL', 'USDQ', 'USDG', 'USDTG',
    'NECT', 'SUSD.E', 'SUSDA' // Add the specific stablecoins
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

/**
 * Gets the top tokens on Berachain by trading volume
 * @param limit The maximum number of tokens to return
 * @returns Array of top tokens
 */
export async function getTopTokens(limit = 12): Promise<DexScreenerToken[]> {
  try {
    console.log("Fetching top tokens from DexScreener");
    
    // Fetch top pairs from Berachain
    const data = await fetchDexScreener("/pairs/berachain");
    
    if (!data || !data.pairs || data.pairs.length === 0) {
      console.warn("No pairs found on Berachain");
      return []; // Return empty array instead of hardcoded tokens
    }
    
    // Get all pairs and sort by volume
    const pairs = data.pairs as DexScreenerPair[];
    pairs.sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0));
    
    // Extract unique tokens from pairs
    const tokenMap = new Map<string, DexScreenerToken>();
    const processedAddresses = new Set<string>();
    
    // Process pairs to extract tokens
    for (const pair of pairs) {
      try {
        // Process base token
        if (pair.baseToken && !processedAddresses.has(pair.baseToken.address.toLowerCase())) {
          const baseAddress = pair.baseToken.address.toLowerCase();
          processedAddresses.add(baseAddress);
          
          // Skip stablecoins and wrapped tokens
          if (isStablecoin(pair.baseToken.symbol, baseAddress) || isWrappedToken(pair.baseToken.symbol, baseAddress)) {
            console.log(`Skipping ${isStablecoin(pair.baseToken.symbol, baseAddress) ? 'stablecoin' : 'wrapped token'}: ${pair.baseToken.symbol}`);
            continue;
          }
          
          // Get the token image URL based on the address
          const imageUrl = `https://raw.githubusercontent.com/berachain/assets/main/${pair.baseToken.symbol.toLowerCase()}-logo.png`;
          
          tokenMap.set(baseAddress, {
            address: baseAddress,
            name: pair.baseToken.name || "Unknown",
            symbol: pair.baseToken.symbol || "???",
            price_usd: pair.priceUsd || "0",
            volume_24h: pair.volume?.h24 || 0,
            price_change_24h: pair.priceChange?.h24 || 0,
            market_cap_usd: pair.marketCap || pair.fdv || 0,
            liquidity_usd: pair.liquidity?.usd || 0,
            fdv_usd: pair.fdv || 0,
            image_url: imageUrl
          });
        }
        
        // Process quote token
        if (pair.quoteToken && !processedAddresses.has(pair.quoteToken.address.toLowerCase())) {
          const quoteAddress = pair.quoteToken.address.toLowerCase();
          processedAddresses.add(quoteAddress);
          
          // Skip stablecoins and wrapped tokens
          if (isStablecoin(pair.quoteToken.symbol, quoteAddress) || isWrappedToken(pair.quoteToken.symbol, quoteAddress)) {
            console.log(`Skipping ${isStablecoin(pair.quoteToken.symbol, quoteAddress) ? 'stablecoin' : 'wrapped token'}: ${pair.quoteToken.symbol}`);
            continue;
          }
          
          // For quote tokens, we need to calculate the price differently
          const quotePrice = pair.priceUsd ? (1 / parseFloat(pair.priceUsd)).toString() : "0";
          
          // Get the token image URL based on the address
          const imageUrl = `https://raw.githubusercontent.com/berachain/assets/main/${pair.quoteToken.symbol.toLowerCase()}-logo.png`;
          
          tokenMap.set(quoteAddress, {
            address: quoteAddress,
            name: pair.quoteToken.name || "Unknown",
            symbol: pair.quoteToken.symbol || "???",
            price_usd: quotePrice,
            volume_24h: pair.volume?.h24 || 0,
            price_change_24h: -1 * (pair.priceChange?.h24 || 0), // Invert price change for quote token
            market_cap_usd: 0, // We don't have this data for quote tokens
            liquidity_usd: pair.liquidity?.usd || 0,
            fdv_usd: 0, // We don't have this data for quote tokens
            image_url: imageUrl
          });
        }
      } catch (pairError) {
        console.warn("Error processing pair:", pairError);
        // Continue to next pair
        continue;
      }
      
      // Stop once we have enough tokens
      if (tokenMap.size >= limit * 3) break; // Get more than needed to filter later
    }
    
    // If we couldn't extract any tokens, return empty array
    if (tokenMap.size === 0) {
      console.warn("No valid tokens extracted from pairs");
      return []; // Return empty array instead of hardcoded tokens
    }
    
    // Convert map to array and sort by volume
    let tokens = Array.from(tokenMap.values());

    // Update filtering logic to prioritize specific tokens
    tokens = tokens.filter(token => {
      // Always include priority tokens
      if (PRIORITY_TOKENS.has(token.address.toLowerCase())) {
        return true;
      }

      const hasEnoughVolume = token.volume_24h >= 100000;
      const isNotStablecoin = !isStablecoin(token.symbol, token.address);
      const isNotWrapped = !isWrappedToken(token.symbol, token.address);
      
      return hasEnoughVolume && isNotStablecoin && isNotWrapped;
    });

    // Sort tokens to prioritize the specific list
    tokens.sort((a, b) => {
      const aIsPriority = PRIORITY_TOKENS.has(a.address.toLowerCase());
      const bIsPriority = PRIORITY_TOKENS.has(b.address.toLowerCase());
      
      if (aIsPriority && !bIsPriority) return -1;
      if (!aIsPriority && bIsPriority) return 1;
      
      // If both are priority or both are not, sort by volume
      return b.volume_24h - a.volume_24h;
    });

    // Limit to requested number of tokens
    tokens = tokens.slice(0, limit);
    
    // Try to enrich token data with additional info
    const enrichedTokens = await Promise.all(
      tokens.map(async (token) => {
        try {
          const fullTokenInfo = await getTokenInfo(token.address);
          if (fullTokenInfo) {
            // Merge the data, keeping the original volume and price data
            return {
              ...token,
              ...fullTokenInfo,
              // Keep original price and volume data as they're more accurate from the pairs endpoint
              price_usd: token.price_usd,
              volume_24h: token.volume_24h,
              price_change_24h: token.price_change_24h
            };
          }
        } catch (error) {
          console.warn(`Failed to enrich token ${token.symbol}:`, error);
        }
        return token;
      })
    );
    
    console.log(`Returning ${enrichedTokens.length} top tokens from DexScreener`);
    return enrichedTokens;
  } catch (error) {
    console.error("Error fetching top tokens from DexScreener:", error);
    
    // Return empty array instead of hardcoded tokens
    return [];
  }
} 