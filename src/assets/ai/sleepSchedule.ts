import { resolveCanonicalStudent } from './prompts'
/**
 * 生徒ごとの生活リズム（就寝・起床時間・平日休日差・ランダム性）管理モジュール
 */

export interface SleepScheduleConfig {
    bedtimeHour: number          // 就寝時間（時: 0〜23）
    bedtimeMinute?: number      // 就寝時間（分: 0〜59, デフォルト 0）
    weekdayWakeHour: number      // 平日起床（時）
    weekdayWakeMinute: number    // 平日起床（分）
    weekendWakeHour: number      // 休日起床（時）
    weekendWakeMinute: number    // 休日起床（分）
    varianceMinutes: number      // 起床時間のばらつき（0=完全一定, 15〜45=日によって変動）
    notes?: string               // キャラクター設定・理由
}

/**
 * 主要生徒ごとの就寝・起床スケジュール設定
 */
export const STUDENT_SLEEP_SCHEDULES: Record<string, SleepScheduleConfig> = {
    // 砂狼シロコ: 毎朝欠かさず早朝ロードバイク走りを日課とするため、平日・休日問わず5:30定時起床
    'シロコ': {
        bedtimeHour: 22,
        bedtimeMinute: 30,
        weekdayWakeHour: 5,
        weekdayWakeMinute: 30,
        weekendWakeHour: 5,
        weekendWakeMinute: 30,
        varianceMinutes: 0,
        notes: '毎朝ロードバイクのトレーニングがあるため、土日もきっかり5:30に起きる'
    },
    '砂狼シロコ': {
        bedtimeHour: 22,
        bedtimeMinute: 30,
        weekdayWakeHour: 5,
        weekdayWakeMinute: 30,
        weekendWakeHour: 5,
        weekendWakeMinute: 30,
        varianceMinutes: 0,
        notes: '毎朝ロードバイクのトレーニングがあるため、土日もきっかり5:30に起きる'
    },

    // 白洲アズサ: アリウス仕込みの徹底した規律と警戒心。平日・休日問わず定時起床
    'アズサ': {
        bedtimeHour: 22,
        bedtimeMinute: 0,
        weekdayWakeHour: 5,
        weekdayWakeMinute: 30,
        weekendWakeHour: 5,
        weekendWakeMinute: 30,
        varianceMinutes: 0,
        notes: '周囲の警戒を怠らず、規則正しく早起き'
    },
    '白洲アズサ': {
        bedtimeHour: 22,
        bedtimeMinute: 0,
        weekdayWakeHour: 5,
        weekdayWakeMinute: 30,
        weekendWakeHour: 5,
        weekendWakeMinute: 30,
        varianceMinutes: 0,
        notes: '周囲の警戒を怠らず、規則正しく早起き'
    },

    // 飛鳥馬トキ: C&C所属。機械のような正確さで起床
    'トキ': {
        bedtimeHour: 23,
        bedtimeMinute: 0,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 0,
        weekendWakeHour: 6,
        weekendWakeMinute: 0,
        varianceMinutes: 0,
        notes: 'エージェントとして定時起床・待機'
    },
    '飛鳥馬トキ': {
        bedtimeHour: 23,
        bedtimeMinute: 0,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 0,
        weekendWakeHour: 6,
        weekendWakeMinute: 0,
        varianceMinutes: 0,
        notes: 'エージェントとして定時起床・待機'
    },

    // 小鳥遊ホシノ: サボり魔・おじさん。平日はパトロールにギリギリ、休日は昼前まで爆睡。高ランダム
    'ホシノ': {
        bedtimeHour: 23,
        bedtimeMinute: 0,
        weekdayWakeHour: 8,
        weekdayWakeMinute: 30,
        weekendWakeHour: 10,
        weekendWakeMinute: 30,
        varianceMinutes: 45,
        notes: 'うへ〜、寝る子は育つって言うしね〜。休日はお昼前まで起きない'
    },
    '小鳥遊ホシノ': {
        bedtimeHour: 23,
        bedtimeMinute: 0,
        weekdayWakeHour: 8,
        weekdayWakeMinute: 30,
        weekendWakeHour: 10,
        weekendWakeMinute: 30,
        varianceMinutes: 45,
        notes: 'うへ〜、寝る子は育つって言うしね〜。休日はお昼前まで起きない'
    },

    // 空崎ヒナ: 風紀委員会激務で深夜1:30就寝。平日は見回りで早起き、休日は少し休む
    'ヒナ': {
        bedtimeHour: 1,
        bedtimeMinute: 30,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 15,
        weekendWakeHour: 8,
        weekendWakeMinute: 30,
        varianceMinutes: 15,
        notes: '書類仕事で就寝は深夜2時前。平日は責任感で早起き、休日は少し睡眠をとる'
    },
    '空崎ヒナ': {
        bedtimeHour: 1,
        bedtimeMinute: 30,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 15,
        weekendWakeHour: 8,
        weekendWakeMinute: 30,
        varianceMinutes: 15,
        notes: '書類仕事で就寝は深夜2時前。平日は責任感で早起き、休日は少し睡眠をとる'
    },

    // 天雨アコ: ヒナの補佐で夜更かし気味
    'アコ': {
        bedtimeHour: 1,
        bedtimeMinute: 0,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 30,
        weekendWakeHour: 8,
        weekendWakeMinute: 0,
        varianceMinutes: 15,
        notes: 'ヒナ委員長のために夜遅くまで業務、休日は平日の疲れを少し癒やす'
    },
    '天雨アコ': {
        bedtimeHour: 1,
        bedtimeMinute: 0,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 30,
        weekendWakeHour: 8,
        weekendWakeMinute: 0,
        varianceMinutes: 15,
        notes: 'ヒナ委員長のために夜遅くまで業務、休日は平日の疲れを少し癒やす'
    },

    // 陸八魔アル: アウトロー気取りで夜更かし、平日は普通に起きるが休日は遅起き
    'アル': {
        bedtimeHour: 0,
        bedtimeMinute: 30,
        weekdayWakeHour: 7,
        weekdayWakeMinute: 15,
        weekendWakeHour: 9,
        weekendWakeMinute: 30,
        varianceMinutes: 30,
        notes: 'ハードボイルドなアウトローを気取って夜更かし。休日はゆっくり起きる'
    },
    '陸八魔アル': {
        bedtimeHour: 0,
        bedtimeMinute: 30,
        weekdayWakeHour: 7,
        weekdayWakeMinute: 15,
        weekendWakeHour: 9,
        weekendWakeMinute: 30,
        varianceMinutes: 30,
        notes: 'ハードボイルドなアウトローを気取って夜更かし。休日はゆっくり起きる'
    },

    // 早瀬ユウカ: セミナー会計。極めて規則正しい生活
    'ユウカ': {
        bedtimeHour: 23,
        bedtimeMinute: 30,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 30,
        weekendWakeHour: 7,
        weekendWakeMinute: 45,
        varianceMinutes: 5,
        notes: '健康管理と計算通りの生活リズム。休日は少しだけ読書を兼ねて遅起き'
    },
    '早瀬ユウカ': {
        bedtimeHour: 23,
        bedtimeMinute: 30,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 30,
        weekendWakeHour: 7,
        weekendWakeMinute: 45,
        varianceMinutes: 5,
        notes: '健康管理と計算通りの生活リズム。休日は少しだけ読書を兼ねて遅起き'
    },

    // 阿慈谷ヒフミ: トリニティの補習授業部
    'ヒフミ': {
        bedtimeHour: 23,
        bedtimeMinute: 0,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 45,
        weekendWakeHour: 8,
        weekendWakeMinute: 30,
        varianceMinutes: 20,
        notes: '平日は登校のためしっかり起床、休日はペロログッズ発売日以外はのんびり起床'
    },
    '阿慈谷ヒフミ': {
        bedtimeHour: 23,
        bedtimeMinute: 0,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 45,
        weekendWakeHour: 8,
        weekendWakeMinute: 30,
        varianceMinutes: 20,
        notes: '平日は登校のためしっかり起床、休日はペロログッズ発売日以外はのんびり起床'
    },

    // 伊落マリー: シスターフッド。朝の祈りのため早起き
    'マリー': {
        bedtimeHour: 22,
        bedtimeMinute: 0,
        weekdayWakeHour: 5,
        weekdayWakeMinute: 45,
        weekendWakeHour: 6,
        weekendWakeMinute: 30,
        varianceMinutes: 10,
        notes: '朝の礼拝と清掃のため早起き。日曜日も礼拝準備のため早起き'
    },
    '伊落マリー': {
        bedtimeHour: 22,
        bedtimeMinute: 0,
        weekdayWakeHour: 5,
        weekdayWakeMinute: 45,
        weekendWakeHour: 6,
        weekendWakeMinute: 30,
        varianceMinutes: 10,
        notes: '朝の礼拝と清掃のため早起き。日曜日も礼拝準備のため早起き'
    },

    // 銀鏡イオリ: 風紀委員会突撃隊長。朝のトレーニング
    'イオリ': {
        bedtimeHour: 23,
        bedtimeMinute: 0,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 0,
        weekendWakeHour: 7,
        weekendWakeMinute: 15,
        varianceMinutes: 15,
        notes: '朝のランニングと見回りのため早起き'
    },
    '銀鏡イオリ': {
        bedtimeHour: 23,
        bedtimeMinute: 0,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 0,
        weekendWakeHour: 7,
        weekendWakeMinute: 15,
        varianceMinutes: 15,
        notes: '朝のランニングと見回りのため早起き'
    },

    // 角楯カリン: C&Cスナイパー
    'カリン': {
        bedtimeHour: 23,
        bedtimeMinute: 30,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 30,
        weekendWakeHour: 7,
        weekendWakeMinute: 30,
        varianceMinutes: 15,
        notes: '勉強は苦手だが任務のため朝はきちんと起きる'
    },
    '角楯カリン': {
        bedtimeHour: 23,
        bedtimeMinute: 30,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 30,
        weekendWakeHour: 7,
        weekendWakeMinute: 30,
        varianceMinutes: 15,
        notes: '勉強は苦手だが任務のため朝はきちんと起きる'
    },

    // 聖園ミカ: ティーパーティーのお姫様。深夜までMomoTalk
    'ミカ': {
        bedtimeHour: 1,
        bedtimeMinute: 0,
        weekdayWakeHour: 7,
        weekdayWakeMinute: 30,
        weekendWakeHour: 9,
        weekendWakeMinute: 30,
        varianceMinutes: 30,
        notes: '夜更かししておしゃべり。休日はお姫様らしくベッドでゴロゴロ'
    },
    '聖園ミカ': {
        bedtimeHour: 1,
        bedtimeMinute: 0,
        weekdayWakeHour: 7,
        weekdayWakeMinute: 30,
        weekendWakeHour: 9,
        weekendWakeMinute: 30,
        varianceMinutes: 30,
        notes: '夜更かししておしゃべり。休日はお姫様らしくベッドでゴロゴロ'
    },

    // 黒舘ハルナ: 美食研究会
    'ハルナ': {
        bedtimeHour: 0,
        bedtimeMinute: 0,
        weekdayWakeHour: 7,
        weekdayWakeMinute: 0,
        weekendWakeHour: 8,
        weekendWakeMinute: 30,
        varianceMinutes: 20,
        notes: '美食の探求から朝の優雅な朝食の準備'
    },
    '黒舘ハルナ': {
        bedtimeHour: 0,
        bedtimeMinute: 0,
        weekdayWakeHour: 7,
        weekdayWakeMinute: 0,
        weekendWakeHour: 8,
        weekendWakeMinute: 30,
        varianceMinutes: 20,
        notes: '美食の探求から朝の優雅な朝食の準備'
    },

    // 浅黄ムツキ: 便利屋68
    'ムツキ': {
        bedtimeHour: 0,
        bedtimeMinute: 0,
        weekdayWakeHour: 7,
        weekdayWakeMinute: 30,
        weekendWakeHour: 9,
        weekendWakeMinute: 0,
        varianceMinutes: 30,
        notes: '夜中にイタズラの仕掛けを作り、休日は気ままに起床'
    },
    '浅黄ムツキ': {
        bedtimeHour: 0,
        bedtimeMinute: 0,
        weekdayWakeHour: 7,
        weekdayWakeMinute: 30,
        weekendWakeHour: 9,
        weekendWakeMinute: 0,
        varianceMinutes: 30,
        notes: '夜中にイタズラの仕掛けを作り、休日は気ままに起床'
    },

    // 生塩ノア: セミナー書記。理知的で規則正しい生活
    'ノア': {
        bedtimeHour: 23,
        bedtimeMinute: 30,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 30,
        weekendWakeHour: 7,
        weekendWakeMinute: 30,
        varianceMinutes: 5,
        notes: 'セミナー書記として規則正しい生活。記憶の整理をして就寝'
    },
    '生塩ノア': {
        bedtimeHour: 23,
        bedtimeMinute: 30,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 30,
        weekendWakeHour: 7,
        weekendWakeMinute: 30,
        varianceMinutes: 5,
        notes: 'セミナー書記として規則正しい生活。記憶の整理をして就寝'
    },

    // 黒崎コユキ: セミナー問題児。夜更かしして朝起きるのが苦手
    'コユキ': {
        bedtimeHour: 0,
        bedtimeMinute: 30,
        weekdayWakeHour: 8,
        weekdayWakeMinute: 0,
        weekendWakeHour: 10,
        weekendWakeMinute: 0,
        varianceMinutes: 30,
        notes: '夜更かししてゲームや暗号解読。朝は寝坊してユウカに怒られがち'
    },
    '黒崎コユキ': {
        bedtimeHour: 0,
        bedtimeMinute: 30,
        weekdayWakeHour: 8,
        weekdayWakeMinute: 0,
        weekendWakeHour: 10,
        weekendWakeMinute: 0,
        varianceMinutes: 30,
        notes: '夜更かししてゲームや暗号解読。朝は寝坊してユウカに怒られがち'
    },

    // 下江コハル: 補習授業部。夜更かしを不純と警戒して早寝
    'コハル': {
        bedtimeHour: 22,
        bedtimeMinute: 0,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 30,
        weekendWakeHour: 8,
        weekendWakeMinute: 0,
        varianceMinutes: 10,
        notes: '不純異性交遊を警戒し早寝。朝は真面目に起きて補習へ'
    },
    '下江コハル': {
        bedtimeHour: 22,
        bedtimeMinute: 0,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 30,
        weekendWakeHour: 8,
        weekendWakeMinute: 0,
        varianceMinutes: 10,
        notes: '不純異性交遊を警戒し早寝。朝は真面目に起きて補習へ'
    },

    // 一之瀬アスナ: C&C。野生の直感で朝から元気
    'アスナ': {
        bedtimeHour: 23,
        bedtimeMinute: 0,
        weekdayWakeHour: 7,
        weekdayWakeMinute: 0,
        weekendWakeHour: 8,
        weekendWakeMinute: 0,
        varianceMinutes: 20,
        notes: '直感でぐっすり眠り、朝はご主人様に会えるのを楽しみに起きる'
    },
    '一之瀬アスナ': {
        bedtimeHour: 23,
        bedtimeMinute: 0,
        weekdayWakeHour: 7,
        weekdayWakeMinute: 0,
        weekendWakeHour: 8,
        weekendWakeMinute: 0,
        varianceMinutes: 20,
        notes: '直感でぐっすり眠り、朝はご主人様に会えるのを楽しみに起きる'
    },

    // 美甘ネル: C&Cリーダー。朝型で規律正しい
    'ネル': {
        bedtimeHour: 23,
        bedtimeMinute: 0,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 0,
        weekendWakeHour: 7,
        weekendWakeMinute: 30,
        varianceMinutes: 10,
        notes: 'C&Cの長として朝から身辺整理とトレーニング。早起き'
    },
    '美甘ネル': {
        bedtimeHour: 23,
        bedtimeMinute: 0,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 0,
        weekendWakeHour: 7,
        weekendWakeMinute: 30,
        varianceMinutes: 10,
        notes: 'C&Cの長として朝から身辺整理とトレーニング。早起き'
    },

    // 杏山カズサ: 放課後スイーツ部。休日はダラダラ
    'カズサ': {
        bedtimeHour: 23,
        bedtimeMinute: 30,
        weekdayWakeHour: 7,
        weekdayWakeMinute: 0,
        weekendWakeHour: 9,
        weekendWakeMinute: 0,
        varianceMinutes: 20,
        notes: '平日は登校のため起床。休日はベッドでスイーツを食べながらのんびり'
    },
    '杏山カズサ': {
        bedtimeHour: 23,
        bedtimeMinute: 30,
        weekdayWakeHour: 7,
        weekdayWakeMinute: 0,
        weekendWakeHour: 9,
        weekendWakeMinute: 0,
        varianceMinutes: 20,
        notes: '平日は登校のため起床。休日はベッドでスイーツを食べながらのんびり'
    },

    // 錠前サオリ: 元アリウススクワッド。習慣化した早朝警戒
    'サオリ': {
        bedtimeHour: 23,
        bedtimeMinute: 0,
        weekdayWakeHour: 5,
        weekdayWakeMinute: 30,
        weekendWakeHour: 6,
        weekendWakeMinute: 0,
        varianceMinutes: 5,
        notes: '戦場での習慣で曜日を問わず早朝に目覚め、周囲を警戒'
    },
    '錠前サオリ': {
        bedtimeHour: 23,
        bedtimeMinute: 0,
        weekdayWakeHour: 5,
        weekdayWakeMinute: 30,
        weekendWakeHour: 6,
        weekendWakeMinute: 0,
        varianceMinutes: 5,
        notes: '戦場での習慣で曜日を問わず早朝に目覚め、周囲を警戒'
    },

    // 春原シュン: 梅花園教官。園児たちの朝食のため早起き
    'シュン': {
        bedtimeHour: 22,
        bedtimeMinute: 30,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 0,
        weekendWakeHour: 7,
        weekendWakeMinute: 0,
        varianceMinutes: 5,
        notes: '梅花園の子供たちの世話と朝食準備のため、毎日規則正しい早起き'
    },
    '春原シュン': {
        bedtimeHour: 22,
        bedtimeMinute: 30,
        weekdayWakeHour: 6,
        weekdayWakeMinute: 0,
        weekendWakeHour: 7,
        weekendWakeMinute: 0,
        varianceMinutes: 5,
        notes: '梅花園の子供たちの世話と朝食準備のため、毎日規則正しい早起き'
    }
}

