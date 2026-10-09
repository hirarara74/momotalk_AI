import type { CharacterVisualProfile } from './types'
import { ROSTER_STUDENTS } from '../ai/rosterStudents'

/**
 * Danbooru visual profile dictionary for the prompt-supported Blue Archive students + Arona.
 * Each entry provides canonical tags for character copyright, halo geometry, hair, eyes,
 * unique anatomical traits (kemomimi, wings, horns), and outfits.
 */
export const STUDENT_VISUAL_PROFILES: Record<number, CharacterVisualProfile> = {
  13005: {
    characterTag: 'onikata_kayoko_(blue_archive)',
    halo: ['halo', 'glowing_halo'],
    hair: ["white_hair","black_hair","two_tone_hair","ponytail"],
    eyes: ["red_eyes"],
    features: ["horns"],
    outfits: { default: ["black_hoodie","white_shirt","black_skirt"] }
  },
  20039: {
    characterTag: 'ryuuge_kisaki_(blue_archive)',
    halo: ['halo', 'glowing_halo'],
    hair: ["black_hair","long_hair"],
    eyes: ["purple_eyes"],
    features: ["hair_ornament"],
    outfits: { default: ["black_qipao","long_sleeves","gold_trim"] }
  },
  20041: {
    characterTag: 'tsukatsuki_rio_(blue_archive)',
    halo: ['halo', 'glowing_halo'],
    hair: ["black_hair","long_hair"],
    eyes: ["red_eyes"],
    features: ["hairclip"],
    outfits: { default: ["black_blazer","black_skirt","red_necktie"] }
  },
  10015: {
    characterTag: 'tendou_arisu_(blue_archive)',
    halo: ['halo', 'glowing_halo'],
    hair: ["black_hair","very_long_hair"],
    eyes: ["blue_eyes"],
    features: ["hairclip"],
    outfits: { default: ["white_shirt","blue_skirt","blue_cardigan"] }
  },
  10033: {
    characterTag: 'kosaka_wakamo_(blue_archive)',
    halo: ['halo', 'glowing_halo'],
    hair: ["black_hair","long_hair"],
    eyes: ["red_eyes"],
    features: ["fox_ears","fox_tail","fox_mask"],
    outfits: { default: ["black_kimono","red_flower_pattern","obi"] }
  },
  20020: {
    characterTag: 'akeboshi_himari_(blue_archive)',
    halo: ['halo', 'glowing_halo'],
    hair: ["white_hair","long_hair"],
    eyes: ["blue_eyes"],
    features: ["wheelchair","hair_flower"],
    outfits: { default: ["white_dress","black_coat"] }
  },
  13008: {
    characterTag: 'kuromi_serika_(blue_archive)',
    halo: ['halo', 'glowing_halo'],
    hair: ["black_hair","twintails"],
    eyes: ["red_eyes"],
    features: ["cat_ears"],
    outfits: { default: ["white_shirt","blue_necktie","pleated_skirt"] }
  },
  13004: {
    characterTag: 'izayoi_nonomi_(blue_archive)',
    halo: ['halo', 'glowing_halo'],
    hair: ["blonde_hair","long_hair"],
    eyes: ["green_eyes"],
    features: ["hair_ribbon"],
    outfits: { default: ["white_shirt","blue_necktie","pleated_skirt"] }
  },
  // 1. Shiroko (砂狼シロコ)
  10010: {
    characterTag: 'sunaookami_shiroko_(blue_archive)',
    halo: ['halo', 'light_blue_halo', 'circular_halo', 'segmented_halo'],
    hair: ['grey_hair', 'wolf_cut', 'medium_hair', 'hair_between_eyes'],
    eyes: ['blue_eyes', 'light_blue_eyes', 'black_pupil', 'white_pupil'],
    features: ['wolf_ears', 'animal_ears', 'ear_piercing'],
    outfits: {
      default: ['abydos_school_uniform', 'sailor_collar', 'white_shirt', 'blue_necktie', 'blue_scarf', 'black_skirt', 'black_thighhighs'],
      cycling: ['cycling_suit', 'cycling_shorts', 'bicycle_helmet'],
      swimsuit: ['school_swimsuit', 'blue_swimsuit']
    }
  },

  // 2. Hoshino (小鳥遊ホシノ)
  10005: {
    characterTag: 'takanashi_hoshino_(blue_archive)',
    halo: ['halo', 'pink_halo', 'target_halo', 'concentric_ring_halo'],
    hair: ['light_pink_hair', 'very_long_hair', 'low_twintails', 'ahoge'],
    eyes: ['heterochromia', 'blue_eye', 'amber_eye', 'sleepy_eyes'],
    features: ['ahoge'],
    outfits: {
      default: ['abydos_school_uniform', 'white_shirt', 'unbuttoned_shirt', 'black_skirt', 'black_thighhighs', 'loose_necktie'],
      swimsuit: ['white_swimsuit', 'frilled_bikini']
    }
  },

  // 3. Hina (空崎ヒナ)
  10004: {
    characterTag: 'sorasaki_hina_(blue_archive)',
    halo: ['halo', 'purple_halo', 'spiked_halo', 'crown_halo', 'intricate_thorns_halo'],
    hair: ['silver_hair', 'violet_hair', 'very_long_hair', 'messy_hair'],
    eyes: ['purple_eyes', 'tired_eyes'],
    features: ['black_horns', 'large_curved_demon_horns', 'small_black_demon_wings', 'petite'],
    outfits: {
      default: ['gehenna_uniform', 'black_military_coat', 'epaulets', 'armband', 'black_gloves', 'white_shirt', 'black_skirt'],
      swimsuit: ['black_swimsuit', 'frilled_one-piece_swimsuit'],
      dress: ['black_dress', 'formal_dress']
    }
  },

  // 4. Ako (天雨アコ)
  20008: {
    characterTag: 'amau_ako_(blue_archive)',
    halo: ['halo', 'light_blue_halo', 'spiked_ring_halo'],
    hair: ['light_blue_hair', 'short_hair', 'side_braid'],
    eyes: ['blue_eyes', 'gentle_gaze'],
    features: ['small_black_horns', 'demon_horns'],
    outfits: {
      default: ['gehenna_uniform', 'side_cutout_dress', 'side_cutout', 'white_collared_shirt', 'black_choker', 'black_gloves', 'armband'],
      dress: ['formal_dress', 'evening_dress']
    }
  },

  // 5. Aru (陸八魔アル)
  10000: {
    characterTag: 'rikuhachima_aru_(blue_archive)',
    halo: ['halo', 'red_halo', 'spiked_cross_halo'],
    hair: ['dark_red_hair', 'burgundy_hair', 'long_hair', 'twin_drills_hair'],
    eyes: ['red_eyes'],
    features: ['curled_ram_horns', 'black_horns'],
    outfits: {
      default: ['fur-trimmed_red_coat', 'black_dress', 'red_necktie', 'black_gloves', 'black_thighhighs', 'problem_solver_68'],
      dress: ['black_evening_dress', 'formal_dress']
    }
  },

  // 6. Yuuka (早瀬ユウカ)
  13010: {
    characterTag: 'hayase_yuuka_(blue_archive)',
    halo: ['halo', 'blue_halo', 'digital_halo', 'interlocking_diamond_halo'],
    hair: ['dark_blue_hair', 'purple_hair', 'twin_tails', 'medium_hair'],
    eyes: ['blue_eyes'],
    features: [],
    outfits: {
      default: ['millennium_school_uniform', 'white_tech_jacket', 'open_jacket', 'black_undershirt', 'black_pleated_skirt', 'black_thighhighs', 'id_card'],
      track: ['track_jacket', 'gym_uniform', 'buruma']
    }
  },

  // 7. Hifumi (阿慈谷ヒフミ)
  10003: {
    characterTag: 'ajitani_hifumi_(blue_archive)',
    halo: ['halo', 'yellow_halo', 'star_halo', 'four-pointed_star_in_ring'],
    hair: ['blonde_hair', 'short_hair', 'side_ponytail', 'black_hair_ribbon'],
    eyes: ['amber_eyes'],
    features: ['small_white_angel_wings'],
    outfits: {
      default: ['trinity_school_uniform', 'white_sailor_suit', 'navy_collar', 'navy_pleated_skirt', 'yellow_neckerchief', 'white_gloves'],
      swimsuit: ['white_one-piece_swimsuit', 'peroro_float']
    }
  },

  // 8. Mari (伊落マリー)
  23008: {
    characterTag: 'iochi_mari_(blue_archive)',
    halo: ['halo', 'golden_halo', 'cross_halo', 'trinity_halo'],
    hair: ['orange_hair', 'long_hair'],
    eyes: ['blue_eyes'],
    features: ['cat_ears', 'animal_ears', 'kemomimi'],
    outfits: {
      default: ['sister_habit', 'nun_veil', 'nun_habit_dress', 'black_veil', 'white_wimple', 'cross_necklace', 'white_gloves'],
      track: ['gym_uniform', 'track_jacket', 'buruma']
    }
  },

  // 9. Azusa (白洲アズサ)
  10019: {
    characterTag: 'shirasu_azusa_(blue_archive)',
    halo: ['halo', 'grey_halo', 'feathered_halo', 'winged_halo'],
    hair: ['light_purple_hair', 'silver-lavender_hair', 'long_hair', 'white_flower_hair_ornament'],
    eyes: ['purple_eyes'],
    features: ['large_white_feathered_angel_wings'],
    outfits: {
      default: ['trinity_school_uniform', 'black_beret', 'white_collared_shirt', 'suspenders', 'black_skirt', 'ribbon_tie'],
      swimsuit: ['bikini', 'white_swimsuit']
    }
  },

  // 10. Iori (銀鏡イオリ)
  10006: {
    characterTag: 'shiromi_iori_(blue_archive)',
    halo: ['halo', 'red_halo', 'spiked_circular_halo'],
    hair: ['white_hair', 'twin_tails'],
    eyes: ['red_eyes'],
    features: ['dark_skin', 'tanned_skin', 'black_demon_horns'],
    outfits: {
      default: ['gehenna_uniform', 'black_military_jacket', 'white_shirt', 'short_shorts', 'bare_legs', 'black_boots'],
      swimsuit: ['swimsuit', 'bikini']
    }
  },

  // 11. Karin (角楯カリン)
  20001: {
    characterTag: 'kakudate_karin_(blue_archive)',
    halo: ['halo', 'yellow_halo', 'radar_halo', 'circular_crosshair_halo'],
    hair: ['black_hair', 'very_long_hair', 'straight_bangs'],
    eyes: ['yellow_eyes'],
    features: ['dark_skin', 'tanned_skin'],
    outfits: {
      default: ['maid_outfit', 'maid_headdress', 'black_maid_dress', 'white_apron', 'white_ruffled_collar', 'thighhighs', 'high_heels'],
      bunny: ['bunny_suit', 'bunny_ears']
    }
  },

  // 12. Mika (聖園ミカ)
  10059: {
    characterTag: 'misono_mika_(blue_archive)',
    halo: ['halo', 'pink_halo', 'starburst_crown_halo', 'complex_royal_halo'],
    hair: ['light_pink_hair', 'long_wavy_hair', 'gradient_yellow_hair_tips', 'hair_flower'],
    eyes: ['yellow_eyes', 'starry_eyes'],
    features: ['large_white_feathered_angel_wings'],
    outfits: {
      default: ['tea_party_dress', 'sleeveless_white_royal_dress', 'pink_ribbon', 'detached_white_sleeves', 'white_gloves', 'capelet']
    }
  },

  // 13. Toki (飛鳥馬トキ)
  10062: {
    characterTag: 'asuma_toki_(blue_archive)',
    halo: ['halo', 'light_blue_halo', 'hexagonal_geometric_halo'],
    hair: ['blonde_hair', 'short_bob_cut', 'hairclips'],
    eyes: ['blue_eyes'],
    features: ['expressionless', 'kuudere'],
    outfits: {
      default: ['maid_outfit', 'maid_headdress', 'maid_headband', 'black_dress', 'white_apron', 'white_gloves'],
      bunny: ['bunny_suit', 'bunny_ears']
    }
  },

  // 14. Haruna (黒舘ハルナ)
  10002: {
    characterTag: 'kurodate_haruna_(blue_archive)',
    halo: ['halo', 'red_halo', 'intricate_floral_lace_halo'],
    hair: ['silver_hair', 'white_hair', 'long_straight_hair'],
    eyes: ['red_eyes'],
    features: ['black_demon_horns', 'small_black_bat_wings'],
    outfits: {
      default: ['gourmet_research_society_uniform', 'black_fur-trimmed_coat', 'red_scarf', 'black_evening_dress', 'black_gloves'],
      track: ['gym_uniform', 'track_jacket', 'buruma']
    }
  },

  // 15. Mutsuki (浅黄ムツキ)
  13006: {
    characterTag: 'asagi_mutsuki_(blue_archive)',
    halo: ['halo', 'red_halo', 'heart_flame_halo'],
    hair: ['grey_hair', 'short_hair', 'twin_buns', 'red_ribbons'],
    eyes: ['red_eyes'],
    features: ['small_black_horns', 'fang', 'mischievous_smirk'],
    outfits: {
      default: ['problem_solver_68_uniform', 'black_sailor_suit', 'red_ribbon_tie', 'black_skirt', 'thighhighs', 'leather_backpack']
    }
  },

  // 16. Noa (生塩ノア)
  10052: {
    characterTag: 'ushio_noa_(blue_archive)',
    halo: ['halo', 'pale_purple_halo', 'concentric_diamond_digital_halo'],
    hair: ['silver-lavender_hair', 'very_long_hair', 'side_ponytail', 'purple_hair_ribbon'],
    eyes: ['purple_eyes'],
    features: [],
    outfits: {
      default: ['seminar_uniform', 'white_long_trench_coat', 'black_pencil_skirt', 'black_collared_shirt', 'purple_tie', 'thighhighs', 'clipboard']
    }
  },

  // 17. Koyuki (黒崎コユキ)
  10063: {
    characterTag: 'kurosaki_koyuki_(blue_archive)',
    halo: ['halo', 'bright_pink_halo', 'spinning_pixel_halo'],
    hair: ['pink_hair', 'short_fluffy_hair', 'messy_twintails', 'bunny_hairclip'],
    eyes: ['pink_eyes'],
    features: ['playful_smile', 'open_mouth'],
    outfits: {
      default: ['seminar_uniform', 'oversized_white_blazer', 'long_sleeves', 'black_pleated_skirt']
    }
  },

  // 18. Koharu (下江コハル)
  10020: {
    characterTag: 'shimoe_koharu_(blue_archive)',
    halo: ['halo', 'black_halo', 'jagged_demonic_halo'],
    hair: ['pink_hair', 'twin_tails', 'black_hair_bows'],
    eyes: ['green_eyes'],
    features: ['small_black_wings', 'blushing_face', 'pout'],
    outfits: {
      default: ['justice_task_force_uniform', 'black_sailor_suit', 'red_armband', 'black_pleated_skirt', 'black_thighhighs'],
      swimsuit: ['swimsuit', 'school_swimsuit']
    }
  },

  // 19. Asuna (一之瀬アスナ)
  16001: {
    characterTag: 'ichinose_asuna_(blue_archive)',
    halo: ['halo', 'blue_halo', 'glowing_circular_halo'],
    hair: ['blonde_hair', 'very_long_hair', 'straight_hair'],
    eyes: ['blue_eyes'],
    features: ['bright_energetic_smile'],
    outfits: {
      default: ['maid_outfit', 'maid_headdress', 'low_cut_black_dress', 'white_apron', 'black_thighhighs'],
      bunny: ['bunny_suit', 'bunny_ears']
    }
  },

  // 20. Neru (美甘ネル)
  10008: {
    characterTag: 'mikamo_neru_(blue_archive)',
    halo: ['halo', 'red_halo', 'jagged_crosshair_halo'],
    hair: ['red-orange_hair', 'spiky_twintails'],
    eyes: ['red_eyes'],
    features: ['sharp_teeth', 'bandage_on_nose', 'petite'],
    outfits: {
      default: ['maid_outfit', 'maid_headdress', 'embroidered_sukajan_souvenir_jacket', 'open_jacket', 'black_maid_dress', 'boots'],
      bunny: ['bunny_suit', 'bunny_ears']
    }
  },

  // 21. Kazusa (杏山カズサ)
  10049: {
    characterTag: 'kyouyama_kazusa_(blue_archive)',
    halo: ['halo', 'pink_halo', 'broken_ring_halo'],
    hair: ['black_hair', 'pink_inner_hair', 'two-tone_hair', 'short_bob'],
    eyes: ['pink_eyes'],
    features: ['black_cat_ears', 'cat_tail', 'kemomimi', 'animal_ears'],
    outfits: {
      default: ['trinity_uniform', 'white_blazer_over_black_hoodie', 'black_necktie', 'black_pleated_skirt', 'thighhighs']
    }
  },

  // 22. Saori (錠前サオリ)
  10048: {
    characterTag: 'joumae_saori_(blue_archive)',
    halo: ['halo', 'dark_blue_halo', 'thorny_broken_crown_halo'],
    hair: ['dark_blue_hair', 'long_messy_hair', 'black_baseball_cap'],
    eyes: ['blue_eyes'],
    features: ['serious_gaze'],
    outfits: {
      default: ['arius_squad_combat_uniform', 'black_tactical_vest', 'crop_top', 'midriff', 'black_combat_trousers', 'gloves', 'bandages'],
      dress: ['formal_dress']
    }
  },

  // 23. Shun (春原シュン)
  10011: {
    characterTag: 'sunohara_shun_(blue_archive)',
    halo: ['halo', 'green_halo', 'lotus_flower_halo'],
    hair: ['black_hair', 'very_long_hair', 'braided_ponytail'],
    eyes: ['amber_eyes'],
    features: ['mature_beauty', 'gentle_smile'],
    outfits: {
      default: ['shanhaijing_uniform', 'black_qipao_dress', 'high_side_slit', 'chest_cutout', 'gold_embroidery', 'black_thighhighs']
    }
  },

  // 24. Arona (アロナ)
  9999: {
    characterTag: 'arona_(blue_archive)',
    halo: ['halo', 'white_halo', 'ribbon_waterdrop_halo'],
    hair: ['light_blue_hair', 'short_bob_hair', 'pink_ribbon_hairpin'],
    eyes: ['blue_eyes'],
    features: ['whale_hair_accessory', 'cheerful_smile', 'petite'],
    outfits: {
      default: ['shittim_chest_uniform', 'sleeveless_white_sailor_suit', 'sailor_collar', 'blue_necktie', 'bare_shoulders']
    }
  },
  10135: {
    characterTag: 'kei_(student)_(blue_archive)',
    halo: ['halo', 'glowing_halo'],
    hair: ["white_hair","very_long_hair","black_hairband"],
    eyes: ["pink_eyes","ringed_eyes"],
    features: ["black_bow"],
    outfits: { default: ["white_jacket","white_shirt","blue_necktie","black_skirt"] }
  },
  10110: {
    characterTag: 'seia_(blue_archive)',
    halo: ['halo', 'glowing_halo'],
    hair: ["blonde_hair","long_hair"],
    eyes: ["yellow_eyes"],
    features: ["fox_ears","fox_tail","animal_ears"],
    outfits: { default: ["white_dress","yellow_jacket"] }
  },
  20024: {
    characterTag: 'nagisa_(blue_archive)',
    halo: ['halo', 'glowing_halo'],
    hair: ["brown_hair","long_hair"],
    eyes: ["yellow_eyes"],
    features: ["white_wings","feathered_wings","hair_ornament"],
    outfits: { default: ["white_dress","capelet"] }
  },
  20023: {
    characterTag: 'kanna_(blue_archive)',
    halo: ['halo', 'glowing_halo'],
    hair: ["blonde_hair","long_hair","hair_over_one_eye"],
    eyes: ["blue_eyes"],
    features: ["dog_ears","animal_ears"],
    outfits: { default: ["blue_jacket","blue_shirt","blue_necktie","black_gloves"] }
  },
  16003: {
    characterTag: 'suzumi_(blue_archive)',
    halo: ['halo', 'glowing_halo'],
    hair: ["white_hair","long_hair"],
    eyes: ["red_eyes"],
    features: ["head_wings","white_wings"],
    outfits: { default: ["school_uniform","sailor_collar","skirt"] }
  },
  10068: {
    characterTag: 'reisa_(blue_archive)',
    halo: ['halo', 'glowing_halo'],
    hair: ["pink_hair","blue_hair","multicolored_hair","twintails","ahoge"],
    eyes: ["purple_eyes"],
    features: ["star_hair_ornament"],
    outfits: { default: ["school_uniform","sailor_collar","grey_skirt","black_jacket"] }
  },
  10139: {
    characterTag: 'niko_(blue_archive)',
    halo: ['halo', 'glowing_halo'],
    hair: ["pink_hair","short_hair"],
    eyes: ["blue_eyes"],
    features: ["fox_ears","animal_ears"],
    outfits: { default: ["school_uniform","white_shirt","sailor_collar","red_armband"] }
  },
  10127: {
    characterTag: 'miyo_(blue_archive)',
    halo: ['halo', 'glowing_halo'],
    hair: ["grey_hair","long_hair","braid"],
    eyes: ["yellow_eyes"],
    features: ["hair_bow","white_bow"],
    outfits: { default: ["green_jacket","white_shirt","grey_skirt","bowtie"] }
  },
  13011: {
    characterTag: 'momoi_(blue_archive)',
    halo: ['halo', 'glowing_halo'],
    hair: ["blonde_hair","short_hair"],
    eyes: ["pink_eyes"],
    features: ["cat_ear_headphones","red_bow"],
    outfits: { default: ["white_jacket","white_shirt","blue_necktie","black_skirt"] }
  },
  20016: {
    characterTag: 'iroha_(blue_archive)',
    halo: ['halo', 'glowing_halo'],
    hair: ["red_hair","long_hair"],
    eyes: ["grey_eyes"],
    features: ["black_hat","military_hat"],
    outfits: { default: ["black_coat","black_shirt","red_necktie","red_armband"] }
  },
  23001: {
    characterTag: 'fuuka_(blue_archive)',
    halo: ['halo', 'glowing_halo'],
    hair: ["black_hair","long_hair","twintails"],
    eyes: ["red_eyes"],
    features: ["horns","demon_horns"],
    outfits: { default: ["white_shirt","necktie","skirt"] }
  },
  23007: {
    characterTag: 'hanako_(blue_archive)',
    halo: ['halo', 'glowing_halo'],
    hair: ["pink_hair","long_hair","single_braid","ahoge"],
    eyes: ["green_eyes"],
    features: ["white_bow","hair_bow"],
    outfits: { default: ["white_shirt","school_uniform","skirt"] }
  },
}

