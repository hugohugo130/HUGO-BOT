const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('頭像')
        .setDescription('獲取用戶頭像 avatar')
        .addUserOption(option =>
            option.setName("用戶")
                .setDescription("要獲取頭像的用戶")
                .setRequired(false),
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const user = interaction.options.getUser("用戶") ?? interaction.user;

        const embed = new EmbedBuilder()
            .setTitle(`${user.username} 的頭像`)
            .setImage(user.displayAvatarURL({ dynamic: true }));

        await interaction.editReply({ embeds: [embed] });
    },
};