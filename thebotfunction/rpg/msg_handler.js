const { Client, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, BaseInteraction, ChatInputCommandInteraction, Message, Guild: djsGuild, AttachmentBuilder } = require("discord.js");

const prefix = "!";
const max_hungry = 20;

async function unlock_waiting_handler(lock_name) {
    await new Promise((resolve) => {
        const startTime = Date.now();
        const checkLock = () => {
            if (!lock[lock_name]) {
                resolve();
            } else if (Date.now() - startTime >= 20000) {
                console.warn(`等待${lock_name}解鎖超時，已進行操作(強制解鎖)`);
                resolve();
            } else {
                setTimeout(checkLock, 100);
            };
        };
        checkLock();
    });
};

class MockMessage {
    constructor(content = null, channel = null, author = null, guild = null, mention_user = null) {
        this.content = content;
        this.channel = channel;
        this.author = author;
        this.guild = guild;
        this.mentions = {
            users: {
                first: () => mention_user,
                cache: new Map([[mention_user?.id, mention_user]])
            }
        };
    };

    async reply() {
        return;
    };

    async delete() {
        return;
    };
};

function get_number_of_items(name, userid) {
    const { load_rpg_data } = require("../../module_database.js");
    const { name: name_list } = require("../../rpg.js");
    const rpg_data = load_rpg_data(userid);
    const items = rpg_data.inventory;

    // 如果輸入的是中文名稱，找到對應的英文key
    let item_key = name;
    if (Object.values(name_list).includes(name)) {
        item_key = Object.keys(name_list).find(key => name_list[key] === name);
    };

    if (!item_key) return 0;

    if (!items[item_key]) return 0;
    return items[item_key];
};

function get_amount(item, user, amount) {
    const default_value = 1;

    if (!amount && amount !== 0) return default_value;
    amount = amount.toLowerCase().trim();

    if (amount === "all" && item && user) {
        return get_number_of_items(item, user.id);
    };

    amount = parseInt(amount);
    if (isNaN(amount)) amount = default_value;

    return amount;
};

async function redirect({ client, message, command, mode = 0 }) {
    /*
    m = 0: 也回復訊息
    m = 1: 只回傳訊息參數
    */
    if (![0, 1].includes(mode)) throw new TypeError("Invalid mode");
    // =======
    if (command.includes(prefix)) {
        try {
            throw new Error(`傳送包含${prefix}的指令名已棄用，現在只需要傳送指令名稱`);
        } catch (e) {
            process.emitWarning(e.stack, {
                type: "DeprecationWarning",
                code: "HR_COMMAND_NAME_WITH_HR",
                hint: `請使用不含${prefix}的指令名稱`
            });
        };
    };
    // =======
    if (!command.includes(prefix)) command = prefix + command;
    const msg = new MockMessage(command, message.channel, message.author, message.guild, message.mentions.users.first());
    const message_args = await rpg_handler({ client, message: msg, d: true, mode: 1 });
    if (mode === 1) return message_args;
    return await message.reply(message_args);
};

function get_random_number(userid) {
    // const { HugoUserID } = require("../../config.json");
    // const show_amount = Math.floor(Math.random() * 3) + 1; // 1~3個
    // const min = 500;
    // const max = 3000;
    // const real_amount = userid === HugoUserID ? Math.floor(Math.random() * (max - min + 1)) + min : show_amount;
    // return { show_amount, real_amount };
    const show_amount = real_amount = Math.floor(Math.random() * 3) + 1; // 1~3個
    return { show_amount, real_amount };
};

let cli = null;
let Guild = null;

/**
 * 
 * @param {BaseInteraction | ChatInputCommandInteraction | Message | Client} interaction 
 * @param {EmbedBuilder} embed 
 * @param {string | null} text 
 * @returns {EmbedBuilder}
 */
function setEmbedFooter(interaction, embed, text = null, client = cli) {
    if (interaction instanceof Client || (client && client instanceof Client)) {
        cli = interaction;
    } else if (interaction instanceof BaseInteraction) {
        Guild = interaction.guild;
    } else if (interaction instanceof ChatInputCommandInteraction) {
        Guild = interaction.guild;
    };

    if (text) {
        text += "\n哈狗機器人 ∙ 由哈狗製作";
        text = text.trim();
    } else text = "哈狗機器人 ∙ 由哈狗製作";

    embed.setFooter({
        text,
        iconURL: (client || cli)?.user?.displayAvatarURL({ dynamic: true }),
    });

    return embed;
};

const rpg_emojis = {
    herd: "cow",
    mine: "ore",
    hew: "wood",
    fell: "wood",
    shop: "shop",
    ls: "backpack",
    buy: "coin",
    sell: "coin",
    cd: "timer"
};

const rpg_help = {
    herd: {
        color: 0x00BBFF,
        title: "放牧",
        description: `放牧或屠宰動物`
    },
    mine: {
        color: 0x00BBFF,
        title: "挖礦",
        description: `獲得礦石，可以與其他玩家交易`
    },
    hew: {
        color: 0x00BBFF,
        title: "伐木",
        description: `獲得木頭，合成出的木材可以與其他物品製作成武器和防具`
    },
    fell: {
        color: 0x00BBFF,
        title: "伐木",
        description: `獲得木頭，合成出的木材可以與其他物品製作成武器和防具`
    },
    wood: {
        color: 0x00BBFF,
        title: "伐木",
        description: `獲得木頭，合成出的木材可以與其他物品製作成武器和防具`
    },
    shop: {
        color: 0x00BBFF,
        title: "商店",
        description: `商店可以購買物品`
    },
    ls: {
        color: 0x00BBFF,
        title: "查看背包",
        description: `查看背包中的物品`
    },
    buy: {
        color: 0x00BBFF,
        title: "購買",
        description: `購買物品`
    },
    sell: {
        color: 0x00BBFF,
        title: "出售",
        description: `出售物品`
    },
    cd: {
        color: 0x00BBFF,
        title: "冷卻",
        description: `查看冷卻時間`
    },
};

// Object.assign(rpg_help.fell, rpg_help.hew);
// Object.assign(rpg_help.wood, rpg_help.hew);

function get_help_embed(category, client, message) {
    const { rpg_commands } = require("./msg_handler.js");

    if (!rpg_commands) {
        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle('錯誤')
            .setDescription('無法載入指令列表');
        return setEmbedFooter(client, embed);
    };

    if (!rpg_help[category]) return null;

    const embedData = rpg_help[category];
    const emojiName = rpg_emojis[category] || "question";

    let emojiStr = "❓"; // 預設表情符號
    if (message && message.guild) {
        emojiStr = get_emoji(message.guild, emojiName);
    };

    const embed = new EmbedBuilder()
        .setColor(embedData.color)
        .setTitle(`${emojiStr} | ${embedData.title}`)
        .setDescription(embedData.description);

    return setEmbedFooter(client, embed);
};

function get_emoji(guild = Guild, name) {
    if (guild instanceof djsGuild && (guild != Guild || !Guild)) {
        Guild = guild;
    };

    let emoji = guild.emojis.cache.find(emoji => emoji.name === name);
    if (!emoji) throw new Error(`找不到名為${name}的emoji`);
    emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
    return emoji;
};

function get_cooldown_embed(remaining_time, guild = Guild, client = cli, action, count, message) {
    const emoji = get_emoji(guild, "crosS");
    const timestamp = Math.floor(Date.now() / 1000) + Math.floor(remaining_time / 1000);
    const time = `<t:${timestamp}:T> (<t:${timestamp}:R>)`;

    action = rpg_actions[action];
    const verb = action[0];
    const noun = action[1];

    const embed = new EmbedBuilder()
        .setColor(0xF04A47)
        .setTitle(`${emoji} | 你過勞了！`)
        .setDescription(`你今天${verb}了 \`${count}\` 次${noun}，等待到 ${time} 可以繼續${action.join("")}`);
    return setEmbedFooter(client, embed);
};

function get_cooldown_time(command_name, rpg_data) {
    return eval(rpg_cooldown[command_name].replace("{c}", rpg_data.count[command_name]));
};

/**
 * 檢查指令是否已經冷卻完畢
 * @param {string} command_name - 指令名稱
 * @param {Object} rpg_data - 用戶的RPG數據
 * @returns {{is_finished: boolean, remaining_time: number}} - is_finished:如果已冷卻完畢返回true，否則返回false - remaining_time: 剩餘時間
 */
function is_cooldown_finished(command_name, rpg_data) {
    if (!rpg_cooldown[command_name]) return { is_finished: true, remaining_time: 0 };
    const lastRunTimestamp = rpg_data.lastRunTimestamp[command_name] || 0;
    const now = Date.now();
    const time_diff = now - lastRunTimestamp;
    const cooldown_time = get_cooldown_time(command_name, rpg_data) * 1000; // 轉換為毫秒

    return {
        is_finished: time_diff >= cooldown_time,
        remaining_time: cooldown_time - time_diff
    };
};

/**
 * 增加錢
 * @param {Object} rpg_data 
 * @param {number} amount 
 * @param {string} originalUser 來源用戶 (系統 或者 '<@id>')
 * @param {string} targetUser 目標用戶 (只能是 '<@id>')
 * @param {string} type 交易類型
 * @returns {number}
 */
