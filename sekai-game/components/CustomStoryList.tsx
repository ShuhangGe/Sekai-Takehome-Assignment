'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CustomStory } from '@/types/custom-story';
import { getUserCustomStories, getPublicCustomStories, deleteCustomStory } from '@/utils/custom-stories';
import { setupCustomStoriesTable } from '@/utils/setup-db';
import { supabase } from '@/lib/supabase';

interface CustomStoryListProps {
  onSelectStory: (story: CustomStory) => void;
  onCreateNew: () => void;
  onEditStory: (story: CustomStory) => void;
  onBack?: () => void;
}

export default function CustomStoryList({ onSelectStory, onCreateNew, onEditStory, onBack }: CustomStoryListProps) {
  const [userStories, setUserStories] = useState<CustomStory[]>([]);
  const [publicStories, setPublicStories] = useState<CustomStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-stories' | 'public-stories'>('my-stories');
  const [error, setError] = useState<string | null>(null);
  const [isSettingUpTable, setIsSettingUpTable] = useState(false);
  const [sqlScript, setSqlScript] = useState<string | null>(null);
  const [showSql, setShowSql] = useState(false);
  
  // Load stories
  useEffect(() => {
    const initializeAndLoadStories = async () => {
      setIsLoading(true);
      setError(null);
      setSqlScript(null);
      
      // First, try to set up the table
      try {
        const setupResult = await setupCustomStoriesTable();
        
        // If setup was successful or the table already exists, load stories
        if (setupResult.success) {
          await loadUserAndPublicStories();
        } else if (setupResult.sql) {
          // If we got SQL, show it to the user
          setSqlScript(setupResult.sql);
          setShowSql(true);
          setError(`The custom_stories table doesn't exist in your database. You need to run the SQL script below in the Supabase SQL Editor.`);
          setIsLoading(false);
        } else {
          // Some other error occurred during setup
          setError(`Failed to set up custom stories table: ${setupResult.message}`);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error during initial setup:', err);
        setError('An error occurred while trying to set up the database. Please try again.');
        setIsLoading(false);
      }
    };
    
    const loadUserAndPublicStories = async () => {
      try {
        // Load user stories
        const myStories = await getUserCustomStories();
        setUserStories(myStories);
        
        // Load public stories
        try {
          const otherStories = await getPublicCustomStories();
          setPublicStories(otherStories);
        } catch (publicStoriesError) {
          console.warn('Could not load public stories, but user stories were loaded successfully:', publicStoriesError);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading stories:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to load stories. The custom stories feature may not be properly set up.');
        }
        setIsLoading(false);
      }
    };
    
    initializeAndLoadStories();
  }, []);
  
  // Handle deleting a story
  const handleDelete = async (storyId: string) => {
    if (window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      try {
        const success = await deleteCustomStory(storyId);
        
        if (success) {
          // Remove from state
          setUserStories(prev => prev.filter(story => story.id !== storyId));
        } else {
          throw new Error('Failed to delete story');
        }
      } catch (err) {
        console.error('Error deleting story:', err);
        alert('Failed to delete story. Please try again.');
      }
    }
  };
  
  // Set up the custom_stories table
  const handleSetupTable = async () => {
    setIsSettingUpTable(true);
    
    try {
      // Try just checking the table again (might have been created manually)
      const { error: checkError } = await supabase.from('custom_stories').select('id').limit(1);
      
      // If no error, table exists now
      if (!checkError) {
        window.location.reload();
        return;
      }
      
      // Otherwise get the setup SQL again
      const result = await setupCustomStoriesTable();
      
      if (result.success) {
        window.location.reload();
      } else if (result.sql) {
        setSqlScript(result.sql);
        setShowSql(true);
        setError(`The table still doesn't exist. Please run the SQL script below in your Supabase dashboard.`);
      } else {
        setError(`Failed to generate SQL script: ${result.message}`);
      }
    } catch (err) {
      console.error('Error setting up table:', err);
      setError('An unexpected error occurred while setting up the database.');
    } finally {
      setIsSettingUpTable(false);
    }
  };

  const handleToggleSql = () => {
    setShowSql(!showSql);
  };

  const handleCopySql = () => {
    if (sqlScript) {
      navigator.clipboard.writeText(sqlScript)
        .then(() => alert('SQL copied to clipboard!'))
        .catch(err => console.error('Failed to copy SQL:', err));
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-4 py-3 font-medium ${
            activeTab === 'my-stories'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('my-stories')}
        >
          My Stories
        </button>
        <button
          className={`px-4 py-3 font-medium ${
            activeTab === 'public-stories'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('public-stories')}
        >
          Community Stories
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-500">Loading stories...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
            <h3 className="text-red-800 font-medium mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
            <p className="mt-2 text-sm text-red-600">
              The database may not be properly set up with the custom_stories table.
            </p>
            
            {sqlScript && (
              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <button
                    onClick={handleToggleSql}
                    className="text-blue-600 text-sm font-medium"
                  >
                    {showSql ? 'Hide SQL Script' : 'Show SQL Script'}
                  </button>
                  
                  <button
                    onClick={handleCopySql}
                    className="text-blue-600 text-sm font-medium"
                  >
                    Copy SQL
                  </button>
                </div>
                
                {showSql && (
                  <div className="mt-2 bg-gray-800 text-white p-4 rounded text-xs overflow-auto max-h-64">
                    <pre>{sqlScript}</pre>
                  </div>
                )}
                
                <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
                  <p className="font-medium text-yellow-800">Follow these steps to fix the error:</p>
                  <ol className="list-decimal ml-5 mt-2 text-yellow-700 space-y-1">
                    <li>Copy the SQL script above (click "Copy SQL" button)</li>
                    <li>Go to your <a href="https://app.supabase.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Supabase Dashboard</a></li>
                    <li>Select your project (with URL: <code className="bg-gray-100 px-1 py-0.5 rounded">acsndwbqhfxmxyonllzq.supabase.co</code>)</li>
                    <li>Go to the "SQL Editor" tab in the left sidebar</li>
                    <li>Click "New Query" to create a new SQL query</li>
                    <li>Paste the SQL code</li>
                    <li>Click "Run" to execute it</li>
                    <li>Return here and click the "Reload" button below</li>
                  </ol>
                </div>
              </div>
            )}
            
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Reload Page
              </button>
              
              {onBack && (
                <button
                  onClick={onBack}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Back to Scenario Selection
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* My Stories Tab */}
            {activeTab === 'my-stories' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Your Custom Stories</h3>
                  <button
                    onClick={onCreateNew}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create New Story
                  </button>
                </div>
                
                {userStories.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">You haven't created any custom stories yet.</p>
                    <button
                      onClick={onCreateNew}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Create Your First Story
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {userStories.map(story => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        onSelect={() => onSelectStory(story)}
                        onEdit={() => onEditStory(story)}
                        onDelete={() => handleDelete(story.id)}
                        showActions={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Public Stories Tab */}
            {activeTab === 'public-stories' && (
              <div>
                <h3 className="text-lg font-medium mb-4">Community Stories</h3>
                
                {publicStories.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No public stories available yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {publicStories.map(story => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        onSelect={() => onSelectStory(story)}
                        showActions={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface StoryCardProps {
  story: CustomStory;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions: boolean;
}

function StoryCard({ story, onSelect, onEdit, onDelete, showActions }: StoryCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div 
        className="cursor-pointer"
        onClick={onSelect}
      >
        <div className="relative h-48 w-full bg-gray-100">
          {story.backgroundImageUrl ? (
            <Image
              src={story.backgroundImageUrl}
              alt={story.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-r from-blue-500 to-purple-600">
              <h3 className="text-xl font-bold text-white px-4 text-center">{story.title}</h3>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{story.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{story.description}</p>
          
          {/* Character traits preview */}
          {Object.keys(story.characterTraits).length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Character Traits:</p>
              <div className="flex flex-wrap gap-2">
                {Object.values(story.characterTraits).map((trait, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {trait.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center text-xs text-gray-500">
            <span>Created: {new Date(story.createdAt).toLocaleDateString()}</span>
            {story.isPublic && (
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                Public
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      {showActions && (
        <div className="border-t border-gray-200 p-3 bg-gray-50 flex justify-end space-x-2">
          <button
            onClick={e => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Edit
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
} 