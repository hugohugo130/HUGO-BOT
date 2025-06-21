const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("合成")
        .setDescription("合成製作武器和物品 craft")
        .setNameLocalizations({
            "zh-TW": "製作",
            "zh-CN": "制作",
            "en-US": "craft",
        })
        .setDescriptionLocalizations({
            "zh-TW": "製作物品",
            "zh-CN": "制作物品",
            "en-US": "Craft items",
        })
        .addStringOption(option =>
            option.setName("物品")
                .setDescription("要合成的物品")
                .setRequired(true)
                .addChoices(
                    { name: "木鋤 (木棒x2 + 木材x1)", value: "wooden_hoe|wooden_stick2*2,wood*1" },
                    { name: "鐵鋤 (木棒x2 + 鐵x1)", value: "iron_hoe|wooden_stick2*2,iron*1" },
                    { name: "木棒 (木材x2)", value: "wooden_stick|wood*2" },

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
        const { name } = require("../../../rpg.js");
        await interaction.deferReply();
        let item = interaction.options.getString("物品");
        const amount = interaction.options.getInteger("數量") || 1;
        item = item.split("|");
        const item_id = item[0];
        let item_need = {};
        for (const need of item[1].split(",")) {
            const need_item = need.split("*");
            const count = need_item[1] || 1;
            item_need[need_item[0]] = count * amount;
        };
        const userid = interaction.user.id;
        let rpg_data = load_rpg_data(userid);
        for (const need_item in item_need) {
            if (rpg_data.inventory[need_item] < item_need[need_item]) {
                return interaction.reply({ content: `你沒有足夠的${need_item}`, ephemeral: true });
            };
        };
        for (const need_item in item_need) {
            rpg_data.inventory[need_item] -= item_need[need_item];
        };
        rpg_data.inventory[item_id] += amount;
        save_rpg_data(userid, rpg_data);
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`${emoji} | 製作物品`)
            .setDescription(`你製作了出了 \`${amount}\` 個 ${name[item_id]}`)
            .setFooter({
                text: `
哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體
你現在有 ${rpg_data.inventory[item_id]} 個 ${name[item_id]}`
            });
        
        await interaction.editReply({ embeds: [embed] });
    },
};
