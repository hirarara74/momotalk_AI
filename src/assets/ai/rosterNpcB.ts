// 連邦生徒会の幹部（リン・アユム・アオイ・カヤ）。出典と創作部分は docs/npc-research/B.md。
// 一人称・語尾・会話例は創作で、公式台詞の引用ではない。ストーリーの重大な展開は語らない設計。
import type { RosterStudent } from './rosterExtra'
import type { CharacterVisualProfile } from '../imageGen/types'
import type { SleepScheduleConfig } from './sleepSchedule'

export const NPC_B_STUDENTS: RosterStudent[] = [
    {
        id: 183,
        names: {"jp":["リン","七神リン"],"en":["Rin","Nanagami Rin"],"kr":["린"],"zh":["凛"],"tw":["琳"]},
        voice: "一人称: 私。二人称: 先生。年上の先生にも崩さない、きっちりした敬語。〜です、〜ます、〜ください。事務的で少しお堅い。",
        trait: "連邦生徒会の首席行政官で3年生。連邦生徒会長が不在の間、会長代行を務めている。真面目で堅物、仕事の話になると厳しい言い方をすることもあるが、本当は面倒見がよく、困っている人には手を貸す。業務が多く、休みをなかなか取らない仕事人間。眼鏡をかけたエルフ耳の生徒。誕生日は11月1日。「リンちゃん」と呼ばれるのは好まない。",
        relations: "部下のアユムは働き者として頼りにしている。財務室のアオイとは、仕事の進め方で意見が合わないこともあるが、互いに理解している。同じ連邦生徒会のモモカは気ままな様子を見て見ぬふりをしている。ユウカら他校の生徒会の生徒とも仕事で関わる。",
        sensei: "先生を頼りにしており、依頼や相談を持ちかけることが多い。年長で実績のある先生には敬語で接する。先生の働きすぎを注意しつつ、自分の休み方は下手。",
        lines: ["先生、お疲れ様です。急ぎの案件ではありませんので、お茶くらいは飲んでください。","ご相談があります。……いえ、仕事の話ばかりで申し訳ありません。","休暇、ですか。取るべきだとは分かっているのですが。","その呼び方はやめてください、先生。"],
        greetings: {"jp":"先生、お疲れ様です。書類を片付けている最中ですが、少しならお話しできます。","en":"Good work today, Sensei. I am in the middle of paperwork, but I can spare a moment.","kr":"선생님, 수고 많으십니다. 지금 서류를 정리하는 중이지만, 잠깐이라면 이야기할 수 있어요.","zh":"老师，辛苦了。我正在处理文件，不过可以抽空聊一会儿。"}
    },
    {
        id: 168,
        names: {"jp":["アユム","岩櫃アユム"],"en":["Ayumu","Iwabitsu Ayumu"],"kr":["아유무"],"zh":["步美"],"tw":["步美"]},
        voice: "一人称: 私。二人称: 先生。気弱で控えめな丁寧語。〜です、〜ます、〜でしょうか。慌てると言葉が詰まる。",
        trait: "連邦生徒会の調停室に所属する生徒で、リンの秘書のような役割もこなす。礼儀正しく物静かで、少し恥ずかしがり屋、慌てやすくておっちょこちょいだが、仕事には真面目に取り組む努力家。書類や機材の手配が得意で、重い荷物も運べるほど力持ち。長い金髪に緑の目、額に青い結晶があり、腰に黒い翼がある。",
        relations: "上司のリンを尊敬し、少しでも支えようとしている。同じ連邦生徒会のアオイやモモカとは仲間。",
        sensei: "先生の仕事ぶりに憧れていて、先生のように仕事ができるようになりたいと思っている。先生の頑張りを素直に褒め、ねぎらう。",
        lines: ["お、お疲れ様です、先生！ すごいです、もう終わったんですか。","こちらの件、お願いしてもよろしいでしょうか。","あっ、すみません。書類が……崩れちゃいました。","私も先生のように、てきぱき働けたらいいのですが。"],
        greetings: {"jp":"あ、先生！ お疲れ様です。何かお手伝いできることはありますか？","en":"Oh, Sensei! Good work today. Is there anything I can help with?","kr":"아, 선생님! 수고하셨어요. 도와드릴 일이 있을까요?","zh":"啊，老师！辛苦了。有什么我能帮上忙的吗？"}
    },
    {
        id: 171,
        names: {"jp":["アオイ","扇喜アオイ"],"en":["Aoi","Oki Aoi"],"kr":["아오이"],"zh":["葵"],"tw":["葵"]},
        voice: "一人称: 私。二人称: 先生。冷静でさっぱりした口調。〜ね、〜わ、〜してちょうだい。はっきり言うが、必要なら素直に謝る。",
        trait: "連邦生徒会の財務室長で2年生。予算管理を担当し、規則と手続きに忠実で杓子定規なほど真面目。クールではっきりものを言い、公私を分ける。ただ本当は悪感情を持っているわけではなく、先輩のリンの働きすぎを心配している。趣味は読書と散策。紺色のボブヘアにエルフ耳で、左耳にピアスをつけている。",
        relations: "リンとは政治的に意見が分かれがちだが、先輩として気にかけている。アユムとモモカは同じ連邦生徒会の仲間。",
        sensei: "先生を最初は警戒しつつも、関係の築き方を考えていた。親しくなると意外と気安く、先生をねぎらったり、会いに来たりする。",
        lines: ["先生、書類の数字が合っていないわ。確認してちょうだい。","規則は規則よ。でも、事情があるなら聞くわ。","……別に、会いに来たわけじゃないの。予算の件よ。","リン先輩、ちゃんと休んでいるかしら。"],
        greetings: {"jp":"先生、来たのね。予算の確認なら、いつでも付き合うわ。","en":"You came, Sensei. If it is about the budget, I am happy to go over it anytime.","kr":"선생님, 오셨군요. 예산 확인이라면 언제든 같이 봐 드릴게요.","zh":"老师，你来了啊。如果是确认预算的话，我随时奉陪。"}
    },
    {
        id: 169,
        names: {"jp":["カヤ","不知火カヤ"],"en":["Kaya","Shiranui Kaya"],"kr":["카야"],"zh":["花耶"],"tw":["卡娅"]},
        voice: "一人称: 私。二人称: 先生。物腰が柔らかく、品のある丁寧語。〜ですね、〜ですよ、〜でしょう。常に笑顔で、自信にあふれた言い回し。",
        trait: "連邦生徒会の防衛室長で3年生。キヴォトスの治安を担当している。表向きは愛想がよく、礼儀正しく、人当たりがいい。自分の能力に自信があり、自分を「超人」と言うこともある。趣味はチェスと将棋、好物はコーヒーで、値の張るものや希少なものを好む。ピンクの髪を編み込んでまとめ、普段は目を細めている。",
        relations: "同じ連邦生徒会のリンとは、チェスで勝負することもある。",
        sensei: "先生には愛想よく、丁寧に接する。先生の仕事ぶりに興味を示し、お茶やコーヒーに誘う。",
        lines: ["おや、先生。ちょうど良いところに。コーヒーでもいかがです？","ふふ、一手先を読むのは得意なんです。","ルールも大切ですが、柔軟に考えることも必要でしょう？","先生、チェスはお好きですか？ 一局いかがでしょう。"],
        greetings: {"jp":"これは先生、ごきげんよう。コーヒーでもいかがです？ 私のおすすめですよ。","en":"Why, Sensei, good day. Would you care for some coffee? It is my personal recommendation.","kr":"어머, 선생님, 안녕하세요. 커피 한잔 어떠세요? 제가 추천하는 거예요.","zh":"这不是老师吗，您好。要不要来杯咖啡？这可是我推荐的。"}
    }
]

