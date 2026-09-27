<h1 align="center">MomoTalk AI</h1>

<div align="center">
    <img src="https://img.shields.io/github/last-commit/hirarara74/momotalk_AI/main">
    <img src="https://img.shields.io/github/languages/top/hirarara74/momotalk_AI">
    <img src="https://img.shields.io/badge/AI-Groq%20%7C%20Gemini%20%7C%20OpenAI%20%7C%20Claude-blue">
    <img src="https://img.shields.io/badge/%E7%94%9F%E5%BE%92%E6%95%B0-23%E4%BA%BA-pink">
</div>

<div align="center">
  <strong>ブルーアーカイブの「モモトーク」を再現した対話型AIチャットWebアプリケーション</strong><br>
  <sub>キヴォトスの生徒たちと最新LLMでリアルタイムに会話しよう！</sub>
</div>

<br>

[English](../README.md) | [简体中文](./README-zh_cn.md) | [繁體中文](./README-zh_tw.md) | [日本語](./README-ja.md)

---

## 🌟 主な機能

- 🤖 **23人の生徒との原作再現チャット**: キヴォトスの生徒23名に対応。他生徒との関係性、先生への呼び方・距離感、口癖や台本サンプルに基づく高精度ロールプレイ。
- ⚡ **超高速＆切り替え可能なAIエンジン**: 超高速推論 **Groq** を標準搭載（`openai/gpt-oss-120b`, `qwen/qwen3.8-27b` など）。さらに **Google Gemini**, **OpenAI互換**, **Anthropic Claude** APIへ設定画面から自由に切り替え可能。
- 🌙 **生活リズム＆睡眠シミュレーション**: 生徒個別の就寝・起床リズム（平日・休日で異なる起床時間や、規則正しい生徒・不規則な生徒の違い）を再現。就寝中のメッセージは保留され、起床時に自動で返信されます（設定でオン/オフ可能）。
- 💬 **本格的なMomoTalk体験**: 「...」入力中アニメーション、先生のメッセージへの「既読」表示、送信タイムスタンプ、日付区切り線。
- 📸 **画像認識（マルチモーダル）対応**: 先生から写真や画像を送信すると、生徒が画像の内容を見てコメントを返します。
- 💖 **絆ランク機能**: 会話を重ねることで生徒との絆ランクが上昇。おなじみの絆アップ演出・効果音を搭載。
- 🌐 **5言語対応**: 日本語、英語、韓国語、簡体字中国語、繁体字中国語の完全UI・ヘルプ対応。
- 🖼️ **会話画像のワンクリック保存**: サイドバーのダウンロードボタンから、チャット履歴を高解像度画像として保存可能。
- 📱 **レスポンシブデザイン**: PCの大画面からスマートフォンの縦画面まで快適に操作可能。

---

## 📸 プレビュー

![生徒選択](./assets/演示1.webp)
![チャット画面](./assets/演示2.webp)

---

## 🚀 クイックスタート

### リポジトリ
- GitHub: [hirarara74/momotalk_AI](https://github.com/hirarara74/momotalk_AI)

### ローカルでの起動方法

```bash
# リポジトリのクローン
git clone https://github.com/hirarara74/momotalk_AI.git
cd momotalk_AI

# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev

# ユニットテストの実行
npm test

# プロダクションビルド
npm run build
```

---

## 📖 使い方

詳細な操作方法やショートカットについては、[使い方ガイド](./How-to-use-jp.md) またはアプリヘッダー右上の **`?`**（ヘルプボタン）をご覧ください。

---

## 💖 クレジット

本プロジェクトは、U1805氏が制作したオープンソースプロジェクト [U1805/momotalk](https://github.com/U1805/momotalk) をベースにAI対話機能を追加・発展させたものです。

キャラクターのメタデータとアセット:
- [kivo.wiki](https://kivo.wiki/)
- [ba.gamekee](https://ba.gamekee.com/)
- [bluearchive.fandom](https://bluearchive.fandom.com)

## 🤝 コントリビューション（貢献方法）

バグ報告、生徒プロンプトの拡充、多言語翻訳の提案は大歓迎です！  
ガイドラインや開発手順の詳細は [CONTRIBUTING.md](../CONTRIBUTING.md) をご覧ください。

---

## 📄 ライセンス

本ソフトウェアは [MIT License](../LICENSE) の下で公開されています。  
『ブルーアーカイブ』に関するキャラクター等の権利帰属については [LICENSE 内の免責条項](../LICENSE#third-party-intellectual-property-notice--disclaimer--知的財産権に関する免責事項) をご確認ください。

---

## ⚖️ 著作権と免責事項

本アプリケーションはファンによる非公式のオープンソースプロジェクトであり、**株式会社YostarおよびNEXON Gamesとは一切関係ありません**。

『ブルーアーカイブ』に関するすべてのキャラクター、画像、音声、商標等の知的財産権は、NEXON GamesおよびYostarに帰属します。