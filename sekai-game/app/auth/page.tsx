'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AuthComponent from '@/components/Auth';

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        router.push('/game');
        return;
      }
      
      setIsLoading(false);
    };
    
    checkSession();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          AI D&D Adventure
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in or create an account to start your adventure
        </p>
      </div>
      
      <AuthComponent />
    </div>
  );
} 