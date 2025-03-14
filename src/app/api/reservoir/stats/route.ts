import { NextResponse } from 'next/server';

interface ReservoirStatsResponse {
  stats: {
    floorPrice: number | null;
    totalVolume: number | null;
  };
}

// Simple in-memory cache using Map
const cache = new Map<string, { data: ReservoirStatsResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Simple rate limiting
const rateLimits = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 10 * 1000; // 10 seconds
const RATE_LIMIT_MAX_REQUESTS = 20; // 20 requests per window

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimits.get(ip);

  if (!userLimit || (now - userLimit.timestamp) > RATE_LIMIT_WINDOW) {
    // Reset rate limit if window has expired
    rateLimits.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  // Increment request count
  userLimit.count += 1;
  return false;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');

    console.log('Fetching stats for collection:', collectionId);

    if (!collectionId) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    // Check rate limit
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    if (isRateLimited(ip)) {
      console.log('Rate limit exceeded for IP:', ip);
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Check cache
    const cacheKey = `collection:${collectionId}:stats`;
    const cachedItem = cache.get(cacheKey);
    const now = Date.now();

    if (cachedItem && (now - cachedItem.timestamp) < CACHE_TTL) {
      console.log('Returning cached data for collection:', collectionId);
      return NextResponse.json(cachedItem.data);
    }

    // If not in cache or expired, fetch from Reservoir
    const reservoirApiKey = process.env.RESERVOIR_API_KEY;
    if (!reservoirApiKey) {
      console.error('Reservoir API key is missing');
      throw new Error('Reservoir API key is not configured');
    }

    const apiUrl = `https://api.reservoir.tools/collections/v7/${encodeURIComponent(collectionId)}/stats/v2`;
    console.log('Fetching from Reservoir API:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'accept': '*/*',
        'x-api-key': reservoirApiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Reservoir API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Reservoir API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Raw Reservoir response:', JSON.stringify(data, null, 2));

    // Transform the data to match frontend expectations
    const transformedData = {
      stats: {
        floorPrice: data.floorAsk?.price?.amount?.native ?? null,
        totalVolume: data.volume?.allTime ?? null
      }
    };

    console.log('Transformed data:', JSON.stringify(transformedData, null, 2));

    // Update cache
    cache.set(cacheKey, { data: transformedData, timestamp: now });

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Collection stats error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch collection stats' },
      { status: 500 }
    );
  }
} 