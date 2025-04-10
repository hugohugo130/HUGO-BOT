const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("結束猜數字遊戲")
        .setDescription("結束猜數字遊戲")
        .setNameLocalizations({
            "zh-TW": "結束猜數字遊戲",
            "zh-CN": "结束猜数字游戏",
            "en-US": "end_guess_the_number_game",
        })
        .setDescriptionLocalizations({
            "zh-TW": "結束猜數字遊戲",
            "zh-CN": "结束猜数字游戏",
            "en-US": "End guess the number game",
        }),
    async execute(interaction) {
        const { end_guess_num_game } = require("../../../module_database.js");
        const userid = interaction.user.id;
        const res = end_guess_num_game(userid);
        if (!res) return interaction.reply("你沒有開始遊戲");
        interaction.reply("遊戲已結束");
    },
};
