const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('擲骰子')
        .setDescription('擲骰子')
        .setNameLocalizations({
            "zh-TW": "擲骰子",
            "zh-CN": "掷骰子",
            "en-US": "roll_a_die",
        })
        .setDescriptionLocalizations({
            "zh-TW": "擲骰子",
            "zh-CN": "掷骰子",
            "en-US": "Roll a die",
        })
        .addIntegerOption(option =>
            option.setName('最小值')
                .setDescription('擲骰子的最小值')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('最大值')
                .setDescription('擲骰子的最大值')
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
            responsetext = `最小值不能大於最大值`;
        };
        const response = await interaction.editReply(responsetext);
        await response.react('🎲');
    },
};