// rosterStudents.ts の生徒の生活リズム（公式プロフィールの趣味・役割に合わせた設定）
const add = (names: string[], config: SleepScheduleConfig) => names.forEach((n) => (STUDENT_SLEEP_SCHEDULES[n] = config))
add(["ケイ","天童ケイ"], { bedtimeHour: 23, bedtimeMinute: 30, weekdayWakeHour: 8, weekdayWakeMinute: 0, weekendWakeHour: 9, weekendWakeMinute: 30, varianceMinutes: 20, notes: 'アリスの世話やゲームで夜更かし気味' })
add(["セイア","百合園セイア"], { bedtimeHour: 22, bedtimeMinute: 0, weekdayWakeHour: 7, weekdayWakeMinute: 0, weekendWakeHour: 8, weekendWakeMinute: 0, varianceMinutes: 10, notes: '本を読んで早めに休み、朝はゆっくり' })
add(["ナギサ","桐藤ナギサ"], { bedtimeHour: 22, bedtimeMinute: 30, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 7, weekendWakeMinute: 30, varianceMinutes: 10, notes: '朝のお茶会の準備や庭の手入れで早起き' })
add(["カンナ","尾刃カンナ"], { bedtimeHour: 23, bedtimeMinute: 30, weekdayWakeHour: 6, weekdayWakeMinute: 0, weekendWakeHour: 7, weekendWakeMinute: 0, varianceMinutes: 10, notes: '推理映画や読書で少し夜更かし、朝は規律正しく起きる' })
add(["スズミ","守月スズミ"], { bedtimeHour: 22, bedtimeMinute: 30, weekdayWakeHour: 6, weekdayWakeMinute: 0, weekendWakeHour: 7, weekendWakeMinute: 0, varianceMinutes: 5, notes: '朝の巡回のために規則正しく早起き' })
add(["レイサ","宇沢レイサ"], { bedtimeHour: 22, bedtimeMinute: 0, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 7, weekendWakeMinute: 30, varianceMinutes: 15, notes: '元気に早寝早起き' })
add(["ニコ","吉野ニコ"], { bedtimeHour: 22, bedtimeMinute: 30, weekdayWakeHour: 5, weekdayWakeMinute: 30, weekendWakeHour: 7, weekendWakeMinute: 0, varianceMinutes: 10, notes: '小隊のお弁当作りのため平日は早起き' })
add(["ミヨ","桜井ミヨ"], { bedtimeHour: 0, bedtimeMinute: 30, weekdayWakeHour: 8, weekdayWakeMinute: 0, weekendWakeHour: 10, weekendWakeMinute: 0, varianceMinutes: 30, notes: '夜に小説を書くため遅寝' })
add(["モモイ","才羽モモイ"], { bedtimeHour: 1, bedtimeMinute: 0, weekdayWakeHour: 8, weekdayWakeMinute: 30, weekendWakeHour: 11, weekendWakeMinute: 0, varianceMinutes: 40, notes: 'ゲームで夜更かしし、休日は昼近くまで寝る' })
add(["イロハ","棗イロハ"], { bedtimeHour: 0, bedtimeMinute: 0, weekdayWakeHour: 9, weekdayWakeMinute: 0, weekendWakeHour: 11, weekendWakeMinute: 30, varianceMinutes: 30, notes: '読書で夜更かし、極度のサボり魔で朝は弱い' })
add(["フウカ","愛清フウカ"], { bedtimeHour: 22, bedtimeMinute: 0, weekdayWakeHour: 4, weekdayWakeMinute: 30, weekendWakeHour: 6, weekendWakeMinute: 30, varianceMinutes: 10, notes: '学園全体の給食の仕込みのため早起き' })
add(["ハナコ","浦和ハナコ"], { bedtimeHour: 0, bedtimeMinute: 30, weekdayWakeHour: 8, weekdayWakeMinute: 30, weekendWakeHour: 10, weekendWakeMinute: 30, varianceMinutes: 30, notes: '夜の散歩（徘徊）をするため遅寝' })

