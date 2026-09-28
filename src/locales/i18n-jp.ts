export default {
    selectInfo: '生徒を選択してください',
    relatedStudentTitle: '関連する生徒',
    noRelatedStudent: '関連する生徒なし',
    default: 'なし',
    name: '名前',
    school: '学校',
    club: 'クラブ',
    birthday: '誕生日',
    rare: 'レア度',
    released: '実装済み',
    unreleased: '未実装',
    sort: '並び替え',
    filter: 'フィルター',
    imageUploadAlert: '25MB以下の画像をアップロードしてください',
    customRoleInfo: 'カスタムキャラクター名を入力してください',
    storyEvent: '絆イベント',
    reply: '返信する',
    playerTitle: 'MomoTalk ストーリー',
    helpTitle: 'MomoTalk AI 利用ガイド',
    playerContent:
        '確認ボタンを押して\n生徒の MomoTalk イベントを再生します\n💥注意：会話履歴が削除されます',
    confirm: '確認',
    cancel: 'キャンセル',
    selectStory: 'イベントを選択',
    selectLanguage: '言語を選択',
    setting: '設定',
    basicSetting: '基本設定',
    soundEffects: '効果音 (SE)',
    soundVolume: 'SE音量',
    aiSetting: 'AI設定',
    aiEnabled: 'AI自動返信',
    aiProvider: 'AIモデル',
    keySecurityReassurance: 'APIキーはお使いのブラウザ内（localStorage）にのみ安全に保存され、外部サーバーへ送信・収集されることはありません。',
    sleepRhythm: '生活リズム（就寝・起床時間）',
    sleepRhythmDesc: '深夜などの睡眠中は返信を保留し、朝の起床時間（生徒の個性・平日/休日の時間）に自動返信します',
    sleepingBadge: '就寝中 ({time} 起床予定)',
    sleepingPlaceholder: '{name}は就寝中です（メッセージは起床時に届きます）...',
    readStatus: '既読',
    clearChat: 'リセット',
    resetChatConfirm: '{name}との会話履歴をリセットしますか？',
    talkWith: '{name} とトークする',
    chatInputPlaceholder: '{name}にメッセージを送信...',
    apiKeyNotConfiguredNotice: '（APIキーが未設定です。画面右上の設定 ⚙️ からAPIキーを入力してください。※Groq API Key は https://console.groq.com/keys から無料で取得できます）',
    imageMessagePlaceholder: '画像についてのメッセージを入力（省略可）...',
    apiKeyPlaceholderGroq: 'gsk_... を入力',
    apiKeyPlaceholder: 'API Key を入力',
    groqKeyNoticePrefix: '※ Groq API Key は ',
    groqKeyNoticeSuffix: ' で無料取得できます。',
    geminiKeyNoticePrefix: '※ Gemini API Key は ',
    geminiKeyNoticeSuffix: ' で取得できます。',
    modelLabel: 'Model (空欄で推奨デフォルト)',
    modelPlaceholderGroq: '推奨: qwen/qwen3.8-27b または openai/gpt-oss-120b',
    modelPlaceholderGemini: '例: gemini-3.5-flash-lite',
    modelPlaceholderOpenai: '例: gpt-4o-mini',
    modelChipTop120b: '★ 最上位モデル (120B)',
    modelChipTop120bTitle: '超大型120B思考型モデル（CoT推論・じっくり高精度）',
    modelChipStd27b: '標準・画像対応 (27B)',
    modelChipStd27bTitle: '標準モデル（画像認識対応・軽快）',
    modelChipGeminiPro: '上位 (3.5-flash)',
    modelChipGeminiLite: '標準 (3.5-flash-lite)',
    customBaseUrlLabel: 'Custom Base URL (任意)',
    filterPromptSupportedOnly: '🤖 プロンプト対応のみ',
    filterAllStudents: '👥 全生徒表示',
    back: '戻る',
    kizunaRankTitle: '絆ランク',
    removeImage: '添付画像を削除',
    sendSticker: 'スタンプを送信',
    sendImage: '画像を添付・送信',
    sharefile: 'データ管理',
    renderStyle: 'テーマ',
    fullScreen: '全画面',
    zoom: 'ズーム',
    draggable: '会話ドラッグ',
    enableDrag: 'ドラッグ',
    importAndExport: '会話内容ファイル',
    importButton: 'ファイルを選択',
    exportButton: 'ダウンロード',
    sharedFile: '共有ファイル（再生可能な会話）',
    warnZoom: 
        "⚠️ お使いのブラウザは現在ズームされています(%ratio%)。画像のダウンロードを続行すると、レイアウトが崩れる可能性があります。\n• ズームが必要な場合は、右上隅の設定 ⚙️ からズーム機能をご利用ください。\n• ダウンロードを続行しますか？",
    help: `
# MomoTalk AI 利用ガイド · How to use

Blue Archiveの生徒たちとリアルタイムに対話できるインタラクティブAIチャットアプリです。

## 💬 チャット機能 · Chat Features

- **生徒との対話**: 生徒を選択して下部の入力バーからメッセージを送信すると、キヴォトスの生徒が性格・口調に忠実に返信してくれます。
- **入力中アニメーション & 既読**: 先生の送信メッセージには「既読」が付き、生徒が返信を考えている間、ゲーム内でおなじみの「…」アニメーションがリアルタイムに再生されます。
- **生活リズム（就寝・起床）**: 生徒一人ひとりの個性や平日/休日に応じた就寝・起床スケジュールが設定されています。深夜の就寝中は返信が保留され、朝の起床時刻になると自動的に返信が届きます（設定でON/OFF可能）。
- **日時・季節・誕生日の認識**: 生徒は現実の「現在日時」「曜日」「時間帯」「季節」や「生徒自身の誕生日」を把握しています。夜遅くの対話や特別な日には特別な反応が返ってきます。
- **チャット日時表示**: メッセージの送信時刻と日付の区切り線が表示されます。

## 📸 画像認識（マルチモーダル） · Image Vision

- **画像送信**: 入力バーの画像アイコンから写真やイラストを送信できます（大容量画像も自動最適化して送信可能）。
- **生徒のリアクション**: 生徒が画像の内容（景色、写真、図形など）を実際に見て、感想や反応を返してくれます。

## 💖 絆ランク · Kizuna Rank

- 生徒とメッセージのやり取りを重ねることで、生徒との絆ランク（Lv.1〜）が上昇します。

## 📚 生徒一覧（23名対応） · Student Roster

- **検索バー**（ショートカットキー \`/\`）：生徒名（漢字・ひらがな・カタカナ・ローマ字）で検索できます。
- **フィルター**: 学校・レア度・実装状況のほか、「🤖 プロンプト対応生徒（23名）」の絞り込み表示が可能です。
- **並び順**: チャット画面では最近やり取りした順に生徒が並びます。
- **差分アイコン**: 「+」印のついた生徒アイコンをクリックして服装や表情の差分を切り替えられます。

## ⚙️ 設定 · Settings

- 画面右上の歯車アイコン（⚙️）から、以下の設定を行えます：
  - **AI プロバイダー**: Groq（デフォルト高速・推奨）/ Google Gemini / OpenAI 互換 / Anthropic Claude
  - **モデルとAPIキー**: 最上位120Bモデル（openai/gpt-oss-120b）や標準画像対応27Bモデル（qwen/qwen3.8-27b）等のワンタップ切り替え
  - **生活リズム**: 生徒の就寝・起床スケジュールのON/OFF
  - **テーマ切り替え**: MomoTalkテーマ / YuzuTalkテーマ
  - **サウンド効果**: 通知音・ランクアップ音のON/OFFおよび音量調整

## ⌨️ ショートカットキー · Shortcuts

- \`/\` : 検索ボックスにフォーカス
- \`Enter\` : メッセージを送信
- \`Shift + Enter\` : 改行

## 📜 クレジット & ガイドライン · Credits & Disclaimer

### 1. 原作著作権・知的財産権の帰属
- 本Webアプリケーションに登場する『ブルーアーカイブ -Blue Archive-』のキャラクター、画像、世界観、商標等のすべての著作権および知的財産権は、**株式会社NEXON Games** および **株式会社Yostar**（ならびに各地域のパブリッシャー・権利者）に帰属します。
- 本アプリは公式の二次創作ガイドラインを最大限尊重し、ファンが個人の趣味として制作した**非公式・非営利の二次創作ファンメイド作品**です。
- 公式運営会社様および関係各社様とは一切の関係がございません。

### 2. ベースリポジトリへの謝辞
- 本アプリのUIおよび基本フレームワークは、オープンソースプロジェクト **[U1805/momotalk](https://github.com/U1805/momotalk)**（MIT License / 作者: U1805 氏）をフォーク・改変し、AI対話エンジンおよびマルチモーダル機能を組み込んで制作されています。素晴らしいMomoTalk再現UIとオープンソースコミュニティへの貢献に心より感謝申し上げます。
- 生徒データおよびアセットの一部は、ファンコミュニティプロジェクト **[SchaleDB](https://schaledb.com/)**（[lonqix/SchaleDB](https://github.com/lonqix/SchaleDB)）のデータを活用・参照させていただいております。

### 3. バイブコーディング（Vibe Coding）による開発
- 本プロジェクトは、Google DeepMind の自律型エージェントAI **Antigravity** をパートナーとし、対話型ペアプログラミング（**バイブコーディング / Vibe Coding**）によって要件定義・プロンプト設計・TDD（テスト駆動開発）・コード実装・最適化を行っています。
- 人間の構想とAIエージェントの自律修正ループ（\`//loop\`）が融合した、新しいAIネイティブなソフトウェア開発の実験的ショーケースでもあります。

### 4. プライバシー & 免責事項
- **APIキーの安全性**: ユーザーが設定したAPIキーは、お使いの端末（ブラウザの \`localStorage\`）にのみ安全に保存され、開発者や第三者のサーバーへ収集・送信されることは一切ありません。通信は各公式AIプロバイダー（Groq, Google等）へ直接暗号化送信されます。
- **免責事項**: 本アプリケーションの利用によって生じたいかなる損害・トラブルについても、制作者および関係者は責任を負いかねます。権利者様からの要請・ガイドラインの更新等があった場合は、速やかに公開停止・修正等の対応を実施いたします。
`
}
