const { SlashCommandBuilder } = require('discord.js');

win = [true, false, false, false];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('賭注')
        .setDescription('賭! 贏幾率為25%, 贏了獲得兩倍哈狗幣')
        .addNumberOption(option =>
            option.setName("數量")
                .setDescription("賭多少哈狗幣")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(500),
        )
        .setNameLocalizations({
            "zh-TW": "賭注",
            "zh-CN": "赌注",
            "en-US": "bet",
        })
        .setDescriptionLocalizations({
            "zh-TW": "賭! 贏幾率為25%, 贏了獲得兩倍哈狗幣",
            "zh-CN": "赌! 赢几率为25%, 赢了获得两倍哈狗币",
            "en-US": "Bet! The winning probability is 25%, and if you win, you will receive twice the amount of哈狗币",
        }),
    async execute(interaction) {
        const { loadData, sethacoin } = require("../../module_database.js");
        await interaction.deferReply();
        let amount = interaction.options.getNumber("數量");
        let userid = interaction.user.id;
        let data = loadData(userid);
        if (data.hacoin < amount) return interaction.editReply("你沒有足夠的哈狗幣來賭博...");
        if (win[Math.floor(Math.random() * win.length)]) {
            sethacoin(userid, -amount, true);
            return await interaction.editReply(`哎呀!輸了!${amount}哈狗幣蒸發了!`);
        } else {
            sethacoin(userid, amount * 2, true);
            return await interaction.editReply(`哇!!!!贏了!獲得了${amount * 2}哈狗幣!!!`);
        };
    },
};