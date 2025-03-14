import type { Chain } from "thirdweb";
import { ethereum } from "thirdweb/chains";

export const berachain: Chain = {
  id: 80094,
  rpc: "https://80094.rpc.thirdweb.com",
  nativeCurrency: {
    name: "BERA",
    symbol: "BERA",
    decimals: 18,
  },
  name: "Berachain",
  icon: {
    url: "https://raw.githubusercontent.com/berachain/assets/main/chain-logos/berachain.svg",
    height: 32,
    width: 32,
    format: "svg"
  },
  blockExplorers: [
    {
      name: "Berascan",
      url: "https://berascan.com"
    },
  ],
};

export const supportedChains: Chain[] = [berachain, ethereum];
export const defaultSelectedChain = berachain;