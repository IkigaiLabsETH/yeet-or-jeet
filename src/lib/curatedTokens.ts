export interface CuratedToken {
  address: string;
  name: string;
  symbol: string;
  description: string;
  category: 'DeFi' | 'Gaming' | 'Infrastructure' | 'Meme' | 'Ecosystem';
  logoUrl?: string;
}

export const CURATED_TOKENS: CuratedToken[] = [
  {
    address: "0x6536cEAD649249cae42FC9bfb1F999429b3ec755",
    name: "Navigator",
    symbol: "NAV",
    description: "Navigator is a DeFi protocol on Berachain focused on optimizing yield strategies.",
    category: "DeFi",
  },
  {
    address: "0xB776608A6881FfD2152bDFE65BD04Cbe66697Dcf",
    name: "Bread",
    symbol: "BREAD",
    description: "Bread is a community-driven token focused on DeFi innovation on Berachain.",
    category: "DeFi",
  },
  {
    address: "0x047b41A14F0BeF681b94f570479AE7208E577a0C",
    name: "Him",
    symbol: "HIM",
    description: "Him token represents the community governance token for the Him Protocol.",
    category: "Ecosystem",
  },
  {
    address: "0x1F7210257FA157227D09449229a9266b0D581337",
    name: "Beramo",
    symbol: "BERAMO",
    description: "Beramo is a gaming and NFT platform built on Berachain.",
    category: "Gaming",
  },
  {
    address: "0xb749584F9fC418Cf905d54f462fdbFdC7462011b",
    name: "Berachain Meme",
    symbol: "BM",
    description: "The first community-driven meme token on Berachain.",
    category: "Meme",
  },
  {
    address: "0xb8B1Af593Dc37B33a2c87C8Db1c9051FC32858B7",
    name: "Ramen",
    symbol: "RAMEN",
    description: "Ramen is a DeFi protocol focusing on sustainable yield farming.",
    category: "DeFi",
  },
  {
    address: "0x08A38Caa631DE329FF2DAD1656CE789F31AF3142",
    name: "Yeet",
    symbol: "YEET",
    description: "A community-driven meme token with utility features.",
    category: "Meme",
  },
  {
    address: "0xFF0a636Dfc44Bb0129b631cDd38D21B613290c98",
    name: "Hold",
    symbol: "HOLD",
    description: "Hold is a staking and governance token for the Hold Protocol.",
    category: "Infrastructure",
  },
  {
    address: "0xb2F776e9c1C926C4b2e54182Fac058dA9Af0B6A5",
    name: "Henlo",
    symbol: "HENLO",
    description: "Henlo is a social token powering community engagement on Berachain.",
    category: "Ecosystem",
  },
  {
    address: "0x18878Df23e2a36f81e820e4b47b4A40576D3159C",
    name: "Olympus",
    symbol: "OHM",
    description: "Olympus is bringing its reserve currency model to Berachain.",
    category: "DeFi",
  }
]; 