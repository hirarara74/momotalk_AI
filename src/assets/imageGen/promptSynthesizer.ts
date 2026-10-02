import type { PromptSynthesisOptions, SynthesizedPrompt, CharacterVisualProfile } from './types'
import { getCharacterVisualProfile, resolveStudentId } from './characterDictionary'
import {
  SCENE_PRESETS,
  STUDENT_SIGNATURE_TRAITS,
  inferSceneFromContext,
  getTimeOfDayTags
} from './sceneTags'
import { detectPhotoIntent, extractPhotoDirective } from './intentDetector'

/**
 * Standard quality prompt prefix for high-fidelity anime generation.
 */
export const QUALITY_PROMPT_PREFIX: string[] = [
  'masterpiece',
  'best quality',
  '2d anime illustration',
  'cel shaded',
  'anime coloring',
  'anime aesthetic',
  'official art style',
  'clean lineart',
  'vibrant colors'
]

/**
 * Standard negative prompt tags preventing anatomy, halo, and multi-character distortions.
 */
export const DEFAULT_NEGATIVE_PROMPT: string[] = [
  'worst_quality',
  'low_quality',
  'normal_quality',
  'photorealistic',
  'realistic',
  '3d',
  'render',
  '3d_render',
  'real_life',
  'photograph',
  'bad_anatomy',
  'bad_hands',
  'missing_fingers',
  'extra_digits',
  'extra_limbs',
  'deformed_fingers',
  'deformed_halo',
  'broken_halo',
  'blurry',
  'cropped',
  'watermark',
  'signature',
  'username',
  'error',
  'text',
  '2girls',
  'multiple_girls',
  'nsfw',
  'nude',
  'explicit'
]

/**
 * Clean, normalize, and deduplicate tags while preserving insertion order.
 */
function deduplicateTags(tags: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const raw of tags) {
    if (!raw) continue
    // Handle comma-separated tag chunks
    const parts = raw.split(',').map(s => s.trim())
    for (const part of parts) {
      if (!part) continue
      const normalizedKey = part.toLowerCase().replace(/[\s-]+/g, '_')
      if (!seen.has(normalizedKey)) {
        seen.add(normalizedKey)
        result.push(part)
      }
    }
  }

  return result
}

/**
 * Select the most appropriate outfit tags from the character's profile based on options and context.
 */
function resolveOutfitTags(
  profile: CharacterVisualProfile,
  outfitVariant?: string,
  contextText?: string
): string[] {
  if (outfitVariant && profile.outfits[outfitVariant]) {
    return profile.outfits[outfitVariant]
  }

  if (contextText) {
    const lower = contextText.toLowerCase()
    if (/swimsuit|水着|바다|비키니|泳装/i.test(lower) && profile.outfits.swimsuit) {
      return profile.outfits.swimsuit
    }
    if (/bunny|バニー|바니|兔女郎/i.test(lower) && profile.outfits.bunny) {
      return profile.outfits.bunny
    }
    if (/dress|ドレス|드레스|礼服/i.test(lower) && profile.outfits.dress) {
      return profile.outfits.dress
    }
    if (/cycling|ライディング|자전거|骑行/i.test(lower) && profile.outfits.cycling) {
      return profile.outfits.cycling
    }
    if (/track|gym|ジャージ|체육복|体操服/i.test(lower) && profile.outfits.track) {
      return profile.outfits.track
    }
  }

  return profile.outfits.default || Object.values(profile.outfits)[0] || []
}

/**
 * Synthesize a 4-tier Danbooru prompt:
 * 1. Aesthetic Quality Prefix
 * 2. Character Visual Identity (Dictionary)
 * 3. Contextual Scene / Pose / Expression / Location
 * 4. Negative Prompt
 */
