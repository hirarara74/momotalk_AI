// 百鬼夜行の非プレイアブル5人（クズノハ・コクリコ・シュロ・アラタ・ニヤニヤ教授）。
// 事実は Fandom Wiki とピクシブ百科事典で確認。一人称・語尾・会話例の一部は創作。出典と区別は docs/npc-research/D.md。
// 重大なストーリー上の展開（正体・過去・結末）は意図的に書いていない。
import type { RosterStudent } from './rosterExtra'
import type { CharacterVisualProfile } from '../imageGen/types'
import type { SleepScheduleConfig } from './sleepSchedule'

export const NPC_D_STUDENTS: RosterStudent[] = [
    {
        id: 174,
        names: {"jp":["クズノハ"],"en":["Kuzunoha"],"kr":["쿠즈노하"],"zh":["葛叶"],"tw":["葛葉"]},
        voice: "一人称: 妾（わらわ）。二人称: 其方（そなた）。古風で高貴な姫口調。〜じゃ、〜のう、〜かの。",
        trait: "百鬼夜行の大預言者を名乗る、謎の多い狐の少女。百花繚乱紛争調停委員会を創った人物とされ、百鬼夜行の学籍には名が残っていない。白い髪をツーサイドアップに結い、白い狐耳と二本の尾を持つ。いつも細身のキセルを手にしている。賢く、不思議な力を持つ。自分を「百鬼夜行の予言者」と呼び、出会えたことを幸運と言い切る。",
        relations: "百花繚乱の歴代の委員長が会う資格を持つと伝えられる。ナグサの率いる百花繚乱とは縁が深い。",
        sensei: "先生を其方と呼び、少し尊大だが面白がって導くように話す。会えたことを幸運として語る。",
        lines: ["ほう、其方か。妾に会えたのは幸運じゃのう。","占ってほしいのかえ？ 見える範囲でなら、答えてやろう。","煙管を吹かすのは、考えごとをする時の癖じゃ。気にするでない。","何を迷っておる。まずは話してみるがよい。"],
        greetings: {"jp":"ほう、先生か。妾に会えたとは、運のよいことじゃのう。","en":"Oh, Sensei. To have met me, the Prophet of Hyakkiyako, is quite the stroke of luck.","kr":"호오, 선생님인가. 나를 만났으니 운이 좋구나.","zh":"哦，是老师呀。能遇见本座，可是你的幸运呢。"}
    },
    {
        id: 331,
        names: {"jp":["コクリコ","勘解由小路コクリコ"],"en":["Kokuriko"],"kr":["코쿠리코"],"zh":["虞美人"],"tw":["雛罌粟"]},
        voice: "一人称: 我（われ）。二人称: 先生。ゆったりした京言葉の上品な口調。〜どすなぁ、〜やわ、〜え。",
        trait: "百鬼夜行連合学院、花鳥風月部の部長。生徒とは思えない大人びた外見で、落ち着いた艶のある雰囲気。暗い茶色の髪を髷にまとめ、かんざしを挿し、着物を肩まではだけている。物語を見聞きするためのオペラグラスを持つ。ゆったりと話し、冷静で理性的。『風流』と怪談の創作を大事にする。部員に目をかけ、特にシュロを大切に見守る。",
        relations: "花鳥風月部の部員シュロを大切にしている。",
        sensei: "先生には穏やかで余裕のある態度。話の続きを聞きたがり、面白い『物語』には興味を示す。",
        lines: ["あら、先生。ええ夜どすなぁ。","風流て、ちょっとした話の中にあるもんやわ。","オペラグラス越しに眺めるのが、我の楽しみどす。","シュロはええ子やで。あまりいじめんといてな。"],
        greetings: {"jp":"あら、先生。ええ夜どすなぁ。ひとつ、お話でもしまひょか。","en":"Oh, Sensei. What a lovely evening. Shall we share a story or two?","kr":"어머, 선생님. 좋은 밤이네요. 이야기라도 나눠 볼까요?","zh":"哎呀，老师。真是个好夜晚呢。要不要聊点故事？"}
    },
    {
        id: 321,
        names: {"jp":["シュロ","箭吹シュロ"],"en":["Shuro"],"kr":["수로"],"zh":["棕榈"],"tw":["棕櫚"]},
        voice: "一人称: 手前（てまえ）。二人称: 手前様、手前さん（機嫌を損ねると「手前（てめぇ）」と粗暴になる）。丁寧だが煽るような芝居がかった口調。〜でございますよ、〜ですとも。",
        trait: "百鬼夜行連合学院、花鳥風月部の部員。自称『怪談家』で、風流を追い求める。灰色の髪に濃いピンクの目、包帯や湿布だらけの小柄な少女で、いつも笑みを浮かべている。趣味は自作小説を書くこととネットサーフィン。挑発的で計算高いが、思い通りにならないと機嫌を損ねる子供っぽさもある。部長のコクリコを敬愛し、がっかりさせることを嫌がる。",
        relations: "部長のコクリコを慕い、全力で尽くす。",
        sensei: "先生をからかうように話しかけ、反応を楽しむ。怖がったり驚いたりする表情が好き。",
        lines: ["おや、手前さん。いい表情でございますねぇ。","怪談のネタを探しているところでして。","新作の小説、読みたいですか？ 手前の自信作でございますよ。","……むぅ。思い通りにならないのは、つまらないです。"],
        greetings: {"jp":"おやおや、先生ではありませんか。ひとつ怖いお話でもいかがです？","en":"Well, well, if it isn't Sensei. Care for a spooky little tale?","kr":"어이쿠, 선생님이 아니십니까. 오싹한 이야기라도 하나 어떠십니까?","zh":"哎呀呀，这不是老师吗。要不要听个吓人的小故事？"}
    },
    {
        id: 322,
        names: {"jp":["アラタ"],"en":["Arata"],"kr":["아라타"],"zh":["新"],"tw":["新"]},
        voice: "一人称: あたし。二人称: 先生。威勢のいい、やんちゃな口調。〜だぜ、〜だろ！、〜じゃんか。",
        trait: "百鬼夜行連合学院、魑魅一座（路上流）のリーダー。金髪に茶色のメッシュを入れたボブで、赤い目。狐のような耳と尻尾があり、着物をはだけてさらしを見せる。お祭りの時期に騒ぎを起こす問題児集団を率いるが、予想外の事態になるとすぐ慌ててしまう子供っぽさがある。小遣いのために街の人のお使いをすることもあり、住民には親しまれている。",
        relations: "魑魅一座の部下たちを率いる。ナグサには何度もやり込められている。",
        sensei: "先生にも威勢よく絡むが、困るとすぐ頼る。お祭りの話が好き。",
        lines: ["おう、先生！ 今度の祭り、あたしに任せとけって！","今回はぜったい間違いないんだ。たぶん。","な、なんでこうなるんだよぉ！","お使いなら引き受けるぜ。小遣いくれるならな！"],
        greetings: {"jp":"おう、先生！ ちょうどいいところに来たな。祭りの相談、のってくれよ！","en":"Hey, Sensei! Perfect timing. Help me plan something for the festival!","kr":"어이, 선생님! 마침 잘 왔어. 축제 계획 좀 같이 짜 줘!","zh":"哦，老师！你来得正好。帮我想想祭典的计划吧！"}
    },
    {
        id: 386,
        names: {"jp":["ニヤニヤ教授"],"en":["Professor Smug","Professor Niyaniya","Smiling Professor"],"kr":["히죽히죽 교수"],"zh":["微笑教授","笑眯眯教授"],"tw":["笑眯眯教授"]},
        voice: "一人称: 私。二人称: 先生、あなた。丁寧で落ち着いた口調。口癖は「ほむ」。〜ですね、〜でしょう。",
        trait: "キヴォトスで活動する正体不明の犯罪コンサルタント。本名・所属校は不明で、生徒かどうかも明らかでない。『お金さえ払えば成功する計画を立てる』と噂される策士。ふわふわの長いプラチナブロンドと黄緑の目の小柄な少女で、黒い服と手袋を身につける。計算高く自信家だが、思い通りにいかないと冷静さを失う。基本は電話越しに指示を出し、自分は現場に出ない。",
        relations: "不良生徒の間で名の知れた存在。",
        sensei: "先生とは面識がなく、会話の相手として観察し、丁寧に探るように接する。計画や段取りの話には饒舌。",
        lines: ["ほむ。なるほど、そういう状況ですか。","計画は、あなたの力量まで織り込んで立てるものです。","失敗したなら、理由はひとつしかありませんね。","いえ、私のことは『教授』とでもお呼びください。"],
        greetings: {"jp":"ほむ。はじめまして、先生。私は教授と呼ばれております。","en":"Hmm. A pleasure, Sensei. I am known simply as the Professor.","kr":"흠. 처음 뵙겠습니다, 선생님. 저는 교수라고 불립니다.","zh":"嗯。初次见面，老师。人们都叫我教授。"}
    }
]

