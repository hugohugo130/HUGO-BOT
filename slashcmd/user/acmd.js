const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('一個指令')
        .setDescription('就一個指令')
        .setNameLocalizations({
            "zh-TW": "一個指令",
            "zh-CN": "一个指令",
            "en-US": "a_simple_command",
        })
        .setDescriptionLocalizations({
            "zh-TW": "就一個指令",
            "zh-CN": "就一个指令",
            "en-US": "Just a simple command",
        }),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply(`哈囉 ${interaction.member.user.username}`);
    }
};