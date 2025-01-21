const { SlashCommandBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("猜數字一次")
        .setDescription("只猜一次數字 guess num once")
        .addIntegerOption(option =>
            option.setName("min")
                .setDescription("隨機數的最小值")
                .setRequired(true),
        )
        .addIntegerOption(option =>
            option.setName("max")
                .setDescription("隨機數的最大值")
                .setRequired(true),
        )
        .addIntegerOption(option =>
            option.setName("guess")
                .setDescription("猜的數字")
                .setRequired(true),
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const { loadData } = require("../../module_database.js");
        const data = loadData(interaction.user.id);
        if (!data.vip) {
            await interaction.editReply("你不是VIP，無法使用此功能");
            return;
        };
        const min_num = interaction.options.getInteger("min");
        const max_num = interaction.options.getInteger("max");
        const guess = interaction.options.getInteger("guess");
        const rnum = Math.floor(Math.random() * max_num - min_num) + min_num;
        const correct = rnum === guess;
        if (correct) {
            await interaction.editReply(`哇！你猜中了！猜中的機率為${(1 / (max_num - min_num + 1)).toFixed(2)}%`);
        } else {
            await interaction.editEeply(`oh..你猜錯了，正確的數字是${rnum} 猜中的機率為${(1 / (max_num - min_num + 1)).toFixed(2)}%`);
        };
    },
};
