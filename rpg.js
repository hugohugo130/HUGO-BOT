const mine_gets = {
    coal: "coal",
    iron_ore: "iron_ore",
    gold_ore: "gold_ore",
    diamond_ore: "diamond_ore",
    emerald_ore: "emerald_ore",
    ruby_ore: "ruby_ore",
    sapphire_ore: "sapphire_ore",
    stone: "stone"
};

const ingots = {
    iron: "iron",
    gold: "gold",
    diamond: "diamond",
    emerald: "emerald",
    ruby: "ruby",
    sapphire: "sapphire"
};

const logs = {
    oak_wood: "oak_wood",
    spruce_wood: "spruce_wood",
    birch_wood: "birch_wood",
    jungle_wood: "jungle_wood",
    acacia_wood: "acacia_wood",
    dark_oak_wood: "dark_oak_wood",
    crimson_wood: "crimson_wood",
    warped_wood: "warped_wood",
    god_wood: "god_wood",
    ha_wood: "ha_wood"
};

const planks = {
    oak_planks: "oak_planks",
    spruce_planks: "spruce_planks",
    birch_planks: "birch_planks",
    jungle_planks: "jungle_planks",
    acacia_planks: "acacia_planks",
    dark_oak_planks: "dark_oak_planks",
    crimson_planks: "crimson_planks",
    warped_planks: "warped_planks",
    god_planks: "god_planks",
    ha_planks: "ha_planks"
}

const wood_productions = {
    stick: "stick",
}

const recipes = {
    wooden_hoe: {
        input: [
            { item: "stick", amount: 2 },
            { item: "#planks", amount: 1 }
        ],
        output: "wooden_hoe",
        amount: 1
    },
    iron_hoe: {
        input: [
            { item: "stick", amount: 2 },
            { item: "iron", amount: 1 }
        ],
        output: "iron_hoe",
        amount: 1
    },
    stick: {
        input: [
            { item: "#planks", amount: 2 }
        ],
        output: "stick",
        amount: 1
    },
    stone_short_knife: {
        input: [
            { item: "stick", amount: 1 },
            { item: "stone", amount: 1 }
        ],
        output: "stone_short_knife",
        amount: 1
    },
    iron_short_knife: {
        input: [
            { item: "stick", amount: 1 },
            { item: "iron", amount: 1 }
        ],
        output: "iron_short_knife",
        amount: 1
    },
    stone_sword: {
        input: [
            { item: "stick", amount: 1 },
            { item: "stone", amount: 3 }
        ],
        output: "stone_sword",
        amount: 1
    },
    iron_sword: {
        input: [
            { item: "stick", amount: 1 },
            { item: "iron", amount: 3 }
        ],
        output: "iron_sword",
        amount: 1
    },
    stone_axe: {
        input: [
            { item: "stick", amount: 2 },
            { item: "stone", amount: 3 }
        ],
        output: "stone_axe",
        amount: 1
    },
    iron_axe: {
        input: [
            { item: "stick", amount: 2 },
            { item: "iron", amount: 3 }
        ],
        output: "iron_axe",
        amount: 1
    },
    iron_armor: {
        input: [
            { item: "iron", amount: 28 }
        ],
        output: "iron_armor",
        amount: 1
    }
};

// 動態生成木材到木板的合成配方，比例 1:4
Object.entries(logs).forEach(([logKey, logValue]) => {
    const plankKey = logKey.replace('_wood', '_planks');
    if (planks[plankKey]) {
        recipes[planks[plankKey]] = {
            input: [
                {
                    item: logValue,
                    amount: 1
                }
            ],
            output: planks[plankKey],
            amount: 4
        };
    };
});

const tags = {
    "planks": Object.keys(planks),
};

const foods_crops = {
    bread: "bread",
    potato: "potato",
    cookie: "cookie",
    cake: "cake",
    candy: "candy",
    chocolate: "chocolate",
    pumpkin_pie: "pumpkin_pie",
    melon_slice: "melon_slice",
    raw_potato: "raw_potato",
};

