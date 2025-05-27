const { SlashCommandBuilder } = require('discord.js');
const { sleep } = require('../../module_sleep.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('哈狗')
        .setDescription('哈狗 熱狗 hadog')
        .setNameLocalizations({
            "zh-TW": "哈狗",
            "zh-CN": "哈狗",
            "en-US": "hadog",
        })
        .setDescriptionLocalizations({
            "zh-TW": "哈狗 熱狗 hadog",
            "zh-CN": "哈狗 熱狗 hadog",
            "en-US": "Hadog 热狗",
        }),
    async execute(interaction) {
        await interaction.deferReply();
        await interaction.editReply("哈狗 熱狗 🌭");
        sleep(1000);
        await interaction.editReply("哈狗");
        sleep(1000);
        await interaction.editReply("熱狗");
        sleep(1000);
        for (let i = 1; i < 10 + 1; i++) {
            // 1 到 10
            await interaction.editReply("🌭".repeat(i));
            sleep(1000);
        };
        sleep(1000);
        await interaction.editReply("💥");
    },
};