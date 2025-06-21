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
    oak_log: "oak_log",
    spruce_log: "spruce_log",
    birch_log: "birch_log",
    jungle_log: "jungle_log",
    acacia_log: "acacia_log",
    dark_oak_log: "dark_oak_log",
    crimson_log: "crimson_log",
    warped_log: "warped_log",
    god_log: "god_log",
    ha_log: "ha_log"
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

const recipes = {};

// 動態生成木材到木板的合成配方，比例 1:4
Object.entries(logs).forEach(([logKey, logValue]) => {
    const plankKey = logKey.replace('_log', '_planks');
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

const foods = {
    shrimp: "shrimp",
    pork: "pork",
    beef: "beef",
    chicken: "chicken",
    duck: "duck",
    raw_shrimp: "raw_shrimp",
    raw_pork: "raw_pork",
    raw_beef: "raw_beef",
    raw_chicken: "raw_chicken",
    raw_duck: "raw_duck",
    bread: "bread",
    cookie: "cookie",
    cake: "cake",
    candy: "candy",
    chocolate: "chocolate",
    pumpkin_pie: "pumpkin_pie",
    melon_slice: "melon_slice",
    golden_apple: "golden_apple",
    enchanted_golden_apple: "enchanted_golden_apple",
    golden_carrot: "golden_carrot",
    golden_beef: "golden_beef",
};

const animals = {
    cow: "cow",
    pig: "pig",
    chicken: "chicken",
    duck: "duck",
    shrimp: "shrimp"
};

const animal_products = {
    cow: "raw_beef",
    pig: "raw_pork",
    chicken: "raw_chicken",
    duck: "raw_duck",
    shrimp: "raw_shrimp"
};

const shop_lowest_price = {
    coal: 50,
    iron_ore: 50,
    gold_ore: 50,
    diamond_ore: 50,
    emerald_ore: 50,
    ruby_ore: 50,
    sapphire_ore: 50,
    stone: 50,
    iron: 50,
    gold: 50,
    diamond: 50,
    emerald: 50,
    ruby: 50,
    sapphire: 50,
    oak_log: 50,
    spruce_log: 50,
    birch_log: 50,
    jungle_log: 50,
    acacia_log: 50,
    dark_oak_log: 50,
    crimson_log: 50,
    warped_log: 50,
    god_log: 50,
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
    raw_shrimp: 50,
    raw_pork: 50,
    raw_beef: 50,
    raw_chicken: 50,
    raw_duck: 50,
    bread: 50,
    cookie: 50,
    cake: 50,
    candy: 50,
    chocolate: 50,
    pumpkin_pie: 50,
    melon_slice: 50,
    golden_apple: 50,
    enchanted_golden_apple: 50,
    golden_carrot: 50,
    golden_beef: 50

};

const food_data = {
    shrimp: 3,
    pork: 3,
    beef: 3,
    chicken: 3,
    duck: 3,
    raw_shrimp: 1,
    raw_pork: 1,
    raw_beef: 1,
    raw_chicken: 1,
    raw_duck: 1,
    bread: 2,
    cookie: 2,
    cake: 2,
    candy: 1,
    chocolate: 2,
    pumpkin_pie: 3,
    melon_slice: 2,
    golden_apple: 3,
    enchanted_golden_apple: 4,
    golden_carrot: 3,
    golden_beef: 3,
};

const name = {
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
    oak_log: "橡木",
    spruce_log: "雲杉木",
    birch_log: "白樺木",
    jungle_log: "叢林木",
    acacia_log: "金合歡木",
    dark_oak_log: "深色橡木",
    crimson_log: "緋紅木",
    warped_log: "凋零木",
    god_log: "神木",
    ha_log: "哈木",
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
    shrimp: "烤蝦",
    pork: "烤豬肉",
    beef: "烤牛肉", 
    chicken: "烤雞肉",
    duck: "烤鴨肉",
    raw_shrimp: "生蝦",
    raw_pork: "生豬肉",
    raw_beef: "生牛肉",
    raw_chicken: "生雞肉", 
    raw_duck: "生鴨肉",
    bread: "麵包",
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
    cow: "牛",
    pig: "豬",
    chicken: "雞",
    duck: "鴨",
    shrimp: "蝦"
};

const name_reverse = Object.entries(name).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
}, {});

module.exports = {
    mine_gets,
    ingots,
    logs,
    foods,
    food_data,
    name,
    name_reverse,
    recipes,
    animals,
    animal_products,
    shop_lowest_price
};
