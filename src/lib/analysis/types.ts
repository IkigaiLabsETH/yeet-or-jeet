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
    significance: number;
  }>;
}

export interface LiquidityData {
  depth: Record<string, number>;
  concentration: number;
  imbalance: number;
  efficiency: number;
}

export interface PatternData {
  pattern: string;
  confidence: number;
  priceTargets: {
    entry: number;
    target: number;
    stopLoss: number;
  };
  timeframe: string;
}

export interface PredictionMetrics {
  predictedPrice: number;
  confidence: number;
  timeframe: string;
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
  direction: 'up' | 'down' | 'sideways';
  strength: number;
  support: number[];
  resistance: number[];
}

// Risk Assessment Types
export interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  recommendation: string;
}

export interface AuditInfo {
  lastAudit: Date;
  auditor: string;
  score: number;
  findings: SecurityIssue[];
}

export interface LiquidityMetrics {
  totalLiquidity: number;
  liquidityDepth: number;
  concentrationRisk: number;
  withdrawalRisk: number;
}

export interface LockInfo {
  isLocked: boolean;
  lockDuration: number;
  lockExpiry: Date;
  lockedAmount: number;
}

export interface WalletInfo {
  address: string;
  balance: number;
  percentage: number;
  lastActivity: Date;
}

export interface WhaleMovement {
  timestamp: Date;
  type: 'buy' | 'sell' | 'transfer';
  amount: number;
  price: number;
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

// Aggregated Data Types
export interface AggregatedData {
  nebulaData: any; // Thirdweb Nebula data
  socialMetrics: {
    twitter: SentimentData & EngagementMetrics;
    discord: MessageStats & GrowthMetrics;
    telegram: GroupStats & ActivityData;
  };
  technicalAnalysis: {
    volume: VolumeAnalysis;
    liquidity: LiquidityData;
    patterns: PatternData[];
    predictions: PredictionMetrics;
  };
  riskMetrics: {
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
  };
  crossChain: {
    bridges: {
      volume: number;
      frequency: FrequencyData;
      distribution: ChainDistribution;
    };
    comparison: {
      marketShare: MarketShareData;
      efficiency: EfficiencyMetrics;
      adoption: AdoptionCurve;
    };
  };
} 