const foods_meat = {
    shrimp: "shrimp",
    pork: "pork",
    beef: "beef",
    chicken: "chicken",
    duck: "duck",
    cod: "cod",
    salmon: "salmon",
    tropical_fish: "tropical_fish",
    pufferfish: "pufferfish",
    clownfish: "clownfish",
    tuna: "tuna",
    swordfish: "swordfish",
    anglerfish: "anglerfish",
    jellyfish: "jellyfish",
    octopus: "octopus",
    squid: "squid",
    crab: "crab",
    lobster: "lobster",
    eel: "eel",
    catfish: "catfish",
    goldfish: "goldfish",
    koi: "koi",
    shark: "shark",
    whale: "whale",
    golden_apple: "golden_apple",
    enchanted_golden_apple: "enchanted_golden_apple",
    golden_carrot: "golden_carrot",
    golden_beef: "golden_beef",
    raw_shrimp: "raw_shrimp",
    raw_pork: "raw_pork",
    raw_beef: "raw_beef",
    raw_chicken: "raw_chicken",
    raw_duck: "raw_duck",
};

const foods = { ...foods_crops, ...foods_meat };

const animals = {
    cow: "cow",
    pig: "pig",
    a_chicken: "a_chicken",
    a_duck: "a_duck",
};

const animal_products = {
    cow: "raw_beef",
    pig: "raw_pork",
    a_chicken: "raw_chicken",
    a_duck: "raw_duck",
};

const shop_lowest_price = {
    coal: 50,
    iron_ore: 50,
    gold_ore: 50,
    diamond_ore: 150,
    emerald_ore: 50,
    ruby_ore: 50,
    sapphire_ore: 50,
    stone: 50,
    iron: 250,
    gold: 50,
    diamond: 750,
    emerald: 50,
    ruby: 50,
    sapphire: 50,
    oak_wood: 50,
    spruce_wood: 50,
    birch_wood: 50,
    jungle_wood: 50,
    acacia_wood: 50,
    dark_oak_wood: 50,
    crimson_wood: 50,
    warped_wood: 50,
    god_wood: 50,
    oak_planks: 50,
    spruce_planks: 50,
    birch_planks: 50,
    jungle_planks: 50,
    acacia_planks: 50,
    dark_oak_planks: 50,
    crimson_planks: 50,
    warped_planks: 50,
    shrimp: 50,
    pork: 50,
    beef: 50,
    chicken: 50,
    duck: 50,
    bread: 130,
    potato: 50,
    cookie: 50,
    cake: 50,
    candy: 50,
    chocolate: 50,
    pumpkin_pie: 50,
    melon_slice: 50,
    golden_apple: 50,
    enchanted_golden_apple: 50,
    golden_carrot: 50,
    golden_beef: 50,
    regen_potion: 100,
    raw_potato: 85,
    raw_shrimp: 50,
    raw_pork: 50,
    raw_beef: 50,
    raw_chicken: 50,
    raw_duck: 50,
    wheat: 65,
};

const food_data = {
    crab: 2,
    lobster: 2,
    eel: 4,
    catfish: 3,
    goldfish: 1,
    koi: 1,
    shark: 4,
    whale: 4,
    clownfish: 1,
    jellyfish: 1,
    candy: 1,
    cod: 2,
    tropical_fish: 2,
    pufferfish: 2,
    bread: 2,
    potato: 2,
    cookie: 2,
    cake: 2,
    chocolate: 2,
    melon_slice: 2,
    swordfish: 3,
    shrimp: 3,
    chicken: 3,
    duck: 3,
    pumpkin_pie: 3,
    golden_apple: 3,
    golden_carrot: 3,
    golden_beef: 3,
    salmon: 3,
    tuna: 3,
    anglerfish: 4,
    octopus: 4,
    squid: 4,
    pork: 4,
    beef: 4,
    enchanted_golden_apple: 4,
    raw_potato: 1,
    raw_shrimp: 1,
    raw_pork: 1,
    raw_beef: 1,
    raw_chicken: 1,
    raw_duck: 1,
    raw_tuna: 1,
};

