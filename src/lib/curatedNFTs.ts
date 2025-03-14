export interface CuratedNFT {
  address: string;
  name: string;
  symbol: string;
  category: 'Gen Art' | 'AI' | 'Icons' | 'Photography';
  collectionSlug: string; // Reservoir collection slug
  collectionId?: string; // For shared contract collections (e.g. OpenSea)
  tokenRange?: {
    start: number;
    end: number;
  }; // For Art Blocks style collections
}

export function getCollectionIdentifier(nft: CuratedNFT): string {
  return nft.collectionSlug;
}

export const CURATED_NFTS: CuratedNFT[] = [
  {
    address: "0xd0b67acc0e5918192b158c1647dad5782e6f4fb5",
    name: "Guy Bourdin",
    symbol: "GUY",
    category: "Photography",
    collectionSlug: "guy-bourdin"
  },
  {
    address: "0x059edd72cd353df5106d2b9cc5ab83a52287ac3a",
    name: "Chromie Squiggle",
    symbol: "SQUIGGLE",
    category: "Gen Art",
    collectionSlug: "chromie-squiggle-by-snowfro"
  },
  {
    address: "0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270",
    name: "Ringers",
    symbol: "RINGERS",
    category: "Gen Art",
    collectionSlug: "ringers-by-dmitri-cherniak",
    tokenRange: {
      start: 53000000,
      end: 53999999
    }
  },
  {
    address: "0x495f947276749ce646f68ac8c248420045cb7b5e",
    name: "MeeBits",
    symbol: "MEET",
    category: "Icons",
    collectionSlug: "meebits",
    collectionId: "meebits-official"
  },
  {
    address: "0x9cf0ab1cc434db83097b7e9c831a764481dec747",
    name: "alignDRAW",
    symbol: "DRAW",
    category: "AI",
    collectionSlug: "aligndraw"
  },
  {
    address: "0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7",
    name: "Mirage Gallery",
    symbol: "MIRAGE",
    category: "AI",
    collectionSlug: "mirage-gallery-genesis"
  },
  {
    address: "0x4d928ab507bf633dd8e68024a1fb4c99316bbdf3",
    name: "Love Tennis",
    symbol: "LOVE",
    category: "Gen Art",
    collectionSlug: "love-tennis"
  },
  {
    address: "0x845dd2a7ee2a92a0518ab2135365ed63fdba0c88",
    name: "QQL",
    symbol: "QQL",
    category: "Gen Art",
    collectionSlug: "qql-mint-pass"
  },
  {
    address: "0x880af717abba38f31ca21673843636a355fb45f3",
    name: "Drip Drop",
    symbol: "DRIP",
    category: "Photography",
    collectionSlug: "drip-drop"
  },
  {
    address: "0x509a050f573be0d5e01a73c3726e17161729558b",
    name: "Where My Vans Go",
    symbol: "VANS",
    category: "Photography",
    collectionSlug: "where-my-vans-go"
  },
  {
    address: "0xdfde78d2baec499fe18f2be74b6c287eed9511d7",
    name: "Life In West America",
    symbol: "LIWA",
    category: "Gen Art",
    collectionSlug: "life-in-west-america",
    tokenRange: {
      start: 15000000,
      end: 15999999
    }
  },
  {
    address: "0xf95b19c4a2e8564dfd26a594992d9a6aa984ed47",
    name: "Machine Hallucinations — NYC",
    symbol: "MHNYC",
    category: "AI",
    collectionSlug: "machine-hallucinations-nyc"
  },
  {
    address: "0x75d639e5e52b4ea5426f2fb46959b9c3099b729a",
    name: "Metascapes",
    symbol: "META",
    category: "Gen Art",
    collectionSlug: "metascapes"
  },
  {
    address: "0xaa4bc994775a0d19ff1c01310191df6521af12dd",
    name: "SIGHTSEERS - PERIMETER TOWN",
    symbol: "SIGHT",
    category: "Gen Art",
    collectionSlug: "sightseers-perimeter-town"
  },
  {
    address: "0x9d6c8e4b348999a69ee24285cd81226f4628e8f8",
    name: "Unsupervised - Burned - Machine Hallucinations - MoMA Dreams",
    symbol: "UNMH",
    category: "AI",
    collectionSlug: "unsupervised-burned-machine-hallucinations-moma-dreams"
  },
  {
    address: "0x747c47c05db872938ec17d6935f8f1dcba129399",
    name: "Pink. Unidentified. Such a Useless Color!",
    symbol: "PINK",
    category: "Gen Art",
    collectionSlug: "pink-unidentified-such-a-useless-color"
  },
  {
    address: "0xc8a75cfe4a0b9362ff2e201f960549e875b10e2d",
    name: "Singularity",
    symbol: "SING",
    category: "AI",
    collectionSlug: "singularity"
  },
  {
    address: "0x7a15b36cb834aea88553de69077d3777460d73ac",
    name: "Unsupervised — Data Universe — MoMA",
    symbol: "UDUM",
    category: "AI",
    collectionSlug: "unsupervised-data-universe-moma",
    collectionId: "opensea-unsupervised-data-universe-moma-by-refik-anadol"
  }
]; 