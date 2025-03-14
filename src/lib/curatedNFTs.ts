export interface CuratedNFT {
  address: string;
  name: string;
  symbol: string;
  description: string;
  category: 'Gen Art' | 'AI' | 'Icons' | 'Photography';
  logoUrl?: string;
  floorPrice?: string;
  totalVolume?: string;
}

export const CURATED_NFTS: CuratedNFT[] = [
  {
    address: "0xa7d8d9ef8D8Ce8992Df33D8b8CF4Aebabd5bD270",
    name: "Art Blocks",
    symbol: "BLOCKS",
    description: "Art Blocks is a first-of-its-kind platform focused on genuinely programmable on-demand generative content that is stored immutably on the Ethereum blockchain.",
    category: "Gen Art",
    floorPrice: "0.22",
    totalVolume: "650000"
  },
  {
    address: "0x059EDD72Cd353dF5106D2B9cC5ab83a52287aC3a",
    name: "Chromie Squiggle",
    symbol: "SQUIGGLE",
    description: "A generative art project by Snowfro, founder of Art Blocks. Each squiggle is randomly generated and stored on-chain.",
    category: "Gen Art",
    floorPrice: "8.75",
    totalVolume: "45000"
  },
  {
    address: "0x42069ABFE407C60cf4ae4112bEDEaD391dBa1cdB",
    name: "Ringers",
    symbol: "RINGERS",
    description: "A generative art collection by Dmitri Cherniak, exploring the endless possibilities of wrapping strings around pegs.",
    category: "Gen Art",
    floorPrice: "35.5",
    totalVolume: "28000"
  },
  {
    address: "0x8BFd726edc4e0d0C3c14Bb1e02CC5F8EE4d6B56D",
    name: "DeepBlue AI",
    symbol: "DEEP",
    description: "AI-generated artwork collection exploring the intersection of human creativity and machine learning.",
    category: "AI",
    floorPrice: "1.25",
    totalVolume: "15000"
  },
  {
    address: "0x394E3d3044fC89fCDd966D3cb35Ac0B32B0Cda91",
    name: "Archetype",
    symbol: "ARCH",
    description: "AI-powered collection that transforms text prompts into unique digital artworks.",
    category: "AI",
    floorPrice: "0.85",
    totalVolume: "12000"
  },
  {
    address: "0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7",
    name: "Mirage Gallery",
    symbol: "MIRAGE",
    description: "A curated collection of AI-generated fine art pieces, bridging the gap between traditional art and artificial intelligence.",
    category: "AI",
    floorPrice: "0.45",
    totalVolume: "8500"
  },
  {
    address: "0x8d04a8c79cEB0889Bdd12acdF3Fa9D207eD3Ff63",
    name: "Iconic Moments",
    symbol: "ICONIC",
    description: "A collection of iconic cultural moments transformed into minimalist digital icons.",
    category: "Icons",
    floorPrice: "0.35",
    totalVolume: "5500"
  },
  {
    address: "0x892848074ddeA461A15f337250Da3ce55580CA85",
    name: "Minimal Icons",
    symbol: "MINIMAL",
    description: "Simple, elegant, and timeless icon designs representing various aspects of digital culture.",
    category: "Icons",
    floorPrice: "0.15",
    totalVolume: "3200"
  },
  {
    address: "0x3B3ee1931Dc30C1957379FAc9aba94D1C48a5405",
    name: "Twin Flames",
    symbol: "TWIN",
    description: "Justin Aversano's groundbreaking photography project capturing 100 sets of twins in powerful portraits.",
    category: "Photography",
    floorPrice: "15.75",
    totalVolume: "85000"
  },
  {
    address: "0xd539A3A5E5210Ea5Aa8F7Dac205Ad84E13660775",
    name: "Drifters",
    symbol: "DRIFT",
    description: "A photographic journey through urban landscapes and street culture, captured by renowned photographers.",
    category: "Photography",
    floorPrice: "0.85",
    totalVolume: "12500"
  }
]; 