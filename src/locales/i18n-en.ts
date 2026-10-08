export default {
    selectInfo: 'Please select a student',
    relatedStudentTitle: 'Related Student',
    noRelatedStudent: 'No related student',
    default: 'Default',
    name: 'Name',
    school: 'School',
    club: 'Club',
    birthday: 'Birthday',
    rare: 'Rarity',
    released: 'Released',
    unreleased: 'Unreleased',
    sort: 'Sort',
    filter: 'Filter',
    imageUploadAlert: 'It is not recommended to upload images larger than 1MB!',
    customRoleInfo: 'Enter a custom character name',
    storyEvent: 'Story Event',
    reply: 'Reply',
    playerTitle: 'MomoTalk Story Player',
    helpTitle: 'MomoTalk AI User Guide',
    playerContent:
        "Click 'Confirm' to start playing the student MomoTalk event\n💥Note: This will clear the conversation history",
    confirm: 'Confirm',
    cancel: 'Cancel',
    selectStory: 'Select an episode',
    selectLanguage: 'Select a language',
    setting: 'Settings',
    basicSetting: 'Basic Settings',
    soundEffects: 'Sound Effects (SE)',
    soundVolume: 'SE Volume',
    aiSetting: 'AI Settings',
    aiEnabled: 'AI Auto-Reply',
    aiProvider: 'AI Provider',
    keySecurityReassurance: 'Your API key is stored locally in your browser (localStorage) and is never sent to any external server.',
    sleepRhythm: 'Student Sleep & Wake Rhythm',
    sleepRhythmDesc: 'Replies are held during sleeping hours and sent automatically when the student wakes up according to their schedule.',
    sleepingBadge: 'Asleep (Wakes up at {time})',
    sleepingPlaceholder: '{name} is currently asleep (messages will be delivered upon waking)...',
    readStatus: 'Read',
    clearChat: 'Reset',
    resetChatConfirm: 'Reset conversation history with {name}?',
    talkWith: 'Talk with {name}',
    chatInputPlaceholder: 'Send message to {name}...',
    apiKeyNotConfiguredNotice: '（API Key is not configured. Please enter your API Key from the top-right Settings ⚙️. ※ You can get a free Groq API Key at https://console.groq.com/keys）',
    imageMessagePlaceholder: 'Type a message about the image (optional)...',
    apiKeyPlaceholderGroq: 'Enter gsk_...',
    apiKeyPlaceholder: 'Enter API Key',
    groqKeyNoticePrefix: '※ Free Groq API Key is available at ',
    groqKeyNoticeSuffix: '.',
    geminiKeyNoticePrefix: '※ Gemini API Key is available at ',
    geminiKeyNoticeSuffix: '.',
    modelLabel: 'Model (Empty for recommended default)',
    modelPlaceholderGroq: 'Recommended: qwen/qwen3.8-27b or openai/gpt-oss-120b',
    modelPlaceholderGemini: 'e.g. gemini-3.5-flash-lite',
    modelPlaceholderOpenai: 'e.g. gpt-4o-mini',
    modelChipTop120b: '★ Flagship (120B)',
    modelChipTop120bTitle: 'Ultra-large 120B reasoning model (CoT reasoning, high precision)',
    modelChipStd27b: 'Standard · Vision (27B)',
    modelChipStd27bTitle: 'Standard model (Vision supported, fast)',
    modelChipGeminiPro: 'Pro (3.5-flash)',
    modelChipGeminiLite: 'Standard (3.5-flash-lite)',
    customBaseUrlLabel: 'Custom Base URL (Optional)',
    filterPromptSupportedOnly: '🤖 Prompt Supported Only',
    filterAllStudents: '👥 Show All Students',
    back: 'Back',
    kizunaRankTitle: 'Bond Rank',
    removeImage: 'Remove attached image',
    sendSticker: 'Send sticker',
    openProfile: 'View profile',
    sendImage: 'Attach and send image',
    sharefile: 'Data',
    renderStyle: 'Theme',
    fullScreen: 'Full Screen',
    zoom: 'Font zoom',
    draggable: 'Dialogue drag and drop',
    enableDrag: 'Drag&drop',
    importAndExport: 'Dialogue Content File',
    importButton: 'Select a File',
    exportButton: 'Click to Download',
    sharedFile: 'Shared File (Playable Dialogue)',
    warnZoom: 
        "⚠️ Your browser is currently zoomed in %ratio%. Continuing to download images may result in formatting errors. \n• If zooming is needed, please use the zoom function in the settings ⚙️ at the top right corner. \n• Do you want to continue downloading?",
    help: `
# MomoTalk AI User Guide · How to use

An interactive AI chat application to talk in real-time with Blue Archive students.

## 💬 Chat Features

- **Talk with Students**: Select any student and send messages via the bottom input bar. Students reply in faithful accordance with their lore, personality, relationships, and speech habits.
- **Typing Indicator & Read Receipts**: Messages sent by Sensei display "Read" receipts, and students show the authentic "..." typing animation in real-time while generating replies.
- **Sleep & Wake Rhythm**: Each student has their own unique personalized sleep/wake rhythm for weekdays and weekends. During sleeping hours, replies are queued and automatically delivered when the student wakes up (can be toggled in settings).
- **Time, Date, Season, and Birthday Awareness**: Students are aware of real-world date, time, weekday, season, and their own birthdays.
- **Message Timestamp & Date Dividers**: Each message displays its send time, with date dividers between different days.

## 📸 Multimodal Vision (Images)

- **Send Photos**: Click the photo icon to send images or screenshots (large images are automatically optimized).
- **In-Character Reactions**: Students look at the actual contents of the image and share authentic reactions.

## 😊 Stickers

- **Send Stickers**: Open the sticker list from the icon on the left of the input bar and tap one to send it. Use the "1" / "2" buttons below to switch pages.
- **Students Understand Them**: Students understand what each sticker means ("OK", "Congratulations", "Thank you", or feelings like surprise, embarrassment, or a sigh) and reply accordingly.

## 💖 Kizuna (Relationship) Rank

- Chatting with students raises your Kizuna relationship rank (Lv.1+) with them over time.

## 📚 Student Roster (23 Students Supported)

- **Search** (\`/\`): Search students by name or romaji.
- **Filter**: Filter by school, rarity, release status, or "🤖 Prompt-Supported Students (23)" only.
- **Sorting**: Students are automatically sorted by newest interaction order in the chat view.
- **Avatar Variations**: Click on students with a "+" badge to cycle through expressions and outfits.

## ⚙️ Settings

- Click the gear icon (⚙️) in the upper right to customize:
  - **AI Provider**: Groq (fast default & recommended), Google Gemini, OpenAI-compatible, or Anthropic Claude
  - **Model & API Key**: One-tap quick selection for 120B reasoning model (openai/gpt-oss-120b) or 27B vision model (qwen/qwen3.8-27b)
  - **Sleep Rhythm**: Toggle student sleep and wake schedules ON/OFF
  - **Audio Effects**: Toggle message send, receive, and rank-up sounds

## ⌨️ Shortcuts

- \`/\` : Focus search box
- \`Enter\` : Send message
- \`Shift + Enter\` : New line

## 📜 Credits & Disclaimer

### 1. Intellectual Property & Copyright Notice
- All characters, imagery, lore, trademarks, and intellectual property related to **Blue Archive** belong to **NEXON Games Co., Ltd.**, **Yostar, Inc.**, and their respective publishers and affiliates.
- This web application is an **unofficial, non-commercial fan creation (derivative work)** made out of love for Blue Archive under the official fan creation guidelines.
- This application is not affiliated with, endorsed by, or sponsored by NEXON Games or Yostar.

### 2. Open Source Attribution & Gratitude
- The user interface and foundational structure of this project are based on the open-source repository **[U1805/momotalk](https://github.com/U1805/momotalk)** (MIT License by U1805), modified and extended to integrate pluggable real-time LLM chat and vision multimodal intelligence. We express our deepest gratitude to U1805 and all contributors for their wonderful MomoTalk web simulator.
- Student data and assets are loaded from **[BlueArcbox/resources](https://github.com/BlueArcbox/resources)** and **[kivo.wiki](https://kivo.wiki/)**.

### 3. Built with Vibe Coding
- This project was developed through interactive AI pair programming (**Vibe Coding**) powered by Google DeepMind's autonomous AI coding assistant, **Antigravity**.

### 4. Privacy & Disclaimer
- **API Key Security**: User API keys are stored solely within your local browser storage (\`localStorage\`) and are never sent to, logged by, or collected on any intermediary server. Requests are dispatched directly and securely over HTTPS to official AI providers (Groq, Google, etc.).
- **Disclaimer**: The developer assumes no responsibility or liability for any consequences arising from the use of this application. If requested by copyright holders, this project will be promptly modified or taken down.
`
}
