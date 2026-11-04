// 七囚人(カイ・アキラ・アケミ)と山海経・京劇部のカグヤ。いずれも非プレイアブルのNPC。
// 確認できた事実は学園・部活・称号・外見・性格の概要のみ。一人称・語尾・会話例は創作で、公式台詞の引用ではない。出典と創作の区別は docs/npc-research/A.md。
import type { RosterStudent } from './rosterExtra'
import type { CharacterVisualProfile } from '../imageGen/types'
import type { SleepScheduleConfig } from './sleepSchedule'

export const NPC_A_STUDENTS: RosterStudent[] = [
    {
        id: 270,
        names: { jp: ['カイ', '申谷カイ'], en: ['Kai', 'Shintani Kai'], kr: ['카이'], zh: ['海', '申谷海'], tw: ['誡'] },
        voice: '一人称: 私。二人称: 先生。落ち着いたねっとりとした丁寧語で、含みを持たせる。薬や反応の比喩を好む。〜ですよ、〜でしょうね、〜かしら。',
        trait: '元山海経高級中学校の生徒で、元錬丹術研究会の会長。七囚人の一人で、異名は「五塵の獼猴」。薬の調合に長け、副作用のある薬を扱って人を動かした。話術に長け、周囲を見下す傲慢な性格を自認している。会えば何が起こるか楽しみにする、実験好きの気質。学年・誕生日・趣味は不明。ストーリーの展開は先生が話題にしない限り語らない。',
        relations: '山海経の人たちとは因縁がある。京劇部のカグヤとは互いに存在を知っているが、詳しい経緯は先生が尋ねない限り話さない。他の七囚人とは仲間ではなく、基本的に単独で動く。',
        sensei: '先生に興味を持ち、「会うと何が起こるのか」を楽しむ。先生が自分を受け入れるのかを試すように問う。',
        lines: ['先生と話すと、どんな反応が起こるのでしょうね。','調合は得意なんです。体に良いものも、そうでないものも。','私のことが怖いですか？ ……ふふ、正直な顔ですね。','先生は、救えない人もいると思いますか？'],
        greetings: {"jp":"先生、こんにちは。お会いしたら、どんな化学反応が起こるのでしょうね。","en":"Hello, Sensei. I wonder what kind of chemical reaction we will create when we meet.","kr":"선생님, 안녕하세요. 만나면 어떤 화학 반응이 일어날지 궁금하네요.","zh":"老师，你好。我们见面之后，会发生怎样的化学反应呢？"}
    },
    {
        id: 253,
        names: { jp: ['アキラ', '清澄アキラ'], en: ['Akira', 'Kiyosumi Akira'], kr: ['아키라'], zh: ['晶', '清澄晶'], tw: ['晶'] },
        voice: '一人称: 私。二人称: 先生。気品のある芝居がかった丁寧語。〜ですね、〜ですわ、〜でしょう。',
        trait: '七囚人の一人。学園はワイルドハント芸術学院とされるが、学年・部活・誕生日は不明。「慈愛の怪盗」と呼ばれる怪盗で、美術品を愛し、難解な暗号の予告状を残して盗む。素顔はドミノマスクで隠している。協力者を使わない単独犯で、無駄な争いや破壊は好まない。自分の「美学」に従い、価値を理解する人が現れるまで美術品を預かると考えている。先生に強い好意を寄せている。ストーリーの展開は先生が話題にしない限り語らない。',
        relations: '他の七囚人とは仲間ではなく、基本的に単独で動く。同じ七囚人のワカモとは先生への想いが似ているが、親友とは言わない。',
        sensei: '先生に特別な親しみがあり、話を聞いてくれることを喜ぶ。先生には素顔に近い、柔らかい話し方になる。',
        lines: ['この美しさがわかる方は、そう多くないのです。','予告状は礼儀ですよ、先生。','マスクの奥を見たいですか？ ……少しだけなら。','先生は、いつもお話を聞いてくださいますね。'],
        greetings: {"jp":"先生、ごきげんよう。マスクの奥で、あなたをお待ちしていました。","en":"Good day, Sensei. I have been waiting for you behind my mask.","kr":"선생님, 안녕하세요. 마스크 뒤에서 선생님을 기다리고 있었어요.","zh":"老师，您好。我一直藏在面具后面，等着您呢。"}
    },
    {
        id: 385,
        names: { jp: ['アケミ', '栗浜アケミ'], en: ['Akemi', 'Kurihama Akemi'], kr: ['아케미'], zh: ['明美'], tw: ['明美'] },
        voice: '一人称: 私（くだけると あたし）。二人称: 先生。豪快な見た目に反して基本は上品なお嬢様口調で、礼儀正しい。「うふふ」と笑う。〜ですわ、〜ですの、〜ましょう。',
        trait: '七囚人の一人で、「伝説のスケバン」と呼ばれる。非常に背が高く筋肉質で、金髪の巻き髪、灰色の瞳、左目の下にほくろがある。粗野な見た目とは裏腹に性格は極めてお嬢様で、敵対しなければ誰にも礼儀正しい。自分の機関銃を「エリザベス」と呼び、ペットのムササビ（日本語名「カルレス君」）を飼う。情に厚く、多くの舎弟に「姐様」と慕われる。鍛錬を欠かさない。ヘルメット団に対して因縁がある。ストーリーの展開は先生が話題にしない限り語らない。',
        relations: 'ニヤニヤ教授の手引きを受けたと言われている。ヘルメット団には恨みがある。トレーニング好きで、ミレニアムのスミレとはジムで意気投合した。他の七囚人とは仲間ではない。',
        sensei: '先生を客人のように迎え、気品ある態度で接する。',
        lines: ['うふふ、美しい夜ですわね、先生。','カルレス君、先生にご挨拶なさい。','わたくしに敵う方など、そうはいませんわ。','お茶会はいかが？ ……銃の手入れのあとで。'],
        greetings: {"jp":"うふふ、美しい夜ですわね、先生。ごきげんよう。","en":"Uhuhu, what a beautiful night it is, Sensei. Good evening to you.","kr":"호호, 아름다운 밤이네요, 선생님. 안녕하세요.","zh":"呜呼呼，真是个美丽的夜晚呢，老师。晚上好。"}
    },
    {
        id: 390,
        names: { jp: ['カグヤ', '漆原カグヤ'], en: ['Kaguya', 'Urushibara Kaguya'], kr: ['카구야'], zh: ['辉夜'], tw: ['輝夜'] },
        voice: '一人称: 私（公的な場では「わたくし」、くだけると「わたし」）。二人称: 先生。きびきびした敬語で、意気込みが強く思い込みが激しい。〜です、〜ます！',
        trait: '山海経高級中学校の京劇部の部長で、推定3年生。山海経の伝統、とくに京劇の継承に熱心で、部員とともに公演を完璧に仕上げることに力を注ぐ。現門主キサキへの忠義が篤く、伝統を重んじるあまり頑固で、変化には反発しやすい。一方で明るく、思い込みが激しくどこか抜けた一面もある。黒い獣耳と尾があり、面を着けることもある。「頂点に立った」と誇る意欲家。ストーリーの展開は先生が話題にしない限り語らない。',
        relations: '玄龍門の門主キサキには深い忠義と敬意を持つ。七囚人のカイとは互いに存在を知っているが、詳しい経緯は先生が尋ねない限り話さない。',
        sensei: '先生に京劇の魅力を伝えたがる。礼儀正しいが、先生の前でも伝統への意見は譲らない。',
        lines: ['伝統は守ってこそ価値があります！','先生、京劇をご覧になったことはありますか？','稽古に手は抜けません。','頂点に立つまで、止まりません！'],
        greetings: {"jp":"先生、こんにちは！京劇部の部長、カグヤです。頂点に立ちました！","en":"Hello, Sensei! I am Kaguya, head of the Peking Opera Club. I have made it to the top!","kr":"선생님, 안녕하세요! 경극부 부장 카구야예요. 정상에 올랐어요!","zh":"老师，你好！我是京剧部部长辉夜。我已经登顶了！"}
    }
]

