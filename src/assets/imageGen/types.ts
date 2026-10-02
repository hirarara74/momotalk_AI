/**
 * Type definitions for MomoTalk Dynamic Student Photo Generation.
 * Covers providers, visual dictionary profiles, intent detection, and prompt synthesis.
 */

export type ImageGenProviderType = 'pollinations' | 'fal' | 'together' | 'openai' | 'stability';

/**
 * Visual profile defining canonical Danbooru tags for a Blue Archive character.
 */
export interface CharacterVisualProfile {
  characterTag: string; // e.g., 'sunaookami_shiroko_(blue_archive)'
  halo: string[];       // e.g., ['halo', 'blue_halo', 'geometric_halo']
  hair: string[];       // e.g., ['grey_hair', 'short_hair', 'wolf_cut']
  eyes: string[];       // e.g., ['heterochromia', 'blue_eye', 'amber_eye']
  features: string[];   // e.g., ['wolf_ears', 'animal_ears']
  outfits: Record<string, string[]>; // e.g., { default: ['abydos_school_uniform', 'blue_scarf'] }
}

/**
 * Result of user message intent classification for photos/selfies.
 */
export interface PhotoIntentResult {
  isPhotoRequested: boolean;
  sceneHint?: string;
  triggerType: 'selfie' | 'activity' | 'outfit' | 'direct' | 'none';
  matchedPattern?: string;
}

/**
 * Options passed to the prompt synthesizer.
 */
export interface PromptSynthesisOptions {
  studentIdOrName: string | number;
  sceneTags?: string[];
  userMessage?: string;
  studentReply?: string;
  locale?: string;
  outfitVariant?: string;
  additionalPositiveTags?: string[];
  additionalNegativeTags?: string[];
}

/**
 * Output of the prompt synthesizer ready for image generation APIs.
 */
export interface SynthesizedPrompt {
  prompt: string;
  negativePrompt: string;
  characterTags: string[];
  sceneTags: string[];
}

/**
 * Global and per-request image generation configuration.
 */
export interface ImageGenConfig {
  enabled: boolean;
  provider: ImageGenProviderType;
  apiKey?: string;
  model?: string;
}

/**
 * Contextual scene preset composed of Danbooru tags.
 */
export interface ScenePreset {
  name: string;
  composition: string[];
  pose: string[];
  expression: string[];
  background: string[];
  lighting: string[];
}

/**
 * Result of extracting [PHOTO: ...] tag directive from LLM streaming text.
 */
export interface PhotoDirectiveResult {
  cleanText: string;
  photoTags?: string;
  hasDirective: boolean;
}
