'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/app/actions';
import Link from 'next/link';

interface GameStats {
  scenario_name: string;
  turns_played: number;
  completed: boolean;
  created_at: string;
}

interface Profile {
  username: string;
  avatar_url: string | null;
  games_played: number;
}

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      
      // Check if user is logged in
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        router.push('/auth');
        return;
      }
      
      setUser(authData.session.user);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url, games_played')
        .eq('id', authData.session.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
      }
      
      // Fetch game stats
      const { data: statsData, error: statsError } = await supabase
        .from('game_stats')
        .select('scenario_name, turns_played, completed, created_at')
        .eq('user_id', authData.session.user.id)
        .order('created_at', { ascending: false });
      
      if (statsError) {
        console.error('Error fetching game stats:', statsError);
      } else {
        setGameStats(statsData || []);
      }
      
      setIsLoading(false);
    };
    
    fetchUserData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">AI D&D Adventure</h1>
          <div className="flex items-center space-x-4">
            <Link href="/game" className="text-white hover:text-blue-200">
              Play Game
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-md text-sm"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Your Profile</h2>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
                {profile?.username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
              </div>
              
              <div>
                <h3 className="text-xl font-semibold">
                  {profile?.username || user?.email || 'Anonymous Player'}
                </h3>
                <p className="text-gray-600">
                  {user?.email}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Total Games Played: {profile?.games_played || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Your Game History</h2>
            
            {gameStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>You haven't completed any games yet.</p>
                <p className="text-sm mt-2">
                  Start playing to see your stats here!
                </p>
                <Link href="/game" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md">
                  Start Playing
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Scenario</th>
                      <th className="px-4 py-3">Turns Played</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 rounded-tr-lg">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameStats.map((stat, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">
                          {stat.scenario_name}
                        </td>
                        <td className="px-4 py-3">
                          {stat.turns_played}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            stat.completed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {stat.completed ? 'Completed' : 'In Progress'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(stat.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 