/**
 * Default fallback visual profile for uncataloged Kivotos students.
 */
export const DEFAULT_FALLBACK_PROFILE: CharacterVisualProfile = {
  characterTag: 'kivotos_student_(blue_archive)',
  halo: ['halo', 'glowing_halo'],
  hair: ['medium_hair'],
  eyes: ['blue_eyes'],
  features: [],
  outfits: {
    default: ['school_uniform', 'pleated_skirt']
  }
}

/**
 * Multilingual aliases for resolving student names/variations to their canonical ID.
 */
export const STUDENT_NAME_ALIASES: Record<string, number> = {
  'カヨコ': 13005,
  '鬼方カヨコ': 13005,
  'kayoko': 13005,
  'onikata kayoko': 13005,
  '카요코': 13005,
  '佳代子': 13005,
  '佳世子': 13005,
  'onikata_kayoko': 13005,
  'キサキ': 20039,
  '竜華キサキ': 20039,
  'kisaki': 20039,
  'ryuuge kisaki': 20039,
  '키사키': 20039,
  '妃咲': 20039,
  '妃姬': 20039,
  'ryuuge_kisaki': 20039,
  'リオ': 20041,
  '調月リオ': 20041,
  'rio': 20041,
  'tsukatsuki rio': 20041,
  '리오': 20041,
  '莉音': 20041,
  '莉央': 20041,
  'tsukatsuki_rio': 20041,
  'アリス': 10015,
  '天童アリス': 10015,
  'aris': 10015,
  'tendou aris': 10015,
  'alice': 10015,
  'tendou alice': 10015,
  '아리스': 10015,
  '爱丽丝': 10015,
  '愛麗絲': 10015,
  'tendou_arisu': 10015,
  'ワカモ': 10033,
  '狐坂ワカモ': 10033,
  'wakamo': 10033,
  'kosaka wakamo': 10033,
  '와카모': 10033,
  '若藻': 10033,
  'kosaka_wakamo': 10033,
  'ヒマリ': 20020,
  '明星ヒマリ': 20020,
  'himari': 20020,
  'akeboshi himari': 20020,
  '히마리': 20020,
  '日鞠': 20020,
  '陽葵': 20020,
  'akeboshi_himari': 20020,
  'セリカ': 13008,
  '黒見セリカ': 13008,
  'serika': 13008,
  'kuromi serika': 13008,
  '세리카': 13008,
  '芹香': 13008,
  '茜香': 13008,
  'kuromi_serika': 13008,
  'ノノミ': 13004,
  '十六夜ノノミ': 13004,
  'nonomi': 13004,
  'izayoi nonomi': 13004,
  '노노미': 13004,
  '野宫': 13004,
  '野乃美': 13004,
  'izayoi_nonomi': 13004,
  // Shiroko
  'shiroko': 10010,
  'sunaookami_shiroko': 10010,
  'sunaookami shiroko': 10010,
  'シロコ': 10010,
  'しろこ': 10010,
  '砂狼シロコ': 10010,
  '시로코': 10010,
  '스나오오카미 시로코': 10010,
  '砂狼白子': 10010,
  '白子': 10010,

  // Hoshino
  'hoshino': 10005,
  'takanashi_hoshino': 10005,
  'takanashi hoshino': 10005,
  'ホシノ': 10005,
  'ほしの': 10005,
  '小鳥遊ホシノ': 10005,
  '호시노': 10005,
  '타카나시 호시노': 10005,
  '小鸟游星野': 10005,
  '小鳥遊星野': 10005,
  '星野': 10005,

  // Hina
  'hina': 10004,
  'sorasaki_hina': 10004,
  'sorasaki hina': 10004,
  'ヒナ': 10004,
  'ひな': 10004,
  '空崎ヒナ': 10004,
  '히나': 10004,
  '소라사키 히나': 10004,
  '空崎日奈': 10004,
  '日奈': 10004,

  // Ako
  'ako': 20008,
  'amau_ako': 20008,
  'amau ako': 20008,
  'アコ': 20008,
  'あこ': 20008,
  '天雨アコ': 20008,
  '아코': 20008,
  '아마우 아코': 20008,
  '天雨亚子': 20008,
  '天雨亞子': 20008,
  '亚子': 20008,
  '亞子': 20008,

  // Aru
  'aru': 10000,
  'rikuhachima_aru': 10000,
  'rikuhachima aru': 10000,
  'アル': 10000,
  'ある': 10000,
  '陸八魔アル': 10000,
  '아루': 10000,
  '리쿠하치마 아루': 10000,
  '陆八魔爱露': 10000,
  '陸八魔愛露': 10000,
  '爱露': 10000,
  '愛露': 10000,

  // Yuuka
  'yuuka': 13010,
  'hayase_yuuka': 13010,
  'hayase yuuka': 13010,
  'ユウカ': 13010,
  'ゆうか': 13010,
  '早瀬ユウカ': 13010,
  '유우카': 13010,
  '하야세 유우카': 13010,
  '早濑优香': 13010,
  '早瀨優香': 13010,
  '优香': 13010,
  '優香': 13010,

  // Hifumi
  'hifumi': 10003,
  'ajitani_hifumi': 10003,
  'ajitani hifumi': 10003,
  'ヒフミ': 10003,
  'ひふみ': 10003,
  '阿慈谷ヒフミ': 10003,
  '히후미': 10003,
  '아지타니 히후미': 10003,
  '阿慈谷日富美': 10003,
  '日富美': 10003,

  // Mari
  'mari': 23008,
  'iochi_mari': 23008,
  'iochi mari': 23008,
  'マリー': 23008,
  'まり': 23008,
  'まりー': 23008,
  '伊落マリー': 23008,
  '마리': 23008,
  '이오치 마리': 23008,
  '伊落玛丽': 23008,
  '伊落瑪麗': 23008,
  '玛丽': 23008,
  '瑪麗': 23008,

  // Azusa
  'azusa': 10019,
  'shirasu_azusa': 10019,
  'shirasu azusa': 10019,
  'アズサ': 10019,
  'あずさ': 10019,
  '白洲アズサ': 10019,
  '아즈사': 10019,
  '시라수 아즈사': 10019,
  '白洲梓': 10019,
  '梓': 10019,

  // Iori
  'iori': 10006,
  'shiromi_iori': 10006,
  'shiromi iori': 10006,
  'イオリ': 10006,
  'いおり': 10006,
  '銀鏡イオリ': 10006,
  '이오리': 10006,
  '시로미 이오리': 10006,
  '银镜伊织': 10006,
  '銀鏡伊織': 10006,
  '伊织': 10006,
  '伊織': 10006,

  // Karin
  'karin': 20001,
  'kakudate_karin': 20001,
  'kakudate karin': 20001,
  'カリン': 20001,
  'かりん': 20001,
  '角楯カリン': 20001,
  '카린': 20001,
  '카쿠다테 카린': 20001,
  '角楯花梨': 20001,
  '花梨': 20001,

  // Mika
  'mika': 10059,
  'misono_mika': 10059,
  'misono mika': 10059,
  'ミカ': 10059,
  'みか': 10059,
  '聖園ミカ': 10059,
  '미카': 10059,
  '미소노 미카': 10059,
  '圣园未花': 10059,
  '聖園未花': 10059,
  '未花': 10059,

  // Toki
  'toki': 10062,
  'asuma_toki': 10062,
  'asuma toki': 10062,
  'トキ': 10062,
  'とき': 10062,
  '飛鳥馬トキ': 10062,
  '토키': 10062,
  '아스마 토키': 10062,
  '飞鸟马时': 10062,
  '飛鳥馬時': 10062,
  '时': 10062,
  '時': 10062,

  // Haruna
  'haruna': 10002,
  'kurodate_haruna': 10002,
  'kurodate haruna': 10002,
  'ハルナ': 10002,
  'はるな': 10002,
  '黒舘ハルナ': 10002,
  '하루나': 10002,
  '쿠로다테 하루ナ': 10002,
  '쿠로다테 하루나': 10002,
  '黑馆晴奈': 10002,
  '黑館晴奈': 10002,
  '晴奈': 10002,

  // Mutsuki
  'mutsuki': 13006,
  'asagi_mutsuki': 13006,
  'asagi mutsuki': 13006,
  'ムツキ': 13006,
  'むつき': 13006,
  '浅黄ムツキ': 13006,
  '무츠키': 13006,
  '아사기 무츠키': 13006,
  '浅黄无月': 13006,
  '淺黃無月': 13006,
  '无月': 13006,
  '無月': 13006,

  // Noa
  'noa': 10052,
  'ushio_noa': 10052,
  'ushio noa': 10052,
  'ノア': 10052,
  'のあ': 10052,
  '生塩ノア': 10052,
  '노아': 10052,
  '우시오 노아': 10052,
  '生盐诺亚': 10052,
  '生鹽諾亞': 10052,
  '诺亚': 10052,
  '諾亞': 10052,

  // Koyuki
  'koyuki': 10063,
  'kurosaki_koyuki': 10063,
  'kurosaki koyuki': 10063,
  'コユキ': 10063,
  'こゆき': 10063,
  '黒崎コユキ': 10063,
  '코유키': 10063,
  '쿠로사키 코유키': 10063,
  '黑崎小雪': 10063,
  '小雪': 10063,

  // Koharu
  'koharu': 10020,
  'shimoe_koharu': 10020,
  'shimoe koharu': 10020,
  'コハル': 10020,
  'こはる': 10020,
  '下江コハル': 10020,
  '코하루': 10020,
  '시모에 코하루': 10020,
  '下江小春': 10020,
  '小春': 10020,

  // Asuna
  'asuna': 16001,
  'ichinose_asuna': 16001,
  'ichinose asuna': 16001,
  'アスナ': 16001,
  'あすな': 16001,
  '一之瀬アスナ': 16001,
  '아스나': 16001,
  '이치노세 아스나': 16001,
  '一之濑明日奈': 16001,
  '一之瀨明日奈': 16001,
  '明日奈': 16001,

  // Neru
  'neru': 10008,
  'mikamo_neru': 10008,
  'mikamo neru': 10008,
  'ネル': 10008,
  'ねる': 10008,
  '美甘ネル': 10008,
  '네루': 10008,
  '미카모 네루': 10008,
  '美甘宁瑠': 10008,
  '美甘寧瑠': 10008,
  '宁瑠': 10008,
  '寧瑠': 10008,

  // Kazusa
  'kazusa': 10049,
  'kyouyama_kazusa': 10049,
  'kyouyama kazusa': 10049,
  'カズサ': 10049,
  'かずさ': 10049,
  '杏山カズサ': 10049,
  '카즈사': 10049,
  '쿄야마 카즈사': 10049,
  '杏山一纱': 10049,
  '杏山一紗': 10049,
  '一纱': 10049,
  '一紗': 10049,

  // Saori
  'saori': 10048,
  'joumae_saori': 10048,
  'joumae saori': 10048,
  'サオリ': 10048,
  'さおり': 10048,
  '錠前サオリ': 10048,
  '사오리': 10048,
  '죠마에 사오리': 10048,
  '锭前纱织': 10048,
  '錠前紗織': 10048,
  '纱织': 10048,
  '紗織': 10048,

  // Shun
  'shun': 10011,
  'sunohara_shun': 10011,
  'sunohara shun': 10011,
  'シュン': 10011,
  'しゅん': 10011,
  '春原シュン': 10011,
  '슌': 10011,
  '스노하라 슌': 10011,
  '春原瞬': 10011,
  '瞬': 10011,

  // Arona
  'arona': 9999,
  'arona_(blue_archive)': 9999,
  'アロナ': 9999,
  'あろな': 9999,
  '아로나': 9999,
  '阿罗娜': 9999,
  '阿羅娜': 9999
}

