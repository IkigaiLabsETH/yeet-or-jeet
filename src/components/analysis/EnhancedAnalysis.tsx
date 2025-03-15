import { useEffect, useState } from 'react';
import { AggregatedData } from '@/lib/analysis/types';
import { DataAggregationService } from '@/lib/analysis/services/DataAggregationService';
import { SocialMetricsService } from '@/lib/analysis/services/SocialMetricsService';
import { TechnicalAnalysisService } from '@/lib/analysis/services/TechnicalAnalysisService';
import { RiskAssessmentService } from '@/lib/analysis/services/RiskAssessmentService';
import { CrossChainAnalysisService } from '@/lib/analysis/services/CrossChainAnalysisService';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';

interface EnhancedAnalysisProps {
  contractAddress: string;
  sdk: ThirdwebSDK;
}

export function EnhancedAnalysis({ contractAddress, sdk }: EnhancedAnalysisProps) {
  const [analysisData, setAnalysisData] = useState<AggregatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize services
        const socialMetrics = new SocialMetricsService(
          process.env.NEXT_PUBLIC_TWITTER_API_KEY || '',
          process.env.NEXT_PUBLIC_DISCORD_BOT_TOKEN || '',
          process.env.NEXT_PUBLIC_TELEGRAM_API_KEY || ''
        );

        const technicalAnalysis = new TechnicalAnalysisService(
          null, // Replace with actual historical data provider
          null  // Replace with actual ML model
        );

        const riskAssessment = new RiskAssessmentService(
          null, // Replace with actual security scanner
          null, // Replace with actual contract analyzer
          null  // Replace with actual whale tracker
        );

        const crossChainAnalysis = new CrossChainAnalysisService(
          null, // Replace with actual bridge monitor
          null, // Replace with actual market data provider
          null  // Replace with actual chain analyzer
        );

        const dataAggregator = new DataAggregationService(
          sdk,
          socialMetrics,
          technicalAnalysis,
          riskAssessment,
          crossChainAnalysis
        );

        // Fetch initial data
        const data = await dataAggregator.aggregateProtocolData(contractAddress);
        setAnalysisData(data);

        // Set up real-time updates
        const cleanup = await dataAggregator.getRealtimeUpdates(
          contractAddress,
          (updates) => {
            setAnalysisData((prev) => prev ? { ...prev, ...updates } : null);
          }
        );

        return cleanup;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contractAddress, sdk]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!analysisData) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Social Metrics Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Social Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Twitter Metrics */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Twitter</h3>
            <p>Sentiment Score: {analysisData.socialMetrics.twitter.score}</p>
            <p>Engagement Rate: {analysisData.socialMetrics.twitter.engagementRate}%</p>
          </div>

          {/* Discord Metrics */}
          <div className="p-4 bg-indigo-50 rounded-lg">
            <h3 className="font-semibold mb-2">Discord</h3>
            <p>Active Users: {analysisData.socialMetrics.discord.activeChannels}</p>
            <p>Growth Rate: {analysisData.socialMetrics.discord.growthRate}%</p>
          </div>

          {/* Telegram Metrics */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Telegram</h3>
            <p>Active Members: {analysisData.socialMetrics.telegram.activeMembers}</p>
            <p>Message Frequency: {analysisData.socialMetrics.telegram.messageFrequency}</p>
          </div>
        </div>
      </section>

      {/* Technical Analysis Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Technical Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Volume Analysis */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Volume Profile</h3>
            <p>High: ${analysisData.technicalAnalysis.volume.valueAreas.high}</p>
            <p>Low: ${analysisData.technicalAnalysis.volume.valueAreas.low}</p>
            <p>Value Area: ${analysisData.technicalAnalysis.volume.valueAreas.value}</p>
          </div>

          {/* Price Predictions */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Price Prediction</h3>
            <p>Target: ${analysisData.technicalAnalysis.predictions.predictedPrice}</p>
            <p>Confidence: {analysisData.technicalAnalysis.predictions.confidence}%</p>
            <p>Timeframe: {analysisData.technicalAnalysis.predictions.timeframe}</p>
          </div>
        </div>
      </section>

      {/* Risk Assessment Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Risk Assessment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Security Score */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Security</h3>
            <p>Score: {analysisData.riskMetrics.security.score}/100</p>
            <p>Issues: {analysisData.riskMetrics.security.issues.length}</p>
          </div>

          {/* Liquidity Analysis */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Liquidity</h3>
            <p>Total: ${analysisData.riskMetrics.liquidity.totalLiquidity}</p>
            <p>Lock Status: {analysisData.riskMetrics.liquidity.isLocked ? 'Locked' : 'Unlocked'}</p>
          </div>

          {/* Whale Activity */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Whale Activity</h3>
            <p>Top Holders: {analysisData.riskMetrics.whales.holders.length}</p>
            <p>Market Impact: {analysisData.riskMetrics.whales.impact.severity}</p>
          </div>
        </div>
      </section>

      {/* Cross-Chain Analysis Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Cross-Chain Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bridge Activity */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Bridge Activity</h3>
            <p>Volume: ${analysisData.crossChain.bridges.volume}</p>
            <p>Frequency: {analysisData.crossChain.bridges.frequency.trend}</p>
          </div>

          {/* Market Position */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Market Position</h3>
            <p>Market Share: {analysisData.crossChain.comparison.marketShare.totalShare}%</p>
            <p>Ranking: #{analysisData.crossChain.comparison.marketShare.ranking}</p>
          </div>
        </div>
      </section>
    </div>
  );
} 