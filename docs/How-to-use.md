![Chat screen](./images/preview-chat.webp)

# MomoTalk AI User Guide

MomoTalk AI is an interactive AI chat web application inspired by the MomoTalk messaging system in Blue Archive. Powered by modern Large Language Models (LLMs), it allows you to chat in real time with Kivotos students in an authentic, immersive environment.

---

## 📚 Features & Layout

### 1. Student List (Sidebar)
- **Select Student**: Click any student in the left sidebar to start chatting.
- **Filtering & Search**:
  - **School Icons**: Filter students by academy (Abydos, Gehenna, Trinity, Millennium, etc.).
  - **Search Bar** (Shortcut `/`): Search students by name, romaji, or nickname.
- **Message Preview**: Each student item displays the latest message snippet.
- **Sleep Status Badge (💤)**: When a student is asleep according to their personal schedule, a `💤` badge appears on their avatar.

### 2. Chat View
- **Sending Messages**: Type your message into the input field at the bottom and press `Enter` (or click Send).
  - Use `Shift + Enter` for a line break.
  - Pressing `Enter` to confirm an IME conversion (e.g. Japanese input) does not send the message.
- **In-Universe Typing Indicator**: When Sensei sends a message, a realistic "..." typing animation indicates the student is replying.
- **Read Receipts ("既読")**: Messages sent by Sensei display a "Read" status once processed.
- **Vision & Image Upload**:
  - Attach images with the image icon to the right of the input box, or paste an image (`Ctrl + V`).
  - Students visually inspect the image content and comment on it in-character.
- **Stickers**: Open the sticker list from the icon on the left of the input box and tap one to send it. Use the "1" / "2" buttons below to switch pages. Students understand what each sticker means ("OK", "Thank you", surprise, embarrassment…) and reply accordingly.
- **View Profile**: Tap a student's avatar in the chat (in the header or next to their messages) to open their profile.

### 3. Life Rhythm & Sleep Simulation
- Each student follows a lore-accurate circadian rhythm (with distinct wake-up times for weekdays vs. weekends, regular vs. irregular sleep patterns).
- **Behavior during Sleep**:
  - If you message a sleeping student, they will not reply immediately. Instead, they will wake up at their scheduled time and automatically respond.
  - The sleep simulation feature can be toggled on/off at any time in Settings.

### 4. Kizuna Relationship System
- Chatting regularly with students increases your Kizuna Rank (relationship level).
- Reaching a new rank triggers the authentic Blue Archive level-up fanfare and sound effect.

### 5. Sidebar Bottom Actions
- **🌐 Language Switcher**: Switch between Japanese, English, Korean, Simplified Chinese, and Traditional Chinese.
- **🧹 Reset Chat**: Use the "Reset" button at the top right of the chat to clear your history with that student (asks for confirmation).

---

## ⚙️ Settings (Gear Icon)

Click the gear icon in the top right to open Settings:

1. **AI Provider**:
   - **Groq** (Default & Recommended): Ultra-fast inference with cutting-edge open models like `openai/gpt-oss-120b` and `qwen/qwen3.8-27b`.
   - **Google Gemini**: Google's multimodal models.
   - **OpenAI Compatible**: Connect any OpenAI-compatible API endpoint or custom model.
   - **Anthropic Claude**: State-of-the-art conversational Claude models.
2. **Sleep Simulation Toggle**: Enable or disable the circadian rhythm mechanic.
3. **Basic Settings**: Sound effects on/off and volume, full screen, zoom, and message dragging.

---

## 🌟 Support & Feedback

If you encounter any issues or have feature requests, please check the GitHub repository:

- GitHub: [hirarara74/momotalk_AI](https://github.com/hirarara74/momotalk_AI)
- Issues: [Submit an Issue](https://github.com/hirarara74/momotalk_AI/issues)

![Thank you](../public/img/kyk.gif)