'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function AuthComponent() {
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in');
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {view === 'sign_in' ? 'Welcome Back!' : 'Create an Account'}
      </h2>
      
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        view={view}
        redirectTo={`${origin}/auth/callback`}
      />
    </div>
  );
} 