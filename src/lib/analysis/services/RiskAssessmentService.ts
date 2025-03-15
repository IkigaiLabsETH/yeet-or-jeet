import {
  SecurityIssue,
  AuditInfo,
  LiquidityMetrics,
  LockInfo,
  WalletInfo,
  WhaleMovement,
  RiskAssessmentData,
  MarketImpact
} from "../types";

interface SecurityProvider {
  scanContract(address: string): Promise<SecurityIssue[]>;
  getAuditInfo(address: string): Promise<AuditInfo[]>;
}

interface LiquidityProvider {
  getLiquidityMetrics(address: string): Promise<LiquidityMetrics>;
  getLockInfo(address: string): Promise<LockInfo[]>;
}

interface WhaleTracker {
  getTopWallets(address: string): Promise<WalletInfo[]>;
  getRecentMovements(address: string): Promise<WhaleMovement[]>;
}

export class RiskAssessmentService {
  constructor(
    private securityProvider: SecurityProvider,
    private liquidityProvider: LiquidityProvider,
    private whaleTracker: WhaleTracker
  ) {}

  async analyze(contractAddress: string): Promise<RiskAssessmentData> {
    try {
      // Perform various risk analyses in parallel
      const [
        securityIssues,
        auditInfo,
        liquidityMetrics,
        lockInfo,
        whaleActivity,
        marketImpact
      ] = await Promise.all([
        this.scanForSecurityIssues(contractAddress),
        this.getAuditInformation(contractAddress),
        this.analyzeLiquidityRisk(contractAddress),
        this.analyzeLockStatus(contractAddress),
        this.analyzeWhaleActivity(contractAddress),
        this.assessMarketImpact(contractAddress)
      ]);

      return {
        security: {
          score: this.calculateSecurityScore(securityIssues, auditInfo),
          issues: securityIssues,
          audit: auditInfo[0] || {
            score: 0,
            issues: []
          }
        },
        liquidity: {
          ...liquidityMetrics,
          ...lockInfo[0] || {
            amount: 0,
            duration: 0,
            unlockDate: new Date(),
            type: 'treasury'
          }
        },
        whales: {
          holders: whaleActivity.topWallets,
          movements: whaleActivity.recentMovements,
          impact: marketImpact
        }
      };
    } catch (error) {
      console.error("Error performing risk assessment:", error);
      throw new Error("Failed to perform risk assessment");
    }
  }

  private async scanForSecurityIssues(contractAddress: string): Promise<SecurityIssue[]> {
    try {
      return await this.securityProvider.scanContract(contractAddress);
    } catch (error) {
      console.error("Error scanning for security issues:", error);
      return [];
    }
  }

  private async getAuditInformation(contractAddress: string): Promise<AuditInfo[]> {
    try {
      return await this.securityProvider.getAuditInfo(contractAddress);
    } catch (error) {
      console.error("Error fetching audit information:", error);
      return [];
    }
  }

  private async analyzeLiquidityRisk(contractAddress: string): Promise<LiquidityMetrics> {
    try {
      return await this.liquidityProvider.getLiquidityMetrics(contractAddress);
    } catch (error) {
      console.error("Error analyzing liquidity risk:", error);
      return {
        totalLiquidity: 0,
        liquidityDepth: 0,
        concentrationRisk: 0,
        withdrawalRisk: 0
      };
    }
  }

  private async analyzeLockStatus(contractAddress: string): Promise<LockInfo[]> {
    try {
      return await this.liquidityProvider.getLockInfo(contractAddress);
    } catch (error) {
      console.error("Error analyzing lock status:", error);
      return [];
    }
  }

  private async analyzeWhaleActivity(contractAddress: string): Promise<{
    topWallets: WalletInfo[];
    recentMovements: WhaleMovement[];
  }> {
    try {
      const [topWallets, recentMovements] = await Promise.all([
        this.whaleTracker.getTopWallets(contractAddress),
        this.whaleTracker.getRecentMovements(contractAddress)
      ]);

      return {
        topWallets,
        recentMovements
      };
    } catch (error) {
      console.error("Error analyzing whale activity:", error);
      return {
        topWallets: [],
        recentMovements: []
      };
    }
  }

  private async assessMarketImpact(contractAddress: string): Promise<MarketImpact> {
    try {
      const movements = await this.whaleTracker.getRecentMovements(contractAddress);
      
      // Calculate impact metrics based on recent whale movements
      const impacts = movements.map(m => ({
        price: m.priceImpact,
        volume: m.amount,
        liquidity: m.priceImpact * m.amount
      }));

      const avgPriceImpact = this.calculateAverage(impacts.map(i => i.price));
      const avgVolumeImpact = this.calculateAverage(impacts.map(i => i.volume));
      const avgLiquidityImpact = this.calculateAverage(impacts.map(i => i.liquidity));

      // Determine severity based on impact metrics
      let severity: 'low' | 'medium' | 'high' = 'low';
      const totalImpact = avgPriceImpact + avgVolumeImpact + avgLiquidityImpact;

      if (totalImpact > 0.5) {
        severity = 'high';
      } else if (totalImpact > 0.2) {
        severity = 'medium';
      }

      return {
        priceImpact: avgPriceImpact,
        volumeImpact: avgVolumeImpact,
        liquidityImpact: avgLiquidityImpact,
        severity
      };
    } catch (error) {
      console.error("Error assessing market impact:", error);
      return {
        priceImpact: 0,
        volumeImpact: 0,
        liquidityImpact: 0,
        severity: 'low'
      };
    }
  }

  private calculateSecurityScore(issues: SecurityIssue[], audits: AuditInfo[]): number {
    let score = 100;

    // Deduct points for security issues
    const severityWeights = {
      critical: 30,
      high: 20,
      medium: 10,
      low: 5
    };

    const issuesDeduction = issues.reduce((total, issue) => 
      total + severityWeights[issue.severity], 0);
    score -= Math.min(issuesDeduction, 50);

    // Add points for audits
    const auditScore = audits.reduce((total, audit) => total + audit.score, 0);
    score += Math.min(auditScore, 20);

    return Math.max(0, Math.min(100, score));
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  async getHistoricalRisk(
    contractAddress: string,
    startTime: Date,
    endTime: Date
  ): Promise<RiskAssessmentData[]> {
    try {
      // For historical analysis, we'll analyze at daily intervals
      const days = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24));
      const analyses: RiskAssessmentData[] = [];

      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000);
        const analysis = await this.analyze(contractAddress);
        analyses.push(analysis);
      }

      return analyses;
    } catch (error) {
      console.error("Error fetching historical risk analysis:", error);
      return [];
    }
  }

  async subscribeToUpdates(
    contractAddress: string,
    callback: (data: Partial<RiskAssessmentData>) => void
  ): Promise<() => void> {
    const interval = setInterval(async () => {
      try {
        const analysis = await this.analyze(contractAddress);
        callback(analysis);
      } catch (error) {
        console.error("Error updating risk assessment:", error);
      }
    }, 5 * 60 * 1000); // Update every 5 minutes

    return () => clearInterval(interval);
  }
} 