const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('結束紅包')
        .setDescription('結束紅包 end redpacket'),
    execute() { },
};