function add_money({ rpg_data, amount, originalUser, targetUser, type }) {
    rpg_data.money += amount;
    rpg_data.transactions.push({
        timestamp: Math.floor(Date.now() / 1000),
        originalUser,
        targetUser,
        amount,
        type
    });
    return rpg_data.money;
};

/**
 * 扣除錢
 * @param {Object} rpg_data 
 * @param {number} amount 
 * @param {string} originalUser 來源用戶 (系統 或者 '<@id>')
 * @param {string} targetUser 目標用戶 (只能是 '<@id>')
 * @param {string} type 交易類型
 * @returns {number}
 */
function remove_money({ rpg_data, amount, originalUser, targetUser, type }) {
    rpg_data.money -= amount;
    rpg_data.transactions.push({
        timestamp: Math.floor(Date.now() / 1000),
        originalUser,
        targetUser,
        amount,
        type
    });
    return rpg_data.money;
};

function get_loophole_embed(client = cli, guild = Guild, text = null) {
    const emoji_cross = get_emoji(guild, "crosS");

    if (text && !text.includes("```")) {
        text = `\`\`\`${text}\`\`\``;
    };

    const embed = new EmbedBuilder()
        .setColor(0xF04A47)
        .setTitle(`${emoji_cross} | 你戳到了一個漏洞！`)
        .setDescription(text);

    return setEmbedFooter(client, embed)
};

async function ls_function({ client, message, rpg_data, data, args, mode, PASS }) {
    if (!rpg_data.privacy.includes(privacy_data["ls"]) && !PASS) {
        const bag_emoji = get_emoji(message.guild, "bag")
        let embed = new EmbedBuilder()
            .setTitle(`${bag_emoji} | 查看包包`)
            .setColor(0x00BBFF)
            .setDescription(`為保護包包內容隱私權，戳這顆按鈕來看你的包包，隱私權設定可以透過 \`${prefix}privacy\` 指令更改`);

        embed = setEmbedFooter(client, embed);

        const confirm_button = new ButtonBuilder()
            .setCustomId(`ls|${message.author.id}`)
            .setEmoji(bag_emoji)
            .setLabel("查看包包")
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder()
            .addComponents(confirm_button);

        if (mode === 1) return { embeds: [embed], components: [row] };
        return await message.reply({ embeds: [embed], components: [row] });
    };

    const { name, mine_gets, ingots, logs, foods_crops, foods_meat, fish, weapons_armor, wood_productions, brew, planks } = require("../../rpg.js");
    const emojiNames = ["bag", "ore", "farmer", "cow", "swords", "potion"];
    const [bag_emoji, ore_emoji, farmer_emoji, cow_emoji, swords_emoji, potion_emoji] = emojiNames.map(name => {
        return get_emoji(message.guild, name);
    });

    // 分類物品
    const ores = {};
    const ingot_items = {};
    const log_items = {};
    const food_crops_items = {};
    const food_meat_items = {}
    const fish_items = {};
    const weapons_armor_items = {};
    const potions_items = {}
    const other_items = {};

    // 遍歷背包中的物品並分類
    for (const [item, amount] of Object.entries(rpg_data.inventory || {})) {
        if (amount <= 0) continue;

        if (Object.keys(mine_gets).includes(item)) {
            ores[item] = amount;
        } else if (Object.keys(ingots).includes(item)) {
            ingot_items[item] = amount;
        } else if (Object.keys(logs).includes(item) || Object.keys(planks).includes(item) || Object.keys(wood_productions).includes(item)) {
            log_items[item] = amount;
        } else if (Object.keys(foods_crops).includes(item)) {
            food_crops_items[item] = amount;
        } else if (Object.keys(foods_meat).includes(item) && !Object.keys(fish).includes(item)) {
            food_meat_items[item] = amount;
        } else if (Object.keys(fish).includes(item)) {
            fish_items[item] = amount;
        } else if (Object.keys(weapons_armor).includes(item)) {
            weapons_armor_items[item] = amount;
        } else if (Object.keys(brew).includes(item)) {
            potions_items[item] = amount;
        } else {
            other_items[item] = amount;
        };
    };

    // 創建嵌入訊息
    const embed = new EmbedBuilder()
        .setColor(0x00BBFF)
        .setTitle(`${bag_emoji} | 你的背包`);

    setEmbedFooter(client, embed);

    // 使用循環添加各類物品欄位
    const categories = [
        { items: ores, name: `${ore_emoji} 礦物` },
        { items: ingot_items, name: '🔨 金屬錠' },
        { items: log_items, name: '🪵 木材' },
        { items: food_crops_items, name: `${farmer_emoji} 農作物` },
        { items: food_meat_items, name: `${cow_emoji} 肉類` },
        { items: fish_items, name: `🐟 魚類` },
        { items: weapons_armor_items, name: `${swords_emoji} 武器 & 防具` },
        { items: potions_items, name: `${potion_emoji} 藥水` },
        { items: other_items, name: '📦 其他物品' }
    ];

    for (const category of categories) {
        if (Object.keys(category.items).length > 0) {
            const itemsText = Object.entries(category.items)
                .map(([item, amount]) => `${name[item]} \`x${amount.toLocaleString()}\``)
                .join('\n');
            embed.addFields({ name: category.name, value: itemsText, inline: true });
        };
    };

    // 如果背包是空的
    if (Object.keys(rpg_data.inventory || {}).length === 0) {
        embed.setColor(0xF04A47);
        embed.setTitle(`${bag_emoji} | 你的背包裡沒有任何東西`);
    };

    if (mode === 1) return { embeds: [embed] };
    return await message.reply({ embeds: [embed] });
}

/*
rpg_cooldown: {
    command_name: "{c} will be replaced with the command execution times"
}
*/
const rpg_cooldown = {
    // 單位: 秒
    // mine: "150 + {c} * 30",
    // hew: "150 + {c} * 30",
    // herd: "150 + {c} * 30",
    // brew: "150 + {c} * 30",
    // fish: "150 + {c} * 30",
    mine: "{c}",
    hew: "{c}",
    herd: "{c}",
    brew: "{c}",
    fish: "{c}",
};

const rpg_actions = {
    挖礦: ["挖", "礦"],
    伐木: ["伐", "木"],
    放牧: ["放牧", ""],
    釀造: ["釀造", "藥水"],
    抓魚: ["抓", "魚"],
};

// const rpg_work = [
//     "mine",
//     "hew",
//     "herd",
//     "brew",
//     "fish",
// ];

const rpg_work = Object.keys(rpg_cooldown);

const redirect_data = {
    fell: "hew",
    wood: "hew",
    bag: "ls",
    item: "ls",
    money: "m",
    store: "shop",
    mo: "m",
    l: "lazy",
};

