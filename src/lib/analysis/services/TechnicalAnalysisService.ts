import {
  VolumeAnalysis,
  LiquidityData,
  PatternData,
  PredictionMetrics,
  MomentumData,
  VolatilityMetrics,
  TrendAnalysis,
  TechnicalAnalysisData
} from "../types";

interface HistoricalDataPoint {
  timestamp: number;
  price: number;
  volume: number;
}

interface HistoricalDataProvider {
  fetch(contractAddress: string): Promise<HistoricalDataPoint[]>;
  getLiquidity(contractAddress: string): Promise<Record<string, number>>;
}

interface MLModel {
  predict(data: HistoricalDataPoint[]): Promise<PredictionMetrics>;
  detectPatterns(data: HistoricalDataPoint[]): Promise<PatternData[]>;
}

export class TechnicalAnalysisService {
  constructor(
    private historicalDataProvider: HistoricalDataProvider,
    private mlModel: MLModel
  ) {}

  async analyze(contractAddress: string): Promise<TechnicalAnalysisData> {
    try {
      // Fetch historical price and volume data
      const historicalData = await this.historicalDataProvider.fetch(contractAddress);

      if (!historicalData || historicalData.length === 0) {
        throw new Error("No historical data available");
      }

      // Perform various analyses in parallel
      const [
        volumeAnalysis,
        liquidityAnalysis,
        patternAnalysis,
        predictions,
        momentumAnalysis,
        volatilityAnalysis,
        trendAnalysis
      ] = await Promise.all([
        this.analyzeVolume(historicalData),
        this.analyzeLiquidity(contractAddress),
        this.analyzePatterns(historicalData),
        this.generatePredictions(historicalData),
        this.analyzeMomentum(historicalData),
        this.analyzeVolatility(historicalData),
        this.analyzeTrend(historicalData)
      ]);

      return {
        volume: volumeAnalysis,
        liquidity: liquidityAnalysis,
        patterns: patternAnalysis,
        predictions,
        momentum: momentumAnalysis,
        volatility: volatilityAnalysis,
        trend: trendAnalysis
      };
    } catch (error) {
      console.error("Error performing technical analysis:", error);
      throw new Error("Failed to perform technical analysis");
    }
  }

  private async analyzeVolume(data: HistoricalDataPoint[]): Promise<VolumeAnalysis> {
    const volumeProfile: Record<string, number> = {};
    const volumes = data.map(d => d.volume);
    const prices = data.map(d => d.price);

    // Calculate volume profile
    data.forEach(({ price, volume }) => {
      const priceLevel = Math.round(price * 100) / 100;
      volumeProfile[priceLevel] = (volumeProfile[priceLevel] || 0) + volume;
    });

    // Calculate value areas
    const sortedVolumes = Object.entries(volumeProfile)
      .sort(([, a], [, b]) => b - a);
    
    const totalVolume = volumes.reduce((a, b) => a + b, 0);
    let cumulativeVolume = 0;
    const valueArea = new Set<number>();

    for (const [price] of sortedVolumes) {
      cumulativeVolume += volumeProfile[price];
      valueArea.add(Number(price));
      if (cumulativeVolume / totalVolume > 0.7) break; // 70% of volume
    }

    const valueAreaPrices = Array.from(valueArea).sort((a, b) => a - b);

    // Detect accumulation/distribution zones
    const volumeZones = this.detectVolumeZones(data);

    return {
      volumeProfile,
      valueAreas: {
        high: Math.max(...valueAreaPrices),
        low: Math.min(...valueAreaPrices),
        value: valueAreaPrices.reduce((a, b) => a + b, 0) / valueAreaPrices.length
      },
      volumeZones
    };
  }

  private async analyzeLiquidity(contractAddress: string): Promise<LiquidityData> {
    try {
      const depthData = await this.historicalDataProvider.getLiquidity(contractAddress);
      
      // Calculate liquidity metrics
      const depths = Object.values(depthData);
      const totalLiquidity = depths.reduce((a, b) => a + b, 0);
      
      // Calculate concentration (Herfindahl-Hirschman Index)
      const concentration = depths
        .map(d => Math.pow((d / totalLiquidity) * 100, 2))
        .reduce((a, b) => a + b, 0) / 10000;

      // Calculate imbalance
      const buyDepth = depths.slice(0, depths.length / 2).reduce((a, b) => a + b, 0);
      const sellDepth = depths.slice(depths.length / 2).reduce((a, b) => a + b, 0);
      const imbalance = Math.abs(buyDepth - sellDepth) / totalLiquidity;

      // Calculate efficiency
      const efficiency = 1 - concentration;

      return {
        depth: depthData,
        concentration,
        imbalance,
        efficiency
      };
    } catch (error) {
      console.error("Error analyzing liquidity:", error);
      throw error;
    }
  }

