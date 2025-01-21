const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("結束猜數字")
        .setDescription("結束猜數字遊戲 end guess the number"),
    async execute(interaction) {
        const { end_guess_num_game } = require("../../module_database.js");
        const userid = interaction.user.id;
        const res = end_guess_num_game(userid);
        if (res === 0) return interaction.reply("你沒有開始遊戲");
        interaction.reply("遊戲已結束");
    },
};
