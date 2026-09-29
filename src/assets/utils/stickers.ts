export const stickers = [
    '/api/Stickers/01.webp',
    '/api/Stickers/02.webp',
    '/api/Stickers/03.webp',
    '/api/Stickers/04.webp',
    '/api/Stickers/05.webp',
    '/api/Stickers/06.webp',
    '/api/Stickers/07.webp',
    '/api/Stickers/08.webp',
    '/api/Stickers/09.webp',
    '/api/Stickers/10.webp',
    '/api/Stickers/11.webp',
    '/api/Stickers/12.webp',
    '/api/Stickers/13.webp',
    '/api/Stickers/14.webp',
    '/api/Stickers/15.webp',
    '/api/Stickers/16.webp',
    '/api/Stickers/17.webp',
    '/api/Stickers/18.webp',
    '/api/Stickers/19.webp',
    '/api/Stickers/20.webp',
    '/api/Stickers/21.webp',
    '/api/Stickers/22.webp',
    '/api/Stickers/23.webp',
    '/api/Stickers/24.webp',
    '/api/Stickers/25.webp',
    '/api/Stickers/26.webp',
    '/api/Stickers/27.webp',
    '/api/Stickers/28.webp',
    '/api/Stickers/29.webp',
    '/api/Stickers/30.webp',
    '/api/Stickers/31.webp',
    '/api/Stickers/32.webp',
    '/api/Stickers/33.webp',
    '/api/Stickers/34.webp',
    '/api/Stickers/35.webp',
    '/api/Stickers/36.webp',
    '/api/Stickers/37.webp',
    '/api/Stickers/38.webp',
    '/api/Stickers/39.webp',
    '/api/Stickers/40.webp'
]

const BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL)
    ? import.meta.env.BASE_URL
    : '/'
const basePrefix = BASE.endsWith('/') ? BASE : `${BASE}/`

export const stickers2 = [
    `${basePrefix}stickers2/ClanChat_Emoji_53_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_83_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_84_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_85_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_86_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_87_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_88_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_89_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_90_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_91_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_92_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_93_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_94_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_95_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_96_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_100_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_103_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_104_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_105_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_106_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_107_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_109_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_110_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_111_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_112_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_141_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_142_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_143_Jp.png`,
    `${basePrefix}stickers2/ClanChat_Emoji_144_Jp.png`
]

export const stickers3 = [
    `${basePrefix}stickers2/ClanChat_Emoji_83_Jp.png`
]