// 追加生徒の生活リズム（趣味や所属の特徴に合わせた設定）
add(["エイミ","和泉元エイミ"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 7, weekdayWakeMinute: 30, weekendWakeHour: 9, weekendWakeMinute: 0, varianceMinutes: 20, notes: 'ぼんやり過ごす時間が多く、生活は少しゆるやか' })
add(["マキ","小塗マキ"], { bedtimeHour: 1, bedtimeMinute: 0, weekdayWakeHour: 9, weekdayWakeMinute: 0, weekendWakeHour: 11, weekendWakeMinute: 30, varianceMinutes: 40, notes: 'グラフィティとゲームで夜更かし' })
add(["スミレ","乙花スミレ"], { bedtimeHour: 21, bedtimeMinute: 30, weekdayWakeHour: 5, weekdayWakeMinute: 30, weekendWakeHour: 6, weekendWakeMinute: 30, varianceMinutes: 5, notes: '朝のトレーニングのため早寝早起き' })
add(["アカネ","室笠アカネ"], { bedtimeHour: 22, bedtimeMinute: 30, weekdayWakeHour: 5, weekdayWakeMinute: 30, weekendWakeHour: 7, weekendWakeMinute: 0, varianceMinutes: 5, notes: 'メイドの務めで早起き' })
add(["コトリ","豊見コトリ"], { bedtimeHour: 0, bedtimeMinute: 0, weekdayWakeHour: 8, weekdayWakeMinute: 30, weekendWakeHour: 10, weekendWakeMinute: 30, varianceMinutes: 30, notes: '機械いじりや物理の話で夜更かし' })
add(["ヒビキ","猫塚ヒビキ"], { bedtimeHour: 0, bedtimeMinute: 0, weekdayWakeHour: 8, weekdayWakeMinute: 30, weekendWakeHour: 10, weekendWakeMinute: 30, varianceMinutes: 25, notes: '作業に没頭して夜更かし' })
add(["ハレ","小鈎ハレ"], { bedtimeHour: 1, bedtimeMinute: 30, weekdayWakeHour: 10, weekdayWakeMinute: 0, weekendWakeHour: 12, weekendWakeMinute: 0, varianceMinutes: 40, notes: 'ゲームや映画で夜更かし' })
add(["ウタハ","白石ウタハ"], { bedtimeHour: 1, bedtimeMinute: 0, weekdayWakeHour: 8, weekdayWakeMinute: 30, weekendWakeHour: 10, weekendWakeMinute: 30, varianceMinutes: 30, notes: '発明に熱中して夜更かし' })
add(["コタマ","音瀬コタマ"], { bedtimeHour: 2, bedtimeMinute: 0, weekdayWakeHour: 10, weekdayWakeMinute: 0, weekendWakeHour: 12, weekendWakeMinute: 0, varianceMinutes: 40, notes: 'ネットと無線で夜型' })
add(["ミドリ","才羽ミドリ"], { bedtimeHour: 0, bedtimeMinute: 0, weekdayWakeHour: 8, weekdayWakeMinute: 0, weekendWakeHour: 10, weekendWakeMinute: 0, varianceMinutes: 25, notes: 'ゲームとお絵かきで夜更かし' })
add(["ユズ","花岡ユズ"], { bedtimeHour: 2, bedtimeMinute: 0, weekdayWakeHour: 10, weekdayWakeMinute: 0, weekendWakeHour: 12, weekendWakeMinute: 30, varianceMinutes: 40, notes: 'ゲーム制作で夜型' })
add(["チヒロ","各務チヒロ"], { bedtimeHour: 0, bedtimeMinute: 30, weekdayWakeHour: 8, weekdayWakeMinute: 0, weekendWakeHour: 10, weekendWakeMinute: 0, varianceMinutes: 25, notes: '機材いじりで夜更かし' })
add(["レイ","野正レイ"], { bedtimeHour: 22, bedtimeMinute: 0, weekdayWakeHour: 6, weekdayWakeMinute: 0, weekendWakeHour: 7, weekendWakeMinute: 30, varianceMinutes: 10, notes: '野球の朝練がある' })
add(["イズミ","獅子堂イズミ"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 7, weekdayWakeMinute: 30, weekendWakeHour: 9, weekendWakeMinute: 30, varianceMinutes: 20, notes: '食べ物の夢を見てゆっくり起きる' })
add(["アカリ","鰐渕アカリ"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 7, weekdayWakeMinute: 30, weekendWakeHour: 9, weekendWakeMinute: 30, varianceMinutes: 20, notes: '食べ歩きで少し遅め' })
add(["ジュンコ","赤司ジュンコ"], { bedtimeHour: 23, bedtimeMinute: 30, weekdayWakeHour: 7, weekdayWakeMinute: 30, weekendWakeHour: 9, weekendWakeMinute: 30, varianceMinutes: 20, notes: '美食研究会の活動で少し遅め' })
add(["ハルカ","伊草ハルカ"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 8, weekendWakeMinute: 0, varianceMinutes: 15, notes: 'アル様のために早起きして支度する' })
add(["チナツ","火宮チナツ"], { bedtimeHour: 22, bedtimeMinute: 30, weekdayWakeHour: 6, weekdayWakeMinute: 0, weekendWakeHour: 7, weekendWakeMinute: 0, varianceMinutes: 5, notes: '風紀委員の務めで規則正しい' })
add(["ジュリ","牛牧ジュリ"], { bedtimeHour: 22, bedtimeMinute: 0, weekdayWakeHour: 5, weekdayWakeMinute: 0, weekendWakeHour: 7, weekendWakeMinute: 0, varianceMinutes: 10, notes: '給食部の朝は早い' })
add(["セナ","氷室セナ"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 6, weekdayWakeMinute: 0, weekendWakeHour: 7, weekendWakeMinute: 30, varianceMinutes: 10, notes: '待機で早めに起きる' })
add(["メグ","下倉メグ"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 7, weekdayWakeMinute: 0, weekendWakeHour: 8, weekendWakeMinute: 30, varianceMinutes: 20, notes: '温泉開発で動き回る' })
add(["カスミ","鬼怒川カスミ"], { bedtimeHour: 0, bedtimeMinute: 0, weekdayWakeHour: 8, weekdayWakeMinute: 30, weekendWakeHour: 10, weekendWakeMinute: 0, varianceMinutes: 30, notes: '爆破の準備で夜更かし' })
add(["イブキ","丹花イブキ"], { bedtimeHour: 21, bedtimeMinute: 30, weekdayWakeHour: 7, weekdayWakeMinute: 0, weekendWakeHour: 8, weekendWakeMinute: 30, varianceMinutes: 10, notes: '年少なので早寝' })
add(["マコト","羽沼マコト"], { bedtimeHour: 0, bedtimeMinute: 30, weekdayWakeHour: 9, weekdayWakeMinute: 0, weekendWakeHour: 11, weekendWakeMinute: 0, varianceMinutes: 30, notes: '悪巧みで夜更かし' })
add(["キララ","夜桜キララ"], { bedtimeHour: 0, bedtimeMinute: 30, weekdayWakeHour: 8, weekdayWakeMinute: 30, weekendWakeHour: 10, weekendWakeMinute: 30, varianceMinutes: 30, notes: '夜までおしゃべり' })
add(["サツキ","京極サツキ"], { bedtimeHour: 1, bedtimeMinute: 0, weekdayWakeHour: 9, weekdayWakeMinute: 0, weekendWakeHour: 11, weekendWakeMinute: 0, varianceMinutes: 30, notes: '実験で夜更かし' })
add(["チアキ","元宮チアキ"], { bedtimeHour: 0, bedtimeMinute: 0, weekdayWakeHour: 8, weekdayWakeMinute: 0, weekendWakeHour: 9, weekendWakeMinute: 30, varianceMinutes: 25, notes: '週刊万魔殿の編集で夜更かし' })
add(["エリカ"], { bedtimeHour: 23, bedtimeMinute: 30, weekdayWakeHour: 8, weekdayWakeMinute: 0, weekendWakeHour: 10, weekendWakeMinute: 0, varianceMinutes: 25, notes: 'のんびりした生活リズム' })
add(["ツルギ","剣先ツルギ"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 7, weekdayWakeMinute: 0, weekendWakeHour: 8, weekendWakeMinute: 30, varianceMinutes: 15, notes: '映画や読書で少し夜更かし' })
add(["ハスミ","羽川ハスミ"], { bedtimeHour: 22, bedtimeMinute: 30, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 8, weekendWakeMinute: 0, varianceMinutes: 10, notes: '規則正しく、朝は読書' })
add(["アイリ","栗村アイリ"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 7, weekdayWakeMinute: 30, weekendWakeHour: 9, weekendWakeMinute: 0, varianceMinutes: 20, notes: 'スイーツ巡りで少しゆっくり' })
add(["ハナエ","朝顔ハナエ"], { bedtimeHour: 22, bedtimeMinute: 0, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 8, weekendWakeMinute: 0, varianceMinutes: 10, notes: '朝はダンスの練習' })
add(["セリナ","鷲見セリナ"], { bedtimeHour: 22, bedtimeMinute: 0, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 7, weekendWakeMinute: 30, varianceMinutes: 10, notes: 'ボランティアで早め' })
add(["シミコ","円堂シミコ"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 7, weekdayWakeMinute: 0, weekendWakeHour: 8, weekendWakeMinute: 30, varianceMinutes: 15, notes: '読書で少し夜更かし' })
add(["ヨシミ","伊原木ヨシミ"], { bedtimeHour: 22, bedtimeMinute: 30, weekdayWakeHour: 7, weekdayWakeMinute: 0, weekendWakeHour: 8, weekendWakeMinute: 30, varianceMinutes: 15, notes: '限定スイーツ巡りの準備' })
add(["マシロ","静山マシロ"], { bedtimeHour: 22, bedtimeMinute: 0, weekdayWakeHour: 6, weekdayWakeMinute: 0, weekendWakeHour: 7, weekendWakeMinute: 30, varianceMinutes: 10, notes: '実直で早寝早起き' })
add(["ナツ","柚鳥ナツ"], { bedtimeHour: 0, bedtimeMinute: 0, weekdayWakeHour: 8, weekdayWakeMinute: 0, weekendWakeHour: 10, weekendWakeMinute: 0, varianceMinutes: 30, notes: '思索にふけって夜更かし' })
add(["ウイ","古関ウイ"], { bedtimeHour: 0, bedtimeMinute: 0, weekdayWakeHour: 8, weekdayWakeMinute: 0, weekendWakeHour: 10, weekendWakeMinute: 0, varianceMinutes: 25, notes: '古書を読み耽る' })
add(["ヒナタ","若葉ヒナタ"], { bedtimeHour: 22, bedtimeMinute: 0, weekdayWakeHour: 5, weekdayWakeMinute: 30, weekendWakeHour: 7, weekendWakeMinute: 0, varianceMinutes: 5, notes: '朝のお祈りがある' })
add(["ミネ","蒼森ミネ"], { bedtimeHour: 22, bedtimeMinute: 0, weekdayWakeHour: 5, weekdayWakeMinute: 30, weekendWakeHour: 6, weekendWakeMinute: 30, varianceMinutes: 5, notes: '救護の備えで早起き' })
add(["サクラコ","歌住サクラコ"], { bedtimeHour: 21, bedtimeMinute: 30, weekdayWakeHour: 5, weekdayWakeMinute: 30, weekendWakeHour: 6, weekendWakeMinute: 30, varianceMinutes: 5, notes: '朝のお祈りのため早寝早起き' })
add(["イチカ","仲正イチカ"], { bedtimeHour: 23, bedtimeMinute: 30, weekdayWakeHour: 7, weekdayWakeMinute: 30, weekendWakeHour: 9, weekendWakeMinute: 0, varianceMinutes: 20, notes: '人助けで動き回る' })
add(["ラブ"], { bedtimeHour: 1, bedtimeMinute: 0, weekdayWakeHour: 9, weekdayWakeMinute: 30, weekendWakeHour: 12, weekendWakeMinute: 0, varianceMinutes: 40, notes: '夜遊びで夜型' })
add(["チセ","和楽チセ"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 8, weekdayWakeMinute: 0, weekendWakeHour: 9, weekendWakeMinute: 30, varianceMinutes: 25, notes: '空を眺めて夜更かし' })
add(["ツバキ","春日ツバキ"], { bedtimeHour: 21, bedtimeMinute: 30, weekdayWakeHour: 8, weekdayWakeMinute: 30, weekendWakeHour: 11, weekendWakeMinute: 0, varianceMinutes: 30, notes: '昼寝好きで朝が弱い' })
add(["フィーナ","朝比奈フィーナ"], { bedtimeHour: 22, bedtimeMinute: 30, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 8, weekendWakeMinute: 0, varianceMinutes: 10, notes: '人助けのため元気に早起き' })
add(["シズコ","河和シズコ"], { bedtimeHour: 22, bedtimeMinute: 30, weekdayWakeHour: 6, weekdayWakeMinute: 0, weekendWakeHour: 7, weekendWakeMinute: 30, varianceMinutes: 10, notes: '百夜堂の仕込みで早起き' })
add(["イズナ","久田イズナ"], { bedtimeHour: 21, bedtimeMinute: 30, weekdayWakeHour: 5, weekdayWakeMinute: 30, weekendWakeHour: 6, weekendWakeMinute: 30, varianceMinutes: 5, notes: '忍者の朝練で早寝早起き' })
add(["ミモリ","水羽ミモリ"], { bedtimeHour: 22, bedtimeMinute: 30, weekdayWakeHour: 6, weekdayWakeMinute: 0, weekendWakeHour: 7, weekendWakeMinute: 30, varianceMinutes: 5, notes: '家事のため規則正しい' })
add(["カエデ","勇美カエデ"], { bedtimeHour: 22, bedtimeMinute: 0, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 8, weekendWakeMinute: 0, varianceMinutes: 15, notes: '元気に早起き' })
add(["ツクヨ","大野ツクヨ"], { bedtimeHour: 22, bedtimeMinute: 30, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 8, weekendWakeMinute: 0, varianceMinutes: 10, notes: '忍術の修行で規則正しい' })
add(["ミチル","千鳥ミチル"], { bedtimeHour: 0, bedtimeMinute: 30, weekdayWakeHour: 9, weekdayWakeMinute: 0, weekendWakeHour: 11, weekendWakeMinute: 0, varianceMinutes: 35, notes: '動画編集で夜更かし' })
add(["カホ","桑上カホ"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 8, weekendWakeMinute: 0, varianceMinutes: 10, notes: '広報の仕事で早め' })
add(["ユカリ","勘解由小路ユカリ"], { bedtimeHour: 22, bedtimeMinute: 0, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 8, weekendWakeMinute: 0, varianceMinutes: 10, notes: 'お祈りのため早め' })
add(["レンゲ","不破レンゲ"], { bedtimeHour: 22, bedtimeMinute: 0, weekdayWakeHour: 5, weekdayWakeMinute: 30, weekendWakeHour: 7, weekendWakeMinute: 0, varianceMinutes: 10, notes: '朝の鍛錬がある' })
add(["キキョウ","桐生キキョウ"], { bedtimeHour: 22, bedtimeMinute: 30, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 8, weekendWakeMinute: 0, varianceMinutes: 10, notes: '日光浴のため朝は早い' })
add(["ウミカ","里浜ウミカ"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 7, weekdayWakeMinute: 0, weekendWakeHour: 8, weekendWakeMinute: 30, varianceMinutes: 15, notes: 'お祭りの情報を調べて夜更かし' })
add(["ナグサ","御稜ナグサ"], { bedtimeHour: 23, bedtimeMinute: 30, weekdayWakeHour: 8, weekdayWakeMinute: 0, weekendWakeHour: 9, weekendWakeMinute: 30, varianceMinutes: 20, notes: '瞑想と読書で夜更かし' })
add(["ニヤ","天地ニヤ"], { bedtimeHour: 1, bedtimeMinute: 0, weekdayWakeHour: 10, weekdayWakeMinute: 0, weekendWakeHour: 12, weekendWakeMinute: 0, varianceMinutes: 40, notes: '働かない部長で夜型' })
add(["サヤ","薬子サヤ"], { bedtimeHour: 1, bedtimeMinute: 0, weekdayWakeHour: 9, weekdayWakeMinute: 30, weekendWakeHour: 11, weekendWakeMinute: 30, varianceMinutes: 35, notes: '研究で夜更かし' })
add(["ココナ","春原ココナ"], { bedtimeHour: 21, bedtimeMinute: 0, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 8, weekendWakeMinute: 0, varianceMinutes: 10, notes: '年少なので早寝' })
add(["ルミ","朱城ルミ"], { bedtimeHour: 22, bedtimeMinute: 30, weekdayWakeHour: 5, weekdayWakeMinute: 30, weekendWakeHour: 7, weekendWakeMinute: 0, varianceMinutes: 10, notes: '商会の仕込みや料理で早起き' })
add(["ミナ","近衛ミナ"], { bedtimeHour: 23, bedtimeMinute: 30, weekdayWakeHour: 6, weekdayWakeMinute: 0, weekendWakeHour: 7, weekendWakeMinute: 30, varianceMinutes: 10, notes: '夜は映画鑑賞' })
add(["レイジョ","鹿山レイジョ"], { bedtimeHour: 22, bedtimeMinute: 0, weekdayWakeHour: 5, weekdayWakeMinute: 30, weekendWakeHour: 6, weekendWakeMinute: 30, varianceMinutes: 5, notes: 'カンフーの朝練がある' })
add(["アヤネ","奥空アヤネ"], { bedtimeHour: 22, bedtimeMinute: 30, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 7, weekendWakeMinute: 30, varianceMinutes: 5, notes: '規則正しい生活' })
add(["ノドカ","天見ノドカ"], { bedtimeHour: 1, bedtimeMinute: 0, weekdayWakeHour: 8, weekdayWakeMinute: 30, weekendWakeHour: 10, weekendWakeMinute: 30, varianceMinutes: 30, notes: '天体観測で夜更かし' })
add(["チェリノ","連河チェリノ"], { bedtimeHour: 22, bedtimeMinute: 0, weekdayWakeHour: 7, weekdayWakeMinute: 0, weekendWakeHour: 8, weekendWakeMinute: 30, varianceMinutes: 15, notes: '会長なので意外と規則的' })
add(["トモエ","佐城トモエ"], { bedtimeHour: 23, bedtimeMinute: 30, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 8, weekendWakeMinute: 0, varianceMinutes: 10, notes: '秘書の仕事で早起き' })
add(["マリナ","池倉マリナ"], { bedtimeHour: 22, bedtimeMinute: 30, weekdayWakeHour: 5, weekdayWakeMinute: 30, weekendWakeHour: 7, weekendWakeMinute: 0, varianceMinutes: 10, notes: '朝の散歩（突撃）' })
add(["シグレ","間宵シグレ"], { bedtimeHour: 23, bedtimeMinute: 30, weekdayWakeHour: 8, weekdayWakeMinute: 0, weekendWakeHour: 10, weekendWakeMinute: 0, varianceMinutes: 25, notes: 'ドリンクの研究で夜更かし' })
add(["ミノリ","安守ミノリ"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 8, weekdayWakeMinute: 0, weekendWakeHour: 10, weekendWakeMinute: 30, varianceMinutes: 25, notes: '労働は定時で終えたい' })
add(["メル","姫木メル"], { bedtimeHour: 2, bedtimeMinute: 0, weekdayWakeHour: 10, weekdayWakeMinute: 0, weekendWakeHour: 12, weekendWakeMinute: 0, varianceMinutes: 40, notes: '漫画を描いて夜更かし' })
add(["モミジ","秋泉モミジ"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 7, weekdayWakeMinute: 0, weekendWakeHour: 8, weekendWakeMinute: 30, varianceMinutes: 15, notes: '読書で少し夜更かし' })
add(["タカネ"], { bedtimeHour: 0, bedtimeMinute: 30, weekdayWakeHour: 8, weekdayWakeMinute: 30, weekendWakeHour: 10, weekendWakeMinute: 0, varianceMinutes: 25, notes: '批評を書いて夜更かし' })
add(["ヤクモ"], { bedtimeHour: 0, bedtimeMinute: 0, weekdayWakeHour: 7, weekdayWakeMinute: 30, weekendWakeHour: 9, weekendWakeMinute: 30, varianceMinutes: 20, notes: '編集作業で夜更かし' })
add(["アンナ"], { bedtimeHour: 23, bedtimeMinute: 30, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 8, weekendWakeMinute: 0, varianceMinutes: 10, notes: '仕事で遅めに寝る' })
add(["エリナ"], { bedtimeHour: 0, bedtimeMinute: 0, weekdayWakeHour: 9, weekdayWakeMinute: 0, weekendWakeHour: 11, weekendWakeMinute: 0, varianceMinutes: 30, notes: '休みたがりで朝が遅い' })
add(["キリノ","中務キリノ"], { bedtimeHour: 22, bedtimeMinute: 30, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 8, weekendWakeMinute: 0, varianceMinutes: 10, notes: '警察官を目指して早起き' })
add(["フブキ","合歓垣フブキ"], { bedtimeHour: 23, bedtimeMinute: 30, weekdayWakeHour: 9, weekdayWakeMinute: 0, weekendWakeHour: 10, weekendWakeMinute: 30, varianceMinutes: 25, notes: 'のんびり屋で朝が遅い' })
add(["コノカ"], { bedtimeHour: 0, bedtimeMinute: 30, weekdayWakeHour: 8, weekdayWakeMinute: 30, weekendWakeHour: 10, weekendWakeMinute: 0, varianceMinutes: 25, notes: 'スマホで夜更かし' })
add(["初音ミク"], { bedtimeHour: 0, bedtimeMinute: 0, weekdayWakeHour: 8, weekdayWakeMinute: 0, weekendWakeHour: 9, weekendWakeMinute: 30, varianceMinutes: 20, notes: 'ライブの準備で夜更かし' })
add(["ミヤコ","月雪ミヤコ"], { bedtimeHour: 22, bedtimeMinute: 0, weekdayWakeHour: 5, weekdayWakeMinute: 30, weekendWakeHour: 6, weekendWakeMinute: 30, varianceMinutes: 0, notes: '隊長として規律を守る' })
add(["サキ","空井サキ"], { bedtimeHour: 22, bedtimeMinute: 0, weekdayWakeHour: 5, weekdayWakeMinute: 30, weekendWakeHour: 6, weekendWakeMinute: 30, varianceMinutes: 0, notes: '規則や教範を重んじる' })
add(["ミユ","霞沢ミユ"], { bedtimeHour: 0, bedtimeMinute: 30, weekdayWakeHour: 9, weekdayWakeMinute: 0, weekendWakeHour: 11, weekendWakeMinute: 0, varianceMinutes: 30, notes: '妄想にふけって夜更かし' })
add(["モエ","風倉モエ"], { bedtimeHour: 0, bedtimeMinute: 0, weekdayWakeHour: 8, weekdayWakeMinute: 0, weekendWakeHour: 9, weekendWakeMinute: 30, varianceMinutes: 25, notes: '花火や爆薬の準備で夜更かし' })
add(["クルミ"], { bedtimeHour: 23, bedtimeMinute: 30, weekdayWakeHour: 7, weekdayWakeMinute: 0, weekendWakeHour: 8, weekendWakeMinute: 30, varianceMinutes: 15, notes: 'マイペースに過ごす' })
add(["オトギ"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 7, weekdayWakeMinute: 0, weekendWakeHour: 8, weekendWakeMinute: 30, varianceMinutes: 15, notes: '静かに夜を過ごす' })
add(["ミサキ","戒野ミサキ"], { bedtimeHour: 1, bedtimeMinute: 0, weekdayWakeHour: 9, weekdayWakeMinute: 30, weekendWakeHour: 12, weekendWakeMinute: 0, varianceMinutes: 30, notes: 'ひとりで夜更かし' })
add(["ヒヨリ","槌永ヒヨリ"], { bedtimeHour: 0, bedtimeMinute: 30, weekdayWakeHour: 9, weekdayWakeMinute: 0, weekendWakeHour: 11, weekendWakeMinute: 0, varianceMinutes: 25, notes: '雑誌を読んで夜更かし' })
add(["アツコ","秤アツコ"], { bedtimeHour: 22, bedtimeMinute: 30, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 8, weekendWakeMinute: 0, varianceMinutes: 10, notes: '朝は花の手入れ' })
add(["スバル"], { bedtimeHour: 22, bedtimeMinute: 0, weekdayWakeHour: 6, weekdayWakeMinute: 0, weekendWakeHour: 7, weekendWakeMinute: 30, varianceMinutes: 5, notes: '毎日着実に規則正しい' })
add(["御坂美琴"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 7, weekdayWakeMinute: 0, weekendWakeHour: 8, weekendWakeMinute: 30, varianceMinutes: 15, notes: '学園都市の中学生らしい生活' })
add(["食蜂操祈"], { bedtimeHour: 0, bedtimeMinute: 0, weekdayWakeHour: 8, weekdayWakeMinute: 30, weekendWakeHour: 10, weekendWakeMinute: 0, varianceMinutes: 20, notes: '派閥の用事で夜更かし' })
add(["佐天涙子"], { bedtimeHour: 23, bedtimeMinute: 30, weekdayWakeHour: 7, weekdayWakeMinute: 30, weekendWakeHour: 9, weekendWakeMinute: 0, varianceMinutes: 20, notes: '都市伝説を調べて夜更かし' })
add(["ヒカリ","橘ヒカリ"], { bedtimeHour: 0, bedtimeMinute: 30, weekdayWakeHour: 9, weekdayWakeMinute: 0, weekendWakeHour: 11, weekendWakeMinute: 30, varianceMinutes: 30, notes: 'ゲームで夜更かしし、朝は弱い' })
add(["ノゾミ","橘ノゾミ"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 7, weekdayWakeMinute: 0, weekendWakeHour: 8, weekendWakeMinute: 30, varianceMinutes: 15, notes: '元気に早起き' })
add(["アオバ"], { bedtimeHour: 23, bedtimeMinute: 30, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 8, weekendWakeMinute: 0, varianceMinutes: 10, notes: '貨物管理の早朝作業がある' })
add(["エリ","白尾エリ"], { bedtimeHour: 1, bedtimeMinute: 0, weekdayWakeHour: 9, weekdayWakeMinute: 0, weekendWakeHour: 11, weekendWakeMinute: 0, varianceMinutes: 35, notes: 'オカルトの研究で夜更かし' })
add(["カノエ"], { bedtimeHour: 2, bedtimeMinute: 0, weekdayWakeHour: 10, weekdayWakeMinute: 0, weekendWakeHour: 12, weekendWakeMinute: 0, varianceMinutes: 40, notes: '妄想にふけって夜型' })
add(["フユ"], { bedtimeHour: 0, bedtimeMinute: 30, weekdayWakeHour: 9, weekdayWakeMinute: 0, weekendWakeHour: 11, weekendWakeMinute: 0, varianceMinutes: 30, notes: '創作で夜更かし' })
add(["リツ"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 7, weekdayWakeMinute: 30, weekendWakeHour: 9, weekendWakeMinute: 0, varianceMinutes: 20, notes: '石探しのため意外と早起き' })
add(["レナ"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 7, weekdayWakeMinute: 30, weekendWakeHour: 9, weekendWakeMinute: 0, varianceMinutes: 20, notes: '怖がりで夜は早めに寝る' })
add(["ツムギ","椎名ツムギ"], { bedtimeHour: 0, bedtimeMinute: 30, weekdayWakeHour: 8, weekdayWakeMinute: 30, weekendWakeHour: 10, weekendWakeMinute: 30, varianceMinutes: 25, notes: '夜に詩作をして夜更かし' })
add(["ココロ"], { bedtimeHour: 22, bedtimeMinute: 0, weekdayWakeHour: 5, weekdayWakeMinute: 30, weekendWakeHour: 6, weekendWakeMinute: 30, varianceMinutes: 5, notes: '隊長として規律正しい' })
add(["コトネ","淵上琴音"], { bedtimeHour: 23, bedtimeMinute: 0, weekdayWakeHour: 6, weekdayWakeMinute: 30, weekendWakeHour: 8, weekendWakeMinute: 0, varianceMinutes: 10, notes: '夜は無線通信' })

