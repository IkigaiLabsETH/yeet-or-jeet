import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { AggregatedData } from "../types";
import { SocialMetricsService } from "./SocialMetricsService";
import { TechnicalAnalysisService } from "./TechnicalAnalysisService";
import { RiskAssessmentService } from "./RiskAssessmentService";
import { CrossChainAnalysisService } from "./CrossChainAnalysisService";

export class DataAggregationService {
  private sdk: ThirdwebSDK;
  private socialMetrics: SocialMetricsService;
  private technicalAnalysis: TechnicalAnalysisService;
  private riskAssessment: RiskAssessmentService;
  private crossChainAnalysis: CrossChainAnalysisService;

  constructor(
    sdk: ThirdwebSDK,
    socialMetrics: SocialMetricsService,
    technicalAnalysis: TechnicalAnalysisService,
    riskAssessment: RiskAssessmentService,
    crossChainAnalysis: CrossChainAnalysisService
  ) {
    this.sdk = sdk;
    this.socialMetrics = socialMetrics;
    this.technicalAnalysis = technicalAnalysis;
    this.riskAssessment = riskAssessment;
    this.crossChainAnalysis = crossChainAnalysis;
  }

  async aggregateProtocolData(contractAddress: string): Promise<AggregatedData> {
    try {
      // Fetch Nebula data
      const contract = await this.sdk.getContract(contractAddress);
      const nebulaData = await contract.metadata.get();

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
        nebulaData,
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
      this.socialMetrics.subscribeToUpdates(contractAddress, callback),
      this.technicalAnalysis.subscribeToUpdates(contractAddress, callback),
      this.riskAssessment.subscribeToUpdates(contractAddress, callback),
      this.crossChainAnalysis.subscribeToUpdates(contractAddress, callback)
    ]);

    // Return cleanup function
    return () => {
      cleanup.forEach(cleanupFn => cleanupFn());
    };
  }
} 