# 生徒の追加とメッセージ操作（2026-10-09）

専用プロンプトを持つ別人の生徒を23人から31人へ拡大した。衣装違いを新たな人数には数えない。

| 生徒 | 基本ID | 所属 | 追加内容 |
| --- | --- | --- | --- |
| 鬼方カヨコ | 13005 | ゲヘナ・便利屋68 | 専用口調、関係性、5言語の挨拶、写真の特徴 |
| 竜華キサキ | 20039 | 山海経・玄龍門 | 同上 |
| 調月リオ | 20041 | ミレニアム・セミナー | 同上 |
| 天童アリス | 10015 | ミレニアム・ゲーム開発部 | 同上 |
| 狐坂ワカモ | 10033 | 百鬼夜行 | 同上 |
| 明星ヒマリ | 20020 | ミレニアム・特異現象捜査部 | 同上 |
| 黒見セリカ | 13008 | アビドス・対策委員会 | 同上 |
| 十六夜ノノミ | 13004 | アビドス・対策委員会 | 同上 |

## 選定と調査

[電撃オンラインの2026年人気投票](https://dengekionline.com/article/202607/80633)で上位に入った未対応のカヨコ、キサキ、リオを優先した。残る5人は学園・部活や会話の個性を増やすため選んだ。全員がアプリの[既存生徒データ](https://BlueArcbox.github.io/resources/Momotalk/students.json)にあり、ID・5言語の表示名・誕生日・アバターを照合した。リポジトリに独立した未実装リストはなく、専用プロンプトの登録有無とこのデータで差分を確認した。

設定の確認に使った資料:

- [カヨコの公式プロフィール](https://sh-anime.shochiku.co.jp/bluearchive-anime/character/onikata-kayoko/)
- [セリカの公式プロフィール](https://sh-anime.shochiku.co.jp/bluearchive-anime/character/kuromi-serika/)
- [ノノミの公式プロフィール](https://sh-anime.shochiku.co.jp/bluearchive-anime/character/izayoi-nonomi/)
- [キサキの公式生徒紹介を掲載した記事](https://blue-archive.doorblog.jp/archives/26817756.html)と[口調・プロフィール](https://w.atwiki.jp/aniwotawiki/pages/57246.html)
- [リオの公式生徒紹介を掲載した記事](https://rojiuragame.com/2025/01/29/%E3%80%90%E3%83%96%E3%83%AB%E3%83%BC%E3%82%A2%E3%83%BC%E3%82%AB%E3%82%A4%E3%83%96%E3%80%91%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BC%E7%B4%B9%E4%BB%8B%E3%80%9C%E3%80%8C%E8%AA%BF%E6%9C%88/)
- [アリスのプロフィール](https://zukan-zukan.com/characters/items/aris-blue-archive)
- [ヒマリの公式生徒紹介を掲載した記事](https://blue-archive-matometopic.blog.jp/archives/16548914.html)
- [ワカモの設定解説](https://pomzero.hatenablog.com/entry/2024/07/25/191933)

挨拶と会話例は設定に合わせた創作で、公式台詞の引用ではない。外部Wiki本文の取得には403/402で失敗した経路もあるため、取得できた公式プロフィール、検索結果、公式紹介を掲載した記事を使用した。画像生成タグは特徴の指定であり、実際に生成される画像の再現性を保証するものではない。

## 操作と返信形式

- PCはメッセージを右クリック、タッチ操作は550ms長押しで編集・送信取り消し（削除）を選べる。先生・生徒両方が対象。操作ボタンからも開ける。
- 移動・スクロール・指を離す操作で長押し待機を取り消す。会話切り替えで開いたメニューを閉じる。
- 編集・削除時は生成中の返信を中断し、生徒別の履歴にも保存する。変更したメッセージを参照していた生成結果の継続は行わない。
- 編集内容のHTMLタグは文字として保存する。既存のMarkdown書式は変換して保持する。
- 全員共通の出力ルールを5言語すべてに適用。会話例の外側の括弧を除去し、返信全体を括弧で囲まないよう指示する。生成結果には補助処理も適用し、文中の引用は残す。
- 部分一致で別の生徒を判定しない。衣装の接尾辞は引き続き基本キャラクターの設定を利用する。

## 検証

`messageActions.test.ts`で両者の編集・削除と保存、単独の生徒挨拶を再読込しても編集が保持されること、長押し、スクロール取消、会話切替、存在しないIDの削除を検証する。

`studentExpansionAndReplyFormat.test.ts`で31人の一意性、新8人の5言語・挨拶・専用設定・画像辞書、名前の誤判定防止、全プロンプトの共通出力ルール、引用を保つ括弧除去を検証する。

実行結果: テスト17ファイル・328件成功、型チェック成功、本番ビルド成功。ブラウザでは右クリックメニュー、編集・保存、再読み込み後の保持を確認し、検証用の編集は元に戻した。スマートフォン実機と外部AIへの実際のリクエストは未検証。

## 衣装違いのアイコン統合（2026-10-10）

- 衣装違い（`Related` を持つエントリ）は別の生徒として一覧に出さず、基本生徒の `Avatars` に統合する。一覧のプラスボタンから衣装のアイコンを選べる。
- 以前の衣装違いIDのチャット履歴・未読・親密度・選択履歴は、起動時に基本生徒へ移す（`migrateOutfitStorage`）。
- `feature/outfit-icons-prompt` ブランチでは、選択中のアイコンが衣装違いなら、システムプロンプトに「現在の衣装設定」を足す。基本のアイコンでは変化しない。性格・口調・一人称は衣装によらず固定。

## 人気上位の12人を追加（2026-10-10）

専用プロンプトを持つ生徒を31人から43人へ拡大した。実装は `src/assets/ai/rosterStudents.ts`（`prompts.ts` が既存の登録先へ組み込む）。

追加: ケイ、セイア、ナギサ、カンナ、スズミ、レイサ、ニコ、ミヨ、モモイ、イロハ、フウカ、ハナコ。

選定: [電撃オンラインの2026年人気投票](https://dengekionline.com/article/202607/80633)の上位10位と[中間結果の25人](https://dengekionline.com/article/202605/76017)、[ranking.net](https://ranking.net/rankings/best-bluearchive-characters)の上位から、未対応だった生徒を選んだ。

設定の出典（公式プロフィールの要約を掲載したページ）: [game8のケイ](https://game8.jp/blue-archive/699441)、[セイア](https://game8.jp/blue-archive/664363)、[ナギサ](https://game8.jp/blue-archive/643625)、[カンナ](https://game8.jp/blue-archive/655207)、[スズミ・レイサ](https://game8.jp/blue-archive/655220)、[ミヨ](https://game8.jp/blue-archive/722292)、[モモイ](https://game8.jp/blue-archive/643734)、[フウカ](https://game8.jp/blue-archive/643661)、[ハナコ](https://game8.jp/blue-archive/643639)、[レイサ](https://gameranbu.jp/bluearchive/f25960ae7f6376d78d33)、[イロハ](https://gameranbu.jp/bluearchive/e9ba47ef574d366566db)、[ニコ](https://zh.moegirl.org.cn/ja/%E5%90%89%E9%87%8E%E5%A6%AE%E5%8F%AF)（検索結果の要約）。

注意: 取得できたのは性格・所属・趣味・関係性の公式プロフィールまで。一人称・語尾・会話例は、プロフィールに合わせた創作で未確認。残りの未対応生徒は GitHub Issue で管理する。
