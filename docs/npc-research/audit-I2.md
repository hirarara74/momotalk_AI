# 監査 I2（rosterExtra.ts 前半 52 人: エイミ 10001 〜 ミチル 16009）

## 照合に使った出典
- ブルアカ攻略Wiki wikiru キャラ呼称表 https://bluearchive.wikiru.jp/?%E3%82%AD%E3%83%A3%E3%83%A9%E5%91%BC%E7%A7%B0%E8%A1%A8 : 52 人全員の自称を確認。すべて現状の一人称と一致（変更なし）。
- Fandom（API の wikitext）: 52 人全員のページ（学園・部活・学年・趣味・Introduction/Personality）を確認。例 https://bluearchive.fandom.com/wiki/Otose_Kotama
- Fandom の Audio ページ: セナ（https://bluearchive.fandom.com/wiki/Himuro_Sena/Audio）で口調を確認。他の人は日本語欄が取れず口調は未確認。
- names の各言語の先頭要素は students.json の `Name` と全 52 人一致（スクリプトで確認、差異 0）。
- ピクシブ百科事典: 組み込みブラウザで取得を試みたが、一括取得で Cloudflare に 429 を返され、その後ボット確認画面（"しばらくお待ちください..."）で止まった。確認できた人数は 0 人（最初の一括取得は「(ブルーアーカイブ)」付き URL が曖昧さ回避ページ等に当たり、内容が別物だった）。ボット確認は回避していない。そのため口調・語尾の変更は一切していない。ニコニコ大百科は時間切れで未使用。

## 直した箇所
| 生徒 | 変更前 → 変更後 | 根拠 |
| --- | --- | --- |
| スミレ | 「トレーニング部」→「トレーニング部の部長」 | Fandom Otohana Sumire（Leader of the Gym Training Department）、wikiru「スミレ部長」 |
| スミレ | relations「レイとは同じ部で励まし合う」→「仮入部（兼部）のレイを容赦なく鍛えている」 | Fandom Nomasa Rei / Sumire（厳しく容赦ないトレーニング） |
| チヒロ | 「副部長格」→「副部長」、relations「ヴェリタスの後輩（ハレ、コタマ、マキ）」→「仲間（同学年のコタマ、後輩のハレとマキ）」 | Fandom Kagami Chihiro（deputy director）、Otose Kotama（3年）。コタマは同学年で後輩ではない |
| コタマ | 「ヴェリタス」→「ヴェリタスの通信担当」 | Fandom Otose Kotama（Comm. leader） |
| チナツ | 「風紀委員会」→「風紀委員会の救護担当」、「規律を重んじる」→「規律と手順を重んじる」 | Fandom Hinomiya Chinatsu（in charge of medical aid for the Prefect Team） |
| セナ | voice「無愛想で簡潔な常体。〜です、〜ください」→「無愛想で簡潔な丁寧語。〜です、〜ください、〜ですので」（常体と〜ですの矛盾を解消） | Fandom Himuro Sena/Audio（ですます調） |
| セナ | 「救急医学部」→「救急医学部の部長」、負傷者を「遺体」と呼んでしまう癖を追記 | Fandom Himuro Sena Introduction、wikiru「セナ部長」 |
| メグ | 「温泉開発部」→「温泉開発部の副部長（現場班長）」 | Fandom Shimokura Megu（leader of the onsite team）、wikiru「温泉開発部の副部長」「メグ班長」 |
| カスミ | 「温泉開発部」→「温泉開発部の部長」 | Fandom Kinugawa Kasumi（president）、wikiru「温泉開発部の部長」 |
| ハスミ | 「正義実現委員会」→「正義実現委員会の副委員長」 | Fandom Hanekawa Hasumi（vice-chairman）、wikiru「副委員長」 |
| サツキ | 「万魔殿」→「万魔殿の情報部長」 | Fandom Kyougoku Satsuki（head of the Information Department）、wikiru「サツキ情報部長」 |
| ウイ | 「図書委員会」→「図書委員会の委員長」 | Fandom Kozeki Ui、wikiru「ウイ委員長」「図書委員長」 |
| サクラコ | 「シスターフッド」→「シスターフッドの代表」 | Fandom Utazumi Sakurako（leader of the Sisterhood） |
| シズコ | 「お祭り運営委員会」→「お祭り運営委員会の委員長」、en 挨拶の「Hyakuyadou」→「Momoyo Hall」 | Fandom Kawawa Shizuko（President of the Festival Management Committee、Momoyo Hall）、wikiru「お祭り運営委員長」 |
| フィーナ | zh 挨拶の「皮娜」→「菲娜」（names.zh の公式表記と不一致だった） | students.json の Name.zh |

## 直さなかった疑問
- 語尾（カスミ「〜だぜ」、アカリ「〜ですわ」、サツキ・ナツ「〜ですわ」、イズミ「〜だぁ」、ヨシミ「〜だもん」、ラブ「〜わよ」など）は出典で確認できず（Fandom の Audio は日本語欄が空のページが多く、ピクシブ百科は取得不可）。創作のまま。特にアカリとカスミは実際の口調と違う可能性あり。要再確認。
- イズナの kr「주인님」・挨拶の kr「참상이옵니다」は公式ローカライズと一致するか未確認（「주군」の可能性）。
- シズコの店名の kr「햐쿠야도」・zh「百夜堂」、ラブの団名 zh「哗啦哗啦头盔团」の公式表記は未確認。「祭祀局」（シズコ relations）も未確認。
- ミチルの zh 挨拶《少女忍法帖满满》は創作的な訳。
- ネタバレ: 該当する箇所は見つからなかった。ラブの「シャーレに所属する唯一のヘルメット団員」は後半の設定に近い。必要なら外すこと。
- ヒカリ・ノゾミ（担当 H）には触れていない。

## 共通パイプライン（prompts.ts）
問題は見つからなかった（読んでいない部分を除く）。
