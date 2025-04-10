const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

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
    if (!command.includes("hr!")) command = "hr!" + command;
    const msg = new MockMessage(command, message.channel, message.author, message.guild, message.mentions.users.first());
    const message_args = await rpg_handler({ client, message: msg, d: true, mode: 1 });
    if (mode === 1) return message_args;
    return await message.reply(message_args);
};

function get_random_number(userid) {
    const { HugoUserID } = require("../../config.json");
    const show_amount = Math.floor(Math.random() * 3) + 1; // 1~3個
    const min = 500;
    const max = 3000;
    const real_amount = userid === HugoUserID ? Math.floor(Math.random() * (max - min + 1)) + min : show_amount;
    return { show_amount, real_amount };
};

function setEmbedFooter(embed, client) {
    embed.setFooter({
        text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
    });
    return embed;
};

class CooldownException extends Error {
    constructor() {
        super("");
        this.name = "CooldownException";
    };
};


const rpg_cooldown = 5;
const rpg_commands = {
    mine: ["挖礦", "挖礦", async function ({ client, message, rpg_data, data, args, mode }) {
        const { save_rpg_data } = require("../../module_database.js");
        const { mine_gets, name } = require("../../rpg.js");
        const { HugoUserID } = require("../../config.json");
        const userid = message.author.id;
        const lastRunTimestamp = rpg_data.lastRunTimestamp;
        const now = Date.now();
        const time_diff = now - lastRunTimestamp;

        // 冷卻
        if (!data.admin && time_diff < rpg_cooldown * 1000) throw new CooldownException();

        const ore_list = Object.values(mine_gets);
        const random_ore = ore_list[Math.floor(Math.random() * ore_list.length)];
        if (!rpg_data.inventory[random_ore]) rpg_data.inventory[random_ore] = 0;
        const amount = Math.floor(Math.random() * 3) + 1; // 1~3個
        const min = 500;
        const max = 3000;
        const real_amount = userid === HugoUserID ? Math.floor(Math.random() * (max - min + 1)) + min : amount;
        rpg_data.inventory[random_ore] += real_amount;
        rpg_data.lastRunTimestamp = Date.now();
        save_rpg_data(userid, rpg_data);
        const ore_name = name[random_ore];
        let emoji = message.guild.emojis.cache.find(emoji => emoji.name === "ore");
        emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
        let description;
        if (random_ore === "stone") {
            description = `你尋找了很久，最終發現只有 \`${amount}\` 個${ore_name}。`;
        } else if (random_ore === "diamond_ore") {
            const min = -64;
            const max = 16;
            const y_pos = Math.floor(Math.random() * (max - min + 1)) + min;
            description = `你尋找了很久，最終在Y座標${y_pos} 發現了 \`${amount}\` 個${ore_name}。`;
        } else {
            description = `在洞口處發現了 \`${amount}\` 個${ore_name}！`;
        };
        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle(`${emoji} | 挖礦`)
            .setDescription(description)
            .setFooter({
                text: `
哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體
你現在擁有 ${rpg_data.inventory[random_ore].toLocaleString()} 個 ${ore_name}
`,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            });
        if (mode === 1) return { embeds: [embed] };
        return await message.reply({ embeds: [embed] });
    }],
    hew: ["伐木", "砍砍樹，偶爾可以挖到神木 owob", async function ({ client, message, rpg_data, data, args, mode }) {
        const { save_rpg_data } = require("../../module_database.js");
        const { logs, name } = require("../../rpg.js");
        const userid = message.author.id;
        const lastRunTimestamp = rpg_data.lastRunTimestamp;
        const now = Date.now();
        const time_diff = now - lastRunTimestamp;

        // 冷卻
        if (!data.admin && time_diff < rpg_cooldown * 1000) throw new CooldownException();

        const { show_amount, real_amount } = get_random_number(userid);
        const log_keys = Object.keys(logs);
        const random_log = logs[log_keys[Math.floor(Math.random() * log_keys.length)]];
        const log_name = name[random_log];
        if (!log_name) return await message.reply({ content: `ERROR: 找不到${random_log}的物品名稱: ${log_name}` });

        if (!rpg_data.inventory[random_log]) rpg_data.inventory[random_log] = 0;
        rpg_data.inventory[random_log] += real_amount;
        rpg_data.lastRunTimestamp = Date.now();
        save_rpg_data(userid, rpg_data);

        let emoji = message.guild.emojis.cache.find(emoji => emoji.name === "wood");
        emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;

        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle(`${emoji} | ${random_log === "god_log" ? "是神?!" : "平常的一天"}`)
            .setFooter({
                text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            });

        if (random_log === "god_log") {
            embed.setDescription(`本來是平常的一天，居然遇到了神木，於是你砍下了它並獲得了 ${show_amount} 塊${log_name}！`)
        } else {
            embed.setDescription(`你來到了森林，並且砍了 ${show_amount} 塊 ${log_name}`)
        };

        if (mode === 1) return { embeds: [embed] };
        return await message.reply({ embeds: [embed] });
    }],
    fell: ["伐木", "砍砍樹，偶爾可以挖到神木 owob", async function ({ client, message, rpg_data, data, args, mode }) {
        return await redirect({ client, message, command: "hr!hew", mode });
    }],
    shop: ["商店", "對你的商店進行任何操作", async function ({ client, message, rpg_data, data, args, mode }) {
        const { load_shop_data, save_shop_data, save_rpg_data } = require("../../module_database.js");
        const { name, mine_gets, ingots, foods } = require("../../rpg.js");
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
                        .setTitle(`${emoji} | 未知的物品`)
                        .setFooter({
                            text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                            iconURL: client.user.displayAvatarURL({ dynamic: true }),
                        });
                    if (mode === 1) return { embeds: [embed] };
                    return await message.reply({ embeds: [embed] });
                };
                const item_exist = Boolean(shop_data.items[item]);
                let amount = args[2];
                if (amount === "all") amount = get_number_of_items(item, userid);
                amount = parseInt(amount);
                if (isNaN(amount)) amount = 1;
                let price = parseInt(args[3]);
                if (!price && !item_exist) {
                    let emoji = message.guild.emojis.cache.find(emoji => emoji.name === "crosS");
                    emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji} | 錯誤的價格`)
                        .setFooter({
                            text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                            iconURL: client.user.displayAvatarURL({ dynamic: true }),
                        });
                    if (mode === 1) return { embeds: [embed] };
                    return await message.reply({ embeds: [embed] });
                };
                let inventory = rpg_data.inventory;
                if (!inventory[item]) {
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji} | 你沒有這個物品`)
                        .setFooter({
                            text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                            iconURL: client.user.displayAvatarURL({ dynamic: true }),
                        });
                    if (mode === 1) return { embeds: [embed] };
                    return await message.reply({ embeds: [embed] });
                };
                if (inventory[item] < amount) {
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji} | 你沒有足夠的物品`)
                        .setFooter({
                            text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                            iconURL: client.user.displayAvatarURL({ dynamic: true }),
                        });
                    if (mode === 1) return { embeds: [embed] };
                    return await message.reply({ embeds: [embed] });
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
                    .setDescription(`你的店面狀態為: \`${status}\`，現在架上有 \`${amount.toLocaleString()}\` 個 \`${item_name}\`，售價為 \`${price.toLocaleString()}$\``)
                    .setFooter({
                        text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                        iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    });
                if (mode === 1) return { embeds: [embed] };
                return await message.reply({ embeds: [embed] });
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
                const item_exist = shop_data.items[item];
                if (!item_exist) {
                    emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji} | 你的商店沒有這個物品`);
                    if (mode === 1) return { embeds: [embed] };
                    return await message.reply({ embeds: [embed] });
                };
                if (!rpg_data.inventory[item]) rpg_data.inventory[item] = 0;
                const amount = shop_data.items[item].amount;
                rpg_data.inventory[item] += amount;
                save_rpg_data(userid, rpg_data);
                delete shop_data.items[item];
                save_shop_data(userid, shop_data);
                emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`${emoji} | 成功下架了 ${item_name}`)
                    .setFooter({
                        text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                        iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    });
                if (mode === 1) return { embeds: [embed] };
                return await message.reply({ embeds: [embed] });
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
                    .setAuthor({ name: `${user.username} 的商店 (營業中)`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                    .setFooter({
                        text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                        iconURL: client.user.displayAvatarURL({ dynamic: true }),
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
                if (mode === 1) return { embeds: [embed] };
                return await message.reply({ embeds: [embed] });
            }
            case "open": {
                const userid = message.author.id;
                let emoji = message.guild.emojis.cache.find(emoji => emoji.name === "store");
                emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
                const shop_data = load_shop_data(userid);
                shop_data.status = true;
                save_shop_data(userid, shop_data);
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`${emoji} | 你的商店開始營業啦！`)
                    .setFooter({
                        text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                        iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    });
                if (mode === 1) return { embeds: [embed] };
                return await message.reply({ embeds: [embed] });
            }
            case "close": {
                const userid = message.author.id;
                let emoji = message.guild.emojis.cache.find(emoji => emoji.name === "store");
                emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
                const shop_data = load_shop_data(userid);
                shop_data.status = false;
                save_shop_data(userid, shop_data);
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`${emoji} | 你拉下了商店鐵捲門`)
                    .setFooter({
                        text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                        iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    });
                if (mode === 1) return { embeds: [embed] };
                return await message.reply({ embeds: [embed] });
            }
            case "status": {
                const userid = message.author.id;
                let emoji = message.guild.emojis.cache.find(emoji => emoji.name === "store");
                emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
                const shop_data = load_shop_data(userid);
                const status = shop_data.status ? "營業中" : "打烊";
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`${emoji} | 你的商店狀態為: ${status}`)
                    .setFooter({
                        text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                        iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    });
                if (mode === 1) return { embeds: [embed] };
                return await message.reply({ embeds: [embed] });
            }
            default: {
                if (mode === 1) return;
                return 1;
            };
        };
    }],
    ls: ["查看背包", "查看背包", async function ({ client, message, rpg_data, data, args, mode }) {
        const { save_rpg_data } = require("../../module_database.js");
        const { name, mine_gets, ingots, logs, foods } = require("../../rpg.js");
        const emojiNames = ["bag", "ore", "bread"];
        const [bag_emoji, ore_emoji, food_emoji] = emojiNames.map(name => {
            const emoji = message.guild.emojis.cache.find(e => e.name === name);
            return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
        });
        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle(`${bag_emoji} | 你的背包`)
            .setFooter({
                text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            });

        // 礦物
        const minerals = Object.entries(rpg_data.inventory)
            .filter(([item]) => Object.values(mine_gets).includes(item) || Object.values(ingots).includes(item))
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([item, amount]) => `${name[item]} \`x${(amount || 0).toLocaleString()}\``).join('\n');
        if (minerals) embed.addFields({ name: `${ore_emoji} 礦物`, value: minerals, inline: true });

        // 食物
        const food = Object.entries(rpg_data.inventory)
            .filter(([item]) => Object.values(foods).includes(item))
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([item, amount]) => `${name[item]} \`x${(amount || 0).toLocaleString()}\``).join('\n');
        if (food) embed.addFields({ name: `${food_emoji} 食物`, value: food, inline: true });

        // 其他
        const others = Object.entries(rpg_data.inventory)
            .filter(([item]) => Object.values(logs).includes(item) ||
                (!Object.values(mine_gets).includes(item) && !Object.values(ingots).includes(item)))
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([item, amount]) => `${name[item]} \`x${(amount || 0).toLocaleString()}\``).join('\n');
        if (others) embed.addFields({ name: `其他`, value: others, inline: true });

        embed.setFooter({
            text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
            iconURL: client.user.displayAvatarURL({ dynamic: true }),
        });

        rpg_data.inventory = Object.fromEntries(
            Object.entries(rpg_data.inventory)
                .sort((a, b) => a[0].localeCompare(b[0]))
        );
        save_rpg_data(message.author.id, rpg_data);
        if (mode === 1) return { embeds: [embed] };
        return await message.reply({ embeds: [embed] });
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
        const shop_data = load_shop_data(target_user.id);

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
                )
                .setFooter({
                    text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                });
            if (mode === 1) return { embeds: [embed] };
            return await message.reply({ embeds: [embed] });
        };
        if (!item) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 這個物品是什麼？我不認識`)
                .setFooter({
                    text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                });
            if (mode === 1) return { embeds: [embed] };
            return await message.reply({ embeds: [embed] });
        };
        if (target_user.id === userid) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 不能購買自己的物品`)
                .setFooter({
                    text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                });
            if (mode === 1) return { embeds: [embed] };
            return await message.reply({ embeds: [embed] });
        };
        if (target_user.bot) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 不能購買機器人的物品`)
                .setFooter({
                    text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                });
            if (mode === 1) return { embeds: [embed] };
            return await message.reply({ embeds: [embed] });
        };
        if (shop_data.status === false) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | ${target_user.toString()} 的商店已打烊`)
                .setFooter({
                    text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                });
            if (mode === 1) return { embeds: [embed] };
            return await message.reply({ embeds: [embed] });
        };
        const item_name = name[item] || item;
        const item_exist = shop_data.items[item];
        if (!item_exist) {
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
                .setTitle(`${emoji_cross} | 沒有販賣這項物品`)
                .setFooter({
                    text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                });
            return await message.reply({ embeds: [embed] });
        };
        if (!Object.values(name).includes(item_name)) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 這是什麼東西？`)
                .setFooter({
                    text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                });
            if (mode === 1) return { embeds: [embed] };
            return await message.reply({ embeds: [embed] });
        }
        let amount = args[1];
        if (amount === "all") {
            amount = item_exist.amount;
        } else {
            amount = parseInt(amount);
        };
        if (isNaN(amount)) amount = 1;
        if (amount <= 0 || amount > item_exist.amount) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 錯誤的數量`)
                .setFooter({
                    text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                });
            if (mode === 1) return { embeds: [embed] };
            return await message.reply({ embeds: [embed] });
        };
        if (rpg_data.money < item_exist.price * amount) {
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji_cross} | 歐不！你沒錢了！`)
                .setDescription(`你還差 \`${(item_exist.price * amount - rpg_data.money).toLocaleString()}$\``)
                .setFooter({
                    text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                });
            if (mode === 1) return { embeds: [embed] };
            return await message.reply({ embeds: [embed] });
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
            .setDescription(`你購買了 ${item_name} \`x${amount.toLocaleString()}\`，花費 \`${(item_exist.price * amount).toLocaleString()}$\``)
            .setFooter({
                text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            });
        if (mode === 1) return { embeds: [embed] };
        return await message.reply({ embeds: [embed] });
    }],
    m: ["查看餘額", "查看自己的餘額", async function ({ client, message, rpg_data, data, args, mode }) {
        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`你目前有 \`${rpg_data.money.toLocaleString()}$\``)
            .setTimestamp();

        const button = new ButtonBuilder()
            .setCustomId('rpg_transaction')
            .setLabel('查看交易紀錄')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .addComponents(button);

        if (mode === 1) return { embeds: [embed], components: [row] };
        return await message.reply({ embeds: [embed], components: [row] });
    }],
    money: ["查看餘額", "查看自己的餘額", async function ({ client, message, rpg_data, data, args, mode }) {
        return await redirect({ client, message, command: "hr!m", mode });
    }],
    cd: ["查看冷卻剩餘時間", "查看冷卻剩餘時間", async function ({ client, message, rpg_data, data, args, mode }) {
        const lastRunTimestamp = data.lastRunTimestamp;
        if (lastRunTimestamp === 0) {
            let embed = new EmbedBuilder()
                .setColor(0x00BBFF)
                .setTitle("⏲️ | 冷卻剩餘時間")
                .setDescription(`你沒有玩過這個遊戲，所以冷卻剩餘時間為 \`0\` 秒`);
            embed = setEmbedFooter(embed, client);
            if (mode === 1) return { embeds: [embed] };
            return await message.reply({ embeds: [embed] });
        };

        const now = Date.now();
        const remainingTime = lastRunTimestamp - now;

        if (remainingTime <= 0) {
            let embed = new EmbedBuilder()
                .setColor(0x00BBFF)
                .setTitle("⏲️ | 冷卻剩餘時間")
                .setDescription(`冷卻已完成！`);
            embed = setEmbedFooter(embed, client);
            if (mode === 1) return { embeds: [embed] };
            return await message.reply({ embeds: [embed] });
        };

        const hours = Math.floor(remainingTime / (1000 * 60 * 60));
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
        let embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle("⏲️ | 冷卻剩餘時間")
            .setDescription(`冷卻剩餘時間為 \`${hours}\` 小時 \`${minutes}\` 分鐘 \`${seconds}\` 秒`);
        embed = setEmbedFooter(embed, client);
        if (mode === 1) return { embeds: [embed] };
        return await message.reply({ embeds: [embed] });
    }],
    help: ["查看指令", "查看指令", async function ({ client, message, rpg_data, data, args, mode }) {
        // 創建一個映射來追蹤已處理的命令
        const processedCommands = new Map();

        // 第一次遍歷，找出所有具有相同功能的命令
        Object.entries(rpg_commands).forEach(([cmd, data]) => {
            const commandName = data[0];
            if (!processedCommands.has(commandName)) {
                processedCommands.set(commandName, []);
            }
            processedCommands.get(commandName).push(cmd);
        });

        // 第二次遍歷，生成最終的描述文本
        let description = '';
        processedCommands.forEach((cmds, commandName) => {
            // 按字母順序排序命令別名
            cmds.sort();
            const cmdDisplay = cmds.length > 1 ? cmds.join('/') : cmds[0];
            // 使用第一個命令的描述
            const commandDesc = rpg_commands[cmds[0]][1];
            description += `- **${cmdDisplay}** - ${commandName} (${commandDesc})\n`;
        });

        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setAuthor({
                name: client.user.globalName || client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(description)
            .setFooter({
                text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            });

        if (mode === 1) return { embeds: [embed] };
        return await message.reply({ embeds: [embed] });
    }],
};

async function rpg_handler({ client, message, d, mode = 0 }) {
    if (![0, 1].includes(mode)) throw new TypeError("args 'mode' must be 0(default) or 1(get message response args)");

    if (!d) {
        if (message.author.bot) return;
    };

    if (!message.content.startsWith("hr!")) return;
    const { load_rpg_data, loadData } = require("../../module_database.js");
    const content = message.content.replace("hr!", "");
    let [command, ...args] = content.split(" ");
    command = command.toLowerCase().trim();
    const cmd_data = rpg_commands[command];
    if (!cmd_data) return message.react(":thinking:");
    const execute = cmd_data[2];
    const userid = message.author.id;
    const rpg_data = load_rpg_data(userid);
    const data = loadData(userid);

    try {
        const result = await execute({ client, message, rpg_data, data, args, mode });
        if (mode === 1) return result;
    } catch (e) {
        if (e instanceof CooldownException) {
            let emoji = message.guild.emojis.cache.find(emoji => emoji.name === "crosS");
            emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
            const command_lastRunTimestamp = rpg_data.lastRunTimestamp[command];
            let cooldone_time = 0;
            let word = "";
            let word2 = "";
            if (command_lastRunTimestamp) {
                cooldone_time = Math.floor(command_lastRunTimestamp / 1000) + rpg_cooldown;
                word = cmd_data[1];
                word2 = `${cmd_data[1]}${cmd_data[1][0]}`; // cmd_data[1] = 挖礦 -> 挖礦 + 挖 = 挖礦挖
            };
            const embed = new EmbedBuilder()
                .setColor(0xF04A47)
                .setTitle(`${emoji} | 你過勞了！`)
                .setDescription(`你做的太頻繁了 :| 等一下再做吧! ⏲️`)
                .setFooter({
                    text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                });
            if (command_lastRunTimestamp) embed.setDescription(`你${word2}得太頻繁了，等待到 <t:${cooldone_time}:R> 可以繼續${word}`)
            return message.reply({ embeds: [embed] });
        };
    };
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
                await rpg_handler({ client: client, message: message });
            } finally {
                lock.rpg_handler = false;
            };
        });
    },
};