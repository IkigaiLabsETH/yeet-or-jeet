export interface CuratedToken {
  address: string;
  name: string;
  symbol: string;
  description: string;
  category: 'DeFi' | 'Gaming' | 'Infrastructure' | 'Meme' | 'Ecosystem';
  price_usd?: string;
  volume_24h?: number;
  price_change_24h?: number;
  market_cap_usd?: number;
  image_url?: string;
  websites?: string[];
  discord_url?: string;
  telegram_handle?: string;
  twitter_handle?: string;
  categories?: string[];
  gt_score?: number;
  liquidity_usd?: number;
  trust_score?: number;
}

export const CURATED_TOKENS: CuratedToken[] = [
  {
    address: "0x6536cEAD649249cae42FC9bfb1F999429b3ec755",
    name: "Navigator",
    symbol: "NAV",
    description: "Navigator is a DeFi protocol on Berachain focused on optimizing yield strategies.",
    category: "DeFi",
    image_url: "https://assets.coingecko.com/coins/images/31252/small/nav.png",
    websites: ["https://navigator.money"],
    twitter_handle: "NavigatorMoney",
    telegram_handle: "navigatormoney",
    discord_url: "https://discord.gg/navigatormoney",
    trust_score: 85,
    price_usd: "1.25",
    volume_24h: 2500000,
    price_change_24h: 5.2,
    market_cap_usd: 12500000,
    liquidity_usd: 5000000
  },
  {
    address: "0x047b41A14F0BeF681b94f570479AE7208E577a0C",
    name: "Him",
    symbol: "HIM",
    description: "Him token represents the community governance token for the Him Protocol.",
    category: "Ecosystem",
    image_url: "https://assets.coingecko.com/coins/images/31253/small/him.png",
    websites: ["https://him.finance"],
    twitter_handle: "HimFinance",
    telegram_handle: "himfinance",
    discord_url: "https://discord.gg/himfinance",
    trust_score: 82,
    price_usd: "2.15",
    volume_24h: 1800000,
    price_change_24h: -2.8,
    market_cap_usd: 21500000,
    liquidity_usd: 3500000
  },
  {
    address: "0x1F7210257FA157227D09449229a9266b0D581337",
    name: "Beramo",
    symbol: "BERAMO",
    description: "Beramo is a gaming and NFT platform built on Berachain.",
    category: "Gaming",
    image_url: "https://assets.coingecko.com/coins/images/31254/small/beramo.png",
    websites: ["https://beramo.io"],
    twitter_handle: "BeramoOfficial",
    telegram_handle: "beramoofficial",
    discord_url: "https://discord.gg/beramo",
    trust_score: 78,
    price_usd: "0.85",
    volume_24h: 1200000,
    price_change_24h: 8.5,
    market_cap_usd: 8500000,
    liquidity_usd: 2000000
  },
  {
    address: "0xb749584F9fC418Cf905d54f462fdbFdC7462011b",
    name: "Berachain Meme",
    symbol: "BM",
    description: "The first community-driven meme token on Berachain.",
    category: "Meme",
    image_url: "https://assets.coingecko.com/coins/images/31255/small/bm.png",
    websites: ["https://bm.finance"],
    twitter_handle: "BMMemeToken",
    telegram_handle: "bmmemetoken",
    trust_score: 72,
    price_usd: "0.0025",
    volume_24h: 950000,
    price_change_24h: 15.3,
    market_cap_usd: 2500000,
    liquidity_usd: 750000
  },
  {
    address: "0xb8B1Af593Dc37B33a2c87C8Db1c9051FC32858B7",
    name: "Ramen",
    symbol: "RAMEN",
    description: "Ramen is a DeFi protocol focusing on sustainable yield farming.",
    category: "DeFi",
    image_url: "https://assets.coingecko.com/coins/images/31256/small/ramen.png",
    websites: ["https://ramen.finance"],
    twitter_handle: "RamenFinance",
    telegram_handle: "ramenfinance",
    discord_url: "https://discord.gg/ramenfinance",
    trust_score: 80,
    price_usd: "3.45",
    volume_24h: 1500000,
    price_change_24h: -1.2,
    market_cap_usd: 34500000,
    liquidity_usd: 4500000
  },
  {
    address: "0x08A38Caa631DE329FF2DAD1656CE789F31AF3142",
    name: "Yeet",
    symbol: "YEET",
    description: "A community-driven meme token with utility features.",
    category: "Meme",
    image_url: "https://assets.coingecko.com/coins/images/31257/small/yeet.png",
    websites: ["https://yeet.finance"],
    twitter_handle: "YeetToken",
    telegram_handle: "yeettoken",
    trust_score: 70,
    price_usd: "0.0075",
    volume_24h: 850000,
    price_change_24h: 25.8,
    market_cap_usd: 750000,
    liquidity_usd: 250000
  },
  {
    address: "0xFF0a636Dfc44Bb0129b631cDd38D21B613290c98",
    name: "Hold",
    symbol: "HOLD",
    description: "Hold is a staking and governance token for the Hold Protocol.",
    category: "Infrastructure",
    image_url: "https://assets.coingecko.com/coins/images/31258/small/hold.png",
    websites: ["https://hold.finance"],
    twitter_handle: "HoldProtocol",
    telegram_handle: "holdprotocol",
    discord_url: "https://discord.gg/holdprotocol",
    trust_score: 83,
    price_usd: "4.20",
    volume_24h: 2100000,
    price_change_24h: 3.5,
    market_cap_usd: 42000000,
    liquidity_usd: 6000000
  },
  {
    address: "0xb2F776e9c1C926C4b2e54182Fac058dA9Af0B6A5",
    name: "Henlo",
    symbol: "HENLO",
    description: "Henlo is a social token powering community engagement on Berachain.",
    category: "Ecosystem",
    image_url: "https://assets.coingecko.com/coins/images/31259/small/henlo.png",
    websites: ["https://henlo.finance"],
    twitter_handle: "HenloFinance",
    telegram_handle: "henlofinance",
    discord_url: "https://discord.gg/henlofinance",
    trust_score: 75,
    price_usd: "1.85",
    volume_24h: 1350000,
    price_change_24h: -4.2,
    market_cap_usd: 18500000,
    liquidity_usd: 3000000
  },
  {
    address: "0x18878Df23e2a36f81e820e4b47b4A40576D3159C",
    name: "Olympus",
    symbol: "OHM",
    description: "Olympus is bringing its reserve currency model to Berachain.",
    category: "DeFi",
    image_url: "https://assets.coingecko.com/coins/images/31260/small/ohm.png",
    websites: ["https://olympusdao.finance"],
    twitter_handle: "OlympusDAO",
    telegram_handle: "olympusdao",
    discord_url: "https://discord.gg/olympusdao",
    trust_score: 88,
    price_usd: "12.50",
    volume_24h: 3500000,
    price_change_24h: 1.8,
    market_cap_usd: 125000000,
    liquidity_usd: 15000000
  }
]; 