  private async analyzePatterns(data: HistoricalDataPoint[]): Promise<PatternData[]> {
    try {
      return await this.mlModel.detectPatterns(data);
    } catch (error) {
      console.error("Error detecting patterns:", error);
      return [];
    }
  }

  private async generatePredictions(data: HistoricalDataPoint[]): Promise<PredictionMetrics> {
    try {
      return await this.mlModel.predict(data);
    } catch (error) {
      console.error("Error generating predictions:", error);
      return {
        predictedPrice: data[data.length - 1].price,
        confidence: 0,
        timeframe: "24h",
        supportingFactors: ["insufficient data for prediction"]
      };
    }
  }

  private async analyzeMomentum(data: HistoricalDataPoint[]): Promise<MomentumData> {
    const prices = data.map(d => d.price);
    
    // Calculate RSI
    const rsi = this.calculateRSI(prices);

    // Calculate MACD
    const macd = this.calculateMACD(prices);

    // Calculate momentum (rate of change)
    const momentum = (prices[prices.length - 1] - prices[prices.length - 14]) / prices[prices.length - 14] * 100;

    return {
      rsi,
      macd,
      momentum
    };
  }

  private async analyzeVolatility(data: HistoricalDataPoint[]): Promise<VolatilityMetrics> {
    const prices = data.map(d => d.price);
    const returns = prices.slice(1).map((price, i) => Math.log(price / prices[i]));
    
    // Calculate historical volatility
    const historicalVolatility = this.calculateStandardDeviation(returns) * Math.sqrt(365) * 100;

    // Calculate implied volatility (simplified)
    const impliedVolatility = historicalVolatility * 1.1; // Typically higher than historical

    // Calculate volatility index (simplified VIX-like)
    const volatilityIndex = historicalVolatility * Math.sqrt(30 / 365);

    // Calculate volatility skew
    const volatilitySkew = this.calculateVolatilitySkew(returns);

    return {
      historicalVolatility,
      impliedVolatility,
      volatilityIndex,
      volatilitySkew
    };
  }

  private async analyzeTrend(data: HistoricalDataPoint[]): Promise<TrendAnalysis> {
    const prices = data.map(d => d.price);
    
    // Calculate trend direction and strength
    const sma20 = this.calculateSMA(prices, 20);
    const sma50 = this.calculateSMA(prices, 50);
    
    let direction: 'bullish' | 'bearish' | 'sideways';
    if (sma20 > sma50 * 1.02) {
      direction = 'bullish';
    } else if (sma20 < sma50 * 0.98) {
      direction = 'bearish';
    } else {
      direction = 'sideways';
    }

    // Calculate trend strength using ADX-like measure
    const strength = this.calculateTrendStrength(prices);

    // Calculate support and resistance levels
    const { support, resistance } = this.calculateSupportResistance(prices);

    return {
      direction,
      strength,
      support,
      resistance
    };
  }

  async getHistoricalAnalysis(
    contractAddress: string,
    startTime: Date,
    endTime: Date
  ): Promise<TechnicalAnalysisData[]> {
    try {
      const historicalData = await this.historicalDataProvider.fetch(contractAddress);
      
      // Filter data points within time range
      const filteredData = historicalData.filter(
        d => d.timestamp >= startTime.getTime() && d.timestamp <= endTime.getTime()
      );

      // Group data by day and analyze each day
      const dailyAnalyses = await Promise.all(
        this.groupByDay(filteredData).map(dayData => this.analyze(contractAddress))
      );

      return dailyAnalyses;
    } catch (error) {
      console.error("Error fetching historical analysis:", error);
      return [];
    }
  }