/**
 * 未登録生徒向けのデフォルト生活リズム
 */
export const DEFAULT_SLEEP_SCHEDULE: SleepScheduleConfig = {
    bedtimeHour: 23,
    bedtimeMinute: 0,
    weekdayWakeHour: 7,
    weekdayWakeMinute: 0,
    weekendWakeHour: 8,
    weekendWakeMinute: 30,
    varianceMinutes: 15,
    notes: '一般的なキヴォトス生徒の生活リズム'
}

/**
 * 生徒名やオブジェクトからスケジュールを取得
 */
export function getStudentSleepSchedule(student: any): SleepScheduleConfig {
    if (!student) return DEFAULT_SLEEP_SCHEDULE

    const name = typeof student === 'string'
        ? student.trim()
        : (typeof student === 'object' && student.Name ? student.Name.trim() : '')

    // Exact names only. A substring match gave ウミカ the schedule of ミカ (and サキ that of ミサキ).
    if (STUDENT_SLEEP_SCHEDULES[name]) return STUDENT_SLEEP_SCHEDULES[name]

    // Outfit suffixes (「ミカ（水着）」「シロコ＊テラー」) and other-language names resolve to the base student.
    const canonical = resolveCanonicalStudent(name)
    if (canonical) {
        for (const key of canonical.names.jp) {
            if (STUDENT_SLEEP_SCHEDULES[key]) return STUDENT_SLEEP_SCHEDULES[key]
        }
    }

    return DEFAULT_SLEEP_SCHEDULE
}

