const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

// Known token IDs for Berachain tokens
const KNOWN_TOKEN_IDS: Record<string, string> = {
  // WBERA address on Berachain
  "0x5806E416dA447b267cEA759358cF22Cc41FAE80F": "berachain",
};

export type CoinGeckoData = {
  id: string;
  symbol: string;
  name: string;
  market_data: {
    current_price: {
      usd: number;
    };
    market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    circulating_supply: number;
    total_supply: number;
    max_supply: number | null;
  };
  image: {
    large: string;
    small: string;
    thumb: string;
  };
};

// Simple price response type
type SimplePriceResponse = Record<string, {
  usd: number;
  usd_market_cap: number;
  usd_24h_vol: number;
}>;

// Add rate limiting protection
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

async function makeRequest(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await sleep(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  
  lastRequestTime = Date.now();
  const response = await fetch(url);
  
  // Handle rate limiting
  if (response.status === 429) {
    console.warn("Rate limited by CoinGecko API");
    await sleep(5000); // Wait 5 seconds before retry
    return makeRequest(url);
  }
  
  return response;
}

export const getCoinGeckoData = async (
  tokenAddress: string,
): Promise<CoinGeckoData | undefined> => {
  const coinId = KNOWN_TOKEN_IDS[tokenAddress.toLowerCase()];
  if (!coinId) {
    console.log("Token not found in KNOWN_TOKEN_IDS:", tokenAddress);
    return;
  }

  try {
    const url = `${COINGECKO_API_BASE}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
    const response = await makeRequest(url);
    
    if (!response.ok) {
      console.error("CoinGecko API error:", response.status, await response.text());
      return;
    }
    
    const data = await response.json();
    console.log("CoinGecko data fetched successfully for:", coinId);
    return data;
  } catch (error) {
    console.error("Error fetching CoinGecko data:", error);
    return;
  }
};

// Add a simpler price-only endpoint for efficiency
export const getSimplePrice = async (
  tokenAddress: string,
): Promise<SimplePriceResponse | undefined> => {
  const coinId = KNOWN_TOKEN_IDS[tokenAddress.toLowerCase()];
  if (!coinId) return;

  try {
    const url = `${COINGECKO_API_BASE}/simple/price?ids=${coinId}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true`;
    const response = await makeRequest(url);
    
    if (!response.ok) {
      console.error("CoinGecko simple price API error:", response.status);
      return;
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching simple price data:", error);
    return;
  }
}; 