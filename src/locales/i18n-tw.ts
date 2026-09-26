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
    sleepRhythm: '作息時間（就寢與起床時間）',
    sleepRhythmDesc: '在深夜等就寢時間內保留訊息，並在早晨起床時間（根據學生個性與平日/假日）自動回覆',
    sleepingBadge: '就寢中 (預計 {time} 起床)',
    sleepingPlaceholder: '{name}正在就寢中（訊息將在起床後回覆）...',
    readStatus: '已讀',
    clearChat: '重設',
    resetChatConfirm: '確定要重設與{name}的對話記錄嗎？',
    sharefile: '導入&導出',
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
`
}