// スタンプが何を伝えているかをAIに言語化して渡すための説明マップ
// (UI側はこれまで通り画像を表示し、AIに渡すテキストだけをこの説明に差し替える)
export const stickerDescriptions: Record<string, string> = {
    '/api/Stickers/01.webp': 'うれしそうに微笑んでいる（ご機嫌なリアクション）',
    '/api/Stickers/02.webp': '頬を赤らめてハートを飛ばしている（好き・照れ）',
    '/api/Stickers/03.webp': '感激して涙ぐんでいる（ありがとう）',
    '/api/Stickers/04.webp': '涙目で謝っている（ごめんなさい）',
    '/api/Stickers/05.webp': '怒って抗議している（不満・イライラ）',
    '/api/Stickers/06.webp': '看護師姿で「大丈夫です」と安心させている',
    '/api/Stickers/07.webp': '警戒・緊張している様子',
    '/api/Stickers/08.webp': 'そっけなく「ふーん」と言っている（興味なさげ）',
    '/api/Stickers/09.webp': '「？」と疑問・困惑を示している',
    '/api/Stickers/10.webp': 'やる気満々にはりきっている',
    '/api/Stickers/11.webp': '驚いてショックを受けている（えっ！）',
    '/api/Stickers/12.webp': 'はしゃいで喜んでいる',
    '/api/Stickers/13.webp': '恥ずかしがって照れている（やめてー）',
    '/api/Stickers/14.webp': '意味深な決め台詞を言っている',
    '/api/Stickers/15.webp': 'ガタガタと震えている（緊張・怖がっている）',
    '/api/Stickers/16.webp': '「いい子いい子」となでて褒めている（励まし）',
    '/api/Stickers/17.webp': 'びっくりして戸惑っている（？が飛んでいる）',
    '/api/Stickers/18.webp': '「OK」と了承・賛成している',
    '/api/Stickers/19.webp': 'スヤスヤと眠っている（おやすみ）',
    '/api/Stickers/20.webp': '湯気の上がる飲み物を持って一息ついている',
    '/api/Stickers/21.webp': '「おめでとう」とお祝いしている',
    '/api/Stickers/22.webp': '楽しそうな様子でリアクションしている',
    '/api/Stickers/23.webp': '満足げに微笑んでいる',
    '/api/Stickers/24.webp': '満足そうに鼻歌をこぼしている',
    '/api/Stickers/25.webp': '静かに目を閉じている（不思議な雰囲気）',
    '/api/Stickers/26.webp': '無言で何か言いたげにしている（間・沈黙）',
    '/api/Stickers/27.webp': '「いただきまーす」と飲み物を楽しんでいる',
    '/api/Stickers/28.webp': '双眼鏡で観察している（警戒中）',
    '/api/Stickers/29.webp': 'ため息をついている（はぁ…）',
    '/api/Stickers/30.webp': '冷めた目でそっけない態度をしている',
    '/api/Stickers/31.webp': '照れて頬を赤らめている',
    '/api/Stickers/32.webp': '歯を食いしばって気合を入れている',
    '/api/Stickers/33.webp': '考え込んでいる様子',
    '/api/Stickers/34.webp': '驚いて赤面している（うわぁ…）',
    '/api/Stickers/35.webp': 'うふふと余裕の笑みを浮かべている',
    '/api/Stickers/36.webp': '落ち着いた様子で微笑んでいる',
    '/api/Stickers/37.webp': '驚いてびっくりしている（!?）',
    '/api/Stickers/38.webp': '驚いて悲鳴を上げている（ひゃっ！）',
    '/api/Stickers/39.webp': '不安そうに焦っている',
    '/api/Stickers/40.webp': 'ニヤリと企んでいる表情',
    // 2ページ目：ブルアカ公式クラチャスタンプ（高精度キャラクター＆テキスト説明）
    'ClanChat_Emoji_53_Jp.png': 'ペロロと星マークの「complete!」達成スタンプを押している（任務完了・達成・よくできました）',
    'ClanChat_Emoji_83_Jp.png': 'ペロロが目を白黒させて舌を出し「…!?」と呆然・ショックを受けている（衝撃・驚愕）',
    'ClanChat_Emoji_84_Jp.png': 'ヒフミが人差し指をピシッと立てて熱心に提案・力説している（提案・ひらめき・熱弁）',
    'ClanChat_Emoji_85_Jp.png': 'アリスが携帯ゲーム機の画面の中から「仲間になってください！」と呼びかけている（勧誘・仲間入りのお願い）',
    'ClanChat_Emoji_86_Jp.png': 'ネルがメイド服でニッコリ笑いながら「ありがとな！」と気さくにお礼を言っている（感謝・お礼）',
    'ClanChat_Emoji_87_Jp.png': 'ユウカが机上の書類の山に突っ伏して「はぁ…」と深いため息をついている（疲労・激務・ため息）',
    'ClanChat_Emoji_88_Jp.png': 'アコが首輪の鈴をつけて微笑み、ハートを浮かべて「えらいです」と褒めている（賞賛・ご褒美・肯定）',
    'ClanChat_Emoji_89_Jp.png': 'マリーが両手を胸の前で合わせ、目を閉じて静かに祈り・感謝を捧げている（お祈り・感謝・敬虔）',
    'ClanChat_Emoji_90_Jp.png': 'ワカモが狐の面をつけて「あ・な・た・さ・ま❤️」と熱烈な好意を向けている（情熱的な愛・アピール）',
    'ClanChat_Emoji_91_Jp.png': 'フブキがドーナツを片手にサムズアップ（親指を立てて）「いいね〜」と満足そうにしている（いいね・賛成・肯定）',
    'ClanChat_Emoji_92_Jp.png': 'コハル（水着）がエビフライを差し出しながら「はい、どうぞ」とおすそ分けしている（どうぞ・おすそ分け・親愛）',
    'ClanChat_Emoji_93_Jp.png': 'イズナが忍者の印を結びながら「サササッ！」と素早く駆け抜けている（素早い行動・駆けつける・参上）',
    'ClanChat_Emoji_94_Jp.png': 'ウイが丸眼鏡をかけてスマホをじっと見つめ、「むむ」と不信・不満そうに唸っている（疑念・不審・凝視）',
    'ClanChat_Emoji_95_Jp.png': 'ミヤコが敬礼気味に微笑みながら「お疲れ様でした」と丁寧に労っている（労い・挨拶・お疲れ様）',
    'ClanChat_Emoji_96_Jp.png': 'サキがヘルメットをかぶり、目を細めて「怪しい…」と鋭い疑惑を向けている（疑念・警戒・追求）',
    'ClanChat_Emoji_100_Jp.png': 'アロナが両手を頬に当て、目をキラキラと黄色く輝かせて期待・憧れの眼差しを向けている（キラキラ・期待・ワクワク）',
    'ClanChat_Emoji_103_Jp.png': 'アリスが両手を合わせて満面の笑みで「神ゲーです！」と大感激している（神ゲー・大絶賛・歓喜）',
    'ClanChat_Emoji_104_Jp.png': 'アルが半目で悟ったように「そうよ」と返している（肯定・納得・諦観）',
    'ClanChat_Emoji_105_Jp.png': 'アルが白目を剥いて涙目になり、「そんなぁ！」と激しくショックを受けて絶叫している（絶望・悲鳴・動揺）',
    'ClanChat_Emoji_106_Jp.png': 'ヒフミがペロロ様をギュッと抱きしめて「ありがとうございます！」と心から深く感謝している（大感謝・お礼・感激）',
    'ClanChat_Emoji_107_Jp.png': 'シロコがサンタ帽・サングラス・付け髭で変装し、大きな袋を担いで怪しくポーズを決めている（サンタ変装・強盗・企み）',
    'ClanChat_Emoji_109_Jp.png': 'ツルギが目を血走らせて牙を剥き、「ぎゃあああ」と大絶叫して大暴走している（パニック・絶叫・狂乱）',
    'ClanChat_Emoji_110_Jp.png': 'ミネが目をぐるぐる回して冷や汗を流しながら「あの、先生……？」とおずおずと困惑して呼びかけている（困惑・戸惑い・呼びかけ）',
    'ClanChat_Emoji_111_Jp.png': 'フウカが背後に炎（怒り/パニック）を背負い、大粒の涙を流しながら鍋の前で泣き叫んでいる（給食部の苦難・大泣き・パニック）',
    'ClanChat_Emoji_112_Jp.png': 'ハルカが目を黄色いダイヤのように輝かせて「わぁっ！」と大興奮・感銘を受けている（大興奮・崇拝・感激）',
    'ClanChat_Emoji_141_Jp.png': 'ミカが花飾りをつけて手を振りながら「こんにちは」と優しく挨拶している（挨拶・こんにちは・お出迎え）',
    'ClanChat_Emoji_142_Jp.png': 'アロナが目をぐるぐる回して涙目になり、あわてて両手を広げて大混乱している（パニック・大混乱・あたふた）',
    'ClanChat_Emoji_143_Jp.png': 'コハルがジト目で口をへの字にして不満・怒り顔で睨みつけている（死刑！・怒り・エッチなのは禁止）',
    'ClanChat_Emoji_144_Jp.png': 'セイアが小鳥を肩に乗せ、静かに目を閉じて「そうか…」と哲学的に納得している（納得・思案・静かな受容）'
}

const basename = (url: string) => url.split('/').pop() || url

const stickerDescriptionsByBasename = new Map(
    Object.entries(stickerDescriptions).map(([url, desc]) => [basename(url), desc])
)
const allStickerBasenames = new Set(
    [...stickers, ...stickers2, ...stickers3].map(basename)
)

// スタンプURLをAIに伝える説明文に変換する。スタンプでなければnullを返す
// 送信時点のURLはドメイン付き替え(proxy())済みのことがあるため、ファイル名の一致で判定する
export function getStickerDescription(url: string): string | null {
    for (const [name, desc] of stickerDescriptionsByBasename) {
        if (url.includes(name)) return desc
    }
    for (const name of allStickerBasenames) {
        if (url.includes(name)) return 'スタンプで感情やリアクションを伝えている（詳細な絵柄は不明）'
    }
    return null
}
