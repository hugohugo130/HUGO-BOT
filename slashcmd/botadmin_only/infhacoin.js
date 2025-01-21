const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('狂加哈狗幣')
        .setDescription('僅機器人管理員可用 infinite hacoin')
        .addNumberOption(option =>
            option.setName("數量")
                .setDescription("每次增加的數量")
                .setRequired(true),
        )
        .addIntegerOption(option =>
            option.setName("次數")
                .setDescription("要增加的次數")
                .setRequired(true),
        ),
    async execute(interaction) {
        const { loadData, sethacoin } = require("../../module_database.js");
        await interaction.deferReply({ ephemeral: true });
        let userid = interaction.user.id;
        let isadmin = loadData(userid).admin;
        if (!isadmin) return await interaction.editReply("您不是機器人管理員。無法使用此指令。");
        let amount = interaction.options.getNumber("數量");
        let times = interaction.options.getInteger("次數");
        
        for (let i = 0; i < times; i++) {
            sethacoin(userid, amount, true);
        };
        await interaction.editReply(`成功增加 ${amount * times} 哈狗幣!`);
    },
};