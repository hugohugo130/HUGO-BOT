const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('設定生日')
        .setDescription('設定自己的生日')
        .setNameLocalizations({
            "zh-TW": "設定生日",
            "zh-CN": "设置生日",
            "en-US": "set_birthday",
        })
        .setDescriptionLocalizations({
            "zh-TW": "設定自己的生日",
            "zh-CN": "设置自己的生日",
            "en-US": "Set your birthday",
        }),
    async execute(interaction) {
        let modal = new ModalBuilder()
            .setCustomId('set_birthday_modal')
            .setTitle('設置生日')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('birthday_input')
                        .setLabel('請輸入生日 (格式: mm-dd)')
                        .setPlaceholder('例如: 01-01')
                        .setStyle(TextInputStyle.Short)
                ),
            );
        await interaction.showModal(modal);
    }
};