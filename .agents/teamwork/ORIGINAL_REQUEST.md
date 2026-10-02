# Original User Request

## Initial Request — 2026-09-29T19:53:58Z

# Teamwork Project Prompt

> Status: Launched — Running via teamwork_preview
> Requested team: Full team (Technical selection, architecture design, and prototype implementation)

Blue Archive MomoTalk Webアプリにおいて、生徒とのチャット中に「今何してるの？」「自撮り送って」といった依頼に応じて、生徒の状況や文脈に合わせたハイクオリティなアニメ調イラスト（自撮り・日常シーン）を、ユーザーの忍耐力を損なわない高速レスポンス（低遅延）で動的に画像生成し、チャットUI上に送信・表示する機能を要件定義・技術選定・設計・実装する。

Working directory: c:/Users/USER/Documents/GitHub/momotalk-ai
Branch: feature/dynamic-student-photos
Integrity mode: development

## Requirements

### R1. 要件定義・技術選定・アーキテクチャ設計（Technical Selection & Design Document）
- **画像生成AIプロバイダー/モデル選定**:
  - デフォルト構成: APIキー登録不要の無料/低コストプロバイダー（例: Pollinations.ai のアニメ特化モデル、HuggingFace等）
  - 高度設定（BYOK）: ユーザーが独自APIキーを設定することで利用可能な高速・高品質プロバイダー（例: Fal.ai, Together AI, Replicate等）
  - クオリティ優先（アニメ・特定キャラクター再現性）と速度（5〜10秒以内）のトレードオフを比較検討した「画像生成AI技術選定・比較レポート」の作成。
- **アーキテクチャ設計**:
  - クライアントサイド完結型通信、localStorageによるAPI設定保持、エラー時の安全なフォールバック設計。

### R2. キャラクター再現度と文脈適応プロンプト設計（Character Fidelity & Scene Adaptability）
- **固有ビジュアル辞書**:
  - 各主要生徒（シロコ、ユウカ、ヒナ、アロナ等）の固有ヘイロー、髪型、髪色、瞳、制服、装飾（けも耳、羽、メガネ等）を正確に描写するためのDanbooru/アニメプロンプト辞書の構築。
- **文脈適応プロンプト自動生成**:
  - 会話の文脈（現在の発言内容、時間帯、場所、生徒の状況）から、LLMが自然な構図・ポーズ・表情・背景プロンプトを抽出・合成するプロンプトエンジニアリングの設計。

### R3. 体感遅延を最小化するUX・非同期インタラクション設計（Perceived Latency UX）
- **即時チャット返信（セリフ先行）**:
  - 画像生成の完了を待たずに、生徒が「自撮り？ちょっと待ってね、今撮るから！」「カフェのケーキ美味しそうでしょ、写真送るね！」などの自然なメッセージを即時（1秒以内）に返信するUX演出。
- **撮影中インジケーター**:
  - メッセージ内に「📷 撮影中...」等のローディングプレースホルダーを表示し、画像読み込み完了後にシームレスに差し替える。
- **UI統合**:
  - MomoTalkチャットUI内での画像メッセージレンダリング（クリック拡大モーダル、画像保存）。

### R4. プロトタイプ実装とテスト検証（Implementation & Automated Testing）
- 設計に基づき、実際にチャット内で「自撮り送って」「今何してるの？」等の発話に対して画像生成がトリガーされ、画像がチャットに届く一連のフローを実装。
- 設定画面（SettingWindow）に画像生成のプロバイダー選択、APIキー入力欄、オン/オフ切り替え等のUIを追加。
- 自動テスト（Vitest）を作成し、プロンプト抽出・キャラ辞書解決・URL/APIリクエスト構築のロジックが検証されていること。

## Verification Resources & Strategy

### Programmatic Verification
- `npm test`: 新設するテストスイート（`src/tests/studentImageGeneration.test.ts`）により以下を自動検証：
  1. 生徒セリフからの画像生成トリガー抽出（タグまたは自然言語判定）
  2. キャラクター外見タグ（ヘイロー、髪型等）とシチュエーションタグの正確な合成
  3. 各プロバイダー向けのAPIリクエスト/URL生成ロジック
  4. 多言語UIテキスト（設定項目等）の存在確認
- `npm run build-only`: 型チェックおよびビルドがエラーなく通ること。

### Agent-as-Judge & Scenario Verification
- 以下のチャットシナリオで実際に画像メッセージが表示されることをシミュレーションまたはコンポーネントテストで検証：
  - シナリオA: 「自撮り送って」→ 生徒の先行セリフ表示 → 撮影プレースホルダー → 画像メッセージ着信
  - シナリオB: 「今何してるの？」→ 日常の場面に合わせた写真メッセージの送信

## Acceptance Criteria

### Technical & Architecture
- [ ] 速度・品質・コスト・キャラ再現性を多角的に比較した「技術選定およびアーキテクチャ設計書」（docs/ARCHITECTURE_IMAGE_GEN.md または docs配下）が作成されていること
- [ ] 主要生徒の外見特徴（ヘイロー・髪・瞳・衣装）を網羅したキャラクタープロンプト辞書が実装されていること
- [ ] APIキー不要の無料デフォルト＋BYOKによる外部API設定のハイブリッド設計が実装されていること

### User Experience
- [ ] 画像生成待機中も、生徒からの即時セリフ返答とローディング演出によってストレスのないUXが担保されていること
- [ ] チャット画面に生徒から送られた画像が自然なメッセージバブルとして表示され、クリック拡大できること

### Code Quality & Testing
- [ ] 新規単体テスト（`studentImageGeneration.test.ts`）を含むすべてのテストスイート（`npm test`）がオールグリーンで通過すること
- [ ] `npm run build-only` によるプロダクションビルドが正常に完了すること
