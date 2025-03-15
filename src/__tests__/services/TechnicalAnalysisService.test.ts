import { TechnicalAnalysisService } from '@/lib/analysis/services/TechnicalAnalysisService';
import type { TechnicalAnalysisData } from '@/lib/analysis/types';

// Define the type locally since it's internal to the service
interface HistoricalDataPoint {
  timestamp: number;
  price: number;
  volume: number;
}

describe('TechnicalAnalysisService', () => {
  // Mock dependencies
  const mockHistoricalDataProvider = {
    fetch: jest.fn(),
    getLiquidity: jest.fn(),
  };

  const mockMLModel = {
    predict: jest.fn(),
    detectPatterns: jest.fn(),
  };

  let service: TechnicalAnalysisService;

  beforeEach(() => {
    service = new TechnicalAnalysisService(mockHistoricalDataProvider, mockMLModel);
    jest.clearAllMocks();
  });

  describe('analyze', () => {
    const mockHistoricalData: HistoricalDataPoint[] = [
      { timestamp: 1000, price: 100, volume: 1000 },
      { timestamp: 2000, price: 110, volume: 1500 },
      { timestamp: 3000, price: 105, volume: 1200 },
      { timestamp: 4000, price: 115, volume: 2000 },
    ];

    beforeEach(() => {
      mockHistoricalDataProvider.fetch.mockResolvedValue(mockHistoricalData);
      mockHistoricalDataProvider.getLiquidity.mockResolvedValue({
        '100': 1000,
        '110': 1500,
        '105': 1200,
      });
      mockMLModel.predict.mockResolvedValue({
        predictedPrice: 120,
        confidence: 0.8,
        timeframe: '24h',
        supportingFactors: ['uptrend', 'high volume'],
      });
      mockMLModel.detectPatterns.mockResolvedValue([
        {
          type: 'bullish_flag',
          confidence: 0.9,
          startPrice: 100,
          endPrice: 115,
          duration: 3000,
          significance: 0.8,
        },
      ]);
    });

    it('should perform complete technical analysis', async () => {
      const result = await service.analyze('0x123');

      // Verify all dependencies were called
      expect(mockHistoricalDataProvider.fetch).toHaveBeenCalledWith('0x123');
      expect(mockHistoricalDataProvider.getLiquidity).toHaveBeenCalledWith('0x123');
      expect(mockMLModel.predict).toHaveBeenCalledWith(mockHistoricalData);
      expect(mockMLModel.detectPatterns).toHaveBeenCalledWith(mockHistoricalData);

      // Verify result structure
      expect(result).toHaveProperty('volume');
      expect(result).toHaveProperty('liquidity');
      expect(result).toHaveProperty('patterns');
      expect(result).toHaveProperty('predictions');
      expect(result).toHaveProperty('momentum');
      expect(result).toHaveProperty('volatility');
      expect(result).toHaveProperty('trend');
    });

    it('should handle empty historical data', async () => {
      mockHistoricalDataProvider.fetch.mockResolvedValue([]);

      await expect(service.analyze('0x123')).rejects.toThrow('No historical data available');
    });

    it('should calculate correct volume metrics', async () => {
      const result = await service.analyze('0x123');

      expect(result.volume.volumeProfile).toBeDefined();
      expect(result.volume.valueAreas).toEqual(
        expect.objectContaining({
          high: expect.any(Number),
          low: expect.any(Number),
          value: expect.any(Number),
        })
      );
      expect(result.volume.volumeZones).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            price: expect.any(Number),
            volume: expect.any(Number),
            type: expect.stringMatching(/^(accumulation|distribution)$/),
          }),
        ])
      );
    });

    it('should calculate correct momentum indicators', async () => {
      const result = await service.analyze('0x123');

      expect(result.momentum.rsi).toBeGreaterThanOrEqual(0);
      expect(result.momentum.rsi).toBeLessThanOrEqual(100);
      expect(result.momentum.macd).toEqual(
        expect.objectContaining({
          value: expect.any(Number),
          signal: expect.any(Number),
          histogram: expect.any(Number),
        })
      );
      expect(result.momentum.momentum).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      mockHistoricalDataProvider.fetch.mockRejectedValue(new Error('API Error'));

      await expect(service.analyze('0x123')).rejects.toThrow('Failed to perform technical analysis');
    });
  });

  describe('getHistoricalAnalysis', () => {
    it('should return historical analysis data', async () => {
      const startTime = new Date('2024-01-01');
      const endTime = new Date('2024-01-03');

      const result = await service.getHistoricalAnalysis('0x123', startTime, endTime);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle errors in historical analysis', async () => {
      mockHistoricalDataProvider.fetch.mockRejectedValue(new Error('Historical API Error'));

      const startTime = new Date('2024-01-01');
      const endTime = new Date('2024-01-03');

      const result = await service.getHistoricalAnalysis('0x123', startTime, endTime);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('subscribeToUpdates', () => {
    it('should set up subscription and return cleanup function', async () => {
      const mockCallback = jest.fn();
      const cleanup = await service.subscribeToUpdates('0x123', mockCallback);

      expect(typeof cleanup).toBe('function');

      // Clean up subscription
      cleanup();
    });
  });
}); 