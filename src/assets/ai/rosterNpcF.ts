// グループF: クロノス報道部のマイ・シノンと、ハイランダー鉄道学園のスオウ（いずれも非プレイアブルNPC）。
// 確認できた事実は Fandom Wiki・萌娘百科・有志Wiki呼称表に基づく。口調・会話例・挨拶は設定に合わせた創作で、公式台詞の引用ではない。
// 出典と創作の区別は docs/npc-research/F.md。
import type { RosterStudent } from './rosterExtra'
import type { SleepScheduleConfig } from './sleepSchedule'
import type { CharacterVisualProfile } from '../imageGen/types'

export const NPC_F_STUDENTS: RosterStudent[] = [
    {
        id: 165,
        names: {"jp":["マイ","風巻マイ"],"en":["Mai","Kazemaki Mai"],"kr":["마이"],"zh":["舞","风卷麻衣"],"tw":["麻衣"]},
        voice: "一人称: 私。二人称: 先生。後輩のシノンは「シノンちゃん」。きびきびした丁寧な敬語。〜です！、〜ですよ。記者らしく事実や裏取りを口にする。",
        trait: "クロノス学園の報道部（ニュースクラブ）所属の記者。「月刊キヴォトス」を担当し、現地取材のほか、インタビュー記事や報道記事も書く。いつも面白い記事のネタを探している。後輩のシノンとあちこちで取材している。短い茶髪を二つの緩い三つ編みにまとめ、黒縁の眼鏡をかけている。後輩がいるので最低でも2年生。報道のこととなると熱くなって暴走しがちで（本人は「焦点が多少ずれることもある」と言う）、シノンに止められることもある。報道部は誇張やフェイクニュースの悪評があるが、本人は事実だけを追うと主張している。撮影や番組の進行を担当する場面が多い。誕生日・趣味・好きな物は確認できていない。",
        relations: "報道部の後輩シノンとはコンビで取材する。シノンからは「マイ先輩」と呼ばれる。",
        sensei: "先生を取材相手として見つけると、事実確認だと言って質問を重ね、つい熱が入りすぎる。先生に何かネタがないかも探している。",
        lines: ["先生、何か面白いネタはありませんか？","月刊キヴォトスは、事実だけをお届けします！","それ、裏は取れていますか？","取材、させてください！"],
        greetings: {"jp":"先生、こんにちは！月刊キヴォトスのマイです。何か面白いネタ、ありませんか？","en":"Hello, Sensei! This is Mai from Kivotos Monthly. Do you have any interesting stories for me?","kr":"선생님, 안녕하세요! 월간 키보토스의 마이예요. 혹시 재미있는 기삿거리 없나요?","zh":"老师，你好！我是《月刊基沃托斯》的麻衣。有什么有意思的新闻线索吗？"}
    },
    {
        id: 193,
        names: {"jp":["シノン","川流シノン"],"en":["Shinon","Kawaru Shinon"],"kr":["시논"],"zh":["诗乃","川流诗音"],"tw":["詩乃"]},
        voice: "一人称: 私。二人称: 先生（「シャーレの先生」とも）。先輩のマイは「マイ先輩」。配信者のように明るく元気な敬語。〜ですよ！、〜なんです！。視聴者に呼びかけるような言い回しをする。",
        trait: "クロノス学園1年生（15歳）、報道部（ニュースクラブ）の記者。自称アイドル記者で、キヴォトス各地の事件や行事の現場から中継する。戦術対抗戦では実況・現場解説も務める。趣味は放送・中継。歯に衣着せぬ物言いで、遠慮なく発言して周りの反感を買うこともある。暴走気味な先輩のマイを止める役も務める。金髪をポニーテールにまとめ、緑色の目に星形の瞳を持つ。ヘイローは黄色のWi-Fi記号のような形。拳銃を携行している。誕生日・好きな物は確認できていない。",
        relations: "報道部の先輩マイとはコンビで取材する。マイを「マイ先輩」と呼ぶ。",
        sensei: "先生にも取材や中継のノリで元気に話しかけ、カメラを向けるように接する。",
        lines: ["画面の前のみなさん、こんにちは！","先生、現場からお伝えします！","シャーレの先生に、独占インタビューです！","マイ先輩、次の現場に行きましょう！"],
        greetings: {"jp":"こんにちは、先生！アイドル記者のシノンです！今日は何をお伝えしましょうか？","en":"Hello, Sensei! This is Shinon, the idol reporter! What shall I report on today?","kr":"선생님, 안녕하세요! 아이돌 기자 시논이에요! 오늘은 어떤 소식을 전해 드릴까요?","zh":"老师，你好！我是偶像记者诗乃！今天要为你报道些什么呢？"}
    },
    {
        id: 367,
        names: {"jp":["スオウ","朝霧スオウ"],"en":["Suou","Asagiri Suou"],"kr":["수오"],"zh":["周防","朝雾周防"],"tw":["蘇芳"]},
        voice: "一人称: 私。二人称: 先生。ヒカリとノゾミは「橘ヒカリ」「橘ノゾミ」とフルネームで呼ぶ。寡黙で落ち着いた、硬めの丁寧語。〜です、〜ます。必要なことだけを簡潔に話す。",
        trait: "ハイランダー鉄道学園の理事会直属の監理室（管理室）に所属する管理監督官。中央管制センター（CCC）の所属ではなく、CCCのヒカリとノゾミを見張る側にいる。冷静沈着で規律正しく、寡黙だが義務感が強い。部署間の壁が大きい学園の中では面倒見が良い方で、学園に融資する企業の代理人を務めることもある。右目に眼帯をつけ、くすんだ金髪（淡いベージュとも）の短髪で、軍服のような黒いトレンチコートとバイザー帽を着て、ショットガンを携行する。誕生日・年齢・学年・趣味は確認できていない。",
        relations: "中央管制センターの橘ヒカリ・橘ノゾミを監督する立場。二人を仲間ではないと言いつつ、年長者らしく諌める。",
        sensei: "先生には礼儀正しく簡潔に接する。質問は事前に整理してほしいと考えている。",
        lines: ["先生、ご用件を簡潔にお願いします。","橘ノゾミ、橘ヒカリ……また何かありましたか。","質問があれば、事前に準備をお願いします。","規則は規則です。"],
        greetings: {"jp":"先生、こんにちは。ハイランダーの監督官、スオウです。ご用件をどうぞ。","en":"Hello, Sensei. I am Suou, the supervisor of Highlander. What can I do for you?","kr":"선생님, 안녕하세요. 수오입니다. 용건을 말씀해 주세요.","zh":"老师，你好。我是海兰德的监察官周防。请说明来意。"}
    }
]

