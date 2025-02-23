const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('結束紅包')
        .setDescription('結束紅包 end red packet')
        .addStringOption(option =>
            option.setName("訊息id")
                .setDescription("要結束的紅包訊息ID")
                .setRequired(true),
        ),
    execute() { },
};