export interface CuratedToken {
  address: string;
  name: string;
  symbol: string;
  description?: string;
  category: string;
  price_usd: number;
  volume_24h: number;
  price_change_24h: number;
  market_cap_usd: number;
  liquidity_usd?: number;
  image_url?: string;
  websites?: string[];
  discord_url?: string;
  telegram_handle?: string;
  twitter_handle?: string;
  categories?: string[];
  gt_score?: number;
  trust_score?: number;
}

export const CURATED_TOKENS: CuratedToken[] = [
  {
    address: "0x6536cEAD649249cae42FC9bfb1F999429b3ec755",
    name: "Navigator",
    symbol: "NAVI",
    description: "BeraChain's premier DeFi aggregator and trading platform",
    category: "DeFi",
    price_usd: 0.32,
    volume_24h: 850000,
    price_change_24h: 5.2,
    market_cap_usd: 3200000,
    liquidity_usd: 750000,
    image_url: "https://raw.githubusercontent.com/berachain/assets/main/tokens/NAVI.png",
    websites: ["https://navigator.xyz"],
    twitter_handle: "NavigatorDAO",
    telegram_handle: "NavigatorDAO",
    trust_score: 85
  },
  {
    address: "0x18878Df23e2a36f81e820e4b47b4A40576D3159C",
    name: "Olympus",
    symbol: "OHM",
    description: "Decentralized reserve currency protocol",
    category: "DeFi",
    price_usd: 21.96,
    volume_24h: 112000,
    price_change_24h: 0.14,
    market_cap_usd: 359600000,
    liquidity_usd: 6750000,
    image_url: "https://raw.githubusercontent.com/berachain/assets/main/tokens/OHM.png",
    websites: ["https://www.olympusdao.finance"],
    twitter_handle: "OlympusDAO",
    telegram_handle: "OlympusDAO",
    trust_score: 92
  },
  {
    address: "0xb2F776e9c1C926C4b2e54182Fac058dA9Af0B6A5",
    name: "Henlo",
    symbol: "HENLO",
    description: "Community-driven meme token on BeraChain",
    category: "Meme",
    price_usd: 0.0095,
    volume_24h: 520000,
    price_change_24h: 7.2,
    market_cap_usd: 950000,
    liquidity_usd: 180000,
    image_url: "https://raw.githubusercontent.com/berachain/assets/main/tokens/HENLO.png",
    twitter_handle: "HenloToken",
    telegram_handle: "HenloToken",
    trust_score: 75
  },
  {
    address: "0xFF0a636Dfc44Bb0129b631cDd38D21B613290c98",
    name: "Hold",
    symbol: "HOLD",
    description: "Staking and yield farming protocol",
    category: "DeFi",
    price_usd: 0.0375,
    volume_24h: 580000,
    price_change_24h: -1.5,
    market_cap_usd: 3750000,
    liquidity_usd: 420000,
    image_url: "https://raw.githubusercontent.com/berachain/assets/main/tokens/HOLD.png",
    websites: ["https://hold.finance"],
    twitter_handle: "HoldFinance",
    telegram_handle: "HoldFinance",
    trust_score: 88
  },
  {
    address: "0x18878Df23e2a36f81e820e4b47b4A40576D3159C",
    name: "Yeet",
    symbol: "YEET",
    description: "The official meme token of BeraChain",
    category: "Meme",
    price_usd: 0.85,
    volume_24h: 1350000,
    price_change_24h: -3.8,
    market_cap_usd: 8500000,
    liquidity_usd: 950000,
    image_url: "https://raw.githubusercontent.com/berachain/assets/main/tokens/YEET.png",
    twitter_handle: "YeetToken",
    telegram_handle: "YeetToken",
    trust_score: 82
  }
]; 