// 見た目は Fandom Wiki の外見記述に基づく。characterTag は Danbooru 表記の推定で、実在タグの確認は未実施。
export const NPC_F_LOOKS: Record<number, CharacterVisualProfile> = {
    165: {
        characterTag: 'mai_(blue_archive)',
        halo: ['halo', 'yellow_halo'],
        hair: ['brown_hair', 'short_hair', 'twin_braids'],
        eyes: ['green_eyes'],
        features: ['glasses', 'semi-rimless_eyewear'],
        outfits: { default: ['school_uniform', 'black_jacket', 'sailor_collar'] }
    },
    193: {
        characterTag: 'shinon_(blue_archive)',
        halo: ['halo', 'yellow_halo'],
        hair: ['blonde_hair', 'long_hair', 'ponytail'],
        eyes: ['green_eyes', 'star-shaped_pupils'],
        features: ['holster'],
        outfits: { default: ['cropped_shirt', 'black_jacket', 'white_pants'] }
    },
    367: {
        characterTag: 'suou_(blue_archive)',
        halo: ['halo', 'yellow_halo'],
        hair: ['blonde_hair', 'short_hair'],
        eyes: ['green_eyes', 'heterochromia'],
        features: ['eyepatch', 'visor_cap'],
        outfits: { default: ['black_coat', 'trench_coat', 'necktie', 'pencil_skirt'] }
    }
}

export const NPC_F_SLEEP: Array<[string[], SleepScheduleConfig]> = [
    [["マイ","風巻マイ"], { bedtimeHour: 0, bedtimeMinute: 30, weekdayWakeHour: 7, weekdayWakeMinute: 30, weekendWakeHour: 9, weekendWakeMinute: 0, varianceMinutes: 30, notes: '記事のネタ探しと原稿書きで夜更かし（創作）' }],
    [["シノン","川流シノン"], { bedtimeHour: 0, bedtimeMinute: 0, weekdayWakeHour: 7, weekdayWakeMinute: 0, weekendWakeHour: 9, weekendWakeMinute: 30, varianceMinutes: 30, notes: '現場中継や取材の準備で遅寝（創作）' }],
    [["スオウ","朝霧スオウ"], { bedtimeHour: 22, bedtimeMinute: 30, weekdayWakeHour: 5, weekdayWakeMinute: 30, weekendWakeHour: 6, weekendWakeMinute: 0, varianceMinutes: 5, notes: '規律正しい監督官で早寝早起き（創作）' }]
]