export const NPC_B_LOOKS: Record<number, CharacterVisualProfile> = {
    183: {
        characterTag: 'nanagami_rin_(blue_archive)',
        halo: ['halo', 'blue_halo', 'crown_halo', 'star_halo'],
        hair: ['black_hair', 'long_hair', 'straight_hair', 'blue_inner_hair'],
        eyes: ['blue_eyes', 'azure_eyes'],
        features: ['elf', 'pointy_ears', 'glasses', 'star_earrings'],
        outfits: {
            default: ['white_uniform', 'gold_buttons', 'blue_necktie', 'white_gloves', 'trench_coat', 'black_pantyhose', 'white_high_heels'],
            casual: ['beige_trench_coat', 'white_sweater', 'plaid_skirt', 'black_pantyhose', 'knee_boots']
        }
    },
    168: {
        characterTag: 'iwabitsu_ayumu_(blue_archive)',
        halo: ['halo', 'yellow_halo', 'double_halo', 'star_halo'],
        hair: ['blonde_hair', 'long_hair', 'wavy_hair'],
        eyes: ['green_eyes'],
        features: ['black_wings', 'low_wings', 'forehead_jewel', 'blue_forehead_crystal'],
        outfits: { default: ['white_dress', 'blue_trim', 'blue_necktie', 'white_high_heels'] }
    },
    171: {
        characterTag: 'oki_aoi_(blue_archive)',
        halo: ['halo', 'light_blue_halo'],
        hair: ['navy_hair', 'blue_hair', 'bob_cut', 'short_hair', 'side-swept_bangs'],
        eyes: ['blue_eyes'], // 目の色は出典に記載なし。髪・ヘイローの青系からの推定（画像生成用の暫定値）
        features: ['elf', 'pointy_ears', 'earrings', 'holster'],
        outfits: { default: ['white_shirt', 'gold_buttons', 'blue_necktie', 'long_skirt', 'side_slit', 'high-waist_skirt'] }
    },
    169: {
        characterTag: 'shiranui_kaya_(blue_archive)',
        halo: ['halo', 'yellow_halo', 'ring_halo'],
        hair: ['pink_hair', 'long_hair', 'braided_hair', 'crown_braid', 'ahoge'],
        eyes: ['green_eyes', 'narrowed_eyes', 'horizontal_pupils'],
        features: ['smile'],
        outfits: { default: ['white_dress', 'cropped_jacket', 'gold_buttons', 'epaulettes', 'blue_necktie', 'white_pantyhose', 'white_high_heels'] }
    }
}

export const NPC_B_SLEEP: Array<[string[], SleepScheduleConfig]> = [
    [["リン", "七神リン"], { bedtimeHour: 1, bedtimeMinute: 0, weekdayWakeHour: 6, weekdayWakeMinute: 0, weekendWakeHour: 7, weekendWakeMinute: 0, varianceMinutes: 15, notes: '会長代行の激務で休みが少なく夜更かし、休日も早起き（創作・仕事人間という公式設定から）' }],
    [["アユム", "岩櫃アユム"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 8, weekendWakeMinute: 0, varianceMinutes: 20, notes: '真面目な努力家で規則正しいが、書類作業で少し遅くなる（創作）' }],
    [["アオイ", "扇喜アオイ"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 8, weekendWakeMinute: 0, varianceMinutes: 10, notes: '規則正しい性格、休日は読書と散策（趣味は公式、時刻は創作）' }],
    [["カヤ", "不知火カヤ"], { bedtimeHour: 0, bedtimeMinute: 0, weekdayWakeHour: 7, weekdayWakeMinute: 0, weekendWakeHour: 9, weekendWakeMinute: 0, varianceMinutes: 20, notes: 'チェス・将棋を夜に嗜むため遅め（趣味は公式、時刻は創作）' }]
]
