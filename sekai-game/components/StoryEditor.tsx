'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CustomStory, CustomStoryFormData, CharacterTrait, TraitOption } from '@/types/custom-story';
import { createCustomStory, updateCustomStory } from '@/utils/custom-stories';

interface StoryEditorProps {
  story?: CustomStory;
  onSave: (savedStory: CustomStory) => void;
  onCancel: () => void;
}

export default function StoryEditor({ story, onSave, onCancel }: StoryEditorProps) {
  const [formData, setFormData] = useState<CustomStoryFormData>({
    title: '',
    description: '',
    systemPrompt: '',
    introduction: '',
    characterTraits: {},
    isPublic: false
  });
  
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTrait, setCurrentTrait] = useState<string>('');
  const [currentOption, setCurrentOption] = useState<string>('');
  
  // Initialize the form with existing story data if editing
  useEffect(() => {
    if (story) {
      setFormData({
        title: story.title,
        description: story.description,
        systemPrompt: story.systemPrompt,
        introduction: story.introduction,
        characterTraits: story.characterTraits,
        isPublic: story.isPublic
      });
      
      if (story.backgroundImageUrl) {
        setBackgroundImagePreview(story.backgroundImageUrl);
      }
    }
  }, [story]);
  
  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, backgroundImage: 'Please upload an image file' }));
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, backgroundImage: 'Image must be less than 5MB' }));
      return;
    }
    
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setBackgroundImagePreview(previewUrl);
    
    // Update form data
    setFormData(prev => ({ ...prev, backgroundImage: file }));
    
    // Clear error if it exists
    if (errors.backgroundImage) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.backgroundImage;
        return newErrors;
      });
    }
  };
  
  // Add a new character trait
  const handleAddTrait = () => {
    if (!currentTrait.trim()) return;
    
    const traitKey = currentTrait.toLowerCase().replace(/\s+/g, '-');
    
    setFormData(prev => ({
      ...prev,
      characterTraits: {
        ...prev.characterTraits,
        [traitKey]: {
          name: currentTrait,
          description: `Description for ${currentTrait}`,
          options: []
        }
      }
    }));
    
    setCurrentTrait('');
  };
  
  // Remove a character trait
  const handleRemoveTrait = (traitKey: string) => {
    setFormData(prev => {
      const newTraits = { ...prev.characterTraits };
      delete newTraits[traitKey];
      return { ...prev, characterTraits: newTraits };
    });
  };
  
  // Update a trait property
  const handleTraitChange = (
    traitKey: string,
    field: keyof CharacterTrait,
    value: string | TraitOption[]
  ) => {
    setFormData(prev => ({
      ...prev,
      characterTraits: {
        ...prev.characterTraits,
        [traitKey]: {
          ...prev.characterTraits[traitKey],
          [field]: value
        }
      }
    }));
  };
  
  // Add a new option to a trait
  const handleAddOption = (traitKey: string) => {
    if (!currentOption.trim()) return;
    
    setFormData(prev => {
      const trait = prev.characterTraits[traitKey];
      return {
        ...prev,
        characterTraits: {
          ...prev.characterTraits,
          [traitKey]: {
            ...trait,
            options: [
              ...trait.options,
              {
                name: currentOption,
                description: `Description for ${currentOption}`,
                effect: `Effect of choosing ${currentOption}`
              }
            ]
          }
        }
      };
    });
    
    setCurrentOption('');
  };
  
  // Remove an option from a trait
  const handleRemoveOption = (traitKey: string, optionIndex: number) => {
    setFormData(prev => {
      const trait = prev.characterTraits[traitKey];
      return {
        ...prev,
        characterTraits: {
          ...prev.characterTraits,
          [traitKey]: {
            ...trait,
            options: trait.options.filter((_, index) => index !== optionIndex)
          }
        }
      };
    });
  };
  
  // Update an option property
  const handleOptionChange = (
    traitKey: string,
    optionIndex: number,
    field: keyof TraitOption,
    value: string
  ) => {
    setFormData(prev => {
      const trait = prev.characterTraits[traitKey];
      const updatedOptions = [...trait.options];
      updatedOptions[optionIndex] = {
        ...updatedOptions[optionIndex],
        [field]: value
      };
      
      return {
        ...prev,
        characterTraits: {
          ...prev.characterTraits,
          [traitKey]: {
            ...trait,
            options: updatedOptions
          }
        }
      };
    });
  };
  
  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.systemPrompt.trim()) {
      newErrors.systemPrompt = 'System prompt is required';
    }
    
    if (!formData.introduction.trim()) {
      newErrors.introduction = 'Introduction is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let savedStory: CustomStory | null;
      
      if (story) {
        // Update existing story
        savedStory = await updateCustomStory(story.id, formData);
      } else {
        // Create new story
        savedStory = await createCustomStory(formData);
      }
      
      if (savedStory) {
        onSave(savedStory);
      } else {
        setErrors({ form: 'Failed to save story. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving story:', error);
      setErrors({ form: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">
        {story ? 'Edit Custom Story' : 'Create New Story'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Story Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a captivating title"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your story in a few sentences"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>
          
          <div>
            <label htmlFor="backgroundImage" className="block text-sm font-medium text-gray-700 mb-1">
              Background Image
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                id="backgroundImage"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="backgroundImage"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md cursor-pointer hover:bg-gray-300 transition"
              >
                {backgroundImagePreview ? 'Change Image' : 'Upload Image'}
              </label>
              
              {backgroundImagePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setBackgroundImagePreview(null);
                    setFormData(prev => ({ ...prev, backgroundImage: undefined }));
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
            
            {errors.backgroundImage && (
              <p className="mt-1 text-sm text-red-600">{errors.backgroundImage}</p>
            )}
            
            {backgroundImagePreview && (
              <div className="mt-4 relative w-full h-40">
                <Image
                  src={backgroundImagePreview}
                  alt="Background preview"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Story Content */}
        <div className="space-y-4">
          <div>
            <label htmlFor="introduction" className="block text-sm font-medium text-gray-700 mb-1">
              Story Introduction
            </label>
            <textarea
              id="introduction"
              name="introduction"
              value={formData.introduction}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write an introduction that will be shown to players at the start of the game"
            />
            {errors.introduction && <p className="mt-1 text-sm text-red-600">{errors.introduction}</p>}
          </div>
          
          <div>
            <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 mb-1">
              System Prompt (AI Instructions)
            </label>
            <textarea
              id="systemPrompt"
              name="systemPrompt"
              value={formData.systemPrompt}
              onChange={handleChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Instructions for the AI on how to run your game (this won't be shown to players)"
            />
            <p className="mt-1 text-xs text-gray-500">
              This is where you instruct the AI how to run your game. Be specific about the tone, setting, and game mechanics.
            </p>
            {errors.systemPrompt && <p className="mt-1 text-sm text-red-600">{errors.systemPrompt}</p>}
          </div>
        </div>
        
        {/* Character Traits */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Character Traits</h3>
          <p className="text-sm text-gray-600 mb-4">
            Define traits that players can customize about their character in your story.
          </p>
          
          {/* Add new trait */}
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={currentTrait}
              onChange={(e) => setCurrentTrait(e.target.value)}
              placeholder="New trait name (e.g. Background, Class, Personality)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddTrait}
              disabled={!currentTrait.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Add Trait
            </button>
          </div>
          
          {/* List of traits */}
          <div className="space-y-6">
            {Object.entries(formData.characterTraits).map(([traitKey, trait]) => (
              <div key={traitKey} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <input
                      type="text"
                      value={trait.name}
                      onChange={(e) => handleTraitChange(traitKey, 'name', e.target.value)}
                      className="font-medium text-gray-800 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTrait(traitKey)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={trait.description}
                    onChange={(e) => handleTraitChange(traitKey, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe this trait"
                  />
                </div>
                
                {/* Trait options */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Options</h4>
                  
                  {/* Add new option */}
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={currentOption}
                      onChange={(e) => setCurrentOption(e.target.value)}
                      placeholder="New option name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddOption(traitKey)}
                      disabled={!currentOption.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* List of options */}
                  <div className="space-y-3">
                    {trait.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="border border-gray-200 rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <input
                            type="text"
                            value={option.name}
                            onChange={(e) => 
                              handleOptionChange(traitKey, optionIndex, 'name', e.target.value)
                            }
                            className="font-medium text-gray-800 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(traitKey, optionIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                        
                        <div className="mb-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={option.description}
                            onChange={(e) => 
                              handleOptionChange(traitKey, optionIndex, 'description', e.target.value)
                            }
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe this option"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Effect
                          </label>
                          <textarea
                            value={option.effect}
                            onChange={(e) => 
                              handleOptionChange(traitKey, optionIndex, 'effect', e.target.value)
                            }
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="How does this option affect gameplay?"
                          />
                        </div>
                      </div>
                    ))}
                    
                    {trait.options.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No options added yet</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {Object.keys(formData.characterTraits).length === 0 && (
              <p className="text-gray-500 italic">No traits added yet</p>
            )}
          </div>
        </div>
        
        {/* Visibility */}
        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
              Make this story public (share with other players)
            </label>
          </div>
        </div>
        
        {/* Form error */}
        {errors.form && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">{errors.form}</div>
        )}
        
        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : story ? 'Update Story' : 'Create Story'}
          </button>
        </div>
      </form>
    </div>
  );
} 