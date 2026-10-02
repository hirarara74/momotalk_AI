## 2026-09-29T20:10:52Z
[Message] timestamp=2026-09-29T20:10:52Z sender=816fdcdb-2ddc-4930-93e4-4ee54bf0bf11 priority=MESSAGE_PRIORITY_HIGH content=You are Worker M5 (worker_m5).
Working directory: c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\worker_m5
Original User Request: c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\ORIGINAL_REQUEST.md
Project root: c:\Users\USER\Documents\GitHub\momotalk-ai
Project Scope: c:\Users\USER\Documents\GitHub\momotalk-ai\PROJECT.md

Your exclusive write ownership:
- src/assets/storeUtils/store.ts
- src/views/DialogView/SettingWindow.vue
- src/assets/i18n/i18n-jp.json
- src/assets/i18n/i18n-en.json
- src/assets/i18n/i18n-kr.json
- src/assets/i18n/i18n-zh.json
- src/assets/i18n/i18n-tw.json

Reference materials:
- c:\Users\USER\Documents\GitHub\momotalk-ai\docs\ARCHITECTURE_IMAGE_GEN.md (Section 6 Security & BYOK Key Policy, Section 8 UI Specs)
- c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\explorer_survey_3\report.md (Section 2 Settings UI & Section 3 Persistence Details)
- c:\Users\USER\Documents\GitHub\momotalk-ai\src\tests\studentImageGeneration.test.ts

Task:
Implement Settings UI, reactive state persistence, and multilingual localization for dynamic photo generation:
1. `src/assets/storeUtils/store.ts`:
   - Add state properties:
     - `imageGenEnabled`: boolean (default: true)
     - `imageGenProvider`: 'pollinations' | 'fal' | 'together' (default: 'pollinations')
     - `imageGenApiKey`: string (default: '')
     - `imageGenModel`: string (default: '')
   - Update `setSettingDialogPage(page: number)`: update the max page clamp from 2 to 3 (`Math.min(Math.max(1, page), 3)`).
   - In `setData()`: serialize and save `image-gen-enabled`, `image-gen-provider`, `image-gen-api-key`, `image-gen-model` to `localStorage`.
   - In `getData()`: deserialize and load `image-gen-enabled` (boolean, default true), `image-gen-provider` (default 'pollinations'), `image-gen-api-key` (string), and `image-gen-model` (string) with backward-compatible defaults.
2. `src/views/DialogView/SettingWindow.vue`:
   - In `.popper-content__tabs`: add 3rd tab button for `imageGenSetting`:
     `<button class="tab-button" :class="{ active: activePage === 3 }" @click="store.setSettingDialogPage(3)">{{ $t('imageGenSetting') }}</button>`
   - Support page 3 in `.featured .page`: adjust CSS width / translateX so that 3 pages can be swiped/viewed cleanly.
   - In Page 3 content:
     - Toggle switch: Photo Generation (`imageGenEnabled`)
     - Provider selection: Radio buttons or selector for Pollinations.ai (Free/Default), Fal.ai (BYOK - Ultra Fast), Together AI (BYOK - Flux.1)
     - BYOK API Key input field (masked/password with visibility toggle) when Fal.ai or Together AI is selected
     - Model selection / chips for BYOK providers
     - Clear description / guidance notes for Sensei.
3. Multilingual localization (`src/assets/i18n/`):
   - Add complete translation strings to ALL 5 files (`i18n-jp.json`, `i18n-en.json`, `i18n-kr.json`, `i18n-zh.json`, `i18n-tw.json`):
     - `imageGenSetting`: "写真・画像" / "Photo Gen" / "사진 생성" / "图片生成" / "圖片生成"
     - `imageGenEnabled`: "生徒の写真送信を許可" / "Enable Student Photos" / "학생 사진 전송 허용" / "允许学生发送照片" / "允許學生發送照片"
     - `imageGenProvider`: "画像生成プロバイダー" / "Image Generation Provider" / "이미지 생성 제공자" / "图片生成服务商" / "圖片生成服務商"
     - `imageGenApiKey`: "APIキー (BYOK)" / "API Key (BYOK)" / "API 키 (BYOK)" / "API密钥 (BYOK)" / "API金鑰 (BYOK)"
     - `imageGenApiKeyPlaceholder`: "APIキーを入力してください" / "Enter API Key" / "API 키를 입력하세요" / "请输入API密钥" / "請輸入API金鑰"
     - `imageGenModel`: "モデル" / "Model" / "모델" / "模型" / "模型"
     - `pollinationsDesc`: "完全無料・登録不要（Pollinations.ai）" / "Free & No Key Required (Pollinations.ai)" / "완전 무료·등록 불필요 (Pollinations.ai)" / "完全免费·无需注册 (Pollinations.ai)" / "完全免費·無需註冊 (Pollinations.ai)"
     - `falDesc`: "超高速・高品質（要APIキー: Fal.ai Flux Schnell）" / "Ultra Fast & High Quality (Fal.ai Flux Schnell)" / "초고속·고품질 (Fal.ai Flux Schnell)" / "超高速·高品质 (Fal.ai Flux Schnell)" / "超高速·高品質 (Fal.ai Flux Schnell)"
     - `togetherDesc`: "FLUX.1 Schnell（要APIキー: Together AI）" / "FLUX.1 Schnell (Together AI)" / "FLUX.1 Schnell (Together AI)" / "FLUX.1 Schnell (Together AI)" / "FLUX.1 Schnell (Together AI)"

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

After implementation:
Run `npm run type-check`, `npm test`, and `npm run build-only`.
Write your handoff report to `c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\worker_m5\handoff.md`.
Update `progress.md`.
Notify parent (id: 816fdcdb-2ddc-4930-93e4-4ee54bf0bf11) via send_message when done.
