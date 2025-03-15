# b/era

A next-generation DeFi and NFT analytics platform that combines institutional-grade market intelligence with AI-powered trading assistance for Berachain and Ethereum.

## Features

### Top Tokens Grid
- **Real-time Market Data**
  - 30-second price updates with multi-source validation
  - Priority token list with guaranteed inclusion
  - Dynamic volume-based token discovery
  - Rich token metadata:
    - Price and volume metrics
    - Market cap and liquidity data
    - Social links and community info
    - Trust scores and risk metrics
  - Automated filtering system:
    - Excludes stablecoins (USDT, USDC, DAI, etc.)
    - Filters out wrapped tokens
    - Removes low-volume tokens (< $100K/24h)
  
- **Data Aggregation**
  - Primary: GeckoTerminal pools for real-time prices
    - Direct pool price monitoring
    - Volume aggregation across pairs
    - Liquidity depth tracking
    - Price change calculations
  - Secondary: GeckoTerminal token API for enriched data
    - Token-specific metrics
    - Market context data
    - Social and community signals
  - Tertiary: DexScreener API as fallback
    - Pair-based price verification
    - Volume and liquidity cross-validation
  - Cross-validation and anomaly detection
    - Price consistency checks
    - Volume validation
    - Market manipulation detection
  
- **Smart Caching**
  - 30-second cache for high-frequency data
  - Parallel data enrichment for priority tokens
  - Multi-threaded processing pipeline
  - Automatic failover mechanisms
  - Cache invalidation strategies:
    - Time-based expiration
    - Event-driven updates
    - Priority token refresh
    - Market event triggers

### NFT Collection Analysis
- **Market Analytics**
  - Real-time floor price tracking
  - Historical volume analysis
    - Daily volume trends
    - Weekly aggregates
    - Monthly patterns
  - Trading velocity metrics
    - Sales frequency
    - Listing rates
    - Time to sale
  - Market cap calculations
  - Bid-ask spread analysis
  
- **Smart Money Tracking**
  - Whale wallet monitoring
    - Large holder tracking
    - Movement analysis
    - Cross-collection activity
  - Accumulation pattern detection
    - Buy pressure analysis
    - Holder concentration
    - Average position size
  - Wash trading identification
    - Circular trade detection
    - Suspicious pattern flagging
    - Volume authenticity scoring
  - Bidder concentration analysis
  - Portfolio optimization signals
  
- **Risk Assessment**
  - Market manipulation detection
    - Wash trading alerts
    - Price manipulation signals
    - Abnormal activity flags
  - Liquidity depth analysis
    - Bid/ask book depth
    - Market impact estimation
    - Slippage projections
  - Volume sustainability scoring
  - Price movement validation
  - Holder concentration metrics

### AI-Powered Trading Assistant
- **Market Intelligence**
  - Pattern recognition in trading data
  - Anomaly detection for market events
  - Predictive analytics for trends
  - Risk scoring for tokens/pools
  - Cross-market correlation analysis
  - Machine learning models:
    - Price prediction
    - Volume forecasting
    - Risk assessment
    - Market sentiment analysis

- **Portfolio Management**
  - Position sizing recommendations
  - Risk-adjusted entry/exit points
  - Portfolio rebalancing signals
  - Gas optimization strategies
  - PnL tracking and analysis
  - Advanced analytics:
    - Risk-adjusted returns
    - Portfolio correlation
    - Diversification metrics
    - Performance attribution

## Technical Integration

### Data Sources

#### 1. GeckoTerminal Integration
- **Pool Data**
  - Real-time price discovery
    - WebSocket price feeds
    - Order book updates
    - Trade execution data
  - Volume aggregation
    - Cross-pool aggregation
    - Volume verification
    - Wash trade filtering
  - Liquidity depth tracking
  - Price change calculations
  
- **Token Discovery**
  - Priority token tracking
    - Guaranteed monitoring
    - Enhanced update frequency
    - Deep data collection
  - Volume-based discovery
    - Dynamic threshold adjustment
    - Trending token detection
  - Smart filtering logic
    - Multi-factor filtering
    - Adaptive thresholds
    - Quality scoring
  - Metadata enrichment
    - Social metrics
    - Community data
    - Development activity

#### 2. Cielo API Integration
- **Token Analysis**
  - Full activity labeling
    - Transaction classification
    - Intent detection
    - Pattern recognition
  - PnL tracking
    - Position-level analysis
    - Realized/unrealized split
    - Tax lot tracking
  - Portfolio management
    - Holdings analysis
    - Risk metrics
    - Performance attribution
  - Risk assessment
    - Market risk scoring
    - Liquidity risk analysis
    - Counterparty risk evaluation

- **NFT Analysis**
  - Collection discovery
    - Trending detection
    - Volume analysis
    - Social signals
  - Floor price tracking
    - Real-time monitoring
    - Historical analysis
    - Predictive modeling
  - Volume analysis
    - Authentic volume verification
    - Wash trade filtering
    - Buyer/seller analysis
  - Market sentiment
    - Social media analysis
    - Community metrics
    - Developer activity
  - Trading patterns
    - Whale tracking
    - Smart money following
    - Manipulation detection

#### 3. OogaBooga Integration

##### Live DEX Integrations
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

### API Endpoints

#### 1. Price API
```typescript
GET https://mainnet.api.oogabooga.io/v1/prices?currency=USD
```
Response format:
```typescript
interface PriceResponse {
  prices: {
    [tokenAddress: string]: {
      price: string;
      timestamp: number;
      confidence: number;
    }
  };
  metadata: {
    lastUpdate: number;
    nextUpdate: number;
  }
}
```

#### 2. Swap API
```typescript
POST https://mainnet.api.oogabooga.io/v1/swap/${chainId}
```
Request format:
```typescript
interface SwapRequest {
  tokenIn: string;
  tokenOut: string;
  amount: string;
  slippageBps: number;
  recipient: string;
}
```

#### 3. Token Approval API
```typescript
GET https://mainnet.api.oogabooga.io/v1/approve/allowance
POST https://mainnet.api.oogabooga.io/v1/approve
```
- Allowance checking
- Approval transaction generation
- Infinite approval support
- Revocation support

### Network Support

| Network | Chain ID | API Base URL |
|---------|----------|--------------|
| Berachain | 80094 | https://mainnet.api.oogabooga.io |
| Berachain bArtio | 80084 | https://bartio.api.oogabooga.io |

### Smart Contract Integration
- OBRouter for swap execution
- Dynamic executor contracts
- Wagmi v2 integration
- Viem utilities

### Reservoir API Integration
- Collection analytics
- Trading metrics
- Market intelligence
- Portfolio tracking
- Risk assessment

## Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/b-era.git
cd b-era
```

2. Install dependencies
```bash
pnpm install
```

3. Configure environment
```bash
# .env.local
NEXT_PUBLIC_OOGABOOGA_API_KEY=your_oogabooga_api_key_here
NEXT_PUBLIC_RESERVOIR_API_KEY=your_reservoir_api_key_here
CIELO_API_KEY=your_cielo_api_key_here  # Required for wallet tracking
```

4. Start development server
```bash
pnpm dev
```

## API Keys
- OogaBooga API: Contact @beranoulli or @whoiskevinn on Telegram
- Cielo API: Visit https://cielo.finance
- Reservoir API: Required for NFT analytics

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

## Disclaimer

This application is a conceptual prototype and not a fully operational product. The application is for educational purposes only and should not be considered financial advice.
