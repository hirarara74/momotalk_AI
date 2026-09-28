export default {
    selectInfo: '請選擇學生',
    relatedStudentTitle: '相關學生',
    noRelatedStudent: '暫無相關學生',
    default: '預設',
    name: '名字',
    school: '學校',
    club: '社團',
    birthday: '生日',
    rare: '稀有度',
    released: '已實裝',
    unreleased: '未實裝',
    sort: '排序',
    filter: '篩選',
    imageUploadAlert: '不建議上傳大於1MB的圖片！',
    customRoleInfo: '輸入自訂角色名稱',
    storyEvent: '羈絆劇情',
    reply: '回覆',
    playerTitle: 'MomoTalk 劇情播放器',
    helpTitle: 'MomoTalk AI 使用指南',
    playerContent: "點選 '確認' 開始播放學生 MomoTalk 劇情\n💥注意：此功能將清空對話記錄",
    confirm: '確認',
    cancel: '取消',
    selectStory: '選擇劇集',
    selectLanguage: '選擇語言',
    setting: '設置',
    basicSetting: '基本設定',
    soundEffects: '音效 (SE)',
    soundVolume: 'SE 音量',
    aiSetting: 'AI設置',
    aiEnabled: 'AI自動回覆',
    aiProvider: 'AI模型',
    keySecurityReassurance: 'API 金鑰僅保存在本機瀏覽器（localStorage）中，絕不上傳任何第三方伺服器。',
    sleepRhythm: '作息時間（就寢與起床時間）',
    sleepRhythmDesc: '在深夜等就寢時間內保留訊息，並在早晨起床時間（根據學生個性與平日/假日）自動回覆',
    sleepingBadge: '就寢中 (預計 {time} 起床)',
    sleepingPlaceholder: '{name}正在就寢中（訊息將在起床後回覆）...',
    readStatus: '已讀',
    clearChat: '重設',
    resetChatConfirm: '確定要重設與{name}的對話記錄嗎？',
    talkWith: '與 {name} 聊天',
    chatInputPlaceholder: '發送訊息給 {name}...',
    apiKeyNotConfiguredNotice: '（API金鑰尚未設定。請點擊右上角設定 ⚙️ 輸入API金鑰。※ 免費的 Groq API Key 可在 https://console.groq.com/keys 申請）',
    imageMessagePlaceholder: '輸入關於圖片的訊息（可選）...',
    apiKeyPlaceholderGroq: '輸入 gsk_...',
    apiKeyPlaceholder: '輸入 API Key',
    groqKeyNoticePrefix: '※ 免費的 Groq API Key 可在 ',
    groqKeyNoticeSuffix: ' 申請。',
    geminiKeyNoticePrefix: '※ Gemini API Key 可在 ',
    geminiKeyNoticeSuffix: ' 申請。',
    modelLabel: 'Model (留空為推薦預設)',
    modelPlaceholderGroq: '推薦: qwen/qwen3.8-27b 或 openai/gpt-oss-120b',
    modelPlaceholderGemini: '例: gemini-3.5-flash-lite',
    modelPlaceholderOpenai: '例: gpt-4o-mini',
    modelChipTop120b: '★ 最強旗艦 (120B)',
    modelChipTop120bTitle: '超大型120B思考型模型（CoT深度推理·精細高品質）',
    modelChipStd27b: '標準·圖像支援 (27B)',
    modelChipStd27bTitle: '標準模型（支援圖像識別·響應輕快）',
    modelChipGeminiPro: '進階 (3.5-flash)',
    modelChipGeminiLite: '標準 (3.5-flash-lite)',
    customBaseUrlLabel: '自訂 Base URL (選填)',
    filterPromptSupportedOnly: '🤖 僅顯示適配Prompt學生',
    filterAllStudents: '👥 顯示全部學生',
    back: '返回',
    kizunaRankTitle: '羈絆等級',
    removeImage: '刪除附加圖片',
    sendSticker: '發送貼圖',
    sendImage: '附加並發送圖片',
    sharefile: '資料管理',
    renderStyle: '主題風格',
    fullScreen: '視窗全螢幕',
    zoom: '字體縮放',
    draggable: '對話拖拽',
    enableDrag: '啟用拖拽',
    importAndExport: '對話內容文檔',
    importButton: '選擇文件',
    exportButton: '點我下載',
    sharedFile: '分享文檔（可播放對話）',
    warnZoom: 
        "⚠️ 發現您的瀏覽器目前處於縮放狀態(%ratio%)，繼續下載圖片可能導致排版錯誤。\n• 如需縮放，請使用右上角設置 ⚙️ 中的縮放功能。\n• 是否要繼續下載？",
    help: `
# MomoTalk AI 使用指南 · How to use

這是一款能夠與《蔚藍檔案》（Blue Archive）的學生們進行即時互動的 AI 對話應用。

## 💬 聊天功能 · Chat Features

- **與學生對話**：選擇任意學生，在底部輸入欄發送訊息，基沃托斯的學生將忠於原作人設、性格、口氣與人際關係進行回覆。
- **輸入中動畫與已讀**：老師發送的訊息會顯示「已讀」，學生思考並組織語言時，會即時播放原作經典的「…」輸入動畫。
- **生活作息（就寢與起床）**：根據學生的個性與工作日/休息日設定了個人化的作息時間。深夜就寢期間回覆將被保留，早晨起床時將自動發送（可在設定中隨時開啟/關閉）。
- **現實時間、季節與生日感知**：學生知曉現實中的當前時間、星期、季節以及學生自己的生日。
- **訊息時間與日期分割線**：每條訊息均標註發送時間，不同日期之間顯示日期分割線。

## 📸 多模態圖像識別 · Image Vision

- **發送圖片**：點擊輸入欄的相片圖示即可發送圖片或截圖（大圖將自動壓縮最佳化）。
- **學生真實回饋**：學生會仔細觀看圖片內容（風景、照片、圖表等）並給出真實的情境反應。

## 😊 貼圖 · Stickers

- **發送貼圖**：點擊輸入欄左側的圖示開啟貼圖列表，點擊即可發送。可用下方的「1」「2」按鈕切換頁面。
- **學生理解貼圖**：學生能理解貼圖的含義（「OK」「恭喜」「謝謝」，以及驚訝、害羞、嘆氣等表情和情緒），並做出相應的回覆。

## 💖 羈絆等級 · Kizuna Rank

- 與學生持續對話可提升與該學生的羈絆等級（Lv.1 起）。

## 📚 學生列表（支援23名深度設定學生） · Student Roster

- **搜尋欄**（快捷鍵 \`/\`）：支援漢字、羅馬拼音及暱稱快速搜尋。
- **篩選**：可按學校、稀有度、實裝狀態，或僅篩選「🤖 已適配AI提示詞的學生（23名）」。
- **排序**：聊天介面按最近互動時間自動置頂排序。
- **差分切換**：帶有「+」標記的學生頭像可點擊切換服裝與表情差分。

## ⚙️ 設定 · Settings

- 點擊右上角齒輪圖示（⚙️）可進行以下自訂設定：
  - **AI 服務商**：Groq（預設高速推薦）/ Google Gemini / OpenAI 相容 / Anthropic Claude
  - **模型與金鑰**：一鍵切換頂級 120B 推理模型（openai/gpt-oss-120b）或標準圖像支援 27B 模型（qwen/qwen3.8-27b）
  - **生活作息**：開啟或關閉學生的作息模擬
  - **主題切換**：MomoTalk 原生主題 / YuzuTalk 主題
  - **音效設定**：提示音、升級音效開關及音量調節

## ⌨️ 快捷鍵 · Shortcuts

- \`/\` : 聚焦搜尋框
- \`Enter\` : 發送訊息
- \`Shift + Enter\` : 換行

## 📜 致謝與免責聲明 · Credits & Disclaimer

### 1. 原作版權與智慧財產權歸屬
- 本應用涉及的《蔚藍檔案》（Blue Archive）所有角色、立繪圖片、世界觀設定、商標及智慧財產權均歸 **NEXON Games** 及 **Yostar**（以及各地區發行商）所有。
- 本專案嚴格遵守官方二次創作規範，是由粉絲出於愛好製作的**非官方、非營利性同人衍生作品**。
- 本專案與 NEXON Games、Yostar 及任何官方營運團隊均無任何關聯。

### 2. 開源專案致謝
- 本應用的 UI 介面與基本框架 Fork 自開源專案 **[U1805/momotalk](https://github.com/U1805/momotalk)**（MIT License / 作者: U1805），並在此基礎上整合了多模型大語言模型（LLM）對話引擎與多模態視覺識別能力。衷心感謝 U1805 優秀的 MomoTalk 原作還原工程及對開源社群的貢獻！
- 部分學生資料與素材資源引用自社群專案 **[SchaleDB](https://schaledb.com/)**（[lonqix/SchaleDB](https://github.com/lonqix/SchaleDB)）。

### 3. 基於 Vibe Coding（氛圍編程）打造
- 本專案由人類開發者與 Google DeepMind 自主型智慧代理 AI **Antigravity** 深度協同，透過互動式結對編程（**Vibe Coding**）完成了架構設計、角色深度提示詞構建、測試驅動開發（TDD）及自我修正循環（\`//loop\`）。
- 這是一個結合人類創意構想與 AI 智慧代理工程閉環的實驗性 AI-Native 軟體範例。

### 4. 隱私安全與免責聲明
- **API 金鑰安全**：您在設定中填寫的 API Key 僅儲存在您本機瀏覽器的 \`localStorage\` 中，絕不會上傳或儲存到任何開發者中繼伺服器，直接透過 HTTPS 加密連線直連官方 AI 服務商（如 Groq、Google 等）。
- **免責聲明**：作者不承擔因使用本應用產生的任何損失或爭議。如版權方提出任何合規要求，本專案將第一時間積極配合調整或下線。
`
}
