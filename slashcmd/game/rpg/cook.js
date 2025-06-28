const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { bake, name } = require("../../../rpg.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("cook")
        .setDescription("烹飪食物")
        .setNameLocalizations({
            "zh-TW": "烹飪",
            "zh-CN": "烹饪",
            "en-US": "cook",
        })
        .setDescriptionLocalizations({
            "zh-TW": "烹飪食物",
            "zh-CN": "烹饪食物",
            "en-US": "cook delicious food",
        })
        .addStringOption(option =>
            option.setName("物品")
                .setDescription("要烹飪的物品")
                .setRequired(true)
                .addChoices(
                    ...Object.entries(bake).map(([item_id, time]) => {
                        return {
                            name: `${name[item_id]} (耗時 ${time} 秒)`,
                            value: `${item_id}|${time}`,
                        };
                    })
                ),
        )
        .addIntegerOption(option =>
            option.setName("數量")
                .setDescription("要烹飪的數量 (預設1)")
                .setMinValue(1)
                .setMaxValue(64)
                .setRequired(false),
        )
        .addIntegerOption(option => 
            option.setName("煤炭")
                .setDescription("要放多少煤炭 (預設1)")
                .setMinValue(1)
                .setRequired(false),
        ),
    async execute(interaction) {
        const { load_rpg_data, save_rpg_data, load_cooking_interactions, save_cooking_interactions } = require("../../../module_database.js");
        const { name } = require("../../../rpg.js");
        const { setEmbedFooter, get_emoji } = require("../../../thebotfunction/rpg/msg_handler.js");
        await interaction.deferReply();

        const userid = interaction.user.id;
        let rpg_data = load_rpg_data(userid);

        let item_data = interaction.options.getString("物品");
        const amount = interaction.options.getInteger("數量") ?? 1;
        const coal_amount = interaction.options.getInteger("煤炭") ?? 1;

        let [item_id, duration] = item_data.split("|");
        duration = parseInt(duration);


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

        for (const need_item in item_need) {
            const item_id = need_item.item;
            const need_amount = need_item.amount;
            const have_amount = (rpg_data.inventory[item_id] || 0);

            if (have_amount < need_amount) {
                item_missing.push({
                    name: name[item_id] || need_item,
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
                .setTitle("你沒有足夠的材料")
                .setColor(0xF04A47)
                .setDescription(`你缺少了 ${items.join("、")}`);

            return await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)], ephemeral: true });
        };

        for (const need_item in item_need) {
            rpg_data.inventory[need_item] -= item_need[need_item];
        };

        const output_amount = amount;

        rpg_data.inventory[item_id] += output_amount;
        save_rpg_data(userid, rpg_data);

        const emoji = get_emoji(interaction.guild, "bread");
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`${emoji} | 烘焙物品`)
            .setDescription("烘焙物品，啟動!");

        let cooking_interactions = load_cooking_interactions();

        const sentMsg = await interaction.fetchReply();
        cooking_interactions.push({
            userid,
            item_id,
            amount,
            coal_amount,
            duration,
            channelId: interaction.channelId,
            messageId: sentMsg.id,
            current: 0,
            legal: amount >= coal_amount,
        });

        // 儲存更新後的烹飪互動回 JSON
        save_cooking_interactions(cooking_interactions);

        await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)] });
    },
};
