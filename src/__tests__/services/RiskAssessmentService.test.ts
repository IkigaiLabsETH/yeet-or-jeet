import { RiskAssessmentService } from '@/lib/analysis/services/RiskAssessmentService';
import type { SecurityIssue, AuditInfo, LiquidityMetrics, WhaleMovement, RiskAssessmentData, WalletInfo, MarketImpact, LockInfo } from '@/lib/analysis/types';

describe('RiskAssessmentService', () => {
  // Mock dependencies
  const mockSecurityProvider = {
    scanContract: jest.fn(),
    getAuditInfo: jest.fn(),
  };

  const mockLiquidityProvider = {
    getLiquidityMetrics: jest.fn(),
    getLockInfo: jest.fn(),
  };

  const mockWhaleTracker = {
    getTopWallets: jest.fn(),
    getRecentMovements: jest.fn(),
  };

  let service: RiskAssessmentService;

  beforeEach(() => {
    service = new RiskAssessmentService(
      mockSecurityProvider,
      mockLiquidityProvider,
      mockWhaleTracker
    );
    jest.clearAllMocks();
  });

  describe('analyze', () => {
    const mockSecurityIssues: SecurityIssue[] = [
      {
        severity: 'high',
        type: 'reentrancy',
        description: 'Potential reentrancy vulnerability found',
        location: 'function withdraw()',
        recommendation: 'Implement reentrancy guard',
      },
    ];

    const mockAuditInfo: AuditInfo[] = [{
      score: 95,
      issues: [],
      lastAudit: new Date('2024-01-01'),
      auditor: 'CertiK',
    }];

    const mockLiquidityMetrics: LiquidityMetrics = {
      totalLiquidity: 1000000,
      liquidityDepth: 500000,
      concentrationRisk: 0.3,
      withdrawalRisk: 0.2,
    };

    const mockWhaleMovements: WhaleMovement[] = [
      {
        address: '0x123',
        type: 'buy',
        amount: 100000,
        timestamp: new Date('2024-02-01'),
        priceImpact: 0.5,
      },
    ];

    const mockWalletInfo: WalletInfo[] = [
      {
        address: '0x123',
        balance: 1000000,
        percentage: 5,
        type: 'whale',
      },
    ];

    const mockMarketImpact: MarketImpact = {
      priceImpact: 0.5,
      volumeImpact: 0.3,
      liquidityImpact: 0.4,
      severity: 'medium',
    };

    beforeEach(() => {
      mockSecurityProvider.scanContract.mockResolvedValue(mockSecurityIssues);
      mockSecurityProvider.getAuditInfo.mockResolvedValue(mockAuditInfo);
      mockLiquidityProvider.getLiquidityMetrics.mockResolvedValue(mockLiquidityMetrics);
      mockLiquidityProvider.getLockInfo.mockResolvedValue([{
        amount: 500000,
        duration: 365,
        unlockDate: new Date('2025-01-01'),
        type: 'team',
      }]);
      mockWhaleTracker.getTopWallets.mockResolvedValue(mockWalletInfo);
      mockWhaleTracker.getRecentMovements.mockResolvedValue(mockWhaleMovements);
    });

    it('should perform complete risk assessment', async () => {
      const result = await service.analyze('0x123');

      // Verify all dependencies were called
      expect(mockSecurityProvider.scanContract).toHaveBeenCalledWith('0x123');
      expect(mockSecurityProvider.getAuditInfo).toHaveBeenCalledWith('0x123');
      expect(mockLiquidityProvider.getLiquidityMetrics).toHaveBeenCalledWith('0x123');
      expect(mockWhaleTracker.getTopWallets).toHaveBeenCalledWith('0x123');
      expect(mockWhaleTracker.getRecentMovements).toHaveBeenCalledWith('0x123');

      // Verify result structure
      expect(result).toHaveProperty('security');
      expect(result.security).toHaveProperty('score');
      expect(result.security).toHaveProperty('issues');
      expect(result.security).toHaveProperty('audit');
      expect(result).toHaveProperty('liquidity');
      expect(result).toHaveProperty('whales');
    });

    it('should calculate correct security metrics', async () => {
      const result = await service.analyze('0x123');

      expect(result.security.score).toBeGreaterThanOrEqual(0);
      expect(result.security.score).toBeLessThanOrEqual(100);
      expect(result.security.issues).toEqual(mockSecurityIssues);
      expect(result.security.audit).toEqual(mockAuditInfo[0]);
    });

    it('should calculate correct liquidity metrics', async () => {
      const result = await service.analyze('0x123');

      expect(result.liquidity.totalLiquidity).toBe(mockLiquidityMetrics.totalLiquidity);
      expect(result.liquidity.liquidityDepth).toBe(mockLiquidityMetrics.liquidityDepth);
      expect(result.liquidity.concentrationRisk).toBe(mockLiquidityMetrics.concentrationRisk);
      expect(result.liquidity.withdrawalRisk).toBe(mockLiquidityMetrics.withdrawalRisk);
    });

    it('should calculate correct whale metrics', async () => {
      const result = await service.analyze('0x123');

      expect(result.whales.holders).toEqual(mockWalletInfo);
      expect(result.whales.movements).toEqual(mockWhaleMovements);
      expect(result.whales.impact).toBeDefined();
      expect(result.whales.impact.severity).toMatch(/^(low|medium|high)$/);
    });

    it('should handle missing audit information gracefully', async () => {
      mockSecurityProvider.getAuditInfo.mockResolvedValue([]);

      const result = await service.analyze('0x123');

      expect(result.security.score).toBeLessThan(50); // Lower score due to missing audit
      expect(result.security.audit).toEqual({ score: 0, issues: [] });
    });

    it('should handle API errors gracefully', async () => {
      mockSecurityProvider.scanContract.mockRejectedValue(new Error('API Error'));

      await expect(service.analyze('0x123')).rejects.toThrow('Failed to perform risk assessment');
    });
  });

  describe('getHistoricalRisk', () => {
    it('should return historical risk data', async () => {
      const startTime = new Date('2024-01-01');
      const endTime = new Date('2024-01-03');

      const result = await service.getHistoricalRisk('0x123', startTime, endTime);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((assessment: RiskAssessmentData) => {
        expect(assessment.security).toBeDefined();
        expect(assessment.liquidity).toBeDefined();
        expect(assessment.whales).toBeDefined();
      });
    });

    it('should handle errors in historical data retrieval', async () => {
      mockWhaleTracker.getRecentMovements.mockRejectedValue(new Error('Historical API Error'));

      const startTime = new Date('2024-01-01');
      const endTime = new Date('2024-01-03');

      const result = await service.getHistoricalRisk('0x123', startTime, endTime);

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

    it('should call callback when risk levels change', async () => {
      const mockCallback = jest.fn();
      await service.subscribeToUpdates('0x123', mockCallback);

      // Simulate a risk level change
      mockWhaleTracker.getRecentMovements.mockResolvedValueOnce([
        {
          address: '0x123',
          type: 'sell',
          amount: 500000,
          timestamp: new Date(),
          priceImpact: 2.5,
        },
      ]);

      // Trigger an update
      await service.analyze('0x123');

      expect(mockCallback).toHaveBeenCalled();
      expect(mockCallback.mock.calls[0][0]).toHaveProperty('security');
    });
  });
}); 