const rpg_commands = {
    mine: ["挖礦", "挖礦", async function ({ client, message, rpg_data, data, args, mode }) {
        const { save_rpg_data } = require("../../module_database.js");
        const { mine_gets, name } = require("../../rpg.js");
        const userid = message.author.id;

        const ore_list = Object.values(mine_gets);
        const random_ore = ore_list[Math.floor(Math.random() * ore_list.length)];
        if (!rpg_data.inventory[random_ore]) rpg_data.inventory[random_ore] = 0;
        const { show_amount, real_amount } = get_random_number(userid);

        rpg_data.inventory[random_ore] += real_amount;
        save_rpg_data(userid, rpg_data);
        const ore_name = name[random_ore];
        const emoji = get_emoji(message.guild, "ore")

        let description;
        if (random_ore === "stone") {
            description = `你尋找了很久，最終發現只有 \`${show_amount}\` 個${ore_name}。`;
        } else if (random_ore === "diamond_ore") {
            const min = -64;
            const max = 16;
            const y_pos = Math.floor(Math.random() * (max - min + 1)) + min;
            description = `你尋找了很久，最終在Y座標\`${y_pos}\` 發現了 \`${show_amount}\` 個${ore_name}。`;
        } else {
            description = `在洞口處發現了 \`${show_amount}\` 個${ore_name}！`;
        };
        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle(`${emoji} | 挖礦`)
            .setDescription(description);
        if (mode === 1) return { embeds: [setEmbedFooter(client, embed, `飽食度剩餘 ${rpg_data.hungry}`)] };
        return await message.reply({ embeds: [setEmbedFooter(client, embed, `飽食度剩餘 ${rpg_data.hungry}`)] });
    }],
    hew: ["伐木", "砍砍樹，偶爾可以挖到神木 owob", async function ({ client, message, rpg_data, data, args, mode }) {
        const { save_rpg_data } = require("../../module_database.js");
        const { logs, name } = require("../../rpg.js");
        const userid = message.author.id;

        const { show_amount, real_amount } = get_random_number(userid);
        const log_keys = Object.keys(logs);
        const random_log = logs[log_keys[Math.floor(Math.random() * log_keys.length)]];
        if (!rpg_data.inventory[random_log]) rpg_data.inventory[random_log] = 0;
        const log_name = name[random_log];
        if (!log_name) return await message.reply({ content: `ERROR: 找不到${random_log}的物品名稱: ${log_name}` });

        let description;
        if (random_log === "god_log") {
            description = `本來是平常的一天，居然遇到了神木，於是你砍下了它並獲得了 \`${show_amount}\` 塊${log_name}！`;
        } else {
            description = `你來到了森林，並且砍了 \`${show_amount}\` 塊${log_name}`;
        };

        if (!rpg_data.inventory[random_log]) rpg_data.inventory[random_log] = 0;
        rpg_data.inventory[random_log] += real_amount;
        save_rpg_data(userid, rpg_data);

        const emoji = get_emoji(message.guild, "wood");

        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle(`${emoji} | ${random_log === "god_log" ? "是神?!" : "平常的一天"}`)
            .setDescription(description);

        if (mode === 1) return { embeds: [setEmbedFooter(client, embed, `飽食度剩餘 ${rpg_data.hungry}`)] };
        return await message.reply({ embeds: [setEmbedFooter(client, embed, `飽食度剩餘 ${rpg_data.hungry}`)] });
    }],
    fell: ["伐木", "砍砍樹，偶爾可以挖到神木 owob", async function ({ client, message, rpg_data, data, args, mode }) {

    }],
    wood: ["伐木", "砍砍樹，偶爾可以挖到神木 owob", async function ({ client, message, rpg_data, data, args, mode }) {

    }],
    herd: ["放牧", "放牧或屠宰動物", async function ({ client, message, rpg_data, data, args, mode }) {
        const { save_rpg_data } = require("../../module_database.js");
        const { animals, animal_products, name } = require("../../rpg.js");
        const userid = message.author.id;

        const animal_list = Object.values(animals);
        const random_animal = animal_list[Math.floor(Math.random() * animal_list.length)];
        const product = animal_products[random_animal];

        if (!rpg_data.inventory[product]) rpg_data.inventory[product] = 0;
        const { show_amount, real_amount } = get_random_number(userid);

        rpg_data.inventory[product] += real_amount;
        save_rpg_data(userid, rpg_data);

        const product_name = name[product];
        const animal_name = product_name.replace("生", "").replace("肉", "");
        const emoji = get_emoji(message.guild, rpg_emojis["herd"]);

        const description = `你宰了一隻${animal_name}，獲得了 \`${show_amount}\` 個${product_name}！`;

        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle(`${emoji} | 是${animal_name}`)
            .setDescription(description);

        if (mode === 1) return { embeds: [setEmbedFooter(client, embed, `飽食度剩餘 ${rpg_data.hungry}`)] };
        return await message.reply({ embeds: [setEmbedFooter(client, embed, `飽食度剩餘 ${rpg_data.hungry}`)] });
    }],
    brew: ["釀造", "釀造藥水", async function ({ client, message, rpg_data, data, args, mode }) {
        const { save_rpg_data } = require("../../module_database.js");
        const { brew, name } = require("../../rpg.js");
        const userid = message.author.id;

        const brew_list = Object.values(brew);
        const random_potion = brew_list[Math.floor(Math.random() * brew_list.length)];
        if (!rpg_data.inventory[random_potion]) rpg_data.inventory[random_potion] = 0;
        const potion_name = name[random_potion];
        const { show_amount, real_amount } = get_random_number(userid);
        rpg_data.inventory[random_potion] += real_amount;
        save_rpg_data(userid, rpg_data);

        const emoji_potion = get_emoji(message.guild, "potion");
        let embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle(`${emoji_potion} | 釀造`)
            .setDescription(`你研究了許久，獲得了 \`${show_amount}\` 個${potion_name}`);
        // .setTitle(`${emoji_potion} | 回復藥水可以幹嘛?`)
        // .setDescription(`你研究了許久，獲得了 \`${show_amount}\` 個${potion_name}\n\n之後推出的冒險可以用上`);

        embed = setEmbedFooter(client, embed, `飽食度剩餘 ${rpg_data.hungry}`);

        if (mode === 1) return { embeds: [embed] };
        return await message.reply({ embeds: [embed] });
    }],
    fish: ["抓魚", "魚魚: 漁夫!不要抓我~~~", async function ({ client, message, rpg_data, data, args, mode }) {
        const { save_rpg_data } = require("../../module_database.js");
        const { fish, name } = require("../../rpg.js");
        const userid = message.author.id;

        const fish_list = Object.values(fish);
        const random_fish = fish_list[Math.floor(Math.random() * fish_list.length)];
        if (!rpg_data.inventory[random_fish]) rpg_data.inventory[random_fish] = 0;
        const { show_amount, real_amount } = get_random_number(userid);

        rpg_data.inventory[random_fish] += real_amount;
        save_rpg_data(userid, rpg_data);
        const fish_name = name[random_fish];
        const fail = Math.floor(Math.random() * fish_list.length) + 1 === 1;

        let fish_text;
        let description;
        if (fail) {
            fish_text = "搖到快吐了"
            description = "靠腰！氣象明明說今天天氣很好怎麼會有暴風雨！"
        } else if (random_fish === "raw_salmon") {
            fish_text = "🐢魚"
            description = `你等待了幾個小時，獲得了 \`${show_amount}\` 條${fish_name}！`
        } else if (random_fish === "raw_shrimp") {
            fish_text = "太蝦了吧"
            description = `你打撈了一片蝦子上來，獲得了 \`${show_amount}\` 個${fish_name}！`
        } else if (random_fish === "raw_tuna") {
            fish_text = "呼"
            description = `你等待了幾個小時，打撈到了 \`${show_amount}\` 條${fish_name}！`
        } else if (random_fish === "raw_shark") {
            if (Math.round(Math.random()) === 0) {
                fish_text = "a";
                description = "欸不是這鯊魚也太大了吧 快跑";
            } else {
                fish_text = "小鯊魚";
                description = `這鯊魚好小owo 先帶 \`${show_amount}\` 條 ${fish_name} 回家`;
            };
        } else {
            if (Math.round(Math.random()) === 0) {
                fish_text = "好吃的魚魚！但要怎麼烤呢？"
                description = `你等待了幾個小時，打撈到了 \`${show_amount}\` 條${fish_name}！`
            } else {
                fish_text = "好欸！"
                description = `有 \`${show_amount}\` 條 ${fish_name} 衝到岸上送魚到你手上了！`
            };
        };

        const emoji = get_emoji(message.guild, "fisher")
        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle(`${emoji} | ${fish_text}`)
            .setDescription(description);

        if (mode === 1) return { embeds: [setEmbedFooter(client, embed, `飽食度剩餘 ${rpg_data.hungry}`)] };
        return await message.reply({ embeds: [setEmbedFooter(client, embed, `飽食度剩餘 ${rpg_data.hungry}`)] });
    }],
    shop: ["商店", "對你的商店進行任何操作", async function ({ client, message, rpg_data, data, args, mode }) {
        const { load_shop_data, save_shop_data, save_rpg_data } = require("../../module_database.js");
        const { name, mine_gets, ingots, foods, shop_lowest_price } = require("../../rpg.js");
        const subcommand = args[0];
        switch (subcommand) {
            case "add": {
                const userid = message.author.id;
                const emoji = get_emoji(message.guild, "store");
                const emoji_cross = get_emoji(message.guild, "crosS");
                const shop_data = load_shop_data(userid);
                const status = shop_data.status ? "營業中" : "打烊";
                /*
                指令: hr!shop add <商品名稱/ID> <數量> <售價>
                範例: hr!shop add 鑽石礦 2 600
                範例2: hr!shop add diamond_ore 2 600
                */
                const item_name = name[args[1]] || args[1]; // 物品名稱
                const item = Object.keys(name).find(key => name[key] === item_name); // 物品id
                if (!Object.keys(name).includes(args[1]) && !Object.values(name).includes(args[1])) {
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji} | 未知的物品`);

                    if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                    return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
                };
                const item_exist = shop_data.items[item];
                let amount = args[2];
                if (amount === "all") amount = get_number_of_items(item, userid);
                amount = parseInt(amount);
                if (isNaN(amount)) amount = 1;
                if (amount < 1) {
                    const emoji = get_emoji(message.guild, "crosS");
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji} | 錯誤的數量`);

                    if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                    return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
                };
                // let price = parseInt(args[3]) || item_exist?.price || shop_lowest_price[item];
                let price = parseInt(args[3]) || item_exist?.price;
                if (!price || price < 1 || price >= 1000000000) {
                    const emoji = get_emoji(message.guild, "crosS");
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji} | 錯誤的價格`);

                    if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                    return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
                };
                if (price < shop_lowest_price[item]) {
                    const emoji = get_emoji(message.guild, "crosS");
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji} | 價格低於最低價格`)
                        .setDescription(`請至少販賣一件 \`${shop_lowest_price[item].toLocaleString()}$\``);

                    if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                    return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
                };
                let inventory = rpg_data.inventory;
                if (!inventory[item]) {
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji_cross} | 你沒有這個物品`);

                    if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                    return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
                };
                if (inventory[item] < amount) {
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji} | 你沒有足夠的物品`);

                    if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                    return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
                };
                inventory[item] -= amount;
                save_rpg_data(userid, rpg_data);
                if (item_exist) {
                    shop_data.items[item].amount += amount;
                    if (price) {
                        shop_data.items[item].price = price;
                    };
                } else {
                    shop_data.items[item] = {
                        name: item,
                        amount,
                        price,
                    };
                };
                amount = shop_data.items[item].amount;
                price = shop_data.items[item].price;
                save_shop_data(userid, shop_data);
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`${emoji} | 成功上架`)
                    .setDescription(`你的店面狀態為: \`${status}\`，現在架上有 \`${amount.toLocaleString()}\` 個 \`${item_name}\`，售價為 \`${price.toLocaleString()}$\``);
                if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
            }
            case "remove": {
                const userid = message.author.id;
                const emoji = get_emoji(message.guild, "store");
                const emoji_cross = get_emoji(message.guild, "crosS");
                const shop_data = load_shop_data(userid);
                const item = args[1];
                if (!item) {
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji} | 請輸入要下架的物品`);
                    if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                    return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
                };
                const item_name = name[item] || item;
                const item_id = Object.keys(name).find(key => name[key] === item_name); // 物品id
                const item_exist = shop_data.items[item_id];
                if (!item_exist) {
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji_cross} | 你的商店沒有這個物品`);
                    if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                    return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
                };
                const remove_amount = args[2] || undefined;
                if (!rpg_data.inventory[item_id]) rpg_data.inventory[item_id] = 0;
                const amount = remove_amount ? parseInt(remove_amount) : shop_data.items[item_id].amount;
                if (amount > shop_data.items[item_id].amount) {
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji_cross} | 你沒有足夠的物品`);
                    if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                    return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
                };
                rpg_data.inventory[item_id] += amount;
                save_rpg_data(userid, rpg_data);
                shop_data.items[item_id].amount -= amount;
                if (shop_data.items[item_id].amount <= 0) {
                    delete shop_data.items[item_id];
                };
                save_shop_data(userid, shop_data);
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`${emoji} | 成功下架了 \`${amount.toLocaleString()}\` 個 ${item_name}`);

                if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
            }
            case "list": {
                const user = message.mentions.users.first() || message.author;
                const userid = user.id;

                const emoji_cross = get_emoji(message.guild, "crosS");
                const ore_emoji = get_emoji(message.guild, "ore");
                const food_emoji = get_emoji(message.guild, "bread");
                const shop_data = load_shop_data(userid);

                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setAuthor({
                        name: `${user.username} 的商店 (營業中)`,
                        iconURL: user.displayAvatarURL({ dynamic: true })
                    });

                // 礦物
                const minerals = Object.entries(shop_data.items)
                    .filter(([item]) => Object.values(mine_gets).includes(item) || Object.values(ingots).includes(item))
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([item, data]) => `${name[item]} \`${data.price.toLocaleString()}$\` / 個 (現有 \`${data.amount.toLocaleString()}\` 個)`)
                    .join('\n');
                if (minerals) embed.addFields({ name: `${ore_emoji} 礦物`, value: minerals, inline: false });

                // 食物
                const food = Object.entries(shop_data.items)
                    .filter(([item]) => Object.values(foods).includes(item))
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([item, data]) => `${name[item]} \`${data.price.toLocaleString()}$\` / 個 (現有 \`${data.amount.toLocaleString()}\` 個)`)
                    .join('\n');
                if (food) embed.addFields({ name: `${food_emoji} 食物`, value: food, inline: false });

                // 其他
                const others = Object.entries(shop_data.items)
                    .filter(([item]) => !Object.values(mine_gets).includes(item) && !Object.values(ingots).includes(item) && !Object.values(foods).includes(item))
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([item, data]) => `${name[item]} \`${data.price.toLocaleString()}$\` / 個 (現有 \`${data.amount.toLocaleString()}\` 個)`)
                    .join('\n');
                if (others) embed.addFields({ name: `其他`, value: others, inline: false });

                if ((!minerals && !food && !others) || !shop_data.status) {
                    embed.setTitle(`${emoji_cross} | 商店裡沒有販賣任何東西`);
                    embed.setAuthor(null);
                };
                if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
            }
            case "open":
            case "on": {
                const userid = message.author.id;
                const emoji = get_emoji(message.guild, "store");
                const shop_data = load_shop_data(userid);
                shop_data.status = true;
                save_shop_data(userid, shop_data);
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`${emoji} | 你的商店開始營業啦！`);

                if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
            }
            case "close":
            case "off": {
                const userid = message.author.id;
                const emoji = get_emoji(message.guild, "store");
                const shop_data = load_shop_data(userid);
                shop_data.status = false;
                save_shop_data(userid, shop_data);
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`${emoji} | 你拉下了商店鐵捲門`);

                if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
            }
            case "status": {
                const userid = message.author.id;
                const emoji = get_emoji(message.guild, "store");
                const shop_data = load_shop_data(userid);
                const status = shop_data.status ? "營業中" : "打烊";
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`${emoji} | 你的商店狀態為: ${status}`);

                if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
            }
            default: {
                const user = message.mentions.users.first();
                if (user) {
                    return await redirect({ client, message, command: `shop list ${user.id}`, mode });
                };
                if (mode === 1) return {};
                return;
            };
        };
    }],
    ls: ["查看背包", "查看背包", async function ({ client, message, rpg_data, data, args, mode }) {
        return await ls_function({ client, message, rpg_data, data, args, mode })
    }],
    bag: ["查看背包", "查看背包", async function ({ client, message, rpg_data, data, args, mode }) {

    }],
    item: ["查看背包", "查看背包", async function ({ client, message, rpg_data, data, args, mode }) {

    }],
    buy: ["購買", "購買其他人上架的物品", async function ({ client, message, rpg_data, data, args, mode }) {
        const { load_shop_data, load_rpg_data } = require("../../module_database.js");
        const { name } = require("../../rpg.js");

        const userid = message.author.id;
        const emoji_cross = get_emoji(message.guild, "crosS");
        const emoji_store = get_emoji(message.guild, "store");

        const target_user = message.mentions.users.first();
        if (!target_user) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 你要購買誰的物品？`)
                .setDescription(`
購買指令: hr!buy <用戶提及/id> <物品> <數量>
範例: hr!buy @Hugo哈狗 鐵礦 10`
                );
            if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
        };

        try {
            args = args.filter(arg => arg !== `<@${target_user.id}>` && arg !== `<@!${target_user.id}>`);
        } catch (e) { };

        let args_ = [];
        for (const arg of args) {
            if (!arg.includes("@")) {
                args_.push(arg);
            };
        };
        args = args_.slice();

        if (args.length === 0 && target_user) {
            return await redirect({ client, message, command: `shop list ${target_user.id}`, mode });
        } else if (args.length === 0) {
            return await redirect({ client, message, command: `help`, mode });
        };

        let item = args[0];
        if (!name[item]) {
            // 如果輸入的是中文名稱，找到對應的英文key
            if (Object.values(name).includes(item)) {
                item = Object.keys(name).find(key => name[key] === item);
            };
            if (!name[item]) item = null;
        };

        const shop_data = load_shop_data(target_user.id);
        if (shop_data.items.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 商店裡沒有販賣任何東西`);

            if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
        };
        if (!item) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 這個物品是什麼？我不認識`);

            if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
        };
        if (target_user.id === userid) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 不能購買自己的物品`);

            if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
        };
        // if (target_user.bot) {
        //     const embed = new EmbedBuilder()
        //         .setColor(0xF04A47)
        //         .setTitle(`${emoji_cross} | 不能購買機器人的物品`)
        //         .setFooter({
        //             text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
        //             iconURL: client.user.displayAvatarURL({ dynamic: true }),
        //         });
        //     if (mode === 1) return { embeds: [embed] };
        //     return await message.reply({ embeds: [embed] });
        // };
        if (shop_data.status === false) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_store} | 該商店目前已經打烊了`);

            if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
        };
        const item_name = name[item] || item;
        const item_exist = shop_data.items[item];
        if (!Object.values(name).includes(item_name)) {
            // const embed = new EmbedBuilder()
            //     .setColor(0xF04A47)
            //     .setTitle(`${emoji_cross} | 這是什麼東西？`)
            //     .setFooter({
            //         text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
            //         iconURL: client.user.displayAvatarURL({ dynamic: true }),
            //     });
            // if (mode === 1) return { embeds: [embed] };
            // return await message.reply({ embeds: [embed] });
            return await redirect({ client, message, command: `shop list ${target_user.id}`, mode });
        }
        if (!item_exist) {
            // return await redirect({ client, message, command: `shop list ${target_user.id}`, mode });

            // const msg = new MockMessage(
            //     `hr!shop list ${target_user.id}`,
            //     message.channel,
            //     message.author,
            //     target_user,
            // );

            // const args = await rpg_handler({ client, message: msg, d: true, mode: 1 });
            // return await message.reply(args);

            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 沒有販賣這項物品`);

            if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
        };
        let amount = args[1];
        if (amount === "all") {
            amount = item_exist.amount;
        } else if (amount) {
            // 過濾amount中任何非數字的字元 e.g: $100 -> 100
            amount = amount.toString().replace(/\D/g, '');

            amount = parseInt(amount);
        };
        if (isNaN(amount)) amount = 1;
        if (amount <= 0 || amount > item_exist.amount) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 錯誤的數量`);

            if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
        };
        if (rpg_data.money < item_exist.price * amount) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 歐不！你沒錢了！`)
                .setDescription(`你還差 \`${(item_exist.price * amount - rpg_data.money).toLocaleString()}$\``);

            if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
        };

        // 參數正確，處理購買

        // rpg_data.money = remove_money({
        //     rpg_data,
        //     amount: item_exist.price * amount,
        //     originalUser: `<@${userid}>`,
        //     targetUser: `<@${target_user.id}>`,
        //     type: `購買物品付款`,
        // });
        // rpg_data.inventory[item] += amount;
        // target_user_rpg_data.money = add_money({
        //     rpg_data: target_user_rpg_data,
        //     amount: item_exist.price * amount,
        //     originalUser: `<@${userid}>`,
        //     targetUser: `<@${target_user.id}>`,
        //     type: `購買物品付款`,
        // });
        // shop_data.items[item].amount -= amount;
        // save_rpg_data(userid, rpg_data);
        // save_rpg_data(target_user.id, target_user_rpg_data);
        // save_shop_data(target_user.id, shop_data);

        // const embed = new EmbedBuilder()
        //     .setColor(0x00BBFF)
        //     .setTitle(`${emoji_store} | 購買成功`)
        //     .setDescription(`你購買了 ${item_name} \`x${amount.toLocaleString()}\`，花費 \`${(item_exist.price * amount).toLocaleString()}$\``);

        // if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
        // return await message.reply({ embeds: [setEmbedFooter(client, embed)] });

        const buyer_mention = message.author.toString();
        const targetUserMention = target_user.toString();
        const total_price = (item_exist.price * amount).toLocaleString();
        const pricePerOne = item_exist.price.toLocaleString();

        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle(`${emoji_store} | 購買確認`)
            .setDescription(`
${buyer_mention} 將要花費 \`${total_price}$ (${pricePerOne}$ / 個)\` 購買 ${targetUserMention} 的 ${item_name} \`x${amount.toLocaleString()}\`

請確認價格和商店正確，我們不處理購買糾紛，
如果價格有誤請和賣家確認好。`);

        const confirmButton = new ButtonBuilder()
            .setCustomId(`buy|${message.author.id}|${target_user.id}|${amount}|${item_exist.price}|${item}`)
            .setLabel('確認購買')
            .setStyle(ButtonStyle.Success);

        const cancelButton = new ButtonBuilder()
            .setCustomId(`cancel|${message.author.id}`)
            .setLabel('取消')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(confirmButton, cancelButton);

        if (mode === 1) return { embeds: [setEmbedFooter(client, embed)], components: [row] };
        return await message.reply({ embeds: [setEmbedFooter(client, embed)], components: [row] });
    }],
    m: ["查看餘額", "查看自己的餘額", async function ({ client, message, rpg_data, data, args, mode }) {
        const button = new ButtonBuilder()
            .setCustomId(`rpg_transaction|${message.author.id}`)
            .setLabel('查看交易紀錄')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .addComponents(button);

        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`你目前有 \`${rpg_data.money.toLocaleString()}$\``);
        if (mode === 1) return { embeds: [setEmbedFooter(client, embed)], components: [row] };
        return await message.reply({ embeds: [setEmbedFooter(client, embed)], components: [row] });
    }],
    mo: ["查看餘額", "查看自己的餘額", async function ({ client, message, rpg_data, data, args, mode }) {

    }],
    money: ["查看餘額", "查看自己的餘額", async function ({ client, message, rpg_data, data, args, mode }) {

    }],
    cd: ["查看冷卻剩餘時間", "查看冷卻剩餘時間", async function ({ client, message, rpg_data, data, args, mode }) {
        const lastRunTimestamp = rpg_data.lastRunTimestamp;
        const filtered_lastRunTimestamp = Object.fromEntries(Object.entries(lastRunTimestamp).filter(([command, time]) => rpg_cooldown[command]));

        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle("⏲️ | 冷卻剩餘時間");

        if (Object.keys(filtered_lastRunTimestamp).length === 0) {
            embed.setDescription(`你沒有工作過(挖礦、伐木、放牧等)，所以快快開始工作吧！`);
        } else {
            for (const [command, time] of Object.entries(filtered_lastRunTimestamp)) {
                if (!rpg_cooldown[command]) continue;
                const { is_finished, remaining_time } = is_cooldown_finished(command, rpg_data);
                const name = command;
                let target_time = Math.floor(new Date() / 1000 + remaining_time / 1000);
                target_time = `<t:${target_time}:R>`;
                let value = is_finished ? `冷卻完畢 (${target_time})` : target_time;
                value += `\n上次執行時間: <t:${Math.floor(time / 1000)}:D> <t:${Math.floor(time / 1000)}:T>`;
                value += `\n今天執行了 \`${rpg_data.count[command].toLocaleString()}\` 次`;
                embed.addFields({ name: name, value: value });
            };
        };

        if (mode === 1) return { embeds: [setEmbedFooter(client, embed, null, client)] };
        return await message.reply({ embeds: [setEmbedFooter(client, embed, null, client)] });
    }],
    cdd: ["[簡易]查看冷卻剩餘時間", "查看冷卻剩餘時間，但是只顯示時間", async function ({ client, message, rpg_data, data, args, mode }) {
        const lastRunTimestamp = rpg_data.lastRunTimestamp;
        const filtered_lastRunTimestamp = Object.fromEntries(Object.entries(lastRunTimestamp).filter(([command, time]) => rpg_cooldown[command]));

        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle("⏲️ | 冷卻剩餘時間");

        if (Object.keys(filtered_lastRunTimestamp).length === 0) {
            embed.setDescription(`你沒有工作過(挖礦、伐木、放牧等)，所以快快開始工作吧！`);
        } else {
            for (const [command, time] of Object.entries(filtered_lastRunTimestamp)) {
                if (!rpg_cooldown[command]) continue;
                const { is_finished, remaining_time } = is_cooldown_finished(command, rpg_data);
                const name = command;
                let target_time = Math.floor(new Date() / 1000 + remaining_time / 1000);
                target_time = `<t:${target_time}:R>`;
                let value = is_finished ? `冷卻完畢 (${target_time})` : target_time;
                embed.addFields({ name: name, value: value });
            };
        };

        if (mode === 1) return { embeds: [setEmbedFooter(client, embed, null, client)] };
        return await message.reply({ embeds: [setEmbedFooter(client, embed, null, client)] });
    }],
    pay: ["付款", "付款給其他用戶", async function ({ client, message, rpg_data, data, args, mode }) {
        const target_user = message.mentions.users.first();
        const emoji_cross = get_emoji(message.guild, "crosS");
        const emoji_top = get_emoji(message.guild, "top");
        if (!target_user) {
            return await redirect({ client, message, command: `help`, mode });
        };
        if (target_user.id === message.author.id) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 不能自己付款給自己啊www`);
            if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
        };
        args = args.filter(arg => arg !== `<@${target_user.id}>` && arg !== `<@!${target_user.id}>`);
        if (target_user.bot) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 不能付款給機器人 還是你要把你的錢錢丟進大海`);
            if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
        };
        const amount = args[0];
        if (isNaN(amount) || amount <= 0) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 錯誤的數量`);
            if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
        };
        if (rpg_data.money < amount) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 歐不!`)
                .setDescription(`你還差 \`${(amount - rpg_data.money).toLocaleString()}$\``);
            if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
        };

        const confirmButton = new ButtonBuilder()
            .setCustomId(`pay_confirm|${message.author.id}|${target_user.id}|${amount}|${Date.now()}`)
            .setLabel('確認付款')
            .setStyle(ButtonStyle.Danger);

        const cancelButton = new ButtonBuilder()
            .setCustomId(`pay_cancel|${message.author.id}`)
            .setLabel('取消付款')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder()
            .addComponents(confirmButton, cancelButton);

        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle(`${emoji_top} | 確認付款`)
            .setDescription(`你確定要付款 \`${amount.toLocaleString()}$\` 給 <@${target_user.id}> ?`)
            .setFooter({ text: `此確認將在 30 秒後過期` });

        if (mode === 1) return { embeds: [setEmbedFooter(client, embed)], components: [row] };
        return await message.reply({ embeds: [setEmbedFooter(client, embed)], components: [row] });
    }],
    help: ["查看指令", "查看指令", async function ({ client, message, rpg_data, data, args, mode }) {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`rpg_help_menu|${message.author.id}`)
            .setPlaceholder('選擇要查看的指令類別')
            .addOptions([
                {
                    label: '資源收集',
                    description: '挖礦、伐木等資源收集指令',
                    value: 'gathering'
                },
                {
                    label: '商店系統',
                    description: '商店相關指令',
                    value: 'shop'
                },
                {
                    label: '背包系統',
                    description: '背包相關指令',
                    value: 'inventory'
                },
                {
                    label: '其他指令',
                    description: '其他雜項指令',
                    value: 'others'
                }
            ]);

        const row = new ActionRowBuilder()
            .addComponents(selectMenu);

        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setAuthor({
                name: client.user.globalName || client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription('請選擇要查看的指令類別');
        if (mode === 1) return { embeds: [setEmbedFooter(client, embed)], components: [row] };
        return await message.reply({ embeds: [setEmbedFooter(client, embed)], components: [row] });
    }],
    privacy: ["隱私權", "修改隱私權", async function ({ client, message, rpg_data, data, args, mode }) {
        // const emoji_shield = get_emoji(message.guild, "shield");

        // const embed = new EmbedBuilder()
        //     .setColor(0x00BBFF)
        //     .setTitle(`${emoji_shield} | 隱私權設定`)
        //     .setDescription(`你確定要設定隱私權嗎？`);

        // const row = new ActionRowBuilder()
        //     .addComponents(
        //         new ButtonBuilder()
        //             .setCustomId(`rpg_privacy_menu|${message.author.id}|true`)
        //             .setLabel('確認')
        //             .setStyle(ButtonStyle.Success),
        //         new ButtonBuilder()
        //             .setCustomId(`rpg_privacy_menu|${message.author.id}|false`)
        //             .setLabel('取消')
        //             .setStyle(ButtonStyle.Danger)
        //     );
        // if (mode === 1) return { embeds: [setEmbedFooter(client, embed)], components: [row] };
        // return await message.reply({ embeds: [setEmbedFooter(client, embed)], components: [row] });
        const emojiNames = ["bag", "partner", "shield"];
        const [emoji_backpack, emoji_partner, emoji_shield] = emojiNames.map(name => {
            return get_emoji(message.guild, name);
        });

        rpg_data.privacy.sort((a, b) => {
            const order = { "money": 0, "backpack": 1, "partner": 2 };
            return order[a] - order[b];
        });

        let text;
        if (rpg_data.privacy.length > 0) {
            text = rpg_data.privacy.join('、');
            text = text.replace("money", "金錢").replace("backpack", "背包").replace("partner", "夥伴");
        } else text = "無";


        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle(`${emoji_shield} | 隱私權設定`)
            .setDescription(`
為保護每個人的隱私，可以透過下拉選單來設定 **允許被公開的** 資訊

目前的設定為：\`${text}\``);

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`rpg_privacy_menu|${message.author.id}`)
            .setPlaceholder('選擇要允許的項目')
            .setMinValues(0)
            .setMaxValues(3)
            .addOptions([
                {
                    label: '金錢',
                    description: '擁有的金錢數量、交易記錄',
                    value: 'money',
                    emoji: '💰',
                    default: rpg_data.privacy.includes("money"),
                },
                {
                    label: '背包',
                    description: '背包內的物品',
                    value: 'backpack',
                    emoji: emoji_backpack,
                    default: rpg_data.privacy.includes("backpack"),
                },
                {
                    label: '夥伴',
                    description: '夥伴的清單',
                    value: 'partner',
                    emoji: emoji_partner,
                    default: rpg_data.privacy.includes("partner"),
                }
            ]);

        const row = new ActionRowBuilder()
            .addComponents(selectMenu);

        if (mode === 1) return { embeds: [setEmbedFooter(client, embed)], components: [row] };
        return await message.reply({ embeds: [setEmbedFooter(client, embed)], components: [row] });
    }],
    lazy: ["懶惰", "懶惰地遊玩這個遊戲", async function ({ client, message, rpg_data, data, args, mode }) {
        if (message.channel.id !== "1391989655490265191") return await message.reply("只能在 <#1391989655490265191> 中使用，正式機器人不支援！");
        // if (new Date().getMinutes() % 2 === 0) {
        if (true) {
            const embeds = []
            const cmds = ["mine", "hew", "herd", "brew", "fish"];
            for (const cmd of cmds) {
                const res = await redirect({ client, message, command: cmd, mode: 1 });
                for (const embed of res.embeds) {
                    embeds.push(embed);
                };
            };

            if (mode === 1) return { embeds };
            return await message.reply({ embeds });
        } else {
            const emoji_cross = get_emoji(message.guild, "crosS");

            const embed = new EmbedBuilder()
                .setTitle(`${emoji_cross} | 太懶了辣！`)
                .setColor(0x00BBFF)
                .setThumbnail("https://cdn.discordapp.com/emojis/1368436829371764867.webp?size=96")
                .setDescription("你太懶了，所以我不給你用!lazy了 owo");

            if (mode === 1) return { embeds: [embed] };
            return await message.reply({ embeds: [embed] });
        };
    }],
    eat: ["吃東西", "吃東西回復飽食度", async function ({ client, message, rpg_data, data, args, mode }) {
        const { save_rpg_data } = require("../../module_database.js");
        const { foods, name, food_data, foods_crops, foods_meat, fish } = require("../../rpg.js");

        const user = message.author;
        const userid = user.id;

        const emoji_cross = get_emoji(message.guild, "crosS");
        const drumstick_emoji = get_emoji(message.guild, "drumstick");

        if (args.length > 0) {
            const extra_embeds = [];

            const food_name = name[args[0]] || args[0];
            const food_id = Object.keys(name).find(key => name[key] === food_name);

            // let amount = args[1]?.toLowerCase().trim() || 1;
            // if (amount === "all") amount = get_number_of_items(item, userid);
            // amount = parseInt(amount);
            // if (isNaN(amount)) amount = 1;
            let amount = get_amount(food_id, user, args[1]);
            if (amount < 1) {
                const embed = new EmbedBuilder()
                    .setColor(0xF04A47)
                    .setTitle(`${emoji_cross} | 錯誤的數量`);

                if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
            };

            if (!foods[food_id]) {
                const embed = new EmbedBuilder()
                    .setColor(0xF04A47)
                    .setTitle(`${emoji_cross} | 這啥東西？不能吃欸`);

                if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
            };

            const add = food_data[food_id]
            if (!add) {
                const embed = get_loophole_embed(client, message.guild, `快點找哈狗說你要吃的食物，我不知道要加多少飽食度吧！\n詳細資訊: food_data[${food_id}]為${add}`)

                console.warn(`食物${food_name} (${food_id})在food_data中沒有這個食物的數據`);
                try {
                    throw new Error();
                } catch (e) {
                    console.warn(`called from: ${e.stack}`);
                };

                if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
            };

            if ((rpg_data.hungry + add) > max_hungry) {
                const embed = new EmbedBuilder()
                    .setColor(0xF04A47)
                    .setTitle(`${emoji_cross} | 你已經吃太飽了`);

                if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
            };

            let newadd = add * amount;
            if ((rpg_data.hungry + newadd) > max_hungry) {
                const old_amount = amount;
                amount = Math.floor((max_hungry - rpg_data.hungry) / add);
                newadd = add * amount;

                const embed = new EmbedBuilder()
                    .setColor(0xF04A47)
                    .setTitle(`${emoji_cross} | 你會吃太飽撐死!`)
                    .setDescription(`你想吃掉\`${old_amount.toLocaleString()}\` 個 \`${food_name}\` \n但你最多只能吃掉 \`${amount}\` 個 \`${food_name}\``);

                extra_embeds.push(embed);
            };

            if (!rpg_data.inventory[food_id]) {
                const embed = new EmbedBuilder()
                    .setColor(0xF04A47)
                    .setTitle(`${emoji_cross} | 你沒有這個食物`);

                if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
            };

            rpg_data.hungry += newadd;
            rpg_data.inventory[food_id] -= amount;
            save_rpg_data(userid, rpg_data);

            const embed = new EmbedBuilder()
                .setColor(0x00BBFF)
                .setTitle(`${drumstick_emoji} | 成功進食`)
                .setDescription(`你吃下了 \`${amount}\` 個 \`${food_name}\`，你的體力值增加到了 \`${rpg_data.hungry}\``);

            const embeds = [setEmbedFooter(client, embed), ...extra_embeds.map(e => setEmbedFooter(client, e))];

            if (mode === 1) return { embeds };
            return await message.reply({ embeds });
        } else {
            const embed = new EmbedBuilder()
                .setColor(0x00BBFF)
                .setTitle(`${drumstick_emoji} | 可以吃的東西`)
                .setDescription(`體力值: ${rpg_data.hungry} / ${max_hungry} 點`);

            const food_crops_items = {};
            const food_meat_items = {};
            const fish_items = {};

            // 遍歷背包中的物品並分類
            for (const [item, amount] of Object.entries(rpg_data.inventory || {})) {
                if (amount <= 0) continue;
                // if (!Object.keys(foods).includes(item)) continue;
                if (!Object.keys(food_data).includes(item)) continue;
                // if (item.startsWith("raw_")) continue;

                if (Object.keys(foods_crops).includes(item)) {
                    food_crops_items[item] = amount;
                } else if (Object.keys(foods_meat).includes(item) && !Object.keys(fish).includes(item)) {
                    food_meat_items[item] = amount;
                } else if (Object.keys(fish).includes(item)) {
                    fish_items[item] = amount;
                };
            };

            if (
                Object.keys(food_crops_items).length === 0 &&
                Object.keys(food_meat_items).length === 0 &&
                Object.keys(fish_items).length === 0
            ) {
                const embed = new EmbedBuilder()
                    .setColor(0xF04A47)
                    .setTitle(`${emoji_cross} | 你沒有任何食物`);

                if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
                return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
            };

            const farmer_emoji = get_emoji(message.guild, "farmer");
            const cow_emoji = get_emoji(message.guild, "cow");

            const categories = [
                { items: food_crops_items, name: `${farmer_emoji} 農作物` },
                { items: food_meat_items, name: `${cow_emoji} 肉類` },
                { items: fish_items, name: `🐟 魚類` },
            ];

            for (const category of categories) {
                if (Object.keys(category.items).length > 0) {
                    const itemsText = Object.entries(category.items)
                        .map(([item, amount]) => `${name[item]} \`${amount.toLocaleString()}\` 個 (回復 \`${food_data[item]}\` ${drumstick_emoji})`)
                        .join('\n');
                    embed.addFields({ name: category.name, value: itemsText });
                };
            };

            if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
        };
    }],
    sell: ["出售", "出售物品給系統", async function ({ client, message, rpg_data, data, args, mode }) {
        const { sell_data, name } = require("../../rpg.js");

        const item_name = name[args[0]] || args[0];
        const item_id = Object.keys(name).find(key => name[key] === item_name);

        if (!name[item_id]) {
            const emoji_cross = get_emoji(message.guild, "crosS");

            let embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 未知的物品`);

            embed = setEmbedFooter(client, embed);

            if (mode === 1) return { embeds: [embed] };
            return await message.reply({ embeds: [embed] });
        };

        if (!rpg_data.inventory[item_id]) {
            const emoji_cross = get_emoji(message.guild, "crosS");

            let embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 你沒有這個物品哦`);

            embed = setEmbedFooter(client, embed);

            if (mode === 1) return { embeds: [embed] };
            return await message.reply({ embeds: [embed] });
        };

        const amount = get_amount(item_id || item_name, message.author, args[1]) || 1;
        if (rpg_data.inventory[item_id] < amount) {
            const emoji_cross = get_emoji(message.guild, "crosS");

            let embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 你沒有這麼多的物品哦`);

            embed = setEmbedFooter(client, embed);

            if (mode === 1) return { embeds: [embed] };
            return await message.reply({ embeds: [embed] });
        }

        const price = sell_data[item_id];
        if (!price) {
            const embed = get_loophole_embed(client, message.guild, `詳細資訊: sell_data[${item_id}]為${price}`);

            if (mode === 1) return { embeds: [embed] };
            return await message.reply({ embeds: [embed] });
        };

        const confirm_button = new ButtonBuilder()
            .setCustomId(`sell|${message.author.id}|${item_id}|${price}|${amount}`)
            .setLabel("確認")
            .setStyle(ButtonStyle.Success);

        const cancel_button = new ButtonBuilder()
            .setCustomId(`cancel|${message.author.id}`)
            .setLabel("取消")
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(cancel_button, confirm_button);

        const emoji_trade = get_emoji(message.guild, "trade");

        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle(`${emoji_trade} | 出售確認`)
            .setDescription(`你將要出售 \`${amount.toLocaleString()}\` 個 \`${item_name}\`，共獲得 \`${(price * amount).toLocaleString()}$\``);

        if (mode === 1) return { embeds: [setEmbedFooter(client, embed)], components: [row] };
        return await message.reply({ embeds: [setEmbedFooter(client, embed)], components: [row] });
    }],
    // cmd: ["通過按下按鈕來選擇指令", "PS: 需要參數的指令不行哦！", async function ({ client, message, rpg_data, data, args, mode }) {
    //     const commands = Object.keys(rpg_commands);;

    //     const attachment = new AttachmentBuilder(`./f_images/cmdBlock.webp`, { name: "cmdBlock.webp" });
    //     const embed = new EmbedBuilder()
    //         .setColor(0x00BBFF)
    //         .setTitle(`⚙️ | 選擇指令`)
    //         .setDescription("PS: 需要參數的指令不行哦！")
    //         .setThumbnail("attachment://cmdBlock.webp");

    //     const buttons = commands.map(cmd => {
    //         return new ButtonBuilder()
    //             .setCustomId(`choose_command|${message.author.id}|${cmd}`)
    //             .setLabel(cmd)
    //             .setStyle(ButtonStyle.Primary);
    //     });

    //     // 將按鈕分成每組最多5個
    //     const rows = [];
    //     for (let i = 0; i < buttons.length; i += 5) {
    //         const row = new ActionRowBuilder()
    //             .addComponents(buttons.slice(i, i + 5));
    //         rows.push(row);
    //     };

    //     if (mode === 1) return { embeds: [setEmbedFooter(client, embed)], components: rows, files: [attachment] };
    //     return await message.reply({ embeds: [setEmbedFooter(client, embed)], components: rows, files: [attachment] });
    // }],
    top: ["金錢排行榜", "who!誰是世界首富!是不是你!", async function ({ client, message, rpg_data, data, args, mode }) {
        const { load_rpg_data } = require("../../module_database.js");
        const { GuildID } = require('../../config.json');

        const guild = client.guilds.cache.get(GuildID);
        const members = guild.members.cache.filter(member => !member.user.bot);

        const userDataList = [];
        for (const member of members.values()) {
            const userid = member.user.id;
            userDataList.push({
                user: member.user,
                money: load_rpg_data(userid).money,
            });
        };

        userDataList.sort((a, b) => b.money - a.money);

        const emoji_top = get_emoji(message.guild, "top");

        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle(`${emoji_top} | 金錢排行榜 Top 10`)

        let description = "";
        const topUsers = userDataList.slice(0, 10);

        for (let i = 0; i < topUsers.length; i++) {
            const userData = topUsers[i];
            const rank = i + 1;

            description += `${rank}. ${userData.user.toString()} - \`${userData.money.toLocaleString()}$\`\n`;
        };

        if (description === "") {
            description = "奇怪餒，目前怎麼可能還沒有任何用戶擁有金錢？我壞掉了？";
        };

        embed.setDescription(description);

        if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
        return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
    }],
    last: ['"倒數"金錢排行榜', "讓我們看看誰最窮!嘿嘿", async function ({ client, message, rpg_data, data, args, mode }) {
        const { load_rpg_data } = require("../../module_database.js");
        const { GuildID } = require('../../config.json');

        const guild = client.guilds.cache.get(GuildID);
        const members = guild.members.cache.filter(member => !member.user.bot);

        const userDataList = [];
        for (const member of members.values()) {
            const userid = member.user.id;
            userDataList.push({
                user: member.user,
                money: load_rpg_data(userid).money,
            });
        };

        // 按金錢排序（從高到低）
        userDataList.sort((a, b) => b.money - a.money);

        const emoji_decrease = get_emoji(message.guild, "decrease");

        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle(`${emoji_decrease} | 「倒數」金錢排行榜 Top 10`)

        let description = "";
        const topUsers = userDataList.slice(-10);
        topUsers.reverse();

        for (let i = 0; i < topUsers.length; i++) {
            const userData = topUsers[i];
            const rank = i + 1;

            description += `${rank}. ${userData.user.toString()} - \`${userData.money.toLocaleString()}$\`\n`;
        };

        if (description === "") {
            description = "奇怪餒，目前怎麼可能還沒有任何用戶擁有金錢？我壞掉了？";
        };

        embed.setDescription(description);

        if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
        return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
    }],
    limited: ["???", "???", async function ({ client, message, rpg_data, data, args, mode }) {
        if (message.author.id !== "898836485397180426") return;
        const { load_rpg_data } = require("../../module_database.js");
        const { foods } = require("../../rpg.js");
        const amount = parseInt(args[0]) || 1;
        const msg = await message.reply("處理中...");
        const total = amount;
        const length = 50;
        let completed = 0;
        let last_msg = "";

        // 取得所有可吃的食物
        const food_items = Object.keys(foods);

        const timer = setInterval(async () => {
            const percent = (completed / total).toFixed(4);
            const cell_num = Math.floor(percent * length);

            let cell = '';
            for (let i = 0; i < cell_num; i++) {
                cell += '█';
            };

            let empty = '';
            for (let i = 0; i < length - cell_num; i++) {
                empty += '░';
            };

            const show_completed = completed.toString().padStart(total.toString().length, '0');
            const percentage = (100 * percent).toFixed(2).toString();

            const progressText = `進度: ${percentage}% ${cell}${empty} ${show_completed}/${total}`;

            const embeds = last_msg?.embeds;
            let desc = "";
            if (embeds && embeds[0]) {
                const embed = embeds[0]?.toJSON();
                const description = embed.description || embed.title || "無描述";
                if (!description.includes("天氣")) {
                    const new_description = description
                        .split("`")
                        .slice(1)
                        .join("`")
                        .replace('`', '')
                        .replace("條", '')
                        .replace('！', '')
                        .replace('個', '');

                    const [amount, ...names] = new_description.split(" ");
                    if (amount && names && names.length > 0) {
                        for (const name of names) {
                            if (name.includes("生")) {
                                desc = name;
                                desc += ` x${amount}`;
                                break;
                            };
                        };
                    } else {
                        desc = description;
                    };
                };
            };
            desc = desc.padEnd(13, '|');

            // 重新載入玩家資料
            // if (completed % 1 === 0) {
            if (true) {
                rpg_data = load_rpg_data(message.author.id);
            };

            // 尋找玩家擁有的可吃食物
            let current_food = null;
            for (const food of food_items) {
                if (rpg_data.inventory[food] > 0) {
                    current_food = food;
                    break;
                };
            };

            let txt;
            if (current_food) {
                txt = `${progressText} | 剩下 ${rpg_data.inventory[current_food].toLocaleString()} 個${current_food} | ${desc}`;
            } else {
                txt = `${progressText} | 沒有食物了 | ${desc}`;
            };
            process.stdout.write(txt + "\r");

            if (completed >= total) {
                clearInterval(timer);
                await msg.edit("完成!");
                return;
            };

            const cmds = ["mine", "hew", "herd", "brew", "fish"];
            for (const cmd of cmds) {
                last_msg = await redirect({ client, message, command: cmd, mode: 1 });
            };

            // 如果有食物就吃
            if (current_food) {
                await redirect({ client, message, command: `eat ${current_food} all`, mode: 1 });
            };

            completed += 1;
        }, 10);
    }],
};

