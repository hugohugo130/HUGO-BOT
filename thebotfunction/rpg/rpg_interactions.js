const { Events, EmbedBuilder, MessageFlags, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

function show_transactions(userid) {
    const { load_rpg_data } = require("../../module_database.js");
    const { transactions = [] } = load_rpg_data(userid);

    /* transactions 列表中的每個字典應該包含:
    timestamp: 時間戳記 (Unix timestamp) 單位: 秒
    detail: 交易詳情 (字串)
    amount: 金額 (數字)
    type: 交易類型 (字串，例如: "出售物品所得"、"購買物品付款" 等)
    */
    return transactions
        .slice(-10)
        .map(({ timestamp, originalUser, targetUser, amount, type }) =>
            `- <t:${timestamp}:R> ${originalUser} \`>\` ${targetUser} \`${amount.toLocaleString()}$\` (${type})`
        ).join('\n');
};

function get_transaction_embed(interaction) {
    const userid = interaction.user.id;
    const username = interaction.user.username;
    const transactions = show_transactions(userid);
    const embed = new EmbedBuilder()
        .setColor(0x00BBFF)
        .setAuthor({
            name: `${username} 的交易紀錄`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(transactions || "- 沒有交易紀錄")
        .setTimestamp();
    return embed;
};

let cli = null;

async function get_failed_embed(client = cli) {
    const { setEmbedFooter, get_emoji } = require("./msg_handler.js");
    const emoji = await get_emoji(client, "crosS");
    const embed = new EmbedBuilder()
        .setColor(0x00BBFF)
        .setTitle(`${emoji} | 沒事戳這顆按鈕幹嘛?`);
    return setEmbedFooter(client, embed, null, client);
};

module.exports = {
    setup(client) {
        client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;
            if (interaction.customId.startsWith("vote_")) return;
            const { time } = require("../../module_time.js");

            const message = interaction.message;
            const user = interaction.user;

            if (message.author.id !== client.user.id) return;

            // 從 customId 提取 UserID
            const customIdParts = interaction.customId.split('|');
            const originalUserId = customIdParts[1];

            // 驗證使用者身份
            if (user.id !== originalUserId) {
                try {
                    await interaction.followUp({ embeds: [await get_failed_embed(client)], flags: MessageFlags.Ephemeral });
                } catch (error) {
                    await interaction.deferUpdate();
                    await interaction.followUp({ embeds: [await get_failed_embed(client)], flags: MessageFlags.Ephemeral });
                };
                return;
            };

            console.log(`[${time()}] ${user.username}${user.globalName ? `(${user.globalName})` : ""} 正在觸發互動(rpg_interactions): ${interaction.customId}，訊息ID: ${interaction.message?.id}`);


            if (interaction.customId.startsWith('rpg_transaction')) {
                await interaction.deferUpdate();
                const embed = get_transaction_embed(interaction);
                await interaction.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral });
            } else if (interaction.customId.startsWith('rpg_help_menu')) {
                const { get_help_embed } = require("./msg_handler.js");
                await interaction.deferUpdate();

                const category = interaction.values[0];
                const newEmbed = await get_help_embed(category, client);

                await interaction.followUp({
                    embeds: [newEmbed],
                    flags: MessageFlags.Ephemeral,
                });
            } else if (interaction.customId.startsWith('pay')) {
                await interaction.deferUpdate();
                const { load_rpg_data, save_rpg_data } = require("../../module_database.js");
                const { get_emoji, setEmbedFooter, add_money, remove_money } = require("./msg_handler.js");

                const emoji_cross = await get_emoji(interaction.client, "crosS");
                if (interaction.customId.startsWith('pay_confirm')) {
                    const emoji_top = await get_emoji(interaction.client, "top");
                    const [_, userId, targetUserId, amount, timestamp] = interaction.customId.split('|');
                    const rpg_data = load_rpg_data(userId);
                    const target_user_rpg_data = load_rpg_data(targetUserId);

                    if (Date.now() - parseInt(timestamp) > 30000) {
                        const embed = new EmbedBuilder()
                            .setColor(0x00BBFF)
                            .setTitle(`${emoji_cross} | 付款失敗`)
                            .setDescription(`付款確認已過期`);

                        await interaction.editReply({ embeds: [setEmbedFooter(client, embed)], components: [] });
                        return;
                    };

                    rpg_data.money = remove_money({
                        rpg_data,
                        amount: parseInt(amount),
                        originalUser: `<@${userId}>`,
                        targetUser: `<@${targetUserId}>`,
                        type: `付款給`,
                    });
                    target_user_rpg_data.money = add_money({
                        rpg_data: target_user_rpg_data,
                        amount: parseInt(amount),
                        originalUser: `<@${userId}>`,
                        targetUser: `<@${targetUserId}>`,
                        type: `付款給`,
                    });
                    save_rpg_data(userId, rpg_data);
                    save_rpg_data(targetUserId, target_user_rpg_data);

                    const embed = new EmbedBuilder()
                        .setColor(0x00BBFF)
                        .setTitle(`${emoji_top} | 付款成功`)
                        .setDescription(`你已成功付款 \`${parseInt(amount).toLocaleString()}$\` 給 <@${targetUserId}>`);

                    await interaction.editReply({ embeds: [setEmbedFooter(client, embed)], components: [] });
                } else if (interaction.customId.startsWith('pay_cancel')) {
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji_cross} | 操作取消`);

                    await interaction.editReply({ embeds: [setEmbedFooter(client, embed)], components: [] });
                };
            } else if (interaction.customId.startsWith('setLang')) {
                // const { load_rpg_data, save_rpg_data } = require("../../module_database.js");
                // const { get_emoji, setEmbedFooter } = require("./msg_handler.js");

                // await interaction.deferUpdate();
                // const emoji_tick = get_emoji(interaction.client, "Tick");
                // const emoji_cross = get_emoji(interaction.client, "crosS");
                // const embed = new EmbedBuilder()
                //     .setColor(0x00BBFF)
                //     .setTitle(`${emoji_tick} | 語言設定成功`)
                //     .setDescription(`你已成功設定語言為 ${client.available_languages[language]}`);

                // const language = customIdParts[2];
                // const rpg_data = load_rpg_data(interaction.user.id);
                // if (rpg_data.language != language) {
                //     rpg_data.language = language;
                //     save_rpg_data(interaction.user.id, rpg_data);
                // } else {
                //     embed.setColor(0xF04A47);
                //     embed.setTitle(`${emoji_cross} | 語言一樣`);
                //     embed.setDescription(`你選擇的語言和現在的語言一樣 :|`);
                // };

                // await interaction.editReply({ embeds: [setEmbedFooter(client, embed)], components: [] });
            } else if (interaction.customId.startsWith('rpg_privacy_menu')) {
                await interaction.deferUpdate();
                const { load_rpg_data, save_rpg_data } = require("../../module_database.js");
                const { get_emoji, setEmbedFooter } = require("./msg_handler.js");

                /*
                mode:
                'true': 第一次執行
                'false': 取消
                undefined: 不是第一次執行
                - deprecated
                */
                // const [_, userId, mode] = interaction.customId.split('|');
                const [_, userId] = interaction.customId.split('|');
                // if (mode === 'false') {
                //     await interaction.message.delete();
                //     await interaction.message.reference?.delete();
                //     return;
                // };

                const rpg_data = load_rpg_data(userId);

                const emoji_shield = await get_emoji(interaction.client, "shield");
                const emoji_backpack = await get_emoji(interaction.client, "bag");
                const emoji_partner = await get_emoji(interaction.client, "partner");

                // if (mode === undefined) { // 不是第一次執行
                //     const privacy = interaction.values;
                //     rpg_data.privacy = privacy;
                //     console.debug(`received privacy: ${JSON.stringify(rpg_data.privacy)}`);
                //     save_rpg_data(userId, rpg_data);
                // };

                const privacy = interaction.values;
                rpg_data.privacy = privacy;
                rpg_data.privacy.sort((a, b) => {
                    const order = { "money": 0, "backpack": 1, "partner": 2 };
                    return order[a] - order[b];
                });
                save_rpg_data(userId, rpg_data);

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
                    .setCustomId(`rpg_privacy_menu|${userId}`)
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

                return await interaction.editReply({ embeds: [setEmbedFooter(client, embed)], components: [row] });
            } else if (interaction.customId.startsWith('choose_command')) {
                await interaction.deferUpdate();
                const { load_rpg_data, save_rpg_data } = require("../../module_database.js");
                const { get_emoji, setEmbedFooter, rpg_handler, MockMessage, prefix } = require("./msg_handler.js");

                const [_, __, command] = interaction.customId.split('|');

                const message = new MockMessage(`${prefix}${command}`, interaction.channel, interaction.user, interaction.guild);
                let response = await rpg_handler({ client: interaction.client, message, d: true, mode: 1 });

                response.components ??= [];

                await interaction.editReply(response);
            } else if (interaction.customId.startsWith('ls')) {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral })
                const { ls_function, MockMessage, prefix } = require("./msg_handler.js");
                const { load_rpg_data } = require("../../module_database.js");
                const [_, userId] = interaction.customId.split("|");
                const message = new MockMessage(`${prefix}ls`, interaction.message.channel, interaction.user, interaction.guild);
                const res = await ls_function({ client: interaction.client, message, rpg_data: load_rpg_data(userId), mode: 1, PASS: true });
                await interaction.followUp(res);
            } else if (interaction.customId.startsWith("sell")) {
                const { load_rpg_data, save_rpg_data } = require("../../module_database.js");
                const { add_money, get_emoji, setEmbedFooter } = require("./msg_handler.js");
                const { name } = require("../../rpg.js");
                await interaction.deferUpdate();

                let [_, userId, item_id, price, amount] = customIdParts;

                price = parseInt(price);
                amount = parseInt(amount);

                const rpg_data = load_rpg_data(userId);

                rpg_data.inventory[item_id] -= amount;
                rpg_data.money = add_money({
                    rpg_data,
                    amount: price * amount,
                    originalUser: "系統",
                    targetUser: `<@${userId}>`,
                    type: "出售物品所得",
                })

                save_rpg_data(userId, rpg_data);

                const emoji_trade = await get_emoji(interaction.client, "trade");
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`${emoji_trade} | 成功售出了 ${amount} 個 ${name[item_id]}`);

                await interaction.editReply({ embeds: [setEmbedFooter(client, embed)], components: [] });
            } else if (interaction.customId.startsWith("cancel")) {
                const { get_emoji, setEmbedFooter } = require("./msg_handler.js");
                await interaction.deferUpdate();

                const emoji_cross = await get_emoji(interaction.client, "crosS");

                const embed = new EmbedBuilder()
                    .setColor(0xF04A47)
                    .setTitle(`${emoji_cross} | 操作取消`);

                await interaction.editReply({ embeds: [setEmbedFooter(client, embed)], components: [] });
            } else if (interaction.customId.startsWith('buy')) {
                const { get_emoji, remove_money, add_money } = require("./msg_handler.js");
                const { load_shop_data, save_shop_data, load_rpg_data, save_rpg_data } = require("../../module_database.js");
                const [_, buyerUserId, targetUserId, amount, price, item] = interaction.customId.split('|');

                await interaction.deferUpdate();

                const emoji_cross = await get_emoji(interaction.client, "crosS");
                const emoji_store = await get_emoji(interaction.client, "store");

                const buyerRPGData = load_rpg_data(buyerUserId);
                const targetUserRPGData = load_rpg_data(targetUserId);
                const targetUserShopData = load_shop_data(targetUserId);

                if (targetUserShopData[item].amount < amount) {
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji_cross} | 沒有販賣這麼多物品`);

                    return await interaction.editReply({ embeds: [setEmbedFooter(client, embed)] });
                };

                buyerRPGData.money = remove_money({
                    rpg_data: buyerRPGData,
                    amount: price * amount,
                    originalUser: `<@${buyerUserId}>`,
                    targetUser: `<@${targetUserId}>`,
                    type: `購買物品付款`,
                });
                buyerRPGData.inventory[item] += amount;
                targetUserRPGData.money = add_money({
                    rpg_data: targetUserRPGData,
                    amount: price * amount,
                    originalUser: `<@${buyerUserId}>`,
                    targetUser: `<@${targetUserId}>`,
                    type: `購買物品付款`,
                });
                targetUserShopData.items[item].amount -= amount;
                save_rpg_data(buyerUserId, buyerRPGData);
                save_rpg_data(targetUserId, targetUserRPGData);
                save_shop_data(targetUserId, targetUserShopData);

                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`${emoji_store} | 購買成功`)
                    .setDescription(`你購買了 ${item_name} \`x${amount.toLocaleString()}\`，花費 \`${(item_exist.price * amount).toLocaleString()}$\``);

                return await interaction.editReply({ embeds: [setEmbedFooter(client, embed)] });
            } else if (interaction.customId.startsWith('oven_bake')) {
                const {
                    load_bake_data,
                    save_bake_data,
                    load_rpg_data,
                    save_rpg_data
                } = require("../../module_database.js");
                const { bake, name, oven_slots } = require("../../rpg.js");

                await interaction.deferUpdate();

                const [_, userId, item_id, amount, coal_amount, duration, session_id] = interaction.customId.split("|");

                // 確保所有數值都被正確解析為整數
                const parsedAmount = parseInt(amount);
                const parsedCoalAmount = parseInt(coal_amount);
                const parsedDuration = parseInt(duration);

                // 從全域變數中取得 item_need 資料
                const item_need = global.oven_sessions?.[session_id];
                if (!item_need) {
                    const { get_emoji, setEmbedFooter } = require("./msg_handler.js");
                    const emoji_cross = await get_emoji(interaction.client, "crosS");
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji_cross} | 烘烤會話已過期`)
                        .setDescription(`請重新執行烘烤指令`);

                    return await interaction.editReply({ embeds: [setEmbedFooter(client, embed)], components: [] });
                };

                let rpg_data = load_rpg_data(userId)

                // ==================檢查物品==================
                let item_missing = [];

                for (const need_item of item_need) {
                    const current_item_id = need_item.item;
                    const need_amount = need_item.amount;
                    const have_amount = (rpg_data.inventory[current_item_id] || 0);

                    if (have_amount < need_amount) {
                        item_missing.push({
                            name: name[current_item_id] || need_item,
                            amount: need_amount - have_amount,
                        });
                    };
                };

                if (item_missing.length > 0) {
                    const items = [];
                    for (const missing of item_missing) {
                        items.push(`${missing.name} \`x${missing.amount}\`個`);
                    };

                    const emoji_cross = await get_emoji(interaction.client, "crosS");
                    const embed = new EmbedBuilder()
                        .setTitle(`${emoji_cross} | 你沒有那麼多的物品`)
                        .setColor(0xF04A47)
                        .setDescription(`你缺少了 ${items.join("、")}`);

                    return await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)], ephemeral: true });
                };
                // ==================檢查物品==================


                for (const need_item of item_need) {
                    rpg_data.inventory[need_item.item] -= need_item.amount;
                };

                save_rpg_data(userId, rpg_data)

                const output_item_id = bake[item_id];
                const end_time = Math.floor(Date.now() / 1000) + parsedDuration;

                let bake_data = load_bake_data();

                if (!bake_data[userId]) {
                    bake_data[userId] = [];
                };

                if (bake_data[userId].length >= oven_slots) {
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji_cross} | 你的烤箱已經滿了`);

                    return await interaction.followUp({ embeds: [setEmbedFooter(interaction.client, embed)] });
                };

                bake_data[userId].push({
                    userId,
                    item_id,
                    amount: parsedAmount,
                    coal_amount: parsedCoalAmount,
                    end_time,
                    output_item_id,
                });

                save_bake_data(bake_data);

                // 清理 session 資料
                delete global.oven_sessions[session_id];

                const { get_emoji, setEmbedFooter } = require("./msg_handler.js");
                const emoji_drumstick = await get_emoji(interaction.client, "drumstick");
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    // .setTitle(`${emoji_drumstick} | 烘烤開始`)
                    // .setDescription(`已開始烘烤 \`${parsedAmount}\` 個 \`${name[item_id]}\`，預計 \`${parsedDuration / 60}\` 分鐘後完成`);
                    .setTitle(`${emoji_drumstick} | 成功放進烤箱烘烤 ${parsedAmount} 個 ${name[item_id]}`)
                    .setDescription(`等待至 <t:${end_time}:R>`);

                await interaction.editReply({ embeds: [setEmbedFooter(client, embed)], components: [] });
            } else if (interaction.customId.startsWith("smelter_smelt")) {
                const {
                    load_smelt_data,
                    save_smelt_data,
                    load_rpg_data,
                    save_rpg_data
                } = require("../../module_database.js");
                const { smeltable_items, name, smelter_slots } = require("../../rpg.js");

                await interaction.deferUpdate();

                const [_, userId, item_id, amount, coal_amount, duration, output_amount, session_id] = interaction.customId.split("|");

                // 確保所有數值都被正確解析為整數
                const parsedAmount = parseInt(amount);
                const parsedCoalAmount = parseInt(coal_amount);
                const parsedDuration = parseInt(duration);

                // 從全域變數中取得 item_need 資料
                const item_need = global.smelter_sessions?.[session_id];
                if (!item_need) {
                    const { get_emoji, setEmbedFooter } = require("./msg_handler.js");
                    const emoji_cross = await get_emoji(interaction.client, "crosS");
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji_cross} | 熔鍊會話已過期`)
                        .setDescription(`請重新執行熔鍊指令`);

                    return await interaction.editReply({ embeds: [setEmbedFooter(client, embed)], components: [] });
                };

                let rpg_data = load_rpg_data(userId)

                // ==================檢查物品==================
                let item_missing = [];

                for (const need_item of item_need) {
                    const current_item_id = need_item.item;
                    const need_amount = need_item.amount;
                    const have_amount = (rpg_data.inventory[current_item_id] || 0);

                    if (have_amount < need_amount) {
                        item_missing.push({
                            name: name[current_item_id] || need_item,
                            amount: need_amount - have_amount,
                        });
                    };
                };

                if (item_missing.length > 0) {
                    const items = [];
                    for (const missing of item_missing) {
                        items.push(`${missing.name} \`x${missing.amount}\`個`);
                    };

                    const emoji_cross = await get_emoji(interaction.client, "crosS");
                    const embed = new EmbedBuilder()
                        .setTitle(`${emoji_cross} | 你沒有那麼多的物品`)
                        .setColor(0xF04A47)
                        .setDescription(`你缺少了 ${items.join("、")}`);

                    return await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)], ephemeral: true });
                };
                // ==================檢查物品==================


                for (const need_item of item_need) {
                    rpg_data.inventory[need_item.item] -= need_item.amount;
                };

                save_rpg_data(userId, rpg_data)

                const output_item_id = smeltable_items.find(a => a.input[0].item === item_id).output;
                const end_time = Math.floor(Date.now() / 1000) + parsedDuration;

                let smelt_data = load_smelt_data();

                if (!smelt_data[userId]) {
                    smelt_data[userId] = [];
                };

                if (smelt_data[userId].length >= smelter_slots) {
                    const embed = new EmbedBuilder()
                        .setColor(0xF04A47)
                        .setTitle(`${emoji_cross} | 你的煉金爐已經滿了`);

                    return await interaction.followUp({ embeds: [setEmbedFooter(interaction.client, embed)] });
                };

                smelt_data[userId].push({
                    userId,
                    item_id,
                    amount: parsedAmount,
                    coal_amount: parsedCoalAmount,
                    end_time,
                    output_item_id,
                    output_amount: parseInt(output_amount),
                });

                save_smelt_data(smelt_data);

                // 清理 session 資料
                delete global.smelter_sessions[session_id];

                const { get_emoji, setEmbedFooter } = require("./msg_handler.js");
                const emoji_furnace = await get_emoji(interaction.client, "furnace");
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`${emoji_furnace} | 成功放進煉金爐內`)
                    .setDescription(`等待至 <t:${end_time}:R>`);

                await interaction.editReply({ embeds: [setEmbedFooter(client, embed)], components: [] });
            }
        });
    },
};