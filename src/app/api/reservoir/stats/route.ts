import { NextResponse } from 'next/server';

// Simple in-memory cache using Map
const cache = new Map<string, { data: any; timestamp: number }>();
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

    if (!collectionId) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    // Check rate limit
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    if (isRateLimited(ip)) {
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
      return NextResponse.json(cachedItem.data);
    }

    // If not in cache or expired, fetch from Reservoir
    const reservoirApiKey = process.env.RESERVOIR_API_KEY;
    if (!reservoirApiKey) {
      throw new Error('Reservoir API key is not configured');
    }

    const response = await fetch(
      `https://api.reservoir.tools/collections/v7/${collectionId}/stats`,
      {
        headers: {
          'accept': '*/*',
          'x-api-key': reservoirApiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Reservoir API Error: ${response.status}`);
    }

    const data = await response.json();

    // Update cache
    cache.set(cacheKey, { data, timestamp: now });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Collection stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection stats' },
      { status: 500 }
    );
  }
} 