const privacy_data = {
    ls: "backpack"
}

/**
 * @param {Client} client 機器人客戶端
 * @param {Message} message 訊息
 * @param {boolean} d
 * @param {number} mode 請求模式 - 0: 預設模式 - 1: 取得訊息回傳參數
 * @returns {Promise<Message | MessagePayload | null>}
 */
async function rpg_handler({ client, message, d, mode = 0 }) {
    const { load_rpg_data, save_rpg_data, loadData } = require("../../module_database.js");
    if (![0, 1].includes(mode)) throw new TypeError("args 'mode' must be 0(default) or 1(get message response args)");

    if (!d) {
        if (message.author.bot) return;
    };

    cli = client;
    let content = message.content.toLowerCase().trim()
    if (!content.startsWith(prefix)) return;
    content = content.replace(prefix, "").trim();
    let [command, ...args] = content.split(" ");
    command = command.toLowerCase().trim();
    command = redirect_data[command] || command;
    if (command.length === 0 || content === prefix) return;
    const cmd_data = rpg_commands[command];

    if (!cmd_data) {
        /*
        // 舊版代碼
        const commands = Object.keys(rpg_commands);
        const cross_emoji = get_emoji(message.guild, "crosS");

        const firstChar = command.charAt(0);
        const similarCommands = commands.filter(cmd => cmd.startsWith(firstChar));

        let description = '';
        if (similarCommands.length > 0) {
            description = `你是不是指：\n${similarCommands.map(cmd => `- hr!${cmd}`).join('\n')}`;
        } else if (command.length > 0) {
            description = `你是指哪個指令？`;
        } else {
            description = `https://cdn.discordapp.com/emojis/1232282096387756032.webp?size=96`;
        };

        const embed = new EmbedBuilder()
            .setColor(0xF04A47)
            .setTitle(`${cross_emoji} | ${command.length > 0 ? `找不到這個指令: \`${command}\`` : '空的指令？'}`)
            .setDescription(description);

        if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
        return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
        */

        const commands = Object.keys(rpg_commands);
        const cross_emoji = get_emoji(message.guild, "crosS");

        command = command.replace(/[^a-zA-Z0-9]/g, '');

        const firstChar = command.charAt(0);
        const similarCommands = commands.filter(cmd => cmd.startsWith(firstChar));

        const embed = new EmbedBuilder()
            .setColor(0xF04A47)
            .setTitle(`${cross_emoji} | 是不是打錯指令了？我找到了你可能想要的指令`);

        if (similarCommands.length === 0) {
            embed.setTitle(`${cross_emoji} | 我找不到你想要選哪個指令餒...`);
            if (mode === 1) return { embeds: [setEmbedFooter(client, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(client, embed)] });
        };

        const buttons = similarCommands.map(cmd => {
            return new ButtonBuilder()
                .setCustomId(`choose_command|${message.author.id}|${cmd}`)
                .setLabel(cmd)
                .setStyle(ButtonStyle.Primary);
        });

        // 將按鈕分成每組最多5個
        const rows = [];
        for (let i = 0; i < buttons.length; i += 5) {
            const row = new ActionRowBuilder()
                .addComponents(buttons.slice(i, i + 5));
            rows.push(row);
        };

        embed.setDescription(`你是不是指：\n${similarCommands.map(cmd => `- ${prefix}${cmd}`).join('\n')}`);
        if (rows.length > 5) {
            rows.length = 0; // 清空rows，等同於 rows = []
            embed.setDescription("太多指令了 owo 我真的不知道你要用什麼指令(||其實是顯示不出來這麼多按鈕||)")
        };

        if (mode === 1) return { embeds: [setEmbedFooter(client, embed)], components: rows };
        return await message.reply({ embeds: [setEmbedFooter(client, embed)], components: rows });
    };

    if (message.guild) Guild = message.guild;
    const execute = cmd_data[2];
    const userid = message.author.id;
    const rpg_data = load_rpg_data(userid);
    const data = loadData(userid);
    const action = cmd_data[0];

    if (rpg_work.includes(command)) {
        if (rpg_data.hungry <= 0) {
            const emoji_cross = get_emoji(message.guild, "crosS");

            const embed = setEmbedFooter(client, new EmbedBuilder()
                .setTitle(`${emoji_cross} | 你的體力不足了！`)
                .setColor(0xF04A47));

            if (mode === 1) return { embeds: [embed] };
            return await message.reply({ embeds: [embed] });
        };
        rpg_data.hungry -= 1;
    };

    if (rpg_cooldown[command] || command === "cd") {
        // if (false) {
        // 檢查上次執行時間是否為今天
        if (rpg_data.lastRunTimestamp && rpg_data.lastRunTimestamp[command]) {
            const lastRunDate = new Date(rpg_data.lastRunTimestamp[command]);
            const today = new Date();

            // 檢查是否為同一天 (比較年、月、日)
            if (lastRunDate.getFullYear() !== today.getFullYear() ||
                lastRunDate.getMonth() !== today.getMonth() ||
                lastRunDate.getDate() !== today.getDate()) {

                // 如果不是同一天，重置計數
                rpg_data.count = {};
                rpg_data.lastRunTimestamp = {};
            };
        };

        for (const cmd of Object.keys(rpg_cooldown)) {
            // 初始化計數器
            if (!rpg_data.count[cmd]) {
                rpg_data.count[cmd] = 0;
            };
            if (!rpg_data.lastRunTimestamp[cmd]) {
                rpg_data.lastRunTimestamp[cmd] = 0;
            };
        };

        const { is_finished, remaining_time } = is_cooldown_finished(command, rpg_data);

        // 冷卻
        if (!is_finished) {
            if (mode === 1) return { embeds: [get_cooldown_embed(remaining_time, message.guild, client, action, rpg_data.count[command], message)] };
            return await message.reply({ embeds: [get_cooldown_embed(remaining_time, message.guild, client, action, rpg_data.count[command], message)] });
        };

        // 增加計數
        rpg_data.count[command]++;

        rpg_data.lastRunTimestamp[command] = Date.now();
        save_rpg_data(userid, rpg_data);
    };

    if (rpg_work.includes(command) && rpg_data.hungry === 0) {
        const { foods } = require("../../rpg.js");
        const food_items = Object.keys(foods);
        let found_food = null;
        for (const food of food_items) {
            if (rpg_data.inventory && rpg_data.inventory[food] > 0) {
                found_food = food;
                break;
            };
        };
        if (found_food) {
            // 嘗試自動吃掉一個食物
            if (typeof rpg_commands.eat?.[2] === "function") {
                await rpg_commands.eat[2]({ client, message, rpg_data, data, args: [found_food, "all"], mode });
            }
        } else {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle("你已經餓到沒有食物可以吃了！請先補充食物！");

            if (mode === 1) return { embeds: [embed] };
            return await message.reply({ embeds: [embed] });
        };
    };

    const result = await execute({ client, message, rpg_data, data, args, mode });
    if (mode === 1) return result;
};

let lock = {
    rpg_handler: false,
};

module.exports = {
    setup(client) {
        client.on(Events.MessageCreate, async (message) => {
            try {
                if (lock.rpg_handler) {
                    await unlock_waiting_handler("rpg_handler");
                };
                lock.rpg_handler = true;
                await rpg_handler({ client, message });
            } catch (error) {
                require("../../module_senderr.js").senderr({ client, msg: `處理rpg遊戲訊息時發生錯誤: ${error.stack}`, clientready: true });
            } finally {
                lock.rpg_handler = false;
            };
        });
    },
    rpg_commands,
    rpg_help,
    rpg_emojis,
    get_help_embed,
    redirect,
    get_number_of_items,
    get_random_number,
    get_loophole_embed,
    setEmbedFooter,
    unlock_waiting_handler,
    MockMessage,
    get_emoji,
    rpg_handler,
    add_money,
    remove_money,
    ls_function,
    prefix,
};
