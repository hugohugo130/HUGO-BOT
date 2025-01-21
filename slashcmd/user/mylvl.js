const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("我的等級")
        .setDescription("查看你的等級 mylvl"),
    async execute(interaction) {
        const { exp_need } = require("../../config.json");
        const { loadData } = require("../../module_database.js");
        await interaction.deferReply();
        const user = interaction.user;
        const data = loadData(user.id);
        const level = data.level;
        const exp = data.exp;
        const expNeeded = exp_need;

        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle("我的等級")
            .setDescription(`### 等級: ${level}\n### 經驗值: ${exp}/${expNeeded}`);

        await interaction.editReply({ embeds: [embed] });
    },
};
