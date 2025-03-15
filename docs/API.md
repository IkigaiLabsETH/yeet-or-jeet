# b/era Technical Integration Documentation

## API Integration Details

### CoinGecko API Integration

#### Core Endpoints

1. **Simple Token Data**
   ```typescript
   GET /simple/price
   GET /simple/token_price/{id}
   GET /simple/supported_vs_currencies
   ```
   - Real-time price data for multiple tokens
   - Custom currency conversion support
   - Last updated timestamps

2. **Comprehensive Token Data**
   ```typescript
   GET /coins/markets
   GET /coins/{id}
   GET /coins/{id}/market_chart
   ```
   - Market caps and volumes
   - Price changes (24h, 7d, 30d)
   - Historical OHLCV with custom intervals
   - Trading volume by exchange

3. **DEX-Specific Data**
   ```typescript
   GET /exchanges/decentralized
   GET /exchanges/{id}/volume_chart
   ```
   - DEX trading volumes
   - Liquidity metrics
   - Trading pair data

### Cielo Finance API Integration

#### 1. Token PnL Analytics
```typescript
GET /v1/tokens/pnl
Parameters: {
  address: string,
  chain_id: number,
  time_range: string,
  include_transfers: boolean
}
```
Returns:
- Realized/unrealized PnL
- Entry/exit prices
- Position sizes
- Transaction costs
- Holding periods

#### 2. NFT PnL Tracking
```typescript
GET /v1/nfts/pnl
Parameters: {
  address: string,
  chain_id: number,
  time_range: string,
  collection_address?: string
}
```
Returns:
- Collection-level profits/losses
- Floor price tracking
- Purchase/sale history
- Rarity-adjusted valuations
- Wash trading flags

#### 3. Total Stats Analysis
```typescript
GET /v1/total-stats
Parameters: {
  address: string,
  chain_id: number,
  time_range: string
}
```
Returns:
- Aggregated portfolio value
- Total transaction volume
- Gas spent
- Protocol interactions
- Risk metrics

#### 4. Transaction Type Support

Our system processes these Cielo-supported transaction types:

1. **DeFi Operations**
   - `SWAP`: Token exchanges on DEXs
   - `ADD_LIQUIDITY`: LP token minting
   - `REMOVE_LIQUIDITY`: LP token burning
   - `STAKE`: Token staking
   - `UNSTAKE`: Token unstaking
   - `CLAIM_REWARDS`: Reward harvesting

2. **Lending Activities**
   - `SUPPLY`: Asset deposits
   - `WITHDRAW`: Asset withdrawals
   - `BORROW`: Loan creation
   - `REPAY`: Loan repayment
   - `LIQUIDATE`: Position liquidation

3. **NFT Transactions**
   - `NFT_PURCHASE`: Direct buys
   - `NFT_SALE`: Direct sales
   - `NFT_MINT`: New NFT creation
   - `NFT_TRANSFER`: NFT movements
   - `NFT_BURN`: NFT destruction

4. **Protocol Interactions**
   - `GOVERNANCE_VOTE`: DAO participation
   - `BRIDGE_TRANSFER`: Cross-chain movements
   - `YIELD_FARM`: Farming operations
   - `FLASH_LOAN`: Flash loan usage

## Data Processing Pipeline

### 1. Data Collection Layer
```typescript
interface DataCollector {
  initializeWebsockets(): Promise<void>;
  setupEventListeners(): void;
  startPolling(): void;
  processRawData(data: RawData): ProcessedData;
}
```

### 2. Data Enrichment Layer
```typescript
interface DataEnricher {
  enrichTokenData(data: TokenData): EnrichedTokenData;
  enrichNFTData(data: NFTData): EnrichedNFTData;
  calculateMetrics(data: ProcessedData): AnalyticsMetrics;
  detectAnomalies(data: EnrichedData): AnomalyReport;
}
```

### 3. Analytics Engine
```typescript
interface AnalyticsEngine {
  generateInsights(data: EnrichedData): AIInsights;
  predictTrends(historicalData: TimeSeriesData): Predictions;
  calculateRisk(position: Position): RiskMetrics;
  optimizePortfolio(holdings: Portfolio): OptimizationSuggestions;
}
```

### 4. User Interface Layer
```typescript
interface UIDataProvider {
  getDashboardData(): DashboardData;
  getPortfolioMetrics(): PortfolioMetrics;
  getTradeOpportunities(): TradeOpportunities;
  getRiskAlerts(): RiskAlerts;
}
```

## Rate Limiting and Caching

1. **API Rate Limits**
   - CoinGecko: 50 calls/minute
   - Cielo: 100 calls/minute
   - Cache frequently accessed data
   - Implement exponential backoff

2. **Caching Strategy**
   ```typescript
   interface CacheConfig {
     priceData: 30s;
     marketData: 5m;
     historicalData: 1h;
     analyticsResults: 15m;
   }
   ```

3. **Error Handling**
   ```typescript
   interface ErrorHandler {
     retryStrategy: ExponentialBackoff;
     fallbackData: CachedData;
     errorNotification: WebhookNotifier;
   }
   ```

## Security Measures

1. **API Key Management**
   - Secure environment variables
   - Key rotation schedule
   - Access logging

2. **Data Validation**
   - Input sanitization
   - Output validation
   - Rate limit monitoring

3. **Audit Trail**
   - Request logging
   - Error tracking
   - Performance monitoring 