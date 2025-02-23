const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('踢出語音')
        .setDescription('中斷用戶的語音連線')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('要中斷語音連線的用戶')
                .setRequired(true),
        ),
    async execute(interaction) {
        const { loadData } = require("../../module_database.js");
        await interaction.deferReply();
        const target_user = interaction.options.getUser('user'); // 獲取要踢出的用戶
        const target_member = interaction.guild.members.cache.get(target_user.id); // 獲取目標用戶

        if (!loadData(interaction.user.id).admin) {
            await interaction.editReply(":x: 你不是機器人管理員！");
            return;
        };

        if (!target_member.voice.channel) {
            await interaction.editReply(":x: 目標用戶不在語音頻道中！");
            return;
        };

        await target_member.voice.disconnect();
        await interaction.editReply(`已成功中斷 ${target_user.toString()} 在 ${target_member.voice.channel.toString()} 中的語音連線！`);
    },
};