# b/era API Documentation

## Overview

The b/era API provides programmatic access to b/era's DeFi trading assistant features, including social metrics analysis, risk assessment, and historical data analysis for tokens on Berachain and NFT collections on Ethereum.

## Authentication

All API endpoints require authentication using an API key. To obtain an API key, please contact the b/era team.

Include your API key in all requests using the `X-API-KEY` header:

```bash
curl -H "X-API-KEY: your_api_key_here" https://api.bera-ai.xyz/v1/analyze/social/0x123...
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- Free tier: 100 requests per minute
- Pro tier: 1000 requests per minute
- Enterprise tier: Custom limits

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Total requests allowed per minute
- `X-RateLimit-Remaining`: Remaining requests for the current window
- `X-RateLimit-Reset`: Time when the rate limit will reset (Unix timestamp)

## Endpoints

### Social Metrics Analysis

```http
GET /analyze/social/{contractAddress}
```

Retrieve comprehensive social metrics analysis for a contract, including Twitter sentiment, Discord activity, and Telegram metrics.

#### Parameters

- `contractAddress` (path): The contract address to analyze

#### Response

```json
{
  "twitter": {
    "score": 0.75,
    "magnitude": 0.85,
    "keywords": ["moon", "bullish", "launch"],
    "timestamp": "2024-02-14T12:00:00Z",
    "likes": 2000,
    "retweets": 500,
    "replies": 150,
    "impressions": 50000,
    "engagementRate": 0.05
  },
  "discord": {
    "total": 5000,
    "activeChannels": 10,
    "peakHours": [14, 15, 16],
    "topContributors": ["user1", "user2", "user3"],
    "newMembers": 100,
    "churnRate": 0.15,
    "retentionRate": 0.85,
    "growthRate": 0.1
  },
  "telegram": {
    "memberCount": 25000,
    "activeMembers": 5000,
    "messageFrequency": 0.8,
    "topicDistribution": {
      "trading": 0.4,
      "tech": 0.3,
      "general": 0.3
    },
    "dailyActiveUsers": 2000,
    "weeklyActiveUsers": 5000,
    "monthlyActiveUsers": 10000,
    "activityHeatmap": {
      "00": 100,
      "01": 80,
      "02": 60
    }
  }
}
```

### Risk Assessment

```http
GET /analyze/risk/{contractAddress}
```

Perform a comprehensive risk assessment of a contract, including security analysis, liquidity metrics, and whale tracking.

#### Parameters

- `contractAddress` (path): The contract address to analyze

#### Response

```json
{
  "security": {
    "score": 85,
    "issues": [
      {
        "severity": "medium",
        "type": "reentrancy",
        "description": "Potential reentrancy vulnerability found",
        "location": "function withdraw()",
        "recommendation": "Implement reentrancy guard"
      }
    ],
    "audit": {
      "score": 95,
      "issues": [],
      "lastAudit": "2024-01-01T00:00:00Z",
      "auditor": "CertiK"
    }
  },
  "liquidity": {
    "totalLiquidity": 1000000,
    "liquidityDepth": 500000,
    "concentrationRisk": 0.3,
    "withdrawalRisk": 0.2
  },
  "whales": {
    "holders": [
      {
        "address": "0x123",
        "balance": 1000000,
        "percentage": 5,
        "type": "whale"
      }
    ],
    "movements": [
      {
        "address": "0x123",
        "type": "buy",
        "amount": 100000,
        "timestamp": "2024-02-01T00:00:00Z",
        "priceImpact": 0.5
      }
    ],
    "impact": {
      "priceImpact": 0.5,
      "volumeImpact": 0.3,
      "liquidityImpact": 0.4,
      "severity": "medium"
    }
  }
}
```

### Historical Analysis

```http
GET /analyze/historical/{contractAddress}
```

Retrieve historical analysis data for a contract over a specified time period.

#### Parameters

- `contractAddress` (path): The contract address to analyze
- `startTime` (query): Start time for historical data (ISO 8601)
- `endTime` (query): End time for historical data (ISO 8601)
- `metrics` (query, optional): Array of metrics to include (social, risk, technical)

#### Response

```json
{
  "social": [
    {
      "timestamp": "2024-02-14T00:00:00Z",
      "twitter": { ... },
      "discord": { ... },
      "telegram": { ... }
    }
  ],
  "risk": [
    {
      "timestamp": "2024-02-14T00:00:00Z",
      "security": { ... },
      "liquidity": { ... },
      "whales": { ... }
    }
  ]
}
```

## Error Handling

The API uses standard HTTP response codes:

- 200: Success
- 400: Bad Request (invalid parameters)
- 401: Unauthorized (invalid API key)
- 429: Too Many Requests (rate limit exceeded)
- 500: Internal Server Error

Error responses include a message explaining the error:

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Please try again in 60 seconds.",
    "details": {
      "resetTime": "2024-02-14T12:01:00Z"
    }
  }
}
```

## SDKs and Libraries

Official SDKs are available for:

- JavaScript/TypeScript: [@bera/sdk](https://www.npmjs.com/package/@bera/sdk)
- Python: [bera-python](https://pypi.org/project/bera-python/)

## Support

For API support or to report issues:

- GitHub Issues: [Report a bug](https://github.com/yourusername/yeet-or-jeet/issues)
- Discord: [Join our community](https://discord.gg/bera)
- Email: api-support@bera-ai.xyz

## Changelog

### v1.0.0 (2024-02-14)

- Initial release of the b/era API
- Added social metrics analysis endpoint
- Added risk assessment endpoint
- Added historical analysis endpoint 