/**
 * 日付と生徒キーから決定論的なハッシュ値を生成
 */
function getDailySeed(date: Date, studentKey: string): number {
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    const str = `${dateStr}-${studentKey}`
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) | 0
    }
    return hash
}

/**
 * その日の起床時間のばらつき（分）を算出（その日1日は値が固定される決定論的乱数）
 */
export function getDailyVarianceMinutes(studentKey: string, date: Date, maxVariance: number): number {
    if (maxVariance <= 0) return 0
    const hash = Math.abs(getDailySeed(date, studentKey))
    // -maxVariance 〜 +maxVariance の範囲
    return (hash % (maxVariance * 2 + 1)) - maxVariance
}

/**
 * 指定日の生徒の起床時間を計算（平日/休日判定＋ばらつき適用）
 */
export function getStudentDailyWakeTime(student: any, date: Date = new Date()): Date {
    const schedule = getStudentSleepSchedule(student)
    const studentName = typeof student === 'string' ? student : (student?.Name || 'student')

    const dayOfWeek = date.getDay() // 0=日, 6=土
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    let baseHour = isWeekend ? schedule.weekendWakeHour : schedule.weekdayWakeHour
    let baseMinute = isWeekend ? schedule.weekendWakeMinute : schedule.weekdayWakeMinute

    const variance = getDailyVarianceMinutes(studentName, date, schedule.varianceMinutes)

    const wakeDate = new Date(date)
    wakeDate.setHours(baseHour, baseMinute + variance, 0, 0)
    return wakeDate
}

