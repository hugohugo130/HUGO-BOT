const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('隨機數字')
        .setDescription('隨機數字 roll')
        .addIntegerOption(option =>
            option.setName('最小值')
                .setDescription('隨機數字的最小值')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('最大值')
                .setDescription('隨機數字的最大值')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();
        let min = interaction.options.getInteger('最小值');
        let max = interaction.options.getInteger('最大值');
        const diceResult = Math.floor(Math.random() * (max - min + 1)) + min;
        let responsetext = `🎲 你擲出了 ${diceResult}。`;
        if (min < 0 || max < 0) {
            responsetext = `你想要擲出負數？好吧，我們就擲出負數吧。🎲 你擲出了 ${diceResult}。`;
        };
        if (min === max) {
            responsetext = `你想要擲出相同的數字？怎麼擲出來的數字也是 ${min}。`;
        };
        if (min > max) {
            responsetext = `最小值不能大於最大值，你洗勒哈囉`;
        };
        const response = await interaction.editReply(responsetext);
        await response.react('🎲');
    },
};