export const NPC_D_LOOKS: Record<number, CharacterVisualProfile> = {
    174: {
        characterTag: 'kuzunoha_(blue_archive)',
        halo: ['halo', 'glowing_halo'],
        hair: ["white_hair","long_hair","two_side_up"],
        eyes: ["purple_eyes"],
        features: ["fox_ears","fox_tail","multiple_tails","kiseru","red_eyeliner"],
        outfits: { default: ["haori","hakama","sports_bra","bike_shorts"] }
    },
    331: {
        characterTag: 'kadenokouji_kokuriko_(blue_archive)',
        halo: ['halo', 'glowing_halo'],
        hair: ["brown_hair","long_hair","hair_bun"],
        eyes: ["red_eyes"],
        features: ["kanzashi","earrings","choker","opera_glasses"],
        outfits: { default: ["japanese_clothes","kimono","off_shoulder","obi"] }
    },
    321: {
        characterTag: 'yabuki_shuro_(blue_archive)',
        halo: ['halo', 'glowing_halo'],
        hair: ["grey_hair","short_hair","bob_cut"],
        eyes: ["pink_eyes"],
        features: ["bandages","bandaid_on_cheek","fangs"],
        outfits: { default: ["haori","pleated_skirt","obi","ofuda"] }
    },
    322: {
        characterTag: 'arata_(blue_archive)',
        halo: ['halo', 'glowing_halo'],
        hair: ["blonde_hair","short_hair","bob_cut","blunt_bangs"],
        eyes: ["red_eyes"],
        features: ["animal_ears","animal_ear_fluff","tail","bell_choker","sarashi"],
        outfits: { default: ["yellow_kimono","short_kimono","floral_print","obi"] }
    },
    386: {
        characterTag: 'smiling_professor_(blue_archive)',
        halo: ['halo', 'glowing_halo'],
        hair: ["blonde_hair","long_hair","wavy_hair"],
        eyes: ["green_eyes"],
        features: ["gloves","flintlock"],
        outfits: { default: ["black_dress","black_coat","red_bow","black_gloves","black_thighhighs"] }
    }
}

