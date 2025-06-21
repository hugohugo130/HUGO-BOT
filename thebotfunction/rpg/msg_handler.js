const { Client, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, BaseInteraction, ChatInputCommandInteraction, Message, Embed } = require("discord.js");

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

async function redirect({ client, message, command, mode = 0 }) {
    /*
    m = 0: 也回復訊息
    m = 1: 只回傳訊息參數
    */
    if (![0, 1].includes(mode)) throw new TypeError("Invalid mode");
    if (command.includes("hr!")) {
        try {
            throw new Error("傳送包含hr!的指令名已棄用，現在只需要傳送指令名稱");
        } catch (e) {
            process.emitWarning(e.stack, {
                type: "DeprecationWarning",
                code: "HR_COMMAND_NAME_WITH_HR",
                hint: "請使用不含hr!的指令名稱"
            });
        };
    };
    if (!command.includes("hr!")) command = "hr!" + command;
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
    }
    embed.setFooter({
        text: text || "哈狗機器人 ∙ 由哈狗製作",
        iconURL: client?.user?.displayAvatarURL({ dynamic: true }),
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
        title: "屠宰",
        description: `屠宰動物`
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
    }
};

// 將fell指向hew的資料
rpg_help.fell = rpg_help.hew;

function get_help_embed(category, client, message) {
    const { rpg_commands } = require("./msg_handler.js");

    if (!rpg_commands) {
        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle('錯誤')
            .setDescription('無法載入指令列表');
        return setEmbedFooter(message, embed);
    };

    if (!rpg_help[category]) return null;

    const embedData = rpg_help[category];
    const emojiName = rpg_emojis[category] || "question";

    let emojiStr = "❓"; // 預設表情符號
    if (message && message.guild) {
        const emoji = message.guild.emojis.cache.find(emoji => emoji.name === emojiName);
        if (emoji) {
            emojiStr = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
        };
    };

    const embed = new EmbedBuilder()
        .setColor(embedData.color)
        .setTitle(`${emojiStr} | ${embedData.title}`)
        .setDescription(embedData.description);
    return setEmbedFooter(message, embed);
};

function get_emoji(guild = Guild, name) {
    let emoji = guild.emojis.cache.find(emoji => emoji.name === name);
    if (!emoji) throw new Error(`找不到名為${name}的emoji`);
    emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
    return emoji;
};

