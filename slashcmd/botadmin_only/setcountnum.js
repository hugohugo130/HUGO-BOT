const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('設定數數數字')
        .setDescription('設定目前數數的數字 set countnum')
        .addIntegerOption(option =>
            option.setName('數字')
                .setDescription('要設定的數字')
                .setRequired(true),
        ),
    async execute(interaction) {
        const { loadData } = require("../../module_database.js");
        await interaction.deferReply();
        if (!loadData(interaction.user.id).admin) return await interaction.editReply("您不是機器人管理員。無法使用此指令。");
        const num = interaction.options.getInteger('數字');
        let countingData = JSON.parse(fs.readFileSync('./db.json', 'utf8'));
        countingData.counting_num = num;
        fs.writeFileSync('./db.json', JSON.stringify(countingData, null, 2));
        await interaction.editReply(`已成功設定數數的數字為 ${num}`);
    },
};