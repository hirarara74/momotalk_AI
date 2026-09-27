# Contributing to MomoTalk AI

Thank you for your interest in contributing to **MomoTalk AI**!  
We welcome bug reports, student prompt improvements, translation additions, and feature suggestions to make chatting with Kivotos students even more delightful.

---

## 🕊️ Community Etiquette & Guidelines / コミュニティの行動指針

1. **Respect Official Rights Holders / 公式への敬意**:
   - This project is an unofficial fan creation. Please respect the official Secondary Creation Guidelines provided by **NEXON Games** and **Yostar**.
   - Do not use this repository for commercial purposes or monetization.
2. **Character Authenticity & In-Character Roleplay / 原作愛とキャラクター性の重視**:
   - When refining student prompts, aim to capture the students' authentic voices, relationships, and mannerisms in Blue Archive.
3. **Be Constructive & Kind / 建設的で温かいコミュニケーション**:
   - Be respectful, constructive, and encouraging to fellow contributors and Sensei worldwide.

---

## 🛠️ How to Contribute / 貢献方法

### 1. Reporting Bugs & Proposing Features / バグ報告・機能提案
- Check [GitHub Issues](https://github.com/hirarara74/momotalk_AI/issues) to see if the issue or idea has already been submitted.
- Open a new Issue detailing:
  - Clear title and description
  - Reproduction steps or expected behavior
  - Browser and device environment (e.g. Chrome / iOS Safari / Desktop)

### 2. Improving Student AI Prompts / 生徒プロンプトの拡充
Prompts are defined in:
- [src/assets/ai/studentPrompts.ts](file:///C:/Users/USER/Documents/GitHub/momotalk-ai/src/assets/ai/studentPrompts.ts)
- [src/assets/ai/sleepSchedule.ts](file:///C:/Users/USER/Documents/GitHub/momotalk-ai/src/assets/ai/sleepSchedule.ts)

When submitting prompt improvements:
- Ensure the prompt maintains the student's first-person pronoun, way of addressing Sensei (e.g. 先生), student relationships, and speech tics.
- Verify that automated tests pass:
  ```bash
  npm test
  ```

### 3. Adding or Updating Translations / 多言語翻訳
Translations are maintained in:
- `src/locales/i18n-jp.ts` (Japanese)
- `src/locales/i18n-en.ts` (English)
- `src/locales/i18n-kr.ts` (Korean)
- `src/locales/i18n-zh.ts` (Simplified Chinese)
- `src/locales/i18n-tw.ts` (Traditional Chinese)

---

## 💻 Local Development Workflow / ローカル開発フロー

```bash
# 1. Clone the repository
git clone https://github.com/hirarara74/momotalk_AI.git
cd momotalk_AI

# 2. Install dependencies
npm install

# 3. (Optional) Configure local environment
cp .env.example .env.local
# Edit .env.local and add your VITE_GROQ_API_KEY if desired

# 4. Start Vite dev server (runs on http://localhost:5174/momotalk/)
npm run dev

# 5. Run test suite
npm test

# 6. Verify production build
npm run build
```

---

## ⚖️ License & Attribution

By contributing to this project, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE) with third-party intellectual property notices.
