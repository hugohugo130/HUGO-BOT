const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('備份資料庫')
        .setDescription('備份資料庫 backup database'),
    execute() { },
};