const brew = {
    regen_potion: "regen_potion",
    poison_potion: "poison_potion",
    floating_potion: "floating_potion",
    invisibility_potion: "invisibility_potion",
    mystery_potion: "mystery_potion",
    eye_potion: "eye_potion",
    ha_potion: "ha_potion",
    jump_potion: "jump_potion",
    lucky_potion: "lucky_potion",
    dizzy_potion: "dizzy_potion",
    unlucky_potion: "unlucky_potion",
    nausea_potion: "nausea_potion",
    hair_growth_potion: "hair_growth_potion",
    revive_potion: "revive_potion",
    gold_potion: "gold_potion",
    cough_potion: "cough_potion",
};

const fish = {
    raw_shrimp: "raw_shrimp",
    raw_cod: "raw_cod",
    raw_salmon: "raw_salmon",
    raw_tropical_fish: "raw_tropical_fish",
    raw_pufferfish: "raw_pufferfish",
    raw_clownfish: "raw_clownfish",
    raw_tuna: "raw_tuna",
    raw_swordfish: "raw_swordfish",
    raw_anglerfish: "raw_anglerfish",
    raw_jellyfish: "raw_jellyfish",
    raw_octopus: "raw_octopus",
    raw_squid: "raw_squid",
    raw_crab: "raw_crab",
    raw_lobster: "raw_lobster",
    raw_eel: "raw_eel",
    raw_catfish: "raw_catfish",
    raw_goldfish: "raw_goldfish",
    raw_koi: "raw_koi",
    raw_shark: "raw_shark",
    raw_whale: "raw_whale",
};

const weapons_armor = {
    wooden_hoe: "wooden_hoe",
    iron_hoe: "iron_hoe",
    stone_short_knife: "stone_short_knife",
    iron_short_knife: "iron_short_knife",
    stone_sword: "stone_sword",
    iron_sword: "iron_sword",
    stone_axe: "stone_axe",
    iron_axe: "iron_axe",
    iron_armor: "iron_armor",
};

const bake = {
    raw_potato: "potato",
    raw_pork: "pork",
    raw_duck: "duck",
    raw_beef: "beef",
    raw_chicken: "chicken",
    raw_salmon: "salmon",
    raw_shrimp: "shrimp",
    raw_tuna: "tuna",
    wheat: "bread",
};

const sell_data = {
    // ==============礦物==============
    coal: 45,
    iron_ore: 45,
    gold_ore: 50,
    diamond_ore: 50,
    emerald_ore: 50,
    ruby_ore: 50,
    sapphire_ore: 50,
    stone: 45,
    iron: 50,
    gold: 50,
    diamond: 675,
    emerald: 50,
    ruby: 50,
    sapphire: 50,
    // ==============木材==============
    oak_wood: 50,
    spruce_wood: 50,
    birch_wood: 50,
    jungle_wood: 50,
    acacia_wood: 50,
    dark_oak_wood: 50,
    crimson_wood: 50,
    warped_wood: 50,
    god_wood: 50,
    ha_wood: 50,
    oak_planks: 50,
    spruce_planks: 50,
    birch_planks: 50,
    jungle_planks: 50,
    acacia_planks: 50,
    dark_oak_planks: 50,
    crimson_planks: 50,
    warped_planks: 50,
    god_planks: 50,
    ha_planks: 50,
    stick: 50,
    // ==============食物(烤魚類也是食物)==============
    shrimp: 50,
    pork: 50,
    beef: 50,
    chicken: 50,
    duck: 50,
    raw_shrimp: 50,
    raw_pork: 50,
    raw_beef: 50,
    raw_chicken: 50,
    raw_duck: 50,
    raw_cod: 50,
    raw_salmon: 50,
    raw_tropical_fish: 50,
    raw_pufferfish: 50,
    raw_clownfish: 50,
    raw_tuna: 50,
    raw_swordfish: 50,
    raw_anglerfish: 50,
    raw_jellyfish: 50,
    raw_octopus: 50,
    raw_squid: 50,
    raw_crab: 50,
    raw_lobster: 50,
    raw_eel: 50,
    raw_catfish: 50,
    raw_goldfish: 50,
    raw_koi: 50,
    raw_shark: 50,
    raw_whale: 50,
    cod: 50,
    salmon: 50,
    tropical_fish: 50,
    pufferfish: 50,
    clownfish: 50,
    tuna: 50,
    swordfish: 50,
    anglerfish: 50,
    jellyfish: 50,
    octopus: 50,
    squid: 50,
    crab: 50,
    lobster: 50,
    eel: 50,
    catfish: 50,
    goldfish: 50,
    koi: 50,
    shark: 50,
    whale: 50,
    bread: 50,
    raw_potato: 76,
    potato: 117,
    cookie: 50,
    cake: 50,
    candy: 50,
    chocolate: 50,
    pumpkin_pie: 50,
    melon_slice: 50,
    // ==============特殊食物==============
    golden_apple: 50,
    enchanted_golden_apple: 50,
    golden_carrot: 50,
    golden_beef: 50,
    wheat: 58,
    // ==============武器裝備==============
    wooden_hoe: 50,
    iron_hoe: 50,
    stone_short_knife: 50,
    iron_short_knife: 50,
    stone_sword: 50,
    iron_sword: 50,
    stone_axe: 50,
    iron_axe: 50,
    iron_armor: 1080,
    // ==============藥水==============
    regen_potion: 50,
    poison_potion: 50,
    floating_potion: 50,
    invisibility_potion: 50,
    mystery_potion: 50,
    eye_potion: 50,
    ha_potion: 50,
    jump_potion: 50,
    lucky_potion: 50,
    dizzy_potion: 50,
    unlucky_potion: 50,
    nausea_potion: 50,
    hair_growth_potion: 50,
    revive_potion: 50,
    gold_potion: 50,
    cough_potion: 50,
};

