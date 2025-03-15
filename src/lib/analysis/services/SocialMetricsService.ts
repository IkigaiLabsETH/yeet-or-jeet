import {
  SentimentData,
  EngagementMetrics,
  MessageStats,
  GrowthMetrics,
  GroupStats,
  ActivityData
} from "../types";

interface TwitterProvider {
  getSentiment(query: string): Promise<SentimentData>;
  getEngagement(query: string): Promise<EngagementMetrics>;
}

interface DiscordProvider {
  getMessageStats(serverId: string): Promise<MessageStats>;
  getGrowthMetrics(serverId: string): Promise<GrowthMetrics>;
}

interface TelegramProvider {
  getGroupStats(groupId: string): Promise<GroupStats>;
  getActivityData(groupId: string): Promise<ActivityData>;
}

interface ProjectMetadata {
  twitter?: {
    handle: string;
    cashtag: string;
  };
  discord?: {
    serverId: string;
  };
  telegram?: {
    groupId: string;
  };
}

export class SocialMetricsService {
  constructor(
    private twitterProvider: TwitterProvider,
    private discordProvider: DiscordProvider,
    private telegramProvider: TelegramProvider,
    private metadataProvider: (address: string) => Promise<ProjectMetadata>
  ) {}

  async analyze(contractAddress: string): Promise<{
    twitter: SentimentData & EngagementMetrics;
    discord: MessageStats & GrowthMetrics;
    telegram: GroupStats & ActivityData;
  }> {
    try {
      const metadata = await this.metadataProvider(contractAddress);

      // Fetch social metrics in parallel
      const [
        twitterMetrics,
        discordMetrics,
        telegramMetrics
      ] = await Promise.all([
        this.analyzeTwitter(metadata.twitter),
        this.analyzeDiscord(metadata.discord),
        this.analyzeTelegram(metadata.telegram)
      ]);

      return {
        twitter: twitterMetrics,
        discord: discordMetrics,
        telegram: telegramMetrics
      };
    } catch (error) {
      console.error("Error analyzing social metrics:", error);
      throw new Error("Failed to analyze social metrics");
    }
  }

  private async analyzeTwitter(metadata?: ProjectMetadata['twitter']): Promise<SentimentData & EngagementMetrics> {
    if (!metadata) {
      return this.getEmptyTwitterMetrics();
    }

    try {
      const query = `${metadata.handle} OR $${metadata.cashtag}`;
      const [sentiment, engagement] = await Promise.all([
        this.twitterProvider.getSentiment(query),
        this.twitterProvider.getEngagement(query)
      ]);

      return {
        ...sentiment,
        ...engagement
      };
    } catch (error) {
      console.error("Error analyzing Twitter metrics:", error);
      return this.getEmptyTwitterMetrics();
    }
  }

  private async analyzeDiscord(metadata?: ProjectMetadata['discord']): Promise<MessageStats & GrowthMetrics> {
    if (!metadata) {
      return this.getEmptyDiscordMetrics();
    }

    try {
      const [messageStats, growthMetrics] = await Promise.all([
        this.discordProvider.getMessageStats(metadata.serverId),
        this.discordProvider.getGrowthMetrics(metadata.serverId)
      ]);

      return {
        ...messageStats,
        ...growthMetrics
      };
    } catch (error) {
      console.error("Error analyzing Discord metrics:", error);
      return this.getEmptyDiscordMetrics();
    }
  }

  private async analyzeTelegram(metadata?: ProjectMetadata['telegram']): Promise<GroupStats & ActivityData> {
    if (!metadata) {
      return this.getEmptyTelegramMetrics();
    }

    try {
      const [groupStats, activityData] = await Promise.all([
        this.telegramProvider.getGroupStats(metadata.groupId),
        this.telegramProvider.getActivityData(metadata.groupId)
      ]);

      return {
        ...groupStats,
        ...activityData
      };
    } catch (error) {
      console.error("Error analyzing Telegram metrics:", error);
      return this.getEmptyTelegramMetrics();
    }
  }

  private getEmptyTwitterMetrics(): SentimentData & EngagementMetrics {
    return {
      score: 0,
      magnitude: 0,
      keywords: [],
      timestamp: new Date(),
      likes: 0,
      retweets: 0,
      replies: 0,
      impressions: 0,
      engagementRate: 0
    };
  }

  private getEmptyDiscordMetrics(): MessageStats & GrowthMetrics {
    return {
      total: 0,
      activeChannels: 0,
      peakHours: [],
      topContributors: [],
      newMembers: 0,
      churnRate: 0,
      retentionRate: 0,
      growthRate: 0
    };
  }

  private getEmptyTelegramMetrics(): GroupStats & ActivityData {
    return {
      memberCount: 0,
      activeMembers: 0,
      messageFrequency: 0,
      topicDistribution: {},
      dailyActiveUsers: 0,
      weeklyActiveUsers: 0,
      monthlyActiveUsers: 0,
      activityHeatmap: {}
    };
  }

  async getHistoricalMetrics(
    contractAddress: string,
    startTime: Date,
    endTime: Date
  ): Promise<Array<{
    timestamp: Date;
    twitter: SentimentData & EngagementMetrics;
    discord: MessageStats & GrowthMetrics;
    telegram: GroupStats & ActivityData;
  }>> {
    try {
      const days = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24));
      const analyses = [];

      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000);
        const analysis = await this.analyze(contractAddress);
        analyses.push({
          timestamp: currentDate,
          ...analysis
        });
      }

      return analyses;
    } catch (error) {
      console.error("Error fetching historical metrics:", error);
      return [];
    }
  }

  async subscribeToUpdates(
    contractAddress: string,
    callback: (data: {
      twitter: Partial<SentimentData & EngagementMetrics>;
      discord: Partial<MessageStats & GrowthMetrics>;
      telegram: Partial<GroupStats & ActivityData>;
    }) => void
  ): Promise<() => void> {
    const interval = setInterval(async () => {
      try {
        const analysis = await this.analyze(contractAddress);
        callback(analysis);
      } catch (error) {
        console.error("Error updating social metrics:", error);
      }
    }, 5 * 60 * 1000); // Update every 5 minutes

    return () => clearInterval(interval);
  }
} 