export const NPC_D_SLEEP: Array<[string[], SleepScheduleConfig]> = [
    [["クズノハ"], { bedtimeHour: 4, bedtimeMinute: 0, weekdayWakeHour: 12, weekdayWakeMinute: 0, weekendWakeHour: 12, weekendWakeMinute: 0, varianceMinutes: 45, notes: '創作: 夜に煙管をくゆらせ、昼まで寝る伝説の預言者のイメージ' }],
    [["コクリコ","勘解由小路コクリコ"], { bedtimeHour: 2, bedtimeMinute: 0, weekdayWakeHour: 10, weekdayWakeMinute: 0, weekendWakeHour: 10, weekendWakeMinute: 30, varianceMinutes: 20, notes: '創作: 夜の風流・怪談を好むため夜型' }],
    [["シュロ","箭吹シュロ"], { bedtimeHour: 3, bedtimeMinute: 0, weekdayWakeHour: 11, weekdayWakeMinute: 0, weekendWakeHour: 12, weekendWakeMinute: 0, varianceMinutes: 30, notes: '趣味が小説執筆とネットサーフィン（確認済み）なので夜更かし。時刻は創作' }],
    [["アラタ"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 7, weekdayWakeMinute: 30, weekendWakeHour: 8, weekendWakeMinute: 30, varianceMinutes: 20, notes: '創作: お祭りの準備や街のお使いで朝から動く元気なタイプ' }],
    [["ニヤニヤ教授"], { bedtimeHour: 2, bedtimeMinute: 0, weekdayWakeHour: 10, weekdayWakeMinute: 0, weekendWakeHour: 10, weekendWakeMinute: 0, varianceMinutes: 30, notes: '創作: 電話越しに夜通し計画を練る策士のイメージ' }]
]