/**
 * 生徒が現在就寝中かどうかを判定
 */
export function isStudentSleeping(
    student: any,
    now: Date = new Date()
): { isSleeping: boolean; wakeTime: Date; bedTime: Date } {
    const schedule = getStudentSleepSchedule(student)
    const studentName = typeof student === 'string' ? student : (student?.Name || 'student')

    const todayWake = getStudentDailyWakeTime(student, now)
    const bedtimeHour = schedule.bedtimeHour
    const bedtimeMinute = schedule.bedtimeMinute || 0

    // 就寝時刻が 12:00 以降（通常の夜 22:00〜23:30 など）
    if (bedtimeHour >= 12) {
        // 現在時刻が今朝の起床時刻より前（例: 深夜 02:00 や 04:00）
        if (now.getTime() < todayWake.getTime()) {
            const yesterdayBed = new Date(now)
            yesterdayBed.setDate(yesterdayBed.getDate() - 1)
            yesterdayBed.setHours(bedtimeHour, bedtimeMinute, 0, 0)

            return {
                isSleeping: true,
                wakeTime: todayWake,
                bedTime: yesterdayBed
            }
        }

        // 現在時刻が今日の就寝時刻以降（例: 夜 23:15）
        const todayBed = new Date(now)
        todayBed.setHours(bedtimeHour, bedtimeMinute, 0, 0)

        if (now.getTime() >= todayBed.getTime()) {
            // 明朝の起床時刻を計算
            const tomorrow = new Date(now)
            tomorrow.setDate(tomorrow.getDate() + 1)
            const tomorrowWake = getStudentDailyWakeTime(student, tomorrow)

            return {
                isSleeping: true,
                wakeTime: tomorrowWake,
                bedTime: todayBed
            }
        }

        // 昼間〜就寝前（覚醒中）
        return {
            isSleeping: false,
            wakeTime: todayWake,
            bedTime: todayBed
        }
    } else {
        // 就寝時刻が日付変更後（ヒナ等の深夜 01:30）
        const todayBed = new Date(now)
        todayBed.setHours(bedtimeHour, bedtimeMinute, 0, 0)

        // 00:00 〜 01:30（まだ起きて活動中）
        if (now.getTime() < todayBed.getTime()) {
            return {
                isSleeping: false,
                wakeTime: todayWake,
                bedTime: todayBed
            }
        }

        // 01:30 〜 起床時刻（就寝中）
        if (now.getTime() < todayWake.getTime()) {
            return {
                isSleeping: true,
                wakeTime: todayWake,
                bedTime: todayBed
            }
        }

        // 起床後（覚醒中）
        return {
            isSleeping: false,
            wakeTime: todayWake,
            bedTime: todayBed
        }
    }
}

/**
 * 起床時に先生へ返信する際に追加するシステムプロンプト指示
 */
export function getWakeupSystemPromptModifier(studentName: string, userMessages: string[]): string {
    const msgList = userMessages.map((m, i) => `${i + 1}. 「${m}」`).join('\n')
    return `
#起床時（朝のメッセージ返信）コンテキスト
- 現在はあなたの起床時間です。
- あなたが就寝している間に、先生から以下のメッセージが届いていました：
${msgList}
- あなたは寝ていたため、今朝起きてこのメッセージに初めて気づきました。
- 【重要】生徒（${studentName}）自身の口調・一人称・口癖だけを使い、朝の挨拶とともに、寝ていて返信が遅くなったこと（昨日はもう寝ていたこと）に軽く触れながら、先生のメッセージに対して自然に返信してください。他の生徒の口癖や言い回しは使わないこと。
`
}
