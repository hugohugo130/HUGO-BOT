const { SlashCommandBuilder, EmbedBuilder, SlashCommandSubcommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { name } = require("../../../rpg.js");

// 定義可烘烤的食材列表
const bakeable_items = [
    "馬鈴薯",
    "生豬肉",
    "生鴨肉",
    "生牛肉",
    "生雞肉",
    "生鮭魚",
    "生蝦",
    "生鮪魚",
    "小麥",
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bake")
        .setDescription("烤箱相關指令")
        .setNameLocalizations({
            "zh-TW": "烤箱",
            "zh-CN": "烤箱",
            "en-US": "oven",
        })
        .setDescriptionLocalizations({
            "zh-TW": "烤箱相關指令",
            "zh-CN": "烤箱相关指令",
            "en-US": "Oven related commands",
        })
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName("bake")
            .setNameLocalizations({
                "zh-TW": "烘烤",
                "zh-CN": "烘烤",
                "en-US": "bake",
            })
            .setDescription("烘烤食物")
            .setDescriptionLocalizations({
                "zh-TW": "烘烤食物",
                "zh-CN": "烘烤食物",
                "en-US": "bake delicious food",
            })
            .addStringOption(option =>
                option.setName("食材")
                    .setDescription("需要烘烤的食材")
                    .setRequired(true)
                    .addChoices(
                        ...bakeable_items.map(item_name => {
                            // 根據中文名稱尋找對應的 item_id
                            const item_id = Object.keys(name).find(key => name[key] === item_name);
                            return {
                                name: item_name,
                                value: item_id
                            };
                        }).filter(choice => choice.value !== undefined)
                    ),
            )
            .addIntegerOption(option =>
                option.setName("數量")
                    .setDescription("烘烤數量")
                    .setMinValue(1)
                    .setRequired(false),
            )
            .addBooleanOption(option =>
                option.setName("全部")
                    .setDescription("烘焙全部選擇的食材")
                    .setRequired(false),
            ),
        )
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName("info")
            .setNameLocalizations({
                "zh-TW": "資訊",
                "zh-CN": "资讯",
                "en-US": "info",
            })
            .setDescription("查看目前烤箱狀態")
            .setDescriptionLocalizations({
                "zh-TW": "查看目前烤箱狀態",
                "zh-CN": "查看目前烤箱状态",
                "en-US": "View current oven status",
            })
        )
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName("get")
            .setNameLocalizations({
                "zh-TW": "取出",
                "zh-CN": "取出",
                "en-US": "get",
            })
            .setDescription("從烤箱取出食物")
            .setDescriptionLocalizations({
                "zh-TW": "從烤箱取出食物",
                "zh-CN": "从烤箱取出食物",
                "en-US": "Take food out from oven",
            })
            .addIntegerOption(option =>
                option.setName("編號")
                    .setDescription("要取出的物品編號（1, 2, 3...）")
                    .setRequired(true)
                    .setMinValue(1),
            ),
        ),
    async execute(interaction) {
        const userId = interaction.user.id;
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "bake") {
            const { load_rpg_data, load_bake_data } = require("../../../module_database.js");
            const { name, oven_slots } = require("../../../rpg.js");
            const { setEmbedFooter, get_emoji } = require("../../../thebotfunction/rpg/msg_handler.js");
            await interaction.deferReply();

            const emoji_cross = await get_emoji(interaction.client, "crosS");
            const emoji_drumstick = await get_emoji(interaction.client, "drumstick");

            let rpg_data = load_rpg_data(userId);
            const bake_data = load_bake_data()[userId];
            if (bake_data && bake_data.length >= oven_slots) {
                const embed = new EmbedBuilder()
                    .setColor(0xF04A47)
                    .setTitle(`${emoji_cross} | 你的烤箱已經滿了`);

                return await interaction.followUp({ embeds: [setEmbedFooter(interaction.client, embed)] });
            };

            let item_id = interaction.options.getString("食材");
            let amount = interaction.options.getInteger("數量") ?? 1;
            const allFoods = interaction.options.getBoolean("全部") ?? false;
            
            if (allFoods) {
                amount = rpg_data.inventory[item_id] || amount;
            };
            const duration = 60 * amount;

            const coal_amount = Math.ceil(amount / 2);

            let item_need = [
                {
                    item: item_id,
                    amount,
                },
                {
                    item: "coal",
                    amount: coal_amount,
                },
            ];
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

                const embed = new EmbedBuilder()
                    .setTitle(`${emoji_cross} | 你沒有那麼多的物品`)
                    .setColor(0xF04A47)
                    .setDescription(`你缺少了 ${items.join("、")}`);

                return await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)], ephemeral: true });
            };

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(`${emoji_drumstick} | 烘烤確認`)
                .setDescription(
                    `將要烘烤 \`${amount}\` 個 \`${name[item_id]}\`
花費 \`${coal_amount}\` 個煤炭
預估時間：\`${duration / 60}\` 分鐘`);

            // 生成一個簡短的識別碼來代替完整的 item_need JSON
            const session_id = `${userId}_${Date.now()}`;

            // 將 item_need 資料儲存在全域變數或快取中
            if (!global.oven_sessions) {
                global.oven_sessions = {};
            };
            global.oven_sessions[session_id] = item_need;

            const confirm_button = new ButtonBuilder()
                .setCustomId(`oven_bake|${userId}|${item_id}|${amount}|${coal_amount}|${duration}|${session_id}`)
                .setLabel("確認")
                .setStyle(ButtonStyle.Success);

            const cancel_button = new ButtonBuilder()
                .setCustomId(`cancel|${userId}`)
                .setLabel("取消")
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder()
                .addComponents(confirm_button, cancel_button);

            await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)], components: [row] });
        } else if (subcommand === "info") {
            const { load_bake_data } = require("../../../module_database.js");
            const { name, oven_slots, bake } = require("../../../rpg.js");
            const { setEmbedFooter, get_emoji } = require("../../../thebotfunction/rpg/msg_handler.js");

            await interaction.deferReply();

            const bake_data = load_bake_data()[userId];
            const emoji_drumstick = await get_emoji(interaction.client, "drumstick");

            const used_slots = bake_data ? bake_data.length : 0;
            const current_time = Math.floor(Date.now() / 1000);

            const embed = new EmbedBuilder()
                .setColor(0x00BBFF)
                .setTitle(`${emoji_drumstick} | 你的烤箱使用狀況`)
                .setDescription(`使用率 \`[${used_slots} / ${oven_slots}]\``);

            if (!bake_data || bake_data.length === 0) {
                embed.setDescription(`使用率 \`[${used_slots} / ${oven_slots}]\`\n\n你的烤箱目前是空的`);
            } else {
                for (let i = 0; i < bake_data.length; i++) {
                    const item = bake_data[i];
                    const input_name = name[item.item_id] || item.item_id;
                    const output_name = name[item.output_item_id] || item.output_item_id;

                    const total_duration = item.amount * 60;
                    const start_time = item.end_time - total_duration;
                    const elapsed_time = current_time - start_time;
                    const progress = Math.min(100, Math.max(0, (elapsed_time / total_duration) * 100));

                    const time_ago = `<t:${item.end_time}:R>`;

                    embed.addFields({
                        name: `${i + 1}. ${input_name} x${item.amount}`,
                        value: `=> ${output_name}x${item.amount} (完成度：${Math.round(progress)}% ${time_ago})`,
                        inline: false
                    });
                };
            };

            await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)] });
        } else if (subcommand === "get") {
            const { load_bake_data, save_bake_data, load_rpg_data, save_rpg_data } = require("../../../module_database.js");
            const { name } = require("../../../rpg.js");
            const { setEmbedFooter, get_emoji } = require("../../../thebotfunction/rpg/msg_handler.js");
            await interaction.deferReply();

            const bake_data_all = load_bake_data();
            const bake_data = bake_data_all[userId];
            const rpg_data = load_rpg_data(userId);

            const emoji_cross = await get_emoji(interaction.client, "crosS");
            const emoji_drumstick = await get_emoji(interaction.client, "drumstick");

            if (!bake_data || bake_data.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0xF04A47)
                    .setTitle(`${emoji_cross} | 你的烤箱是空的`);
                return await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)], ephemeral: true });
            };

            const index = interaction.options.getInteger("編號") - 1;
            if (index < 0 || index >= bake_data.length) {
                const embed = new EmbedBuilder()
                    .setColor(0xF04A47)
                    .setTitle(`${emoji_cross} | 錯誤的物品編號`)
                return await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)], ephemeral: true });
            };

            const item = bake_data[index];
            const current_time = Math.floor(Date.now() / 1000);
            if (current_time < item.end_time) {
                const embed = new EmbedBuilder()
                    .setColor(0xF04A47)
                    .setTitle(`${emoji_cross} | 烘烤還沒完成`)
                return await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)], ephemeral: true });
            };

            // 將烘烤完成的物品加入背包
            rpg_data.inventory[item.output_item_id] = (rpg_data.inventory[item.output_item_id] || 0) + item.amount;
            // 從烤箱移除該物品
            bake_data.splice(index, 1);
            // 儲存資料
            save_bake_data(bake_data_all);
            save_rpg_data(userId, rpg_data);

            const embed = new EmbedBuilder()
                .setColor(0x00BBFF)
                .setTitle(`${emoji_drumstick} | 成功從烤箱取出了 ${name[item.output_item_id] || item.output_item_id}x${item.amount}`);

            return await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)] });
        };
    },
};
