import { supabase } from '@/lib/supabase';
import { CustomStory, CustomStoryFormData } from '@/types/custom-story';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all custom stories for the current user
 */
export async function getUserCustomStories(): Promise<CustomStory[]> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('custom_stories')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      // Directly throw a clear error about the missing table
      if (error.message && error.message.includes('relation "custom_stories" does not exist')) {
        throw new Error('The custom_stories table does not exist in the database. Please run the SQL setup script.');
      }
      
      // For other errors, log specific properties instead of the whole object
      console.error('Supabase query error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }

    return data.map(mapDatabaseStoryToCustomStory);
  } catch (error) {
    // Just re-throw the error with its original message
    throw error;
  }
}

/**
 * Get public custom stories created by other users
 */
export async function getPublicCustomStories(): Promise<CustomStory[]> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    const { data, error } = await supabase
      .from('custom_stories')
      .select('*')
      .eq('is_public', true)
      .order('updated_at', { ascending: false });

    if (error) {
      // Directly throw a clear error about the missing table
      if (error.message && error.message.includes('relation "custom_stories" does not exist')) {
        throw new Error('The custom_stories table does not exist in the database. Please run the SQL setup script.');
      }
      
      // For other errors, log specific properties instead of the whole object
      console.error('Supabase query error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Database error: ${error.message || 'Unknown error'}`);
    }

    // Filter out the user's own stories if they're logged in
    return data
      .filter(story => !userId || story.user_id !== userId)
      .map(mapDatabaseStoryToCustomStory);
  } catch (error) {
    // Just re-throw the error with its original message
    throw error;
  }
}

/**
 * Get a custom story by ID
 */
export async function getCustomStoryById(storyId: string): Promise<CustomStory | null> {
  try {
    const { data, error } = await supabase
      .from('custom_stories')
      .select('*')
      .eq('id', storyId)
      .single();

    if (error) {
      throw error;
    }

    return mapDatabaseStoryToCustomStory(data);
  } catch (error) {
    console.error(`Error fetching custom story ${storyId}:`, error);
    return null;
  }
}

/**
 * Create a new custom story
 */
export async function createCustomStory(formData: CustomStoryFormData): Promise<CustomStory | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    // First, upload the background image if provided
    let backgroundImageUrl = null;
    if (formData.backgroundImage) {
      const imageFile = formData.backgroundImage;
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `custom-stories/${userData.user.id}/${uuidv4()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('story-backgrounds')
        .upload(filePath, imageFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the uploaded image
      const { data: urlData } = await supabase.storage
        .from('story-backgrounds')
        .getPublicUrl(filePath);

      backgroundImageUrl = urlData.publicUrl;
    }

    // Then, insert the new story record
    const { data, error } = await supabase
      .from('custom_stories')
      .insert({
        user_id: userData.user.id,
        title: formData.title,
        description: formData.description,
        background_image_url: backgroundImageUrl,
        system_prompt: formData.systemPrompt,
        introduction: formData.introduction,
        character_traits: formData.characterTraits,
        is_public: formData.isPublic
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapDatabaseStoryToCustomStory(data);
  } catch (error) {
    console.error('Error creating custom story:', error);
    return null;
  }
}

/**
 * Update an existing custom story
 */
export async function updateCustomStory(
  storyId: string,
  formData: CustomStoryFormData
): Promise<CustomStory | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    // Check if this story belongs to the user
    const { data: storyData, error: storyError } = await supabase
      .from('custom_stories')
      .select('user_id')
      .eq('id', storyId)
      .single();

    if (storyError || storyData.user_id !== userData.user.id) {
      throw new Error('Not authorized to update this story');
    }

    // Upload the background image if a new one is provided
    let backgroundImageUrl = undefined;
    if (formData.backgroundImage) {
      const imageFile = formData.backgroundImage;
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `custom-stories/${userData.user.id}/${uuidv4()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('story-backgrounds')
        .upload(filePath, imageFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the uploaded image
      const { data: urlData } = await supabase.storage
        .from('story-backgrounds')
        .getPublicUrl(filePath);

      backgroundImageUrl = urlData.publicUrl;
    }

    // Update the story record
    const updateData: any = {
      title: formData.title,
      description: formData.description,
      system_prompt: formData.systemPrompt,
      introduction: formData.introduction,
      character_traits: formData.characterTraits,
      is_public: formData.isPublic
    };

    if (backgroundImageUrl) {
      updateData.background_image_url = backgroundImageUrl;
    }

    const { data, error } = await supabase
      .from('custom_stories')
      .update(updateData)
      .eq('id', storyId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapDatabaseStoryToCustomStory(data);
  } catch (error) {
    console.error(`Error updating custom story ${storyId}:`, error);
    return null;
  }
}

/**
 * Delete a custom story
 */
export async function deleteCustomStory(storyId: string): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    // Delete the story
    const { error } = await supabase
      .from('custom_stories')
      .delete()
      .eq('id', storyId)
      .eq('user_id', userData.user.id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting custom story ${storyId}:`, error);
    return false;
  }
}

/**
 * Map a database story record to a CustomStory interface
 */
function mapDatabaseStoryToCustomStory(data: any): CustomStory {
  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    description: data.description,
    backgroundImageUrl: data.background_image_url,
    systemPrompt: data.system_prompt,
    introduction: data.introduction,
    characterTraits: data.character_traits,
    isPublic: data.is_public,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
} 