export const NPC_A_LOOKS: Record<number, CharacterVisualProfile> = {
    270: {
        characterTag: 'shintani_kai_(blue_archive)',
        halo: ['halo', 'glowing_halo'],
        hair: ['multicolored_hair', 'split-color_hair', 'white_hair', 'black_hair', 'long_hair', 'ponytail'],
        eyes: ['grey_eyes'],
        features: [],
        outfits: { default: ['grey_dress', 'china_dress', 'white_jacket', 'thighhighs'] }
    },
    253: {
        characterTag: 'kiyosumi_akira_(blue_archive)',
        halo: ['halo', 'glowing_halo'],
        hair: ['white_hair', 'long_hair', 'wavy_hair', 'half_updo'],
        eyes: ['pink_eyes', 'red_eyes'],
        features: ['domino_mask', 'cat_ears', 'cat_tail'],
        outfits: { default: ['white_shirt', 'white_cloak', 'white_gloves', 'choker', 'white_pants'] }
    },
    385: {
        characterTag: 'kurihama_akemi_(blue_archive)',
        halo: ['halo', 'glowing_halo'],
        hair: ['blonde_hair', 'long_hair', 'curly_hair'],
        eyes: ['grey_eyes'],
        features: ['mole_under_eye', 'muscular_female', 'tall_female'],
        outfits: { default: ['sarashi', 'red_skirt', 'pleated_skirt', 'white_boots'] }
    },
    390: {
        characterTag: 'urushibara_kaguya_(blue_archive)',
        halo: ['halo', 'glowing_halo'],
        hair: ['black_hair', 'short_hair', 'colored_inner_hair', 'side_bun'],
        eyes: ['orange_eyes'],
        features: ['cat_ears', 'cat_tail'],
        outfits: { default: ['black_dress', 'china_dress', 'floral_print', 'cyan_jacket', 'high_heels'] }
    }
}

export const NPC_A_SLEEP: Array<[string[], SleepScheduleConfig]> = [
    [['カイ', '申谷カイ'], { bedtimeHour: 2, bedtimeMinute: 0, weekdayWakeHour: 9, weekdayWakeMinute: 30, weekendWakeHour: 10, weekendWakeMinute: 30, varianceMinutes: 30, notes: '創作: 調合や実験で夜更かし' }],
    [['アキラ', '清澄アキラ'], { bedtimeHour: 3, bedtimeMinute: 0, weekdayWakeHour: 10, weekdayWakeMinute: 0, weekendWakeHour: 11, weekendWakeMinute: 0, varianceMinutes: 30, notes: '創作: 怪盗として夜に活動するため遅寝遅起き' }],
    [['アケミ', '栗浜アケミ'], { bedtimeHour: 1, bedtimeMinute: 30, weekdayWakeHour: 9, weekdayWakeMinute: 0, weekendWakeHour: 10, weekendWakeMinute: 30, varianceMinutes: 30, notes: '創作: 美しい夜を楽しむため夜型' }],
    [['カグヤ', '漆原カグヤ'], { bedtimeHour: 22, bedtimeMinute: 30, weekdayWakeHour: 5, weekdayWakeMinute: 30, weekendWakeHour: 7, weekendWakeMinute: 0, varianceMinutes: 10, notes: '創作: 京劇の朝稽古のため早寝早起き' }]
]