export function synthesizePrompt(options: PromptSynthesisOptions): SynthesizedPrompt {
  const profile = getCharacterVisualProfile(options.studentIdOrName)
  const studentId = resolveStudentId(options.studentIdOrName)

  // Combined context string for contextual inferences
  const contextText = `${options.userMessage || ''} ${options.studentReply || ''}`.trim()

  // 1. Layer 2: Character Identity Tags
  const charTagList: string[] = ['1girl', 'solo', profile.characterTag]
  if (!profile.characterTag.includes('blue_archive')) {
    charTagList.push('blue_archive')
  }
  charTagList.push(...profile.halo)
  charTagList.push(...profile.hair)
  charTagList.push(...profile.eyes)
  charTagList.push(...profile.features)

  const outfitTags = resolveOutfitTags(profile, options.outfitVariant, contextText)
  charTagList.push(...outfitTags)

  const characterTags = deduplicateTags(charTagList)

  // 2. Layer 3: Contextual Scene Tags
  const sceneTagList: string[] = []

  // Check explicit scene tags passed in options
  if (options.sceneTags && options.sceneTags.length > 0) {
    sceneTagList.push(...options.sceneTags)
  }

  // Check for [PHOTO: ...] directive in student reply
  if (options.studentReply) {
    const directive = extractPhotoDirective(options.studentReply)
    if (directive.hasDirective && directive.photoTags) {
      sceneTagList.push(directive.photoTags)
    }
  }

  // Intent-based default composition
  const intent = detectPhotoIntent(options.userMessage || '')
  if (intent.isPhotoRequested && intent.triggerType === 'selfie') {
    sceneTagList.push('selfie', 'holding_phone', 'looking_at_viewer', 'upper_body')
  }

  // Contextual text inferences (locations, poses, expressions)
  const inferredContextTags = inferSceneFromContext(contextText)
  sceneTagList.push(...inferredContextTags)

  // Student signature traits if scene is still sparse
  if (sceneTagList.length < 3 && studentId != null && STUDENT_SIGNATURE_TRAITS[studentId]) {
    const trait = STUDENT_SIGNATURE_TRAITS[studentId]
    const preset = SCENE_PRESETS[trait.preferredPreset]
    if (preset) {
      sceneTagList.push(...preset.composition, ...preset.pose, ...preset.expression, ...preset.background, ...preset.lighting)
    }
    sceneTagList.push(...trait.extraSceneTags)
  }

  // If still empty, fall back to standard selfie preset
  if (sceneTagList.length === 0) {
    const defaultPreset = SCENE_PRESETS.selfie_standard
    sceneTagList.push(
      ...defaultPreset.composition,
      ...defaultPreset.pose,
      ...defaultPreset.expression,
      ...defaultPreset.background,
      ...defaultPreset.lighting
    )
  }

  // Time of day tags if not already present
  const hasTimeTag = sceneTagList.some(tag => /morning|daytime|afternoon|sunset|golden_hour|night|late_night/i.test(tag))
  if (!hasTimeTag) {
    sceneTagList.push(...getTimeOfDayTags())
  }

  const sceneTags = deduplicateTags(sceneTagList)

  // 3. Assemble Full Positive Prompt
  const fullPositiveTags = deduplicateTags([
    ...QUALITY_PROMPT_PREFIX,
    ...characterTags,
    ...sceneTags,
    ...(options.additionalPositiveTags || [])
  ])

  // 4. Assemble Negative Prompt
  const fullNegativeTags = deduplicateTags([
    ...DEFAULT_NEGATIVE_PROMPT,
    ...(options.additionalNegativeTags || [])
  ])

  return {
    prompt: fullPositiveTags.join(', '),
    negativePrompt: fullNegativeTags.join(', '),
    characterTags,
    sceneTags
  }
}

/**
 * Alias for synthesizePrompt.
 */
export const buildDanbooruPrompt = synthesizePrompt

/**
 * Resolves a character's visual profile by ID or name.
 */
export const resolveCharacterProfile = getCharacterVisualProfile