  async subscribeToUpdates(
    contractAddress: string,
    callback: (data: Partial<TechnicalAnalysisData>) => void
  ): Promise<() => void> {
    const interval = setInterval(async () => {
      try {
        const analysis = await this.analyze(contractAddress);
        callback(analysis);
      } catch (error) {
        console.error("Error updating technical analysis:", error);
      }
    }, 60 * 1000); // Update every minute

    return () => clearInterval(interval);
  }

  // Helper methods
  private calculateRSI(prices: number[], period: number = 14): number {
    const changes = prices.slice(1).map((price, i) => price - prices[i]);
    const gains = changes.map(change => change > 0 ? change : 0);
    const losses = changes.map(change => change < 0 ? -change : 0);

    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateMACD(
    prices: number[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
  ): { value: number; signal: number; histogram: number } {
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    const macdLine = fastEMA - slowEMA;
    const signalLine = this.calculateEMA([macdLine], signalPeriod);

    return {
      value: macdLine,
      signal: signalLine,
      histogram: macdLine - signalLine
    };
  }

  private calculateSupportResistance(
    prices: number[]
  ): { support: number[]; resistance: number[] } {
    const pivots = this.findPivotPoints(prices);
    const support = pivots.filter((p, i) => 
      i > 0 && i < pivots.length - 1 && 
      pivots[i - 1] > p && pivots[i + 1] > p
    );
    const resistance = pivots.filter((p, i) => 
      i > 0 && i < pivots.length - 1 && 
      pivots[i - 1] < p && pivots[i + 1] < p
    );

    return {
      support: [...new Set(support)].sort((a, b) => a - b),
      resistance: [...new Set(resistance)].sort((a, b) => a - b)
    };
  }

  private detectVolumeZones(data: HistoricalDataPoint[]): Array<{
    price: number;
    volume: number;
    type: 'accumulation' | 'distribution';
  }> {
    const zones: Array<{
      price: number;
      volume: number;
      type: 'accumulation' | 'distribution';
    }> = [];
    const window = 24; // 24-hour window

    for (let i = window; i < data.length; i++) {
      const windowData = data.slice(i - window, i);
      const priceChange = data[i].price - data[i - window].price;
      const volumeSum = windowData.reduce((sum, d) => sum + d.volume, 0);
      const avgPrice = windowData.reduce((sum, d) => sum + d.price, 0) / window;

      if (volumeSum > this.calculateAverageVolume(data) * 1.5) {
        zones.push({
          price: avgPrice,
          volume: volumeSum,
          type: priceChange > 0 ? 'accumulation' as const : 'distribution' as const
        });
      }
    }

    return zones;
  }

  private calculateAverageVolume(data: HistoricalDataPoint[]): number {
    return data.reduce((sum, d) => sum + d.volume, 0) / data.length;
  }

  private calculateEMA(prices: number[], period: number): number {
    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  private calculateSMA(prices: number[], period: number): number {
    return prices.slice(-period).reduce((a, b) => a + b, 0) / period;
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
  }

  private calculateVolatilitySkew(returns: number[]): number {
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const cubedDiffs = returns.map(r => Math.pow(r - mean, 3));
    const variance = returns.map(r => Math.pow(r - mean, 2))
      .reduce((a, b) => a + b, 0) / returns.length;
    return (cubedDiffs.reduce((a, b) => a + b, 0) / returns.length) /
      Math.pow(Math.sqrt(variance), 3);
  }

  private calculateTrendStrength(prices: number[]): number {
    const changes = prices.slice(1).map((price, i) => price - prices[i]);
    const directionalMovement = changes.map(change => Math.abs(change));
    return directionalMovement.reduce((a, b) => a + b, 0) / prices.length;
  }

  private findPivotPoints(prices: number[]): number[] {
    const pivots: number[] = [];
    const window = 5;

    for (let i = window; i < prices.length - window; i++) {
      const windowPrices = prices.slice(i - window, i + window + 1);
      const midPrice = prices[i];
      
      if (midPrice === Math.max(...windowPrices) || midPrice === Math.min(...windowPrices)) {
        pivots.push(midPrice);
      }
    }

    return pivots;
  }

  private groupByDay(data: HistoricalDataPoint[]): HistoricalDataPoint[][] {
    const groups: { [key: string]: HistoricalDataPoint[] } = {};
    
    data.forEach(point => {
      const date = new Date(point.timestamp).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(point);
    });

    return Object.values(groups);
  }
} 