function get_cooldown_embed(remaining_time, guild = Guild, client = cli, action, count, message) {
    const emoji = get_emoji(guild, "crosS");
    const timestamp = Math.floor(Date.now() / 1000) + Math.floor(remaining_time / 1000);
    const time = `<t:${timestamp}:T> (<t:${timestamp}:R>)`;
    const embed = new EmbedBuilder()
        .setColor(0xF04A47)
        .setTitle(`${emoji} | 你過勞了！`)
        .setDescription(`你今天${action}了 \`${count}\` 次，等待到 ${time} 可以繼續${action}`);
    return setEmbedFooter(message, embed);
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


/*
rpg_cooldown: {
    command_name: "{c} will be replaced with the command execution times"
}
*/
const rpg_cooldown = {
    // 單位: 秒
    mine: "{c} * 30",
    hew: "{c} * 30",
    herd: "{c} * 30",
};

const rpg_commands = {
    herd: ["屠宰", "屠宰動物", async function ({ client, message, rpg_data, data, args, mode }) {
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

        const animal_name = name[random_animal];
        const product_name = name[product];
        const emoji = get_emoji(message.guild, rpg_emojis["herd"]);

        const description = `你宰了一隻${animal_name}，獲得了 \`${show_amount}\` 個${product_name}！`;

        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle(`${emoji} | 是${animal_name}`)
            .setDescription(description);

        if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
        return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
    }],
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
        let emoji = message.guild.emojis.cache.find(emoji => emoji.name === "ore");
        emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
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
        if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
        return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
    }],
    hew: ["伐木", "砍砍樹，偶爾可以挖到神木 owob", async function ({ client, message, rpg_data, data, args, mode }) {
        const { save_rpg_data } = require("../../module_database.js");
        const { logs, name } = require("../../rpg.js");
        const userid = message.author.id;

        const { show_amount, real_amount } = get_random_number(userid);
        const log_keys = Object.keys(logs);
        const random_log = logs[log_keys[Math.floor(Math.random() * log_keys.length)]];
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

        if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
        return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
    }],
    fell: ["伐木", "砍砍樹，偶爾可以挖到神木 owob", async function ({ client, message, rpg_data, data, args, mode }) {
        return await redirect({ client, message, command: `hew`, mode });
    }],
    wood: ["伐木", "砍砍樹，偶爾可以挖到神木 owob", async function ({ client, message, rpg_data, data, args, mode }) {
        return await redirect({ client, message, command: `hew`, mode });
    }],
    shop: ["商店", "對你的商店進行任何操作", async function ({ client, message, rpg_data, data, args, mode }) {
        const { load_shop_data, save_shop_data, save_rpg_data } = require("../../module_database.js");
        const { name, mine_gets, ingots, foods, shop_lowest_price } = require("../../rpg.js");
        const subcommand = args[0];
        switch (subcommand) {
            case "add": {
                const userid = message.author.id;
                let emoji = message.guild.emojis.cache.find(emoji => emoji.name === "store");
                emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
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
                    let emoji = message.guild.emojis.cache.find(emoji => emoji.name === "crosS");
                    emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji} | 未知的物品`);

                    if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
                    return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
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

                    if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
                    return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
                };
                let price = parseInt(args[3]) || item_exist?.price || shop_lowest_price[item];
                if (!price || price < 1) {
                    const emoji = get_emoji(message.guild, "crosS");
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji} | 錯誤的價格`);

                    if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
                    return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
                };
                let inventory = rpg_data.inventory;
                if (!inventory[item]) {
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji} | 你沒有這個物品`);

                    if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
                    return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
                };
                if (inventory[item] < amount) {
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji} | 你沒有足夠的物品`);

                    if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
                    return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
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
                if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
                return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
            }
            case "remove": {
                const userid = message.author.id;
                let emoji = message.guild.emojis.cache.find(emoji => emoji.name === "store");
                const shop_data = load_shop_data(userid);
                const item = args[1];
                if (!item) {
                    emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji} | 請輸入要下架的物品`);
                    if (mode === 1) return { embeds: [embed] };
                    return await message.reply({ embeds: [embed] });
                };
                const item_name = name[item] || item;
                const item_id = Object.keys(name).find(key => name[key] === item_name); // 物品id
                const item_exist = shop_data.items[item_id];
                if (!item_exist) {
                    emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji} | 你的商店沒有這個物品`);
                    if (mode === 1) return { embeds: [embed] };
                    return await message.reply({ embeds: [embed] });
                };
                if (!rpg_data.inventory[item_id]) rpg_data.inventory[item_id] = 0;
                const amount = shop_data.items[item_id].amount;
                rpg_data.inventory[item_id] += amount;
                save_rpg_data(userid, rpg_data);
                delete shop_data.items[item_id];
                save_shop_data(userid, shop_data);
                emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`${emoji} | 成功下架了 ${item_name}`);
                if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
                return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
            }
            case "list": {
                const user = message.mentions.users.first() || message.author;
                const userid = user.id;
                let emoji = message.guild.emojis.cache.find(emoji => emoji.name === "store");
                let emoji_cross = message.guild.emojis.cache.find(emoji => emoji.name === "crosS");
                let ore_emoji = message.guild.emojis.cache.find(emoji => emoji.name === "ore");
                let food_emoji = message.guild.emojis.cache.find(emoji => emoji.name === "bread");
                emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
                emoji_cross = `<${emoji_cross.animated ? 'a' : ''}:${emoji_cross.name}:${emoji_cross.id}>`;
                ore_emoji = `<${ore_emoji.animated ? 'a' : ''}:${ore_emoji.name}:${ore_emoji.id}>`;
                food_emoji = `<${food_emoji.animated ? 'a' : ''}:${food_emoji.name}:${food_emoji.id}>`;
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
                if (minerals) embed.addFields({ name: `${ore_emoji} 礦物`, value: minerals, inline: true });

                // 食物
                const food = Object.entries(shop_data.items)
                    .filter(([item]) => Object.values(foods).includes(item))
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([item, data]) => `${name[item]} \`${data.price.toLocaleString()}$\` / 個 (現有 \`${data.amount.toLocaleString()}\` 個)`)
                    .join('\n');
                if (food) embed.addFields({ name: `${food_emoji} 食物`, value: food, inline: true });

                // 其他
                const others = Object.entries(shop_data.items)
                    .filter(([item]) => !Object.values(mine_gets).includes(item) && !Object.values(ingots).includes(item) && !Object.values(foods).includes(item))
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([item, data]) => `${name[item]} \`${data.price.toLocaleString()}$\` / 個 (現有 \`${data.amount.toLocaleString()}\` 個)`)
                    .join('\n');
                if (others) embed.addFields({ name: `其他`, value: others, inline: true });

                if ((!minerals && !food && !others) || !shop_data.status) {
                    embed.setTitle(`${emoji_cross} | 商店裡沒有販賣任何東西`);
                    embed.setAuthor(null);
                };
                if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
                return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
            }
            case "open" | "on": {
                const userid = message.author.id;
                let emoji = message.guild.emojis.cache.find(emoji => emoji.name === "store");
                emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
                const shop_data = load_shop_data(userid);
                shop_data.status = true;
                save_shop_data(userid, shop_data);
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`${emoji} | 你的商店開始營業啦！`);
                if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
                return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
            }
            case "close" | "off": {
                const userid = message.author.id;
                let emoji = message.guild.emojis.cache.find(emoji => emoji.name === "store");
                emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
                const shop_data = load_shop_data(userid);
                shop_data.status = false;
                save_shop_data(userid, shop_data);
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`${emoji} | 你拉下了商店鐵捲門`);
                if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
                return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
            }
            case "status": {
                const userid = message.author.id;
                let emoji = message.guild.emojis.cache.find(emoji => emoji.name === "store");
                emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
                const shop_data = load_shop_data(userid);
                const status = shop_data.status ? "營業中" : "打烊";
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`${emoji} | 你的商店狀態為: ${status}`);
                if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
                return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
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
        const { name, mine_gets, ingots, logs, foods } = require("../../rpg.js");
        const emojiNames = ["bag", "ore", "bread"];
        const [bag_emoji, ore_emoji, food_emoji] = emojiNames.map(name => {
            return get_emoji(message.guild, name);
        });

        // 分類物品
        const ores = {};
        const ingot_items = {};
        const log_items = {};
        const food_items = {};
        const other_items = {};

        // 遍歷背包中的物品並分類
        for (const [item, amount] of Object.entries(rpg_data.inventory || {})) {
            if (amount <= 0) continue;

            if (Object.keys(mine_gets).includes(item)) {
                ores[item] = amount;
            } else if (Object.keys(ingots).includes(item)) {
                ingot_items[item] = amount;
            } else if (Object.keys(logs).includes(item)) {
                log_items[item] = amount;
            } else if (Object.keys(foods).includes(item)) {
                food_items[item] = amount;
            } else {
                other_items[item] = amount;
            };
        };

        // 創建嵌入訊息
        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle(`${bag_emoji} | 你的背包`);

        setEmbedFooter(message, embed);

        // 使用循環添加各類物品欄位
        const categories = [
            { items: ores, name: `${ore_emoji} 礦物` },
            { items: ingot_items, name: '🔨 金屬錠' },
            { items: log_items, name: '🪵 木材' },
            { items: food_items, name: `${food_emoji} 食物` },
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
    }],
    bag: ["查看背包", "查看背包", async function ({ client, message, rpg_data, data, args, mode }) {
        return await redirect({ client, message, command: `ls`, mode });
    }],
    item: ["查看背包", "查看背包", async function ({ client, message, rpg_data, data, args, mode }) {
        return await redirect({ client, message, command: `ls`, mode });
    }],
    buy: ["購買", "購買其他人上架的物品", async function ({ client, message, rpg_data, data, args, mode }) {
        const { load_shop_data, save_shop_data, load_rpg_data, save_rpg_data } = require("../../module_database.js");
        const { name } = require("../../rpg.js");
        const userid = message.author.id;
        let emoji_cross = message.guild.emojis.cache.find(emoji => emoji.name === "crosS");
        let emoji_store = message.guild.emojis.cache.find(emoji => emoji.name === "store");
        emoji_cross = `<${emoji_cross.animated ? 'a' : ''}:${emoji_cross.name}:${emoji_cross.id}>`;
        emoji_store = `<${emoji_store.animated ? 'a' : ''}:${emoji_store.name}:${emoji_store.id}>`;
        const target_user = message.mentions.users.first();
        const target_user_rpg_data = load_rpg_data(target_user.id);

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

        if (!target_user) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 你要購買誰的物品？`)
                .setDescription(`
購買指令: hr!buy <用戶提及/id> <物品> <數量>
範例: hr!buy @Hugo哈狗 鐵礦 10`
                );
            if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
        };
        const shop_data = load_shop_data(target_user.id);
        if (shop_data.items.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 商店裡沒有販賣任何東西`);

            if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
        };
        if (!item) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 這個物品是什麼？我不認識`);

            if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
        };
        if (target_user.id === userid) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 不能購買自己的物品`);

            if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
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
                .setTitle(`${emoji_cross} | ${target_user.toString()} 的商店已打烊`);

            if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
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

            if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
        };
        let amount = args[1];
        if (amount === "all") {
            amount = item_exist.amount;
        } else {
            // 過濾amount中任何非數字的字元 e.g: $100 -> 100
            amount = amount.toString().replace(/\D/g, '');

            amount = parseInt(amount);
        };
        if (isNaN(amount)) amount = 1;
        if (amount <= 0 || amount > item_exist.amount) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 錯誤的數量`);

            if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
        };
        if (rpg_data.money < item_exist.price * amount) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 歐不！你沒錢了！`)
                .setDescription(`你還差 \`${(item_exist.price * amount - rpg_data.money).toLocaleString()}$\``);

            if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
        };
        rpg_data.money -= item_exist.price * amount;
        rpg_data.inventory[item] += amount;
        target_user_rpg_data.money += item_exist.price * amount;
        shop_data.items[item].amount -= amount;
        save_rpg_data(userid, rpg_data);
        save_rpg_data(target_user.id, target_user_rpg_data);
        save_shop_data(target_user.id, shop_data);
        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle(`${emoji_store} | 購買成功`)
            .setDescription(`你購買了 ${item_name} \`x${amount.toLocaleString()}\`，花費 \`${(item_exist.price * amount).toLocaleString()}$\``);
        if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
        return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
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
        if (mode === 1) return { embeds: [setEmbedFooter(message, embed)], components: [row] };
        return await message.reply({ embeds: [setEmbedFooter(message, embed)], components: [row] });
    }],
    money: ["查看餘額", "查看自己的餘額", async function ({ client, message, rpg_data, data, args, mode }) {
        return await redirect({ client, message, command: "m", mode });
    }],
    cd: ["查看冷卻剩餘時間", "查看冷卻剩餘時間", async function ({ client, message, rpg_data, data, args, mode }) {
        const lastRunTimestamp = rpg_data.lastRunTimestamp;
        const filtered_lastRunTimestamp = Object.fromEntries(Object.entries(lastRunTimestamp).filter(([command, time]) => rpg_cooldown[command]));

        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle("⏲️ | 冷卻剩餘時間");

        if (Object.keys(filtered_lastRunTimestamp).length === 0) {
            embed.setDescription(`你沒有工作過(挖礦、伐木、屠宰等)，所以快快開始工作吧！`);
        } else {
            for (const [command, time] of Object.entries(filtered_lastRunTimestamp)) {
                if (!rpg_cooldown[command]) continue;
                const { is_finished, remaining_time } = is_cooldown_finished(command, rpg_data);
                const name = command;
                let target_time = Math.floor(new Date() / 1000 + remaining_time / 1000);
                target_time = `<t:${target_time}:R>`;
                let value = is_finished ? `冷卻完畢 (${target_time})` : target_time;
                value += `\n上次執行時間: <t:${Math.floor(time / 1000)}:D> <t:${Math.floor(time / 1000)}:T>`;
                embed.addFields({ name: name, value: value });
            };
        };

        if (mode === 1) return { embeds: [setEmbedFooter(message, embed, null, client)] };
        return await message.reply({ embeds: [setEmbedFooter(message, embed, null, client)] });
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
            if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
        };
        args = args.filter(arg => arg !== `<@${target_user.id}>` && arg !== `<@!${target_user.id}>`);
        if (target_user.bot) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 不能付款給機器人 還是你要把你的錢錢丟進大海`);
            if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
        };
        const amount = args[0];
        if (isNaN(amount) || amount <= 0) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 錯誤的數量`);
            if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
        };
        if (rpg_data.money < amount) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 歐不!`)
                .setDescription(`你還差 \`${(amount - rpg_data.money).toLocaleString()}$\``);
            if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
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

        if (mode === 1) return { embeds: [setEmbedFooter(message, embed)], components: [row] };
        return await message.reply({ embeds: [setEmbedFooter(message, embed)], components: [row] });
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
        if (mode === 1) return { embeds: [setEmbedFooter(message, embed)], components: [row] };
        return await message.reply({ embeds: [setEmbedFooter(message, embed)], components: [row] });
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
        // if (mode === 1) return { embeds: [setEmbedFooter(message, embed)], components: [row] };
        // return await message.reply({ embeds: [setEmbedFooter(message, embed)], components: [row] });
        const emojiNames = ["bag", "partner", "shield"];
        const [emoji_backpack, emoji_partner, emoji_shield] = emojiNames.map(name => {
            return get_emoji(message.guild, name);
        });


        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle(`${emoji_shield} | 隱私權設定`)
            .setDescription(`
為保護每個人的隱私，可以透過下拉選單來設定 **允許被公開的** 資訊

目前的設定為：\`${rpg_data.privacy.length > 0 ? rpg_data.privacy.join('、') : '無'}\``);

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`rpg_privacy_menu|${message.author.id}`)
            .setPlaceholder('選擇要允許的項目')
            .setMinValues(0)
            .setMaxValues(3)
            .addOptions([
                {
                    label: '金錢',
                    description: '擁有的金錢數量、交易記錄',
                    value: '金錢',
                    emoji: '💰'
                },
                {
                    label: '背包',
                    description: '背包內的物品',
                    value: '背包',
                    emoji: emoji_backpack
                },
                {
                    label: '夥伴',
                    description: '夥伴的清單',
                    value: '夥伴',
                    emoji: emoji_partner
                }
            ]);

        const row = new ActionRowBuilder()
            .addComponents(selectMenu);

        if (mode === 1) return { embeds: [setEmbedFooter(message, embed)], components: [row] };
        return await message.reply({ embeds: [setEmbedFooter(message, embed)], components: [row] });
    }],
};

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
    if (!content.startsWith("hr!")) return;
    content = content.replace("hr!", "").trim();
    let [command, ...args] = content.split(" ");
    command = command.toLowerCase().trim();
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

        if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
        return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
        */

        const commands = Object.keys(rpg_commands);
        const cross_emoji = get_emoji(message.guild, "crosS");

        const firstChar = command.charAt(0);
        const similarCommands = commands.filter(cmd => cmd.startsWith(firstChar));

        const embed = new EmbedBuilder()
            .setColor(0xF04A47)
            .setTitle(`${cross_emoji} | 是不是打錯指令了？我找到了你可能想要的指令`);

        if (similarCommands.length === 0) {
            embed.setTitle(`${cross_emoji} | 我找不到你想要選哪個指令餒...`);
            if (mode === 1) return { embeds: [setEmbedFooter(message, embed)] };
            return await message.reply({ embeds: [setEmbedFooter(message, embed)] });
        };

        const buttons = similarCommands.map(cmd => {
            return new ButtonBuilder()
                .setCustomId(`choose_command|${message.author.id}|${cmd}`)
                .setLabel(cmd)
                .setStyle(ButtonStyle.Primary);
        });

        const row = new ActionRowBuilder()
            .addComponents(buttons);

        embed.setDescription(`你是不是指：\n${similarCommands.map(cmd => `- hr!${cmd}`).join('\n')}`);

        if (mode === 1) return { embeds: [setEmbedFooter(message, embed)], components: [row] };
        return await message.reply({ embeds: [setEmbedFooter(message, embed)], components: [row] });
    };
    if (message.guild) Guild = message.guild;
    const execute = cmd_data[2];
    const userid = message.author.id;
    const rpg_data = load_rpg_data(userid);
    const data = loadData(userid);
    const action = cmd_data[0];

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
        };
    };

    // 初始化計數器
    if (!rpg_data.count[command]) {
        rpg_data.count[command] = 0;
    };

    const { is_finished, remaining_time } = is_cooldown_finished(command, rpg_data);

    // 冷卻
    if (rpg_cooldown[command] && !is_finished) {
        if (mode === 1) return { embeds: [get_cooldown_embed(remaining_time, message.guild, client, action, rpg_data.count[command], message)] };
        return await message.reply({ embeds: [get_cooldown_embed(remaining_time, message.guild, client, action, rpg_data.count[command], message)] });
    };

    // 增加計數
    rpg_data.count[command]++;

    rpg_data.lastRunTimestamp[command] = Date.now();
    save_rpg_data(userid, rpg_data);

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
    setEmbedFooter,
    unlock_waiting_handler,
    MockMessage,
    get_emoji,
};
