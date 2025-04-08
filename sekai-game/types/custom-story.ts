export interface CharacterTrait {
  name: string;
  description: string;
  options: TraitOption[];
}

export interface TraitOption {
  name: string;
  description: string;
  effect: string;
}

export interface CustomStory {
  id: string;
  userId: string;
  title: string;
  description: string;
  backgroundImageUrl?: string;
  systemPrompt: string;
  introduction: string;
  characterTraits: Record<string, CharacterTrait>;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomStoryFormData {
  title: string;
  description: string;
  backgroundImage?: File;
  systemPrompt: string;
  introduction: string;
  characterTraits: Record<string, CharacterTrait>;
  isPublic: boolean;
} 