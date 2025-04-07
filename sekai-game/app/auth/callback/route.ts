import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookieStore = await cookies();
            const cookie = cookieStore.get(name);
            return cookie?.value;
          },
          async set(name: string, value: string, options: CookieOptions) {
            const cookieStore = await cookies();
            cookieStore.set({ name, value, ...options });
          },
          async remove(name: string, options: CookieOptions) {
            const cookieStore = await cookies();
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(new URL('/game', request.url));
    }
  }

  // Return to the home page with error
  return NextResponse.redirect(new URL('/?error=auth', request.url));
} 