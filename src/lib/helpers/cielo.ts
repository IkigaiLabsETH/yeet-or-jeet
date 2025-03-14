interface TotalStats {
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

interface TokenPnL {
  token: string;
  total_buy_usd: number;
  total_sell_usd: number;
  total_pnl_usd: number;
  roi_percentage: number;
  num_swaps: number;
  average_buy_price: number;
  average_sell_price: number;
  first_trade: number;
  last_trade: number;
  is_honeypot: boolean;
}

interface TokenPnLResponse {
  data: TokenPnL;
}

interface TotalStatsResponse {
  status: string;
  data: TotalStats;
}

const CIELO_API_KEY = process.env.CIELO_API_KEY;

if (!CIELO_API_KEY) {
  console.warn("CIELO_API_KEY is not set. Wallet stats and PnL features will be disabled.");
}

const CIELO_API_BASE = "https://feed-api.cielo.finance/api/v1";

export async function getWalletStats(
  walletAddress: string,
  chain: string,
  timeframe: "1d" | "7d" | "30d" | "max" = "max",
): Promise<TotalStats | null> {
  // If chain is berachain (80094), use Thirdweb
  if (chain === "berachain") {
    try {
      // Import required functions from thirdweb
      const { getWalletBalance } = await import("thirdweb/wallets");
      const { createThirdwebClient } = await import("thirdweb");

      // Create Thirdweb client
      const client = createThirdwebClient({
        clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
      });

      // Get native token balance
      const balance = await getWalletBalance({
        address: walletAddress,
        client,
        chain: {
          id: 80094,
          name: "Berachain",
          nativeCurrency: {
            name: "BERA",
            symbol: "BERA",
            decimals: 18,
          },
          rpc: "https://rpc.berachain.com",
        },
      });

      // Since we don't have historical data for Berachain yet,
      // we'll return a simplified stats object with just the current balance
      return {
        wallet: walletAddress,
        realized_pnl_usd: 0,
        realized_roi_percentage: 0,
        tokens_traded: 0,
        unrealized_pnl_usd: Number(balance?.value || 0),
        unrealized_roi_percentage: 0,
        winrate: 0,
        average_holding_time: 0,
        combined_pnl_usd: Number(balance?.value || 0),
        combined_roi_percentage: 0,
      };
    } catch (error) {
      console.error("Error fetching Berachain wallet stats:", error);
      return null;
    }
  }

  // For other chains, use Cielo
  if (!CIELO_API_KEY) {
    console.warn("CIELO_API_KEY is not set. Skipping wallet stats fetch.");
    return null;
  }

  try {
    const params = new URLSearchParams({
      timeframe,
      ...(chain && { chains: chain }),
    });

    const url = `${CIELO_API_BASE}/${walletAddress}/pnl/total-stats?${params}`;
    console.log("Attempting to fetch wallet stats with:", {
      url,
      apiKey: CIELO_API_KEY ? "Present" : "Missing",
      walletAddress,
      chain,
      timeframe,
    });

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "X-API-KEY": CIELO_API_KEY,
      },
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      console.error("Failed to fetch wallet stats:", {
        status: response.status,
        statusText: response.statusText,
        url,
        errorResponse,
      });
      return null;
    }

    const data: TotalStatsResponse = await response.json();
    console.log("Wallet stats response:", data);
    return data.data;
  } catch (error) {
    console.error("Error fetching wallet stats:", error);
    return null;
  }
}

export async function getTokenPnL(
  walletAddress: string,
  tokenAddress: string,
  chain: string,
): Promise<TokenPnL | null> {
  // If chain is berachain (80094), use Thirdweb
  if (chain === "berachain") {
    try {
      // Import required functions from thirdweb
      const { getWalletBalance } = await import("thirdweb/wallets");
      const { createThirdwebClient } = await import("thirdweb");

      // Create Thirdweb client
      const client = createThirdwebClient({
        clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
      });

      // Get token balance
      const balance = await getWalletBalance({
        address: walletAddress,
        client,
        chain: {
          id: 80094,
          name: "Berachain",
          nativeCurrency: {
            name: "BERA",
            symbol: "BERA",
            decimals: 18,
          },
          rpc: "https://rpc.berachain.com",
        },
        tokenAddress,
      });

      // Since we don't have historical data for Berachain yet,
      // we'll return a simplified PnL object with just the current balance
      return {
        token: tokenAddress,
        total_buy_usd: 0,
        total_sell_usd: 0,
        total_pnl_usd: 0,
        roi_percentage: 0,
        num_swaps: 0,
        average_buy_price: 0,
        average_sell_price: 0,
        first_trade: Math.floor(Date.now() / 1000),
        last_trade: Math.floor(Date.now() / 1000),
        is_honeypot: false,
      };
    } catch (error) {
      console.error("Error fetching Berachain token PnL:", error);
      return null;
    }
  }

  // For other chains, use Cielo
  if (!CIELO_API_KEY) {
    console.warn("CIELO_API_KEY is not set. Skipping token PnL fetch.");
    return null;
  }

  try {
    const url = `${CIELO_API_BASE}/${walletAddress}/pnl/token/${tokenAddress}`;
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "X-API-KEY": CIELO_API_KEY,
      },
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      console.error("Failed to fetch token PnL:", {
        status: response.status,
        statusText: response.statusText,
        url,
        errorResponse,
      });
      return null;
    }

    const data: TokenPnLResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching token PnL:", error);
    return null;
  }
}