const name = {
    // ==============礦物==============
    coal: "煤炭",
    iron_ore: "鐵礦",
    gold_ore: "金礦",
    diamond_ore: "鑽石礦",
    emerald_ore: "綠寶石礦",
    ruby_ore: "紅寶石礦",
    sapphire_ore: "藍寶石礦",
    stone: "石頭",
    iron: "鐵",
    gold: "金",
    diamond: "鑽石",
    emerald: "綠寶石",
    ruby: "紅寶石",
    sapphire: "藍寶石",
    // ==============木材==============
    oak_wood: "橡木",
    spruce_wood: "雲杉木",
    birch_wood: "白樺木",
    jungle_wood: "叢林木",
    acacia_wood: "金合歡木",
    dark_oak_wood: "深色橡木",
    crimson_wood: "緋紅木",
    warped_wood: "凋零木",
    god_wood: "神木",
    ha_wood: "哈木",
    oak_planks: "橡木板",
    spruce_planks: "雲杉木板",
    birch_planks: "白樺木板",
    jungle_planks: "叢林木板",
    acacia_planks: "金合歡木板",
    dark_oak_planks: "深色橡木板",
    crimson_planks: "緋紅木板",
    warped_planks: "凋零木板",
    god_planks: "神木板",
    ha_planks: "哈木板",
    stick: "木棒",
    // ==============食物(烤魚類也是食物)==============
    shrimp: "烤蝦",
    pork: "烤豬肉",
    beef: "烤牛肉",
    chicken: "烤雞肉",
    duck: "烤鴨肉",
    bread: "麵包",
    potato: "烤馬鈴薯",
    cookie: "餅乾",
    cake: "蛋糕",
    candy: "糖果",
    chocolate: "巧克力",
    pumpkin_pie: "南瓜派",
    melon_slice: "西瓜片",
    golden_apple: "金蘋果",
    enchanted_golden_apple: "附魔金蘋果",
    golden_carrot: "金蘿蔔",
    golden_beef: "金牛肉",
    raw_shrimp: "生蝦",
    raw_pork: "生豬肉",
    raw_beef: "生牛肉",
    raw_chicken: "生雞肉",
    raw_duck: "生鴨肉",
    raw_potato: "馬鈴薯",
    wheat: "小麥",
    // ==============動物==============
    cow: "牛",
    pig: "豬",
    a_chicken: "雞",
    a_duck: "鴨",
    // ==============藥水==============
    regen_potion: "回復藥水",
    poison_potion: "中毒藥水",
    floating_potion: "漂浮藥水",
    invisibility_potion: "隱形藥水",
    mystery_potion: "神秘藥水",
    eye_potion: "眼藥水",
    ha_potion: "哈藥水",
    jump_potion: "跳躍藥水",
    lucky_potion: "幸運藥水",
    dizzy_potion: "眩暈藥水",
    unlucky_potion: "倒楣藥水",
    nausea_potion: "噁心藥水",
    hair_growth_potion: "增髮藥水",
    revive_potion: "復活藥水",
    gold_potion: "黃金藥水",
    cough_potion: "咳嗽藥水",
    // ==============魚類==============
    raw_shrimp: "生蝦",
    raw_cod: "生鱈魚",
    raw_salmon: "生鮭魚",
    raw_tropical_fish: "生熱帶魚",
    raw_pufferfish: "生河豚",
    raw_clownfish: "生小丑魚",
    raw_tuna: "生鮪魚",
    raw_swordfish: "生劍魚",
    raw_anglerfish: "生燈籠魚",
    raw_jellyfish: "生水母",
    raw_octopus: "生章魚",
    raw_squid: "生魷魚",
    raw_crab: "生螃蟹",
    raw_lobster: "生龍蝦",
    raw_eel: "生鰻魚",
    raw_catfish: "生鯰魚",
    raw_goldfish: "生金魚",
    raw_koi: "生錦鯉",
    raw_shark: "生鯊魚",
    raw_whale: "生鯨魚",
    shrimp: "烤蝦",
    cod: "烤鱈魚",
    salmon: "烤鮭魚",
    tropical_fish: "烤熱帶魚",
    pufferfish: "烤河豚",
    clownfish: "烤小丑魚",
    tuna: "烤鮪魚",
    swordfish: "烤劍魚",
    anglerfish: "烤燈籠魚",
    jellyfish: "烤水母",
    octopus: "烤章魚",
    squid: "烤魷魚",
    crab: "烤螃蟹",
    lobster: "烤龍蝦",
    shrimp: "烤蝦子",
    eel: "烤鰻魚",
    catfish: "烤鯰魚",
    goldfish: "烤金魚",
    koi: "烤錦鯉",
    shark: "烤鯊魚",
    whale: "烤鯨魚",
    // ==============武器 & 防具==============
    wooden_hoe: "木鋤",
    iron_hoe: "鐵鋤",
    stone_short_knife: "石短刀",
    iron_short_knife: "鐵短刀",
    stone_sword: "石劍",
    iron_sword: "鐵劍",
    stone_axe: "石斧",
    iron_axe: "鐵斧",
    iron_armor: "鐵製盔甲",
    // ==============tags==============
    "#planks": "任意木板"
    // ==============....==============
};

