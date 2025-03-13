# This is the b/era

A DeFi trading assistant powered by AI that helps you make informed decisions about when to buy (DCA IN) or sell DCA OUT) tokens on Berachain.

## Features

- **Top Tokens Grid**: Discover high-volume tokens on Berachain
  - View tokens sorted by 24-hour trading volume
  - See key metrics like price, volume, market cap, and liquidity
  - Access token social links and websites
  - View token descriptions and trust scores
  - One-click token selection for analysis
  - Automatic filtering of stablecoins for more relevant analysis
  - Fallback to curated token list when APIs are unavailable

- **Real-time Price Data**: Integrated with multiple data sources for accurate and up-to-date token information
  - GeckoTerminal API as primary data source for comprehensive token information
  - DexScreener API as fallback for token data when GeckoTerminal is unavailable
  - Hardcoded token data as final fallback when both APIs fail
  - Current price in USD
  - Price updates in real-time
  - Support for all whitelisted tokens on Berachain

- **Smart Swap Integration**: Leveraging OogaBooga's Swap API for efficient token swaps
  - Best price routing across multiple DEXs
  - Price impact calculation
  - Gas estimation
  - Slippage protection (0.5% default)
  - Token approval handling
  - Multi-hop routing support

## Technical Integration

### GeckoTerminal API (Primary Data Source)

The application primarily integrates with GeckoTerminal's API to provide comprehensive token data:

- **Token Discovery**: Fetches top tokens by volume on Berachain directly from DEXs
  - Automatically filters out stablecoins for more relevant analysis
  - Dynamically discovers tokens based on actual trading activity
  - Sorts tokens by 24-hour trading volume
- **Token Metadata**: Retrieves detailed information about tokens
  - Token logos and images
  - Social media links (Twitter, Telegram, Website)
  - Token descriptions
  - GeckoTerminal trust scores
  - Market data (price, volume, market cap)
- **Pool Data**: Extracts token information from trading pools
  - Price and volume data from actual DEX trades
  - Liquidity information
  - Price change percentages

### DexScreener API (Fallback Data Source)

The application also integrates with DexScreener's API as a fallback when GeckoTerminal data is unavailable:

- **Pair Data**: Retrieves detailed information about trading pairs
  - Price and volume data from actual DEX trades
  - Liquidity information
  - Price change percentages
- **Token Metadata**: Extracts token information from trading pairs
  - Token addresses, names, and symbols
  - Social links when available
  - Trust scores

### OogaBooga Aggregator

OogaBooga aggregates liquidity from multiple sources on Berachain to provide the best possible trading experience:

#### Live Integrations
- **AMM DEXs**
  - Kodiak V2 (Constant Product AMM)
  - Kodiak V3 (Concentrated Liquidity)
  - Bex (Constant Product AMM)
  - Honeypot (Constant Product AMM)
  - Grizzly (Concentrated Liquidity + Hooks)
  - Izumi (Concentrated Liquidity + Limit Orders)
  - Marginal (Perpetuals + CP AMM)
  - Memeswap (Launchpad + CP AMM)
  - Bulla (Concentrated Liquidity + Hooks)

- **Specialized DEXs**
  - Burr Bear
    - Multi Stable Pools (StableSwap AMM)
    - Generalized Pools (CP + Multi-Token AMM)
    - Burr Pools (Bonding Curve AMM)
  - Twin Finance (CP AMM)
  - WeBera (Yield Protocol)

- **Other Protocols**
  - Beradrome (Restaking Protocol)
  - Honeyswap (Stablecoin Wrapper)
  - Berps (Perpetuals Protocol)
  - Bend (Lending Protocol)
  - WBERA (Native Wrapper)

### OogaBooga APIs

The application integrates with two primary OogaBooga APIs:

1. **Price API**
   ```typescript
   GET https://mainnet.api.oogabooga.io/v1/prices?currency=USD
   ```
   Provides real-time price data for all whitelisted tokens on Berachain.
   - Returns array of token prices in USD
   - Native token (BERA) is represented as zero address
   - Updates in real-time

2. **Swap API**
   ```typescript
   POST https://mainnet.api.oogabooga.io/v1/swap/${chainId}
   ```
   Handles token swaps with the following features:
   - Optimal routing through OBRouter
   - Path definition generation
   - Executor contract interaction
   - Cross-DEX aggregation for best prices
   - Support for multi-hop swaps
   - Automatic slippage protection

3. **Token Approval API**
   ```typescript
   GET https://mainnet.api.oogabooga.io/v1/approve/allowance
   POST https://mainnet.api.oogabooga.io/v1/approve
   ```
   Manages token approvals for the OogaBooga router:
   - Check current allowance
   - Get approval transaction data
   - Support for infinite approvals

### API Endpoints

| Network | Chain ID | API Base URL |
|---------|----------|--------------|
| Berachain | 80094 | https://mainnet.api.oogabooga.io |
| Berachain bArtio | 80084 | https://bartio.api.oogabooga.io |

### Smart Contract Interaction

The application interacts with OogaBooga's smart contracts using:
- OBRouter for swap execution
- Dynamic executor contracts for optimal routing
- Wagmi v2 for blockchain interactions
- Viem for Ethereum utilities

## Supported Networks

Currently supporting:
- Berachain (Chain ID: 80094)
- Berachain bArtio (Chain ID: 80084)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Add your OogaBooga API key to `.env.local`:
   ```
   NEXT_PUBLIC_OOGABOOGA_API_KEY=your_api_key_here
   ```
4. Run the development server:
   ```bash
   pnpm dev
   ```

> **Note**: API key is required for access. Please contact @beranoulli or @whoiskevinn on Telegram to obtain one.

Please note that this application is a conceptual prototype and not a fully operational product. The application provided is for educational purposes only and should not be considered financial advice.
