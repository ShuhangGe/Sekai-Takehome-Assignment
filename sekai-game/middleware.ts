import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = request.cookies.get(name);
          return cookie?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          // This is a workaround for middleware cookies handling
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        async remove(name: string, options: CookieOptions) {
          // This is a workaround for middleware cookies handling
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Check auth status
  const { data: { session } } = await supabase.auth.getSession();

  // Handle protected routes
  if (!session && request.nextUrl.pathname.startsWith('/game')) {
    const redirectUrl = new URL('/auth', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Handle auth routes when already authenticated
  if (session && request.nextUrl.pathname.startsWith('/auth')) {
    const redirectUrl = new URL('/game', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ['/game/:path*', '/auth/:path*'],
}; 