const name_reverse = Object.entries(name).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
}, {});

function check_item_data() {
    const all_items = [
        ...Object.values(mine_gets),
        ...Object.values(ingots),
        ...Object.values(logs),
        ...Object.values(planks),
        ...Object.values(foods_crops),
        ...Object.values(foods_meat),
        ...Object.keys(recipes),
        ...Object.values(wood_productions),
        ...Object.keys(name).filter(item => !item.startsWith("#")),
    ].flat().filter(item => !["cow", "pig", "a_chicken", "a_duck"].includes(item));


    for (const item_id of all_items) {
        if (!name[item_id]) {
            console.warn(`[警告] 物品ID "${item_id}" 沒有對應的名稱`);
        };
    };

    for (const item_id of all_items) {
        if (!sell_data[item_id]) {
            console.warn(`[警告] 物品ID "${item_id}" 沒有對應的出售價格`);
        };
    };
};

const oven_slots = 3;

module.exports = {
    mine_gets,
    ingots,
    logs,
    planks,
    foods,
    foods_crops,
    foods_meat,
    food_data,
    name,
    name_reverse,
    recipes,
    animals,
    animal_products,
    shop_lowest_price,
    brew,
    fish,
    wood_productions,
    weapons_armor,
    tags,
    bake,
    sell_data,
    check_item_data,
    oven_slots,
};
