const { SlashCommandBuilder, EmbedBuilder, SlashCommandSubcommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { smeltable_items, get_name_of, animal_products } = require("../../../rpg.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("smelt")
        .setDescription("煉金爐相關指令")
        .setNameLocalizations({
            "zh-TW": "煉金爐",
            "zh-CN": "炼金炉",
            "en-US": "smelter",
        })
        .setDescriptionLocalizations({
            "zh-TW": "煉金爐相關指令",
            "zh-CN": "炼金炉相关指令",
            "en-US": "Smelter related commands",
        })
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName("smelt")
            .setNameLocalizations({
                "zh-TW": "熔鍊",
                "zh-CN": "熔鍊",
                "en-US": "smelt",
            })
            .setDescription("熔鍊礦物")
            .setDescriptionLocalizations({
                "zh-TW": "熔鍊礦物",
                "zh-CN": "熔炼矿物",
                "en-US": "Smelt ores",
            })
            .addStringOption(option =>
                option.setName("配方")
                    .setDescription("要熔鍊的配方")
                    .setRequired(true)
                    .addChoices(
                        ...smeltable_items.map(item => {
                            const I_item_id = item.input[0].item;
                            const I_amount = item.input[0].amount;
                            const O_item_id = item.output;
                            const O_amount = item.amount;
                            return {
                                name: `${get_name_of(I_item_id)} x${I_amount} => ${get_name_of(O_item_id)} x${O_amount}`,
                                value: I_item_id
                            };
                        })
                    ),
            )
            .addIntegerOption(option =>
                option.setName("數量")
                    .setDescription("熔鍊數量")
                    .setMinValue(1)
                    .setRequired(false),
            )
            .addBooleanOption(option =>
                option.setName("全部")
                    .setDescription("熔鍊全部選擇的礦物")
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
            .setDescription("查看目前煉金爐狀態")
            .setDescriptionLocalizations({
                "zh-TW": "查看目前煉金爐狀態",
                "zh-CN": "查看目前炼金炉状态",
                "en-US": "View current smelter status",
            })
        )
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName("get")
            .setNameLocalizations({
                "zh-TW": "取出",
                "zh-CN": "取出",
                "en-US": "get",
            })
            .setDescription("從煉金爐取出物品")
            .setDescriptionLocalizations({
                "zh-TW": "從煉金爐取出物品",
                "zh-CN": "从炼金炉取出物品",
                "en-US": "Take items out from smelter",
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
        if (subcommand === "smelt") {
            const { load_rpg_data, load_smelt_data } = require("../../../module_database.js");
            const { name, smelter_slots, smeltable_items } = require("../../../rpg.js");
            const { setEmbedFooter, get_emoji, get_loophole_embed } = require("../../../thebotfunction/rpg/msg_handler.js");
            await interaction.deferReply();

            const emoji_cross = await get_emoji(interaction.client, "crosS");
            const emoji_furnace = await get_emoji(interaction.client, "furnace");

            let rpg_data = load_rpg_data(userId);
            const smelt_data = load_smelt_data()[userId];
            if (smelt_data && smelt_data.length >= smelter_slots) {
                const embed = new EmbedBuilder()
                    .setColor(0xF04A47)
                    .setTitle(`${emoji_cross} | 你的煉金爐已經滿了`);

                return await interaction.followUp({ embeds: [setEmbedFooter(interaction.client, embed)] });
            };

            let item_id = interaction.options.getString("配方");
            let amount = interaction.options.getInteger("數量") ?? 1;
            const allMats = interaction.options.getBoolean("全部") ?? false;

            // 找到該 smeltable_item 的配方
            const smelt_recipe = smeltable_items.find(item => item.input[0].item === item_id);
            if (!smelt_recipe) {
                const embed = await get_loophole_embed(interaction.client, "找不到該熔鍊配方");
                return await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)], ephemeral: true });
            }

            if (allMats) {
                amount = Math.floor((rpg_data.inventory[item_id] || amount) / input_amount);
            };

            const input_amount = smelt_recipe.input[0].amount * amount;
            const output_amount = smelt_recipe.amount * amount;
            const duration = 5 * 60 * amount;

            let item_need = [
                {
                    item: item_id,
                    amount: input_amount,
                },
                {
                    item: "coal",
                    amount: Math.ceil(amount / 2),
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
                .setColor(0x00BBFF)
                .setTitle(`${emoji_furnace} | 熔鍊確認`)
                .setDescription(
                    `將要熔鍊 \`${input_amount}\` 組 \`${get_name_of(item_id)}\`
花費 \`${Math.ceil(input_amount / 2)}\` 個煤炭
預估時間：\`${duration / 60}\` 分鐘`);

            // 生成一個簡短的識別碼
            const session_id = `${userId}_${Date.now()}`;

            // 將 item_need 資料儲存在全域變數或快取中
            if (!global.smelter_sessions) {
                global.smelter_sessions = {};
            };
            global.smelter_sessions[session_id] = item_need;

            const confirm_button = new ButtonBuilder()
                .setCustomId(`smelter_smelt|${userId}|${item_id}|${input_amount}|${Math.ceil(amount / 2)}|${duration}|${output_amount}|${session_id}`)
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
            const { load_smelt_data } = require("../../../module_database.js");
            const { name, smelter_slots } = require("../../../rpg.js");
            const { setEmbedFooter, get_emoji } = require("../../../thebotfunction/rpg/msg_handler.js");

            await interaction.deferReply();

            const smelt_data = load_smelt_data()[userId];
            const emoji_furnace = await get_emoji(interaction.client, "furnace");

            const used_slots = smelt_data ? smelt_data.length : 0;
            const current_time = Math.floor(Date.now() / 1000);

            const embed = new EmbedBuilder()
                .setColor(0x00BBFF)
                .setTitle(`${emoji_furnace} | 你的煉金爐使用狀況`)
                .setDescription(`使用率 \`[${used_slots} / ${smelter_slots}]\``);

            if (!smelt_data || smelt_data.length === 0) {
                embed.setDescription(`使用率 \`[${used_slots} / ${smelter_slots}]\`\n\n你的煉金爐目前是空的`);
            } else {
                for (let i = 0; i < smelt_data.length; i++) {
                    const item = smelt_data[i];
                    const input_name = name[item.item_id] || item.item_id;
                    const output_name = name[item.output_item_id] || item.output_item_id;

                    const total_duration = item.amount * 60;
                    const start_time = item.end_time - total_duration;
                    const elapsed_time = current_time - start_time;
                    const progress = Math.min(100, Math.max(0, (elapsed_time / total_duration) * 100));

                    const time_ago = `<t:${item.end_time}:R>`;

                    embed.addFields({
                        name: `${i + 1}. ${input_name} x${item.amount}`,
                        value: `=> ${output_name}x${item.output_amount} (完成度：${Math.round(progress)}% ${time_ago})`,
                        inline: false
                    });
                };
            };

            await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)] });
        } else if (subcommand === "get") {
            const { load_smelt_data, save_smelt_data, load_rpg_data, save_rpg_data } = require("../../../module_database.js");
            const { name } = require("../../../rpg.js");
            const { setEmbedFooter, get_emoji } = require("../../../thebotfunction/rpg/msg_handler.js");
            await interaction.deferReply();

            const smelt_data_all = load_smelt_data();
            const smelt_data = smelt_data_all[userId];
            const rpg_data = load_rpg_data(userId);

            const emoji_cross = await get_emoji(interaction.client, "crosS");
            const emoji_furnace = await get_emoji(interaction.client, "furnace");

            if (!smelt_data || smelt_data.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0xF04A47)
                    .setTitle(`${emoji_cross} | 你的煉金爐是空的`);

                return await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)], ephemeral: true });
            };

            const index = interaction.options.getInteger("編號") - 1;
            if (index < 0 || index >= smelt_data.length) {
                const embed = new EmbedBuilder()
                    .setColor(0xF04A47)
                    .setTitle(`${emoji_cross} | 錯誤的物品編號`);

                return await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)], ephemeral: true });
            };

            const item = smelt_data[index];
            const current_time = Math.floor(Date.now() / 1000);
            if (current_time < item.end_time) {
                const embed = new EmbedBuilder()
                    .setColor(0xF04A47)
                    .setTitle(`${emoji_cross} | 熔鍊還沒完成`)
                    .setFooter({ text: `等待至 <t:${item.end_time}:R>` });

                return await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)], ephemeral: true });
            };

            // 將熔鍊完成的物品加入背包
            rpg_data.inventory[item.output_item_id] = (rpg_data.inventory[item.output_item_id] || 0) + item.output_amount;
            // 從煉金爐移除該物品
            smelt_data.splice(index, 1);
            // 儲存資料
            save_smelt_data(smelt_data_all);
            save_rpg_data(userId, rpg_data);

            const embed = new EmbedBuilder()
                .setColor(0x00BBFF)
                .setTitle(`${emoji_furnace} | 成功從煉金爐取出了 ${name[item.output_item_id] || item.output_item_id}x${item.output_amount}`);

            return await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)] });
        };
    },
};
