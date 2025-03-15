// Data Types
export interface SentimentData {
  score: number;
  magnitude: number;
  keywords: string[];
  timestamp: Date;
}

export interface EngagementMetrics {
  likes: number;
  retweets: number;
  replies: number;
  impressions: number;
  engagementRate: number;
}

export interface TrendData {
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  timeframe: string;
  supportingMetrics: Record<string, number>;
}

export interface MessageStats {
  total: number;
  activeChannels: number;
  peakHours: number[];
  topContributors: string[];
}

export interface GrowthMetrics {
  newMembers: number;
  churnRate: number;
  retentionRate: number;
  growthRate: number;
}

export interface GroupStats {
  memberCount: number;
  activeMembers: number;
  messageFrequency: number;
  topicDistribution: Record<string, number>;
}

export interface ActivityData {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  activityHeatmap: Record<string, number>;
}

// Technical Analysis Types
export interface VolumeAnalysis {
  volumeProfile: Record<string, number>;
  valueAreas: {
    high: number;
    low: number;
    value: number;
  };
  volumeZones: Array<{
    price: number;
    volume: number;
    type: 'accumulation' | 'distribution';
  }>;
}

export interface LiquidityData {
  depth: Record<string, number>;
  concentration: number;
  imbalance: number;
  efficiency: number;
}

export interface PatternData {
  type: string;
  confidence: number;
  startPrice: number;
  endPrice: number;
  duration: number;
  significance: number;
}

export interface PredictionMetrics {
  predictedPrice: number;
  confidence: number;
  timeframe: '1h' | '4h' | '24h' | '7d';
  supportingFactors: string[];
}

export interface MomentumData {
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  momentum: number;
}

export interface VolatilityMetrics {
  historicalVolatility: number;
  impliedVolatility: number;
  volatilityIndex: number;
  volatilitySkew: number;
}

export interface TrendAnalysis {
  direction: 'bullish' | 'bearish' | 'sideways';
  strength: number;
  support: number[];
  resistance: number[];
}

// Risk Assessment Types
export interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  location?: string;
  recommendation?: string;
}

export interface AuditInfo {
  lastAudit?: Date;
  auditor?: string;
  score: number;
  issues: SecurityIssue[];
}

export interface LiquidityMetrics {
  totalLiquidity: number;
  liquidityDepth: number;
  concentrationRisk: number;
  withdrawalRisk: number;
}

export interface LockInfo {
  amount: number;
  duration: number;
  unlockDate: Date;
  type: 'team' | 'treasury' | 'ecosystem';
}

export interface WalletInfo {
  address: string;
  balance: number;
  percentage: number;
  type: 'whale' | 'team' | 'contract' | 'unknown';
}

export interface WhaleMovement {
  timestamp: Date;
  address: string;
  type: 'buy' | 'sell';
  amount: number;
  priceImpact: number;
}

export interface MarketImpact {
  priceImpact: number;
  volumeImpact: number;
  liquidityImpact: number;
  severity: 'low' | 'medium' | 'high';
}

// Cross-Chain Types
export interface FrequencyData {
  daily: number;
  weekly: number;
  monthly: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface ChainDistribution {
  [chainId: string]: {
    volume: number;
    percentage: number;
    activity: number;
  };
}

export interface MarketShareData {
  totalShare: number;
  ranking: number;
  competitors: Array<{
    name: string;
    share: number;
  }>;
}

export interface EfficiencyMetrics {
  speed: number;
  cost: number;
  reliability: number;
  score: number;
}

export interface AdoptionCurve {
  stage: 'early' | 'growth' | 'mature' | 'decline';
  rate: number;
  projection: number;
  confidence: number;
}

// Social Metrics Types
export interface SentimentData {
  score: number;
  magnitude: number;
  keywords: string[];
  timestamp: Date;
}

export interface EngagementMetrics {
  likes: number;
  retweets: number;
  replies: number;
  impressions: number;
  engagementRate: number;
}

export interface MessageStats {
  total: number;
  activeChannels: number;
  peakHours: number[];
  topContributors: string[];
}

export interface GrowthMetrics {
  newMembers: number;
  churnRate: number;
  retentionRate: number;
  growthRate: number;
}

export interface GroupStats {
  memberCount: number;
  activeMembers: number;
  messageFrequency: number;
  topicDistribution: Record<string, number>;
}

export interface ActivityData {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  activityHeatmap: Record<string, number>;
}

// Cross-chain Analysis Types
export interface BridgeActivity {
  volume24h: number;
  transactions24h: number;
  uniqueUsers24h: number;
  averageSize: number;
  topBridges: Array<{
    name: string;
    volume: number;
    userCount: number;
  }>;
}

export interface ProtocolComparison {
  marketShare: number;
  volumeRank: number;
  tvlRank: number;
  userBaseRank: number;
  competitors: Array<{
    name: string;
    chain: string;
    metrics: {
      volume: number;
      tvl: number;
      users: number;
    };
  }>;
}

export interface CrossChainMetrics {
  chainDistribution: Record<string, number>;
  bridgeUtilization: Record<string, number>;
  crossChainVolume: number;
  userOverlap: Record<string, number>;
}

// Aggregated Data Types
export interface TechnicalAnalysisData {
  volume: VolumeAnalysis;
  liquidity: LiquidityData;
  patterns: PatternData[];
  predictions: PredictionMetrics;
  momentum: MomentumData;
  volatility: VolatilityMetrics;
  trend: TrendAnalysis;
}

export interface RiskAssessmentData {
  security: {
    score: number;
    issues: SecurityIssue[];
    audit: AuditInfo;
  };
  liquidity: LiquidityMetrics & LockInfo;
  whales: {
    holders: WalletInfo[];
    movements: WhaleMovement[];
    impact: MarketImpact;
  };
}

export interface SocialMetricsData {
  twitter: SentimentData & EngagementMetrics;
  discord: MessageStats & GrowthMetrics;
  telegram: GroupStats & ActivityData;
}

export interface CrossChainAnalysisData {
  bridges: BridgeActivity;
  comparison: ProtocolComparison;
  metrics: CrossChainMetrics;
}

export interface AggregatedData {
  nebulaData: any; // Contract metadata from Thirdweb
  socialMetrics: SocialMetricsData;
  technicalAnalysis: TechnicalAnalysisData;
  riskMetrics: RiskAssessmentData;
  crossChain: CrossChainAnalysisData;
} 