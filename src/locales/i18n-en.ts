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
    sleepRhythm: 'Student Sleep & Wake Rhythm',
    sleepRhythmDesc: 'Replies are held during sleeping hours and sent automatically when the student wakes up according to their schedule.',
    sleepingBadge: 'Asleep (Wakes up at {time})',
    sleepingPlaceholder: '{name} is currently asleep (messages will be delivered upon waking)...',
    readStatus: 'Read',
    clearChat: 'Reset',
    resetChatConfirm: 'Reset conversation history with {name}?',
    sharefile: 'Import & Export',
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
  - **Theme**: MomoTalk or YuzuTalk theme
  - **Audio Effects**: Toggle message send, receive, and rank-up sounds

## ⌨️ Shortcuts

- \`/\` : Focus search box
- \`Enter\` : Send message
- \`Shift + Enter\` : New line
`
}
