import { supabase } from '@/lib/supabase';

/**
 * Sets up the custom_stories table in the database if it doesn't exist
 */
export async function setupCustomStoriesTable(): Promise<{ success: boolean; message: string; sql?: string }> {
  try {
    // First, check if the table exists
    const { error: checkError } = await supabase.from('custom_stories').select('id').limit(1);
    
    // If we can query the table, it exists
    if (!checkError) {
      console.log('custom_stories table already exists');
      return { success: true, message: 'Table already exists' };
    }
    
    // Log the specific error properties to debug
    console.log('Table check error:', {
      message: checkError.message,
      details: checkError.details,
      hint: checkError.hint,
      code: checkError.code
    });
    
    // Here, we expect the error to be about the table not existing
    // We don't need a separate check since that's the expected error
    
    // SQL to create the table
    const createTableSQL = `
      -- Create extension for UUID generation if it doesn't exist
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Create a table for user-created custom stories
      CREATE TABLE IF NOT EXISTS custom_stories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        background_image_url TEXT,
        system_prompt TEXT NOT NULL,
        introduction TEXT NOT NULL,
        character_traits JSONB NOT NULL DEFAULT '{}',
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Enable Row Level Security for custom stories
      ALTER TABLE custom_stories ENABLE ROW LEVEL SECURITY;

      -- Create policies for custom_stories
      CREATE POLICY "Users can view their own custom stories"
        ON custom_stories FOR SELECT
        USING (auth.uid() = user_id OR is_public = TRUE);

      CREATE POLICY "Users can create their own custom stories"
        ON custom_stories FOR INSERT
        WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Users can update their own custom stories"
        ON custom_stories FOR UPDATE
        USING (auth.uid() = user_id);

      CREATE POLICY "Users can delete their own custom stories"
        ON custom_stories FOR DELETE
        USING (auth.uid() = user_id);
        
      -- Create function to update updated_at
      CREATE OR REPLACE FUNCTION update_modified_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      -- Create trigger to update 'updated_at' column
      CREATE TRIGGER update_custom_stories_updated_at
      BEFORE UPDATE ON custom_stories
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_column();
    `;
    
    // This RPC approach won't work in your Supabase instance - we'll just return the SQL
    // Instead of automatically trying, we'll just return the SQL for manual execution
    return { 
      success: false, 
      message: 'The custom_stories table needs to be created manually. Please run the SQL script in your Supabase dashboard.',
      sql: createTableSQL
    };
    
  } catch (error) {
    // Log more specific error information
    const errorInfo = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : { error };
    
    console.error('Error setting up custom_stories table:', errorInfo);
    
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error setting up database'
    };
  }
} 