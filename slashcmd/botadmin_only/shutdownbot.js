const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("關機")
        .setDescription("關閉機器人(僅限機器人管理員) shutdown bot"),
    async execute(interaction) {
        const { BotAnnouncementChannelID } = require("../../config.json");
        const { loadData } = require("../../module_database.js");
        const { saveQueue } = require("../../module_music.js");
        const { time } = require("../../module_time.js");

        await interaction.deferReply();
        let user = interaction.user;
        if (!loadData(user.id).admin) return await interaction.editReply("您不是機器人管理員。無法使用此指令。");
        await interaction.editReply("機器人正在關機!");
        console.log(`[${time()}] 正在關機... (${user.globalName || user.username} 要求關機)`);
        let channel = interaction.guild.channels.cache.get(BotAnnouncementChannelID);
        if (channel) {
            await channel.send({ content: `哈狗機器人已關機! (${user.toString()} 要求我關機)`, allowedMentions: { repliedUser: false } });
        };
        saveQueue(new Map());
        await interaction.client.destroy();
        process.exit();
    },
};