/**
 * Common Japanese and English honorifics to strip before alias lookup.
 */
const HONORIFICS_REGEX = /(?:ちゃん|さん|くん|君|先生|センセー|せんせー|様|さま|先輩|たん|[-_ ]?(?:chan|san|kun|sensei|senpai))$/i

/**
 * Resolve a student ID or name to their canonical numeric ID.
 * Returns undefined if no exact or alias match is found.
 */
export function resolveStudentId(studentIdOrName: string | number): number | undefined {
  if (typeof studentIdOrName === 'number') {
    return studentIdOrName
  }
  const trimmed = String(studentIdOrName).trim()
  if (!trimmed) return undefined

  const asNum = Number(trimmed)
  if (!isNaN(asNum) && asNum > 0) {
    return asNum
  }

  const normalized = trimmed.toLowerCase()

  // 1. Direct exact alias match
  if (STUDENT_NAME_ALIASES[normalized] != null) {
    return STUDENT_NAME_ALIASES[normalized]
  }

  // 2. Strip common honorifics and check exact alias match
  const stripped = normalized.replace(HONORIFICS_REGEX, '').trim()
  if (stripped && STUDENT_NAME_ALIASES[stripped] != null) {
    return STUDENT_NAME_ALIASES[stripped]
  }

  // 3. Word boundary / token match (avoiding substring poisoning)
  // - Never match short query as substring of long alias (removes alias.includes(normalized)).
  // - For Latin queries (e.g. "hina", "aru", "mari", "noa"):
  //   Only match if bounded by word boundaries, preventing "hinata" -> Hina, "haruka" -> Aru, "marina" -> Mari.
  // - For non-Latin aliases (>=2 chars), require token boundary.
  const entries = Object.entries(STUDENT_NAME_ALIASES)

  // Latin word boundary matching (for alias length >= 2)
  for (const [alias, id] of entries) {
    if (/^[a-z0-9_ -]+$/i.test(alias) && alias.length >= 2) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const wordBoundaryRegex = new RegExp(`(^|[^a-z0-9_])${escaped}($|[^a-z0-9_])`, 'i')
      if (wordBoundaryRegex.test(normalized) || (stripped && wordBoundaryRegex.test(stripped))) {
        return id
      }
    }
  }

  // CJK token boundary matching (for alias length >= 2)
  for (const [alias, id] of entries) {
    if (!/^[a-z0-9_ -]+$/i.test(alias) && alias.length >= 2) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const tokenRegex = new RegExp(`(^|[\\s、。・\\[\\]()（）「」『』])${escaped}($|[\\s、。・\\[\\]()（）「」『』])`)
      if (tokenRegex.test(normalized) || (stripped && tokenRegex.test(stripped))) {
        return id
      }
    }
  }

  return undefined
}

/**
 * Check if a student is supported in the Danbooru visual dictionary.
 */
export function isSupportedVisualStudent(studentIdOrName: string | number): boolean {
  const id = resolveStudentId(studentIdOrName)
  return id != null && STUDENT_VISUAL_PROFILES[id] != null
}

/**
 * Get the CharacterVisualProfile for a student by ID or name.
 * If not recognized, returns a generic fallback profile.
 */
export function getCharacterVisualProfile(studentIdOrName: string | number): CharacterVisualProfile {
  const id = resolveStudentId(studentIdOrName)
  if (id != null && STUDENT_VISUAL_PROFILES[id]) {
    return STUDENT_VISUAL_PROFILES[id]
  }
  return DEFAULT_FALLBACK_PROFILE
}

// rosterStudents.ts の生徒は、全言語の名前を別名として登録する
for (const r of ROSTER_STUDENTS) {
  for (const n of Object.values(r.names).flat()) {
    const key = n.toLowerCase()
    if (STUDENT_NAME_ALIASES[key] == null) STUDENT_NAME_ALIASES[key] = r.id
  }
}

/**
 * Alias for getCharacterVisualProfile.
 */
export const resolveVisualProfile = getCharacterVisualProfile
