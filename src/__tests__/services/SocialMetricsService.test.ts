import { SocialMetricsService } from '@/lib/analysis/services/SocialMetricsService';
import type {
  SentimentData,
  EngagementMetrics,
  MessageStats,
  GrowthMetrics,
  GroupStats,
  ActivityData,
} from '@/lib/analysis/types';

describe('SocialMetricsService', () => {
  // Mock providers
  const mockTwitterProvider = {
    getSentiment: jest.fn(),
    getEngagement: jest.fn(),
  };

  const mockDiscordProvider = {
    getMessageStats: jest.fn(),
    getGrowthMetrics: jest.fn(),
  };

  const mockTelegramProvider = {
    getGroupStats: jest.fn(),
    getActivityData: jest.fn(),
  };

  const mockMetadataProvider = jest.fn();

  let service: SocialMetricsService;

  beforeEach(() => {
    service = new SocialMetricsService(
      mockTwitterProvider,
      mockDiscordProvider,
      mockTelegramProvider,
      mockMetadataProvider
    );
    jest.clearAllMocks();
  });

  describe('analyze', () => {
    const mockTwitterData: SentimentData & EngagementMetrics = {
      score: 0.75,
      magnitude: 0.85,
      keywords: ['moon', 'bullish', 'launch'],
      timestamp: new Date(),
      likes: 2000,
      retweets: 500,
      replies: 150,
      impressions: 50000,
      engagementRate: 0.05,
    };

    const mockDiscordData: MessageStats & GrowthMetrics = {
      total: 5000,
      activeChannels: 10,
      peakHours: [14, 15, 16],
      topContributors: ['user1', 'user2', 'user3'],
      newMembers: 100,
      churnRate: 0.15,
      retentionRate: 0.85,
      growthRate: 0.1,
    };

    const mockTelegramData: GroupStats & ActivityData = {
      memberCount: 25000,
      activeMembers: 5000,
      messageFrequency: 0.8,
      topicDistribution: {
        'trading': 0.4,
        'tech': 0.3,
        'general': 0.3,
      },
      dailyActiveUsers: 2000,
      weeklyActiveUsers: 5000,
      monthlyActiveUsers: 10000,
      activityHeatmap: {
        '00': 100,
        '01': 80,
        '02': 60,
      },
    };

    beforeEach(() => {
      // Mock metadata provider
      mockMetadataProvider.mockResolvedValue({
        twitter: { handle: 'project', cashtag: 'TOKEN' },
        discord: { serverId: 'server123' },
        telegram: { groupId: 'group123' },
      });

      // Mock provider methods
      mockTwitterProvider.getSentiment.mockResolvedValue({
        score: mockTwitterData.score,
        magnitude: mockTwitterData.magnitude,
        keywords: mockTwitterData.keywords,
        timestamp: mockTwitterData.timestamp,
      });
      mockTwitterProvider.getEngagement.mockResolvedValue({
        likes: mockTwitterData.likes,
        retweets: mockTwitterData.retweets,
        replies: mockTwitterData.replies,
        impressions: mockTwitterData.impressions,
        engagementRate: mockTwitterData.engagementRate,
      });

      mockDiscordProvider.getMessageStats.mockResolvedValue({
        total: mockDiscordData.total,
        activeChannels: mockDiscordData.activeChannels,
        peakHours: mockDiscordData.peakHours,
        topContributors: mockDiscordData.topContributors,
      });
      mockDiscordProvider.getGrowthMetrics.mockResolvedValue({
        newMembers: mockDiscordData.newMembers,
        churnRate: mockDiscordData.churnRate,
        retentionRate: mockDiscordData.retentionRate,
        growthRate: mockDiscordData.growthRate,
      });

      mockTelegramProvider.getGroupStats.mockResolvedValue({
        memberCount: mockTelegramData.memberCount,
        activeMembers: mockTelegramData.activeMembers,
        messageFrequency: mockTelegramData.messageFrequency,
        topicDistribution: mockTelegramData.topicDistribution,
      });
      mockTelegramProvider.getActivityData.mockResolvedValue({
        dailyActiveUsers: mockTelegramData.dailyActiveUsers,
        weeklyActiveUsers: mockTelegramData.weeklyActiveUsers,
        monthlyActiveUsers: mockTelegramData.monthlyActiveUsers,
        activityHeatmap: mockTelegramData.activityHeatmap,
      });
    });

    it('should perform complete social analysis', async () => {
      const result = await service.analyze('0x123');

      expect(result).toHaveProperty('twitter');
      expect(result).toHaveProperty('discord');
      expect(result).toHaveProperty('telegram');

      expect(result.twitter).toEqual(mockTwitterData);
      expect(result.discord).toEqual(mockDiscordData);
      expect(result.telegram).toEqual(mockTelegramData);
    });

    it('should handle Twitter API errors gracefully', async () => {
      mockTwitterProvider.getSentiment.mockRejectedValue(new Error('Twitter API Error'));
      mockTwitterProvider.getEngagement.mockRejectedValue(new Error('Twitter API Error'));

      const result = await service.analyze('0x123');

      expect(result.twitter).toEqual({
        score: 0,
        magnitude: 0,
        keywords: [],
        timestamp: expect.any(Date),
        likes: 0,
        retweets: 0,
        replies: 0,
        impressions: 0,
        engagementRate: 0,
      });
      expect(result.discord).toEqual(mockDiscordData);
      expect(result.telegram).toEqual(mockTelegramData);
    });

    it('should handle Discord API errors gracefully', async () => {
      mockDiscordProvider.getMessageStats.mockRejectedValue(new Error('Discord API Error'));
      mockDiscordProvider.getGrowthMetrics.mockRejectedValue(new Error('Discord API Error'));

      const result = await service.analyze('0x123');

      expect(result.twitter).toEqual(mockTwitterData);
      expect(result.discord).toEqual({
        total: 0,
        activeChannels: 0,
        peakHours: [],
        topContributors: [],
        newMembers: 0,
        churnRate: 0,
        retentionRate: 0,
        growthRate: 0,
      });
      expect(result.telegram).toEqual(mockTelegramData);
    });

    it('should handle Telegram API errors gracefully', async () => {
      mockTelegramProvider.getGroupStats.mockRejectedValue(new Error('Telegram API Error'));
      mockTelegramProvider.getActivityData.mockRejectedValue(new Error('Telegram API Error'));

      const result = await service.analyze('0x123');

      expect(result.twitter).toEqual(mockTwitterData);
      expect(result.discord).toEqual(mockDiscordData);
      expect(result.telegram).toEqual({
        memberCount: 0,
        activeMembers: 0,
        messageFrequency: 0,
        topicDistribution: {},
        dailyActiveUsers: 0,
        weeklyActiveUsers: 0,
        monthlyActiveUsers: 0,
        activityHeatmap: {},
      });
    });
  });

  describe('getHistoricalMetrics', () => {
    it('should return historical social metrics', async () => {
      const startTime = new Date('2024-01-01');
      const endTime = new Date('2024-01-03');

      const result = await service.getHistoricalMetrics('0x123', startTime, endTime);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(metrics => {
        expect(metrics).toHaveProperty('timestamp');
        expect(metrics).toHaveProperty('twitter');
        expect(metrics).toHaveProperty('discord');
        expect(metrics).toHaveProperty('telegram');
      });
    });

    it('should handle errors in historical data retrieval', async () => {
      mockTwitterProvider.getSentiment.mockRejectedValue(new Error('Historical API Error'));
      mockTwitterProvider.getEngagement.mockRejectedValue(new Error('Historical API Error'));

      const startTime = new Date('2024-01-01');
      const endTime = new Date('2024-01-03');

      const result = await service.getHistoricalMetrics('0x123', startTime, endTime);

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

    it('should call callback when social metrics change', async () => {
      const mockCallback = jest.fn();
      await service.subscribeToUpdates('0x123', mockCallback);

      // Simulate a metrics change
      mockTwitterProvider.getSentiment.mockResolvedValueOnce({
        score: 0.9,
        magnitude: 0.95,
        keywords: ['moon', 'bullish', 'launch', 'partnership'],
        timestamp: new Date(),
      });
      mockTwitterProvider.getEngagement.mockResolvedValueOnce({
        likes: 4000,
        retweets: 1000,
        replies: 300,
        impressions: 75000,
        engagementRate: 0.08,
      });

      // Trigger an update
      await service.analyze('0x123');

      expect(mockCallback).toHaveBeenCalled();
      expect(mockCallback.mock.calls[0][0]).toHaveProperty('twitter');
    });
  });
}); 