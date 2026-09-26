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
    sleepRhythm: '生活リズム（就寝・起床時間）',
    sleepRhythmDesc: '深夜などの睡眠中は返信を保留し、朝の起床時間（生徒の個性・平日/休日の時間）に自動返信します',
    sleepingBadge: '就寝中 ({time} 起床予定)',
    sleepingPlaceholder: '{name}は就寝中です（メッセージは起床時に届きます）...',
    readStatus: '既読',
    clearChat: 'リセット',
    resetChatConfirm: '{name}との会話履歴をリセットしますか？',
    sharefile: 'インポート & エクスポート',
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
- **入力中アニメーション**: 生徒が返信を考えている間、ゲーム内でおなじみの「…」アニメーションがリアルタイムに再生されます。
- **日時・季節・誕生日の認識**: 生徒は現実の「現在日時」「曜日」「時間帯」「季節」や「生徒自身の誕生日」を把握しています。夜遅くの対話や特別な日には特別な反応が返ってきます。
- **チャット日時表示**: メッセージの送信時刻と日付の区切り線が表示されます。

## 📸 画像認識（マルチモーダル） · Image Vision

- **画像送信**: 入力バーの画像アイコンから写真やイラストを送信できます（1MB以上の大容量画像も自動最適化して送信可能）。
- **生徒のリアクション**: 生徒が画像の内容（景色、写真、図形など）を実際に見て、感想や反応を返してくれます。

## 💖 絆ランク · Kizuna Rank

- 生徒とメッセージのやり取りを重ねることで、生徒との絆ランクが上昇します。

## 📚 生徒一覧 · Student Roster

- **検索バー**（ショートカットキー \`/\`）：生徒名（漢字・ひらがな・カタカナ・ローマ字）で検索できます。
- **並び順**: デフォルトでは最近やり取りした順に生徒が並びます。
- **差分アイコン**: 「+」印のついた生徒アイコンをクリックして服装や表情の差分を切り替えられます。

## ⚙️ 設定 · Settings

- 画面右上の歯車アイコン（⚙️）から、以下の設定を行えます：
  - **AI プロバイダー**: Google Gemini / OpenAI 互換 / Anthropic Claude
  - **モデルとAPIキー**: 使用するモデル名や独自のAPIキーの設定
  - **テーマ切り替え**: MomoTalkテーマ / YuzuTalkテーマ
  - **サウンド効果**: 通知音・ランクアップ音のON/OFFおよび音量調整

## ⌨️ ショートカットキー · Shortcuts

- \`/\` : 検索ボックスにフォーカス
- \`Enter\` : メッセージを送信
- \`Shift + Enter\` : 改行
- \`Ctrl + Z\` : 直前の操作を取り消し（Undo）
- \`Ctrl + Shift + Z\` : やり直し（Redo）
`
}
