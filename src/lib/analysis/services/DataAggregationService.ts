import { SmartContract } from '@thirdweb-dev/react';
import { BaseContract } from 'ethers';
import { AggregatedData } from "@/lib/analysis/types";
import { SocialMetricsService } from "@/lib/analysis/services/SocialMetricsService";
import { TechnicalAnalysisService } from "@/lib/analysis/services/TechnicalAnalysisService";
import { RiskAssessmentService } from "@/lib/analysis/services/RiskAssessmentService";
import { CrossChainAnalysisService } from "@/lib/analysis/services/CrossChainAnalysisService";

export class DataAggregationService {
  private contract: SmartContract<BaseContract>;
  private socialMetrics: SocialMetricsService;
  private technicalAnalysis: TechnicalAnalysisService;
  private riskAssessment: RiskAssessmentService;
  private crossChainAnalysis: CrossChainAnalysisService;

  constructor(
    contract: SmartContract<BaseContract>,
    socialMetrics: SocialMetricsService,
    technicalAnalysis: TechnicalAnalysisService,
    riskAssessment: RiskAssessmentService,
    crossChainAnalysis: CrossChainAnalysisService
  ) {
    this.contract = contract;
    this.socialMetrics = socialMetrics;
    this.technicalAnalysis = technicalAnalysis;
    this.riskAssessment = riskAssessment;
    this.crossChainAnalysis = crossChainAnalysis;
  }

  async aggregateProtocolData(contractAddress: string): Promise<AggregatedData> {
    try {
      // Fetch contract metadata using V5 contract
      const metadata = await this.contract.metadata.get();

      // Fetch data from all services in parallel
      const [
        socialMetricsData,
        technicalAnalysisData,
        riskMetricsData,
        crossChainData
      ] = await Promise.all([
        this.socialMetrics.fetchMetrics(contractAddress),
        this.technicalAnalysis.analyze(contractAddress),
        this.riskAssessment.evaluate(contractAddress),
        this.crossChainAnalysis.analyze(contractAddress)
      ]);

      // Combine all data
      return {
        nebulaData: metadata,
        socialMetrics: socialMetricsData,
        technicalAnalysis: technicalAnalysisData,
        riskMetrics: riskMetricsData,
        crossChain: crossChainData
      };
    } catch (error) {
      console.error("Error aggregating protocol data:", error);
      throw new Error("Failed to aggregate protocol data");
    }
  }

  async getHistoricalData(
    contractAddress: string,
    startTime: Date,
    endTime: Date
  ): Promise<AggregatedData[]> {
    try {
      // Implement historical data fetching logic
      const [
        socialHistory,
        technicalHistory,
        riskHistory,
        crossChainHistory
      ] = await Promise.all([
        this.socialMetrics.getHistoricalMetrics(contractAddress, startTime, endTime),
        this.technicalAnalysis.getHistoricalAnalysis(contractAddress, startTime, endTime),
        this.riskAssessment.getHistoricalRisk(contractAddress, startTime, endTime),
        this.crossChainAnalysis.getHistoricalData(contractAddress, startTime, endTime)
      ]);

      // Combine historical data points
      // Implementation depends on how you want to structure historical data
      return [];
    } catch (error) {
      console.error("Error fetching historical data:", error);
      throw new Error("Failed to fetch historical data");
    }
  }

  async getRealtimeUpdates(
    contractAddress: string,
    callback: (data: Partial<AggregatedData>) => void
  ): Promise<() => void> {
    // Set up WebSocket or polling connections for real-time updates
    const cleanup = await Promise.all([
      this.socialMetrics.subscribeToUpdates(contractAddress, (data) => {
        if (data.twitter || data.discord || data.telegram) {
          callback({ socialMetrics: data as AggregatedData['socialMetrics'] });
        }
      }),
      this.technicalAnalysis.subscribeToUpdates(contractAddress, (data) => {
        if (data.volume || data.liquidity || data.patterns || data.predictions) {
          callback({ technicalAnalysis: data as AggregatedData['technicalAnalysis'] });
        }
      }),
      this.riskAssessment.subscribeToUpdates(contractAddress, (data) => {
        if (data.security || data.liquidity || data.whales) {
          callback({ riskMetrics: data as AggregatedData['riskMetrics'] });
        }
      }),
      this.crossChainAnalysis.subscribeToUpdates(contractAddress, (data) => {
        if (data.bridges || data.comparison) {
          callback({ crossChain: data as AggregatedData['crossChain'] });
        }
      })
    ]);

    // Return cleanup function
    return () => {
      cleanup.forEach((cleanupFn: () => void) => cleanupFn());
    };
  }
} 