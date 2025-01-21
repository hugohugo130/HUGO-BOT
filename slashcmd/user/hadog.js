const { SlashCommandBuilder } = require('discord.js');
const { sleep } = require('../../module_sleep.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('哈狗')
        .setDescription('哈狗 熱狗 hadog'),
    async execute(interaction) {
        await interaction.deferReply();
        await interaction.editReply("哈狗 熱狗 🌭");
        await sleep(1000);
        await interaction.editReply("哈狗");
        await sleep(1000);
        await interaction.editReply("熱狗");
        await sleep(1000);
        for (let i = 1; i < 11; i++) {
            // 1 到 10
            await interaction.editReply("🌭".repeat(i));
            await sleep(1000);
        };
        await sleep(1000);
        await interaction.editReply("💥");
    }
};