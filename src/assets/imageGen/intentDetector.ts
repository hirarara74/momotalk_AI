import type { PhotoIntentResult, PhotoDirectiveResult } from './types'

/**
 * Regex patterns for multilingual photo intent detection.
 * Supports Japanese, English, Korean, Simplified Chinese, and Traditional Chinese.
 */

// 1. Explicit Selfie Requests
const SELFIE_REGEX = /(?:自撮り|じどり|セルフィー|写メ|selfie|셀카|셀피|自拍)/i

// 2. Explicit Photo / Picture Requests
const DIRECT_PHOTO_REGEX = new RegExp([
  // Japanese
  '(?:写真|画像|しゃしん).*(?:送|見|撮|ちょ|下さ|くれ|ちょうだい|お願い|UP|うｐ|ある[？?])',
  '(?:写真|画像)見せて',
  '(?:写真|画像)送って',
  '写真を?撮って',
  // English
  '(?:send|show|give|take|share|snap).*(?:photo|picture|pic|image|snapshot)',
  '(?:send|show|let\\s+me\\s+see).*(?:selfie|photo|picture|pic)',
  // Korean
  '사진.*(?:보내|보여|찍어|줘|부탁|있어[?？])',
  // Chinese (Simplified & Traditional)
  '(?:发|發|拍|看|看一下|看看|传|傳).*(?:照片|相片|照|图|圖)',
  '拍照(?:我看|看看)?'
].join('|'), 'i')

// 3. Situational Activity Inquiries ("What are you doing?")
// Anchored to prevent hijacking compound non-photo task inquiries (e.g. "今何してるの？宿題手伝って")
const ACTIVITY_CORE_PATTERNS = [
  // Japanese
  '今何してる(?:の|ん|よ)?',
  '何してるの?',
  '今どこ(?:にいる(?:の|ん|よ)?)?',
  '様子見せて',
  // English
  'what(?:\\s+are)?\\s+you\\s+doing',
  'where\\s+are\\s+you',
  'what\\s+are\\s+you\\s+up\\s+to',
  // Korean
  '지금\\s*뭐해',
  '지금\\s*뭐하고\\s*있어',
  '지금\\s*어디',
  // Chinese (Simplified & Traditional)
  '(?:你)?在[干幹]嘛',
  '(?:你)?在[干幹][什甚][么麼]',
  '(?:你)?在做[什甚][么麼]',
  '你在(?:哪|哪里|哪裡)'
].join('|')

const ACTIVITY_REGEX = new RegExp(
  `^(?:.*?[,、\\s]+)?(?:${ACTIVITY_CORE_PATTERNS})[？?！!~〜.。\\s]*(?:教えて(?:よ|ね)?[？?！!~〜.。\\s]*)?$`,
  'i'
)

// 4. Outfit / Costume Inquiries
const OUTFIT_REGEX = new RegExp([
  // Japanese
  '(?:衣装|服|制服|水着|コスチューム).*(?:見せて|どう|見たい)',
  'どんな服(?:着てる)?[？?]?',
  // English
  '(?:show|see).*(?:outfit|clothes|dress|swimsuit|costume)',
  'what\\s+are\\s+you\\s+wearing[?？]?',
  // Korean
  '(?:옷|의상|수영복).*(?:보여|어때)',
  // Chinese
  '(?:衣服|服装|服裝|泳装|泳裝).*(?:看看|看一下|展示)'
].join('|'), 'i')

/**
 * Explicit refusals and negative requests (e.g. "Do not send photos", "No selfies").
 * Prevents false positive photo generation when user expresses explicit negation.
 */
const INTENT_NEGATION_REGEX = new RegExp([
  // Japanese
  '(?:送らないで|撮らないで|送らなくていい|不要|嫌い|いらない|見たくない|駄目|だめ|結構です)',
  // English
  '(?:don[\'’]?t|do\\s+not|no\\s+selfies?|never\\s+send|stop\\s+sending|please\\s+don[\'’]?t)',
  // Chinese
  '(?:别发|不要发|别拍|不要拍|不用发|不用拍|不需要)',
  // Korean
  '(?:보내지\\s*마|찍지\\s*마|보여주지\\s*마|필요\\s*없어)'
].join('|'), 'i')

/**
 * Detect photo / selfie intent from user's message.
 * Evaluates in priority order: negation -> selfie -> direct photo -> outfit -> activity.
 */
