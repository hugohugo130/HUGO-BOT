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

function get_failed_embed(interaction, guild, client = cli) {
    const { setEmbedFooter, get_emoji } = require("./msg_handler.js");
    const emoji = get_emoji(guild, "crosS");
    const embed = new EmbedBuilder()
        .setColor(0x00BBFF)
        .setTitle(`${emoji} | 沒事戳這顆按鈕幹嘛?`);
    return setEmbedFooter(interaction, embed, null, client);
};

function get_help_embed(category, client) {
    const { rpg_commands, setEmbedFooter } = require("./msg_handler.js");

    // 分類指令
    const commandCategories = {
        gathering: ['mine', 'hew', 'fell', 'herd', 'lazy'],
        shop: ['shop', 'buy'],
        inventory: ['ls', 'bag', 'item'],
        others: ['m', 'mo', 'money', 'cd', 'pay', 'help', 'privacy']
    };

    let description = '';
    let title = '';

    // 合併相同指令
    const mergedCommands = {};
    commandCategories[category].forEach(cmd => {
        if (rpg_commands[cmd]) {
            const [name, desc] = rpg_commands[cmd];
            if (!mergedCommands[name]) {
                mergedCommands[name] = {
                    desc,
                    cmds: [cmd]
                };
            } else {
                mergedCommands[name].cmds.push(cmd);
            };
        };
    });

    switch (category) {
        case 'gathering':
            title = '資源收集指令';
            description = Object.entries(mergedCommands)
                .map(([name, data]) => {
                    const cmdList = data.cmds.join('/');
                    return `- **${cmdList}** - ${name} (${data.desc})`;
                })
                .join('\n');
            break;
        case 'shop':
            title = '商店系統指令';
            description = Object.entries(mergedCommands)
                .map(([name, data]) => {
                    const cmdList = data.cmds.join('/');
                    return `- **${cmdList}** - ${name} (${data.desc})`;
                })
                .join('\n');
            break;
        case 'inventory':
            title = '背包系統指令';
            description = Object.entries(mergedCommands)
                .map(([name, data]) => {
                    const cmdList = data.cmds.join('/');
                    return `- **${cmdList}** - ${name} (${data.desc})`;
                })
                .join('\n');
            break;
        case 'others':
            title = '其他指令';
            description = Object.entries(mergedCommands)
                .map(([name, data]) => {
                    const cmdList = data.cmds.join('/');
                    return `- **${cmdList}** - ${name} (${data.desc})`;
                })
                .join('\n');
            break;
    };

    const embed = new EmbedBuilder()
        .setColor(0x00BBFF)
        .setTitle(title)
        .setDescription(description || '沒有找到相關指令');

    return setEmbedFooter(client, embed);
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

            // console.debug(`customId: ${interaction.customId}`);
            // console.debug(`customIdParts: ${customIdParts}`);
            // console.debug(`originalUserId: ${originalUserId}`);

            // 驗證使用者身份
            if (user.id !== originalUserId) {
                try {
                    await interaction.followUp({ embeds: [get_failed_embed(interaction, interaction.guild, client)], flags: MessageFlags.Ephemeral });
                } catch (error) {
                    await interaction.deferUpdate();
                    await interaction.followUp({ embeds: [get_failed_embed(interaction, interaction.guild, client)], flags: MessageFlags.Ephemeral });
                };
                return;
            };

            console.log(`[${time()}] ${user.username}${user.globalName ? `(${user.globalName})` : ""} 正在觸發互動(rpg_interactions): ${interaction.customId}`);

            if (interaction.customId.startsWith('rpg_transaction')) {
                await interaction.deferUpdate();
                const embed = get_transaction_embed(interaction);
                await interaction.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral });
            } else if (interaction.customId.startsWith('rpg_help_menu')) {
                await interaction.deferUpdate();

                const category = interaction.values[0];
                const newEmbed = get_help_embed(category, client);

                await interaction.followUp({
                    embeds: [newEmbed],
                    flags: MessageFlags.Ephemeral,
                });
            } else if (interaction.customId.startsWith('pay')) {
                await interaction.deferUpdate();
                const { load_rpg_data, save_rpg_data } = require("../../module_database.js");
                const { get_emoji, setEmbedFooter, add_money, remove_money } = require("./msg_handler.js");

                const emoji_cross = get_emoji(interaction.guild, "crosS");
                if (interaction.customId.startsWith('pay_confirm')) {
                    const emoji_top = get_emoji(interaction.guild, "top");
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
                // const emoji_tick = get_emoji(interaction.guild, "Tick");
                // const emoji_cross = get_emoji(interaction.guild, "crosS");
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

                const emoji_shield = get_emoji(message.guild, "shield");
                const emoji_backpack = get_emoji(message.guild, "bag");
                const emoji_partner = get_emoji(message.guild, "partner");

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

                return await interaction.editReply({ embeds: [setEmbedFooter(message, embed)], components: [row] });
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
                const res = await ls_function({ client: interaction.client, message, rpg_data: load_rpg_data(userId), mode: 1 });
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

                const emoji_trade = get_emoji(interaction.guild, "trade");
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`${emoji_trade} | 成功售出了 ${amount} 個 ${name[item_id]}`);

                await interaction.editReply({ embeds: [setEmbedFooter(client, embed)], components: [] });
            } else if (interaction.customId === "cancel") {
                const { get_emoji, setEmbedFooter } = require("./msg_handler.js");
                await interaction.deferUpdate();

                const emoji_cross = get_emoji(interaction.guild, "crosS");

                const embed = new EmbedBuilder()
                    .setColor(0xF04A47)
                    .setTitle(`${emoji_cross} | 操作取消`);

                await interaction.editReply({ embeds: [setEmbedFooter(client, embed)], components: [] });
            }
        });
    },
};