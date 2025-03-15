# b/era

A next-generation DeFi and NFT analytics platform that combines institutional-grade market intelligence with AI-powered trading assistance for Berachain and Ethereum.

## Why b/era?

b/era addresses critical gaps in the DeFi and NFT analytics landscape:

1. **Fragmented Data**: Most platforms offer siloed views of either DeFi or NFT data. b/era unifies these insights through our comprehensive DataAggregationService.

2. **Delayed Analysis**: Traditional platforms rely on historical data. b/era provides real-time analysis through WebSocket connections and intelligent caching.

3. **Limited Context**: Existing tools often miss crucial social and cross-chain signals. Our multi-service architecture captures the complete market picture.

4. **Poor Risk Assessment**: Current platforms lack sophisticated risk metrics. b/era's RiskAssessmentService provides institutional-grade risk analysis.

## Architecture

### Core Services

1. **DataAggregationService**
   - **Why**: Central orchestrator for all data collection and analysis
   - **How**: 
     - Manages parallel data fetching from all services
     - Implements smart caching (30s for high-frequency data)
     - Provides real-time updates via WebSocket/polling
     - Handles historical data aggregation

2. **SocialMetricsService**
   - **Why**: Social signals often precede market movements
   - **How**:
     - Twitter sentiment analysis and engagement tracking
     - Discord community growth and activity metrics
     - Telegram group dynamics and trend detection
     - Real-time social feed monitoring

3. **TechnicalAnalysisService**
   - **Why**: Professional-grade market analysis
   - **How**:
     - Volume and liquidity analysis
     - Pattern recognition
     - Price prediction models
     - Momentum indicators
     - Volatility metrics

4. **RiskAssessmentService**
   - **Why**: Institutional-grade risk management
   - **How**:
     - Security audit analysis
     - Liquidity risk assessment
     - Whale movement tracking
     - Market manipulation detection
     - Smart contract risk scoring

5. **CrossChainAnalysisService**
   - **Why**: Comprehensive cross-chain market intelligence
   - **How**:
     - Bridge activity monitoring
     - Protocol comparison metrics
     - Market share analysis
     - Efficiency metrics tracking
     - Adoption curve analysis

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

#### 4. Nebula Integration
- **Blockchain AI Engine**
  - Real-time onchain data analysis
    - Cross-chain data monitoring
    - Smart contract interaction
    - Transaction pattern recognition
  - Natural language processing
    - Trading instruction interpretation
    - Market analysis queries
    - Portfolio recommendations
  - Autonomous trading capabilities
    - Market condition monitoring
    - Trade execution optimization
    - Risk management automation

- **Advanced Analytics**
  - Smart contract analysis
    - Code quality assessment
    - Vulnerability detection
    - Gas optimization suggestions
  - Portfolio intelligence
    - Position optimization
    - Risk exposure analysis
    - Performance forecasting
  - Market sentiment analysis
    - Social signal processing
    - Community engagement metrics
    - Developer activity tracking

- **API Integration**
```typescript
POST https://nebula-api.thirdweb.com/chat
```
Request format:
```typescript
interface NebulaRequest {
  message: string;
  stream: boolean;
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
}
```

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

## Setup and Configuration

### Prerequisites

- Node.js 18+
- pnpm 8+
- Redis (for caching)
- MongoDB (for historical data)

### Installation

1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/b-era.git
cd b-era
```

2. **Install Dependencies**
```bash
pnpm install
```

3. **Configure Environment**
```bash
# .env.local

# Core API Keys
NEXT_PUBLIC_OOGABOOGA_API_KEY=your_oogabooga_api_key_here
NEXT_PUBLIC_RESERVOIR_API_KEY=your_reservoir_api_key_here
CIELO_API_KEY=your_cielo_api_key_here
THIRDWEB_SECRET_KEY=your_nebula_api_key_here

# Social Media APIs
NEXT_PUBLIC_TWITTER_API_KEY=your_twitter_api_key
NEXT_PUBLIC_DISCORD_BOT_TOKEN=your_discord_bot_token
NEXT_PUBLIC_TELEGRAM_API_KEY=your_telegram_api_key

# Market Data APIs
NEXT_PUBLIC_GECKOTERMINAL_API_KEY=your_geckoterminal_key
NEXT_PUBLIC_DEXSCREENER_API_KEY=your_dexscreener_key

# Machine Learning Configuration
NEXT_PUBLIC_ENABLE_ML_PIPELINE=true
NEXT_PUBLIC_ML_MODEL_ENDPOINT=your_model_endpoint

# Infrastructure
NEXT_PUBLIC_REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_MONGODB_URI=mongodb://localhost:27017/bera
```

4. **Start Required Services**
```bash
# Start Redis
redis-server

# Start MongoDB
mongod
```

5. **Run Development Server**
```bash
pnpm dev
```

### Service Configuration

1. **DataAggregationService**
   - Configure cache TTL in `src/config/cache.ts`
   - Adjust polling intervals in `src/config/polling.ts`
   - Set up WebSocket connections in `src/config/websocket.ts`

2. **SocialMetricsService**
   - Configure API rate limits in `src/config/rateLimit.ts`
   - Set up sentiment analysis models in `src/config/ml.ts`
   - Define social metrics thresholds in `src/config/metrics.ts`

3. **TechnicalAnalysisService**
   - Configure technical indicators in `src/config/indicators.ts`
   - Set up price prediction models in `src/config/prediction.ts`
   - Define market patterns in `src/config/patterns.ts`

4. **RiskAssessmentService**
   - Configure risk thresholds in `src/config/risk.ts`
   - Set up security scanning in `src/config/security.ts`
   - Define whale tracking parameters in `src/config/whales.ts`

5. **CrossChainAnalysisService**
   - Configure supported chains in `src/config/chains.ts`
   - Set up bridge monitoring in `src/config/bridges.ts`
   - Define cross-chain metrics in `src/config/crosschain.ts`

### API Keys

- **OogaBooga API**: Contact @beranoulli or @whoiskevinn on Telegram
- **Cielo API**: Visit https://cielo.finance
- **Reservoir API**: Visit https://reservoir.tools
- **Thirdweb API**: Visit https://thirdweb.com/dashboard

### Development Guidelines

1. **Code Style**
   - Follow TypeScript best practices
   - Use ES6+ features
   - Implement proper error handling
   - Write comprehensive tests

2. **Performance**
   - Optimize database queries
   - Implement proper caching
   - Use WebSocket where appropriate
   - Minimize API calls

3. **Security**
   - Never commit API keys
   - Implement rate limiting
   - Validate all inputs
   - Follow security best practices

## Disclaimer

This application is a conceptual prototype and not a fully operational product. The application is for educational purposes only and should not be considered financial advice.
