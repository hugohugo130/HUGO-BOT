const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('一個指令')
        .setDescription('就一個指令 acmd'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply(`哈囉 ${interaction.member.user.username}`);
    }
};