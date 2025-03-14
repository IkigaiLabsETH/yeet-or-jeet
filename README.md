# This is the b/era

A DeFi trading assistant powered by AI that helps you make informed decisions about when to buy (DCA IN) or sell (DCA OUT) tokens on Berachain and analyze NFT collections on Ethereum.

## Features

- **Top Tokens Grid**: Discover high-volume tokens on Berachain
  - Real-time token data with 30-second cache refresh
  - Priority token list with guaranteed inclusion
  - Dynamic volume-based token discovery
  - Multi-source price aggregation:
    - Primary: GeckoTerminal pools for real-time prices
    - Secondary: GeckoTerminal token API for enriched data
    - Tertiary: DexScreener API as fallback
  - Automatic filtering system:
    - Excludes stablecoins (USDT, USDC, DAI, etc.)
    - Filters out wrapped tokens
    - Removes low-volume tokens (< $100K/24h)
  - Rich token metadata:
    - Price and volume metrics
    - Market cap and liquidity data
    - Social links and community info
    - Trust scores and risk metrics
  - Smart caching system:
    - 30-second cache for high-frequency data
    - Parallel data enrichment for priority tokens
    - Fallback mechanisms for API failures

- **NFT Collection Analysis**: Advanced NFT analytics powered by Reservoir API
  - Comprehensive Market Analysis
    - Real-time floor price tracking
    - Historical daily volume data
    - Weekly and monthly volume trends
    - Trading velocity metrics
    - Average sale prices
    - Market cap calculations
    - Floor bid tracking
    - Bid-ask spread analysis
  
  - Trading Pattern Analysis
    - Top trader identification and behavior
    - Whale activity monitoring
    - Accumulation/distribution patterns
    - Wash trading detection
    - Unique buyer/seller metrics
    - Active bid monitoring
    - Bidder concentration analysis
  
  - Collection Metrics
    - Holder distribution analysis
    - Trading consistency tracking
    - Sales velocity monitoring
    - Community engagement metrics
    - Market position assessment
    - Bid depth analysis
    - Offer acceptance rates
  
  - User Portfolio Analysis
    - Holdings valuation
    - Position relative to floor
    - Historical performance tracking
    - Rarity analysis
    - Portfolio optimization suggestions
    - Active bid opportunities
    - Bid placement recommendations
  
  - Risk Assessment
    - Market manipulation indicators
    - Liquidity analysis
    - Whale concentration metrics
    - Volume sustainability evaluation
    - Price movement analysis
    - Bid validity assessment
    - Offer quality scoring
  
  - Interactive Features
    - Real-time data updates
    - Customizable analysis parameters
    - One-click detailed reports
    - Historical trend visualization
    - Price target suggestions
    - Bid tracking dashboard
    - Offer management tools

- **Real-time Price Data**: Enhanced multi-source price aggregation
  - Primary Source (GeckoTerminal):
    - Pool-based real-time price discovery
    - Direct token price API integration
    - Metadata enrichment for priority tokens
  - Secondary Source (DexScreener):
    - Pair-based price verification
    - Volume and liquidity cross-validation
  - Fallback Mechanisms:
    - Cached data (30-second validity)
    - Priority token address list
    - Multi-API retry logic
  - Data Quality Features:
    - Price cross-verification
    - Volume validation
    - Stablecoin detection
    - Wrapped token filtering
    - Market manipulation checks

- **Smart Swap Integration**: Leveraging OogaBooga's Swap API for efficient token swaps
  - Best price routing across multiple DEXs
  - Price impact calculation
  - Gas estimation
  - Slippage protection (0.5% default)
  - Token approval handling
  - Multi-hop routing support

## Technical Integration

### GeckoTerminal API (Primary Data Source)

Enhanced integration with GeckoTerminal's API for comprehensive token data:

- **Real-time Pool Data**:
  - Direct pool price monitoring
  - Volume aggregation across pairs
  - Liquidity depth tracking
  - Price change calculations
  
- **Token Discovery System**:
  - Priority token tracking
  - Volume-based discovery
  - Smart filtering logic:
    - Stablecoin exclusion
    - Wrapped token detection
    - Volume thresholds
  
- **Data Enrichment Pipeline**:
  - Base token information
  - Market metrics
  - Social and community data
  - Trust and risk scores
  
- **Caching Architecture**:
  - 30-second cache lifetime
  - Per-token cache entries
  - Automatic staleness checks
  - Cache invalidation on significant changes

### Cielo API Integration

The application integrates with Cielo's API for both token and NFT analysis:

- **Token Analysis** (Berachain):
  - Full support for activity labeling
  - PnL tracking and wallet analysis
  - Transaction history and portfolio management

- **NFT Analysis** (Ethereum):
  - Trending collections discovery
  - Floor price tracking
  - Volume analysis
  - Holder distribution
  - Market sentiment analysis
  - Collection metadata
  - Trading patterns
  - Rarity data

> Note: NFT analysis features require the `NEXT_PUBLIC_CIELO_API_KEY` environment variable to be set

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

### Reservoir API Integration (Primary NFT Data Source)

The application leverages Reservoir's comprehensive NFT API suite for detailed collection analysis:

- **Collection Data**
  - Trending collections discovery
  - Floor price tracking
  - Volume analysis
  - Historical performance data
  - Market cap calculations

- **Trading Analytics**
  - Daily volume tracking
  - Top trader identification
  - Whale activity monitoring
  - Market manipulation detection
  - Trading pattern analysis

- **Market Metrics**
  - Sales velocity tracking
  - Unique trader analysis
  - Price trend monitoring
  - Liquidity assessment
  - Volume sustainability metrics

> Note: NFT analysis features require the `NEXT_PUBLIC_RESERVOIR_API_KEY` environment variable to be set

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
3. Add your API keys to `.env.local`:
   ```
   NEXT_PUBLIC_OOGABOOGA_API_KEY=your_oogabooga_api_key_here
   CIELO_API_KEY=your_cielo_api_key_here  # Required for wallet tracking and PnL features
   ```
4. Run the development server:
   ```bash
   pnpm dev
   ```

> **Note**: API keys are required for access. 
> - For OogaBooga API key, please contact @beranoulli or @whoiskevinn on Telegram
> - For Cielo API key, visit https://cielo.finance

Please note that this application is a conceptual prototype and not a fully operational product. The application provided is for educational purposes only and should not be considered financial advice.

## Data Flow Architecture

```
Primary Data Flow:
Pool Data (real-time) -> Token Cache (30s) -> Token Enrichment -> Filtering -> Sorting -> Final List

Fallback Mechanisms:
1. GeckoTerminal Pools API (most recent prices/volumes)
2. GeckoTerminal Token API (token-specific data)
3. GeckoTerminal Info API (metadata enrichment)
4. Cached data (if within 30 seconds)
5. DexScreener API (fallback)
6. Priority token list (guaranteed inclusion)
```
