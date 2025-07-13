const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { recipes, name } = require("../../../rpg.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("make")
        .setDescription("合成製作武器和物品")
        .setNameLocalizations({
            "zh-TW": "製作",
            "zh-CN": "製作",
            "en-US": "make",
        })
        .setDescriptionLocalizations({
            "zh-TW": "合成物品",
            "zh-CN": "合成物品",
            "en-US": "Craft items",
        })
        .addStringOption(option =>
            option.setName("物品")
                .setDescription("要合成的物品")
                .setRequired(true)
                .addChoices(
                    ...Object.entries(recipes).map(([item_id, recipe]) => {
                        const recipe_str = recipe.input.map(input =>
                            `${name[input.item] || input.item}x${input.amount}`
                        ).join("、");
                        return {
                            name: `${name[item_id]} (${recipe_str})`,
                            value: `${item_id}|${recipe.input.map(input =>
                                `${input.item}*${input.amount}`
                            ).join(",")}`
                        };
                    })
                ),
        )
        .addIntegerOption(option =>
            option.setName("數量")
                .setDescription("要合成的數量")
                .setMinValue(1)
                .setRequired(false),
        ),
    async execute(interaction) {
        const { load_rpg_data, save_rpg_data } = require("../../../module_database.js");
        const { name, tags } = require("../../../rpg.js");
        const { setEmbedFooter, get_emoji } = require("../../../thebotfunction/rpg/msg_handler.js");
        await interaction.deferReply();

        const userid = interaction.user.id;
        let rpg_data = load_rpg_data(userid);

        let item = interaction.options.getString("物品");
        const amount = interaction.options.getInteger("數量") ?? 1;

        item = item.split("|");
        const item_id = item[0];
        let item_need = {};
        let item_missing = [];
        for (const need of item[1].split(",")) {
            const need_item = need.split("*");
            const count = need_item[1] || 1;
            let id = need_item[0];
            let real_id = id;
            if (id.startsWith("#")) {
                const tag = id.replace("#", "");
                for (const item of tags[tag]) {
                    if (rpg_data.inventory[item]) {
                        id = item;
                        break;
                    };
                };
                if (!id.startsWith("#")) {
                    real_id = id;
                } else {
                    real_id = need_item[0];
                }
            }
            item_need[real_id] = (item_need[real_id] || 0) + count * amount;
        };

        for (const need_item in item_need) {
            const have_amount = (rpg_data.inventory[need_item] || 0);
            if (have_amount < item_need[need_item]) {
                item_missing.push({
                    name: name[need_item] || need_item,
                    amount: item_need[need_item] - have_amount,
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

        const output_amount = recipes[item_id].amount * amount;

        rpg_data.inventory[item_id] += output_amount;
        save_rpg_data(userid, rpg_data);

        const emoji = get_emoji(interaction.guild, "toolbox")
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`${emoji} | 製作物品`)
            .setDescription(`你製作出了 \`${output_amount}\` 個 ${name[item_id]}`);

        await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)] });
    },
};
