import type { ScenePreset } from './types'

/**
 * Standard scene presets providing pre-configured Danbooru tags
 * for common MomoTalk photo situations.
 */
export const SCENE_PRESETS: Record<string, ScenePreset> = {
  // 1. Classic Smartphone Selfie
  selfie_standard: {
    name: 'selfie_standard',
    composition: ['selfie', 'holding_phone', 'looking_at_viewer', 'close-up', 'upper_body'],
    pose: ['arm_up', 'pointing_phone_at_self'],
    expression: ['gentle_smile', 'slight_blush'],
    background: ['indoor', 'soft_background_blur'],
    lighting: ['natural_daylight', 'soft_lighting']
  },

  // 2. Playful / Cute Selfie
  selfie_cute: {
    name: 'selfie_cute',
    composition: ['selfie', 'holding_phone', 'looking_at_viewer', 'dutch_angle', 'close-up'],
    pose: ['v_sign', 'peace_sign_near_eye', 'tilted_head'],
    expression: ['cheerful_smile', 'winking', 'blush'],
    background: ['classroom', 'school_hallway'],
    lighting: ['bright_afternoon_sun']
  },

  // 3. Cafe / Afternoon Tea
  cafe_break: {
    name: 'cafe_break',
    composition: ['selfie', 'sitting_at_table', 'looking_at_viewer'],
    pose: ['holding_teacup', 'table', 'plate_with_cake'],
    expression: ['happy_smile', 'blush'],
    background: ['cafe_interior', 'cozy_cafe_atmosphere'],
    lighting: ['warm_indoor_lighting', 'sunlight_through_window']
  },

  // 4. Desk Work / Studying at SCHALE
  studying_desk: {
    name: 'studying_desk',
    composition: ['medium_shot', 'looking_at_viewer', 'sitting'],
    pose: ['sitting_at_desk', 'holding_pen', 'notebooks_on_desk'],
    expression: ['focused_look', 'slight_smile'],
    background: ['schale_office', 'bookshelf', 'computer_screen_background'],
    lighting: ['indoor_office_lighting']
  },

  // 5. Late Night / Bedtime Cozy
  night_bedroom: {
    name: 'night_bedroom',
    composition: ['selfie', 'close-up', 'looking_at_viewer', 'lying_on_bed'],
    pose: ['hugging_pillow', 'relaxed_posture'],
    expression: ['sleepy_eyes', 'soft_smile', 'blush'],
    background: ['bedroom', 'bed_sheet', 'cozy_room'],
    lighting: ['dim_room_lighting', 'screen_glow', 'night']
  },

  // 6. Outdoor Patrol / Sports
  outdoor_patrol: {
    name: 'outdoor_patrol',
    composition: ['selfie', 'outdoors', 'upper_body', 'looking_at_viewer'],
    pose: ['walking', 'sports_towel_around_neck'],
    expression: ['energetic_smile', 'light_sweat'],
    background: ['street', 'blue_sky', 'city_background'],
    lighting: ['sunny_day', 'bright_sunlight', 'lens_flare']
  },

  // 7. Summer Beach / Resort
  beach_summer: {
    name: 'beach_summer',
    composition: ['selfie', 'outdoors', 'upper_body', 'looking_at_viewer'],
    pose: ['standing_on_sand', 'peace_sign'],
    expression: ['bright_smile', 'blush'],
    background: ['beach', 'ocean', 'blue_sky', 'sandy_beach'],
    lighting: ['bright_sunlight', 'summer_sun']
  },

  // 8. Classroom Golden Hour / Sunset
  classroom_afternoon: {
    name: 'classroom_afternoon',
    composition: ['selfie', 'sitting', 'looking_at_viewer'],
    pose: ['resting_chin_on_hands', 'sitting_at_desk'],
    expression: ['gentle_smile'],
    background: ['classroom', 'school_desks', 'window'],
    lighting: ['golden_hour', 'sunset_light_through_window']
  }
}

/**
 * Location Danbooru tags indexed by keyword.
 */
export const LOCATION_TAGS: Record<string, string[]> = {
  classroom: ['classroom', 'school_desks', 'blackboard', 'window'],
  cafe: ['cafe', 'cafe_interior', 'cafe_table', 'coffee_cup', 'indoor'],
  street: ['city_street', 'outdoors', 'buildings', 'sidewalk'],
  beach: ['beach', 'ocean', 'sandy_beach', 'blue_sky'],
  office: ['schale_office', 'office_desk', 'computer', 'indoor'],
  bedroom: ['bedroom', 'bed', 'cozy_room', 'indoor'],
  park: ['park', 'trees', 'grass', 'outdoors'],
  library: ['library', 'bookshelves', 'books', 'quiet_room'],
  rooftop: ['school_rooftop', 'chainlink_fence', 'open_sky'],
  convenience_store: ['convenience_store', 'store_shelves', 'indoor']
}

/**
 * Time-of-day Danbooru tags.
 */
