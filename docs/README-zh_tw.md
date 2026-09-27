<h1 align="center">MomoTalk AI</h1>

<div align="center">
    <img src="https://img.shields.io/github/last-commit/hirarara74/momotalk_AI/main">
    <img src="https://img.shields.io/github/languages/top/hirarara74/momotalk_AI">
    <img src="https://img.shields.io/badge/AI-Groq%20%7C%20Gemini%20%7C%20OpenAI%20%7C%20Claude-blue">
    <img src="https://img.shields.io/badge/%E5%AD%B8%E7%94%9F%E6%95%B8-23%E4%BD%8D-pink">
</div>

<div align="center">
  <strong>基於《蔚藍檔案》MomoTalk 界面的沉浸式 AI 對話 Web 應用程式</strong><br>
  <sub>與奇普托斯的 23 位學生在最新大語言模型驅動下展開即時互動！</sub>
</div>

<br>

[English](../README.md) | [简体中文](./README-zh_cn.md) | [繁體中文](./README-zh_tw.md) | [日本語](./README-ja.md)

---

## 🌟 主要特色

- 🤖 **23 位學生深度角色扮演**: 支援 23 位《蔚藍檔案》學生，深度還原第一人稱口吻、對老師的稱呼與距離感、學生人際關係網絡與口癖。
- ⚡ **超高速可插拔 AI 引擎**: 預設搭載超快速推論 **Groq**（支援 `openai/gpt-oss-120b`、`qwen/qwen3.8-27b` 等），並可在設定中一鍵切換至 **Google Gemini**、**OpenAI 相容介面** 或 **Anthropic Claude**。
- 🌙 **真實作息與睡眠節律模擬**: 模擬學生獨特的作息時間（區分工作日/例假日起床時間，以及規律/作息不規律習慣）。學生入睡後訊息自動排隊，醒來時主動回覆（可在設定中自由開關）。
- 💬 **還原原版 MomoTalk 體驗**: 逼真的「...」正在輸入動效、自然打字節奏、老師訊息的「已讀」狀態標記、時間戳記與日期分割線。
- 📸 **多模態圖像辨識**: 支援向學生發送圖片或截圖，學生能辨識圖像內容並做出貼合人設的個人化反應。
- 💖 **羈絆等級系統**: 與學生日常對話累積親密度提升羈絆等級，伴有專屬羈絆升級音效。
- 🌐 **五國語言國際化**: 完整支援繁體中文、簡體中文、日語、英語、韓語的介面與說明。
- 🖼️ **長截圖一鍵匯出**: 側邊欄專屬保存按鈕，一鍵將聊天記錄匯出為高畫質 PNG 圖片。
- 📱 **響應式適配**: 完美自適應桌面寬螢幕與行動裝置直螢幕操作。

---

## 📸 預覽

![學生選擇](./assets/演示1.webp)
![聊天介面](./assets/演示2.webp)

---

## 🚀 快速開始

### 原始碼倉庫
- GitHub: [hirarara74/momotalk_AI](https://github.com/hirarara74/momotalk_AI)

### 本地部署與執行

```bash
# 複製倉庫
git clone https://github.com/hirarara74/momotalk_AI.git
cd momotalk_AI

# 安裝依賴套件
npm install

# 啟動本地開發服務
npm run dev

# 執行單元測試
npm test

# 生產環境打包
npm run build
```

---

## 📖 使用說明

詳細操作與鍵盤快速鍵請查閱 [使用說明](./How-to-use-zh_tw.md) 或點擊網頁右上角的 **`?`** 說明按鈕。

---

## 💖 鳴謝

本專案基於 U1805 創作的開源對話生成器 [U1805/momotalk](https://github.com/U1805/momotalk) 架構發展並擴充了 AI 即時互動功能。

學生資料與素材來源:
- [kivo.wiki](https://kivo.wiki/)
- [ba.gamekee](https://ba.gamekee.com/)
- [bluearchive.fandom](https://bluearchive.fandom.com)

## 🤝 參與貢獻

歡迎提交 Issue 反饋缺陷、擴充學生 AI 提示詞與潤色多語言翻譯！  
詳細貢獻指南與本地開發流程請參閱 [CONTRIBUTING.md](../CONTRIBUTING.md)。

---

## 📄 開源許可證

本專案基於 [MIT License](../LICENSE) 開源。  
關於《蔚藍檔案》相關角色的智慧財產權歸屬，請參閱 [LICENSE 中的第三方免責聲明](../LICENSE#third-party-intellectual-property-notice--disclaimer--知的財産権に関する免責事項)。

---

## ⚖️ 版權與免責聲明

本專案為粉絲自製的非官方開源專案，**與 Yostar 及 NEXON Games 無任何官方關聯**。

《蔚藍檔案》的所有角色、圖像、音訊、商標等智慧財產權均歸屬 NEXON Games 及 Yostar 所有。