export function detectPhotoIntent(userMessage: string): PhotoIntentResult {
  if (!userMessage || typeof userMessage !== 'string') {
    return {
      isPhotoRequested: false,
      triggerType: 'none'
    }
  }

  const trimmed = userMessage.trim()
  if (!trimmed) {
    return {
      isPhotoRequested: false,
      triggerType: 'none'
    }
  }

  // Pre-filter: Explicit negation and refusal detection
  if (INTENT_NEGATION_REGEX.test(trimmed)) {
    return {
      isPhotoRequested: false,
      triggerType: 'none'
    }
  }

  // 1. Explicit Selfie match
  if (SELFIE_REGEX.test(trimmed)) {
    return {
      isPhotoRequested: true,
      sceneHint: 'selfie',
      triggerType: 'selfie',
      matchedPattern: 'selfie'
    }
  }

  // 2. Explicit Photo match
  if (DIRECT_PHOTO_REGEX.test(trimmed)) {
    return {
      isPhotoRequested: true,
      sceneHint: 'photo',
      triggerType: 'direct',
      matchedPattern: 'direct'
    }
  }

  // 3. Outfit match
  if (OUTFIT_REGEX.test(trimmed)) {
    return {
      isPhotoRequested: true,
      sceneHint: 'outfit',
      triggerType: 'outfit',
      matchedPattern: 'outfit'
    }
  }

  // 4. Activity inquiry match
  if (ACTIVITY_REGEX.test(trimmed)) {
    return {
      isPhotoRequested: true,
      sceneHint: 'activity',
      triggerType: 'activity',
      matchedPattern: 'activity'
    }
  }

  return {
    isPhotoRequested: false,
    triggerType: 'none'
  }
}

/**
 * Regex matching [PHOTO: <tags>] or 【PHOTO: <tags>】 in LLM outputs.
 * Global flag (/g) ensures all directive tags are cleanly stripped from user-facing text.
 */
export const PHOTO_DIRECTIVE_REGEX = /(?:\[|【)\s*PHOTO\s*:\s*([^\]】]+)\s*(?:\]|】)/gi

/**
 * Extract photo directive tags from LLM reply stream or completed text,
 * stripping all directives to produce clean user-facing dialogue.
 */
export function extractPhotoDirective(llmReplyText: string): PhotoDirectiveResult {
  if (!llmReplyText || typeof llmReplyText !== 'string') {
    return { cleanText: '', hasDirective: false }
  }

  const singleMatch = /(?:\[|【)\s*PHOTO\s*:\s*([^\]】]+)\s*(?:\]|】)/i.exec(llmReplyText)
  if (singleMatch) {
    const photoTags = singleMatch[1].trim()
    const cleanText = llmReplyText.replace(PHOTO_DIRECTIVE_REGEX, '').trim()
    return {
      cleanText,
      photoTags,
      hasDirective: true
    }
  }

  return {
    cleanText: llmReplyText.trim(),
    hasDirective: false
  }
}

/**
 * Build system prompt directive instructing the student LLM to emit
 * an immediate dialogue response followed by a [PHOTO: ...] tag when photo intent is detected.
 */
export function buildPhotoPromptDirective(language: string = 'jp'): string {
  switch (language.toLowerCase()) {
    case 'en':
      return '\n(Note: Sensei requested a photo or selfie. You MUST strictly preserve your character persona, tone, first/second-person pronouns, and relationship with Sensei. Do NOT break character. Reply in 1-2 natural, in-character sentences fitting your exact personality, and end your message with a [PHOTO: composition, pose, expression, location, time] directive tag.)\n'
    case 'kr':
      return '\n(선생님이 사진이나 셀카를 요청했습니다. 반드시 자신의 캐릭터 설정, 말투, 1인칭 및 2인칭 호칭, 성격을 엄격히 유지하세요. 캐릭터성을 절대 무너뜨리지 말고, 당신의 성격에 어울리는 자연스러운 대화로 1~2문장 즉시 답장한 뒤, 메시지 끝에 반드시 [PHOTO: 구도, 포즈, 표정, 장소, 시간대] 태그를 붙여주세요.)\n'
    case 'zh':
    case 'zh-cn':
      return '\n(老师正在向你索要照片或自拍。请务必严格维持你自身的角色人设、性格、口吻、第一人称及第二人称称呼，绝对不要崩人设。用完全符合你性格的1~2句生动台词进行即时回复，并在末尾附加 [PHOTO: 构图, 姿势, 表情, 地点, 时间] 标签。)\n'
    case 'tw':
    case 'zh-tw':
      return '\n(老師正在向你索要照片或自拍。請務必嚴格維持你自身的角色人設、性格、語氣、第一人稱及第二人稱稱呼，絕對不要崩人設。用完全符合你性格的1~2句生動台詞進行即時回覆，並在末尾附加 [PHOTO: 構圖, 姿勢, 表情, 地點, 時間] 標籤。)\n'
    case 'jp':
    case 'ja':
    default:
      return '\n（重要指示: 先生が写真や自撮りを求めています。あなた自身のキャラクターの人格・口調・一人称・二人称・性格設定を最優先で厳格に維持し、絶対にキャラクター性を崩さないでください。あなたの性格ならではの自然なリアクションを1〜2文で即座に返し、末尾に必ず [PHOTO: 構図, ポーズ, 表情, 場所, 時間帯] タグを付与してください）\n'
  }
}