export const TIME_OF_DAY_TAGS: Record<string, string[]> = {
  morning: ['morning', 'morning_sunlight', 'bright'],
  daytime: ['daytime', 'sunlight', 'clear_sky'],
  afternoon: ['afternoon', 'warm_sunlight'],
  sunset: ['sunset', 'golden_hour', 'orange_sky', 'dusk'],
  night: ['night', 'night_sky', 'dark_lighting', 'moonlight'],
  late_night: ['late_night', 'dark', 'dim_lighting', 'screen_glow']
}

/**
 * Expression Danbooru tags.
 */
export const EXPRESSION_TAGS: Record<string, string[]> = {
  smile: ['smile', 'happy'],
  gentle: ['gentle_smile', 'soft_smile'],
  cheerful: ['cheerful_smile', 'open_mouth', 'happy'],
  blush: ['blush', 'slight_blush'],
  winking: ['winking', 'one_eye_closed'],
  pout: ['pout', 'pouting_face'],
  sleepy: ['sleepy_eyes', 'half-closed_eyes', 'yawning'],
  flustered: ['flustered', 'embarrassed', 'blush', 'sweatdrop'],
  tsundere: ['tsundere_expression', 'looking_away', 'slight_blush'],
  serious: ['serious_look', 'focused_eyes']
}

/**
 * Pose Danbooru tags.
 */
export const POSE_TAGS: Record<string, string[]> = {
  selfie: ['selfie', 'holding_phone', 'arm_up'],
  peace: ['peace_sign', 'v_sign'],
  waving: ['waving_hand'],
  sitting: ['sitting', 'sitting_at_table'],
  lying: ['lying_on_bed', 'lying_down'],
  eating: ['eating', 'holding_food'],
  drinking: ['drinking', 'holding_cup'],
  standing: ['standing']
}

/**
 * Lighting Danbooru tags.
 */
export const LIGHTING_TAGS: Record<string, string[]> = {
  natural: ['natural_light', 'soft_lighting'],
  warm: ['warm_lighting', 'indoor_lighting'],
  bright: ['bright_sunlight', 'backlighting'],
  dim: ['dim_lighting', 'low_light'],
  sunset: ['golden_hour_lighting', 'dusk_lighting'],
  cinematic: ['cinematic_lighting', 'depth_of_field']
}

/**
 * Student-specific signature scene preferences and personal trait tags.
 */
export const STUDENT_SIGNATURE_TRAITS: Record<number, { preferredPreset: string; extraSceneTags: string[] }> = {
  10010: { preferredPreset: 'outdoor_patrol', extraSceneTags: ['slight_blush', 'athletic'] }, // Shiroko
  10005: { preferredPreset: 'night_bedroom', extraSceneTags: ['sleepy_eyes', 'relaxed'] }, // Hoshino
  10004: { preferredPreset: 'studying_desk', extraSceneTags: ['tired_eyes', 'gentle_smile'] }, // Hina
  20008: { preferredPreset: 'studying_desk', extraSceneTags: ['flustered', 'blush', 'paperwork'] }, // Ako
  10000: { preferredPreset: 'selfie_cute', extraSceneTags: ['proud_smile', 'confident'] }, // Aru
  13010: { preferredPreset: 'studying_desk', extraSceneTags: ['calculator', 'cute_pout'] }, // Yuuka
  10003: { preferredPreset: 'cafe_break', extraSceneTags: ['cheerful_smile', 'peroro'] }, // Hifumi
  23008: { preferredPreset: 'selfie_standard', extraSceneTags: ['gentle_smile', 'kind_gaze'] }, // Mari
  10019: { preferredPreset: 'classroom_afternoon', extraSceneTags: ['serious_look', 'soft_expression'] }, // Azusa
  10006: { preferredPreset: 'outdoor_patrol', extraSceneTags: ['tsundere_expression', 'sharp_gaze'] }, // Iori
  20001: { preferredPreset: 'selfie_standard', extraSceneTags: ['calm_expression', 'maid'] }, // Karin
  10059: { preferredPreset: 'cafe_break', extraSceneTags: ['starry_eyes', 'radiant_smile', 'roll_cake'] }, // Mika
  10062: { preferredPreset: 'selfie_cute', extraSceneTags: ['expressionless', 'kuudere', 'double_peace_sign'] }, // Toki
  10002: { preferredPreset: 'cafe_break', extraSceneTags: ['elegant_smile', 'dessert'] }, // Haruna
  13006: { preferredPreset: 'selfie_cute', extraSceneTags: ['mischievous_smirk', 'winking', 'fang'] }, // Mutsuki
  10052: { preferredPreset: 'studying_desk', extraSceneTags: ['gentle_smile', 'clipboard'] }, // Noa
  10063: { preferredPreset: 'selfie_cute', extraSceneTags: ['playful_smile', 'wide_grin', 'open_mouth'] }, // Koyuki
  10020: { preferredPreset: 'selfie_standard', extraSceneTags: ['heavy_blush', 'flustered', 'embarrassed_pout'] }, // Koharu
  16001: { preferredPreset: 'selfie_cute', extraSceneTags: ['bright_smile', 'energetic', 'winking'] }, // Asuna
  10008: { preferredPreset: 'outdoor_patrol', extraSceneTags: ['sharp_teeth', 'smug_grin', 'arms_crossed'] }, // Neru
  10049: { preferredPreset: 'cafe_break', extraSceneTags: ['tsundere_expression', 'slight_blush', 'sweets'] }, // Kazusa
  10048: { preferredPreset: 'outdoor_patrol', extraSceneTags: ['serious_gaze', 'calm'] }, // Saori
  10011: { preferredPreset: 'selfie_standard', extraSceneTags: ['gentle_smile', 'mature_expression', 'tea'] }, // Shun
  9999: { preferredPreset: 'selfie_cute', extraSceneTags: ['cheerful_smile', 'sparkling_eyes'] } // Arona
}

/**
 * Retrieve a scene preset by its name.
 */
export function getScenePreset(name: string): ScenePreset | undefined {
  return SCENE_PRESETS[name]
}

/**
 * List all available scene presets.
 */
export function listScenePresets(): ScenePreset[] {
  return Object.values(SCENE_PRESETS)
}

/**
 * Compute time-of-day Danbooru tags based on current or specified time.
 */
export function getTimeOfDayTags(date: Date = new Date()): string[] {
  const hour = date.getHours()

  if (hour >= 5 && hour < 9) {
    return TIME_OF_DAY_TAGS.morning
  } else if (hour >= 9 && hour < 16) {
    return TIME_OF_DAY_TAGS.daytime
  } else if (hour >= 16 && hour < 19) {
    return TIME_OF_DAY_TAGS.sunset
  } else if (hour >= 19 && hour < 23) {
    return TIME_OF_DAY_TAGS.night
  } else {
    return TIME_OF_DAY_TAGS.late_night
  }
}

/**
 * Infer situational Danbooru tags by analyzing conversational context
 * (user inquiry text and/or student reply text).
 */
export function inferSceneFromContext(text: string): string[] {
  if (!text) return []
  const lower = text.toLowerCase()
  const tags: Set<string> = new Set()

  // Location detection
  if (/カフェ|喫茶|お茶|ケーキ|パフェ|紅茶|cafe|coffee|tea|dessert|cake|카페|디저트/i.test(lower)) {
    LOCATION_TAGS.cafe.forEach(t => tags.add(t))
    POSE_TAGS.sitting.forEach(t => tags.add(t))
  } else if (/教室|授業|学校|放課後|勉強|classroom|school|study|class|교실|수업/i.test(lower)) {
    LOCATION_TAGS.classroom.forEach(t => tags.add(t))
  } else if (/海|砂浜|ビーチ|プール|水着|泳|beach|ocean|pool|sea|swim|swimsuit|바다|수영장/i.test(lower)) {
    LOCATION_TAGS.beach.forEach(t => tags.add(t))
    LIGHTING_TAGS.bright.forEach(t => tags.add(t))
  } else if (/シャーレ|執務室|オフィス|仕事|書類|schale|office|work|desk|서류|집무실/i.test(lower)) {
    LOCATION_TAGS.office.forEach(t => tags.add(t))
    POSE_TAGS.sitting.forEach(t => tags.add(t))
  } else if (/ベッド|部屋|寝る|おやすみ|布団|bedroom|bed|sleep|room|침대|방/i.test(lower)) {
    LOCATION_TAGS.bedroom.forEach(t => tags.add(t))
    POSE_TAGS.lying.forEach(t => tags.add(t))
    EXPRESSION_TAGS.sleepy.forEach(t => tags.add(t))
  } else if (/散歩|パトロール|外|公園|patrol|walk|park|street|산책|순찰/i.test(lower)) {
    LOCATION_TAGS.street.forEach(t => tags.add(t))
    POSE_TAGS.standing.forEach(t => tags.add(t))
  }

  // Expression / mood detection
  if (/照れ|恥ずかし|赤面|blush|embarrass|부끄/i.test(lower)) {
    EXPRESSION_TAGS.blush.forEach(t => tags.add(t))
  }
  if (/笑顔|にこっ|えへへ|smile|happy|웃음/i.test(lower)) {
    EXPRESSION_TAGS.cheerful.forEach(t => tags.add(t))
  }
  if (/眠い|ねむ|あくび|sleepy|tired|졸려/i.test(lower)) {
    EXPRESSION_TAGS.sleepy.forEach(t => tags.add(t))
  }
  if (/ピース|peace|v sign|브이/i.test(lower)) {
    POSE_TAGS.peace.forEach(t => tags.add(t))
  }

  return Array.from(tags)
}

/**
 * Get signature trait tags for a specific student ID.
 */
export function getSignatureStudentSceneTags(studentId: number): string[] {
  const trait = STUDENT_SIGNATURE_TRAITS[studentId]
  if (!trait) return []
  const preset = SCENE_PRESETS[trait.preferredPreset]
  const presetTags = preset ? [...preset.composition, ...preset.pose, ...preset.expression, ...preset.background, ...preset.lighting] : []
  return Array.from(new Set([...presetTags, ...trait.extraSceneTags]))
}
