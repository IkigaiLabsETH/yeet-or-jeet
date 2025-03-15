import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './utils';

export interface AuthConfig {
  publicPaths?: string[];
  requireApiKey?: boolean;
}

const defaultConfig: AuthConfig = {
  publicPaths: ['/api/auth/login', '/api/auth/register'],
  requireApiKey: true,
};

export async function authMiddleware(
  request: NextRequest,
  config: AuthConfig = defaultConfig
) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (config.publicPaths?.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for API key if required
  if (config.requireApiKey) {
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return new NextResponse(
        JSON.stringify({ error: 'API key is required' }),
        { status: 401 }
      );
    }

    // Verify API key (implement your own verification logic)
    const isValidApiKey = process.env.API_KEY === apiKey;
    if (!isValidApiKey) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401 }
      );
    }
  }

  // Check for authentication token
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401 }
    );
  }

  try {
    // Verify JWT token
    const decoded = await verifyToken(token);
    
    // Add user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);

    // Clone the request with modified headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return response;
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Invalid or expired token' }),
      { status: 401 }
    );
  }
}

// Middleware matcher configuration
export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 