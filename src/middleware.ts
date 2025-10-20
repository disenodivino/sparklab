import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;
  
  // Special case for login 404 - redirect to event/login
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/event/login', req.url));
  }

  // For development, we'll skip auth checks and allow direct access to dashboard
  // In production, you would verify authentication here

  return res;
}

// Run middleware on these paths
export const config = {
  matcher: [
    '/login',
    '/event/dashboard/:path*'
  ],
};