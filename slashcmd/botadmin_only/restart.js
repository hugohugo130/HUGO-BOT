const { execSync } = require('child_process');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('重啟機器人')
        .setDescription('使用斜線指令來重啟機器人 restart'),
    async execute(interaction) {
        const { loadData } = require("../../module_database.js");
        const { BotAnnouncementChannelID } = require("../../config.json");
        await interaction.deferReply();

        if (!loadData(interaction.user.id).admin) return await interaction.editReply("您不是機器人管理員。無法使用此指令。");

        await interaction.editReply("機器人即將重啟");

        const isWindows = process.platform === "win32";
        const rootDir = path.join(__dirname, '../..');

        // 檢查 index.js 是否存在
        let mainFile = 'index.js';

        const scriptPath = path.join(rootDir, mainFile);
        if (!fs.existsSync(scriptPath)) return await interaction.editReply("Error 0x0001: 機器人主程式不存在。"); 

        const channel = interaction.guild.channels.cache.get(BotAnnouncementChannelID);
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle("哈狗機器人正在重啟!")
                .setDescription("哈狗機器人正在重啟!")
                .setColor(0x00BBFF)
                .setTimestamp();
            await channel.send({ embeds: [embed] });
        };

        if (isWindows) {
            try {
                await interaction.editReply("哈狗機器人正在重啟!");
                // 使用 execSync 直接替換當前進程
                await interaction.client.destroy();
                console.log("=========機器人重啟=========")
                execSync(`node "${scriptPath}"`, {
                    stdio: 'inherit',
                    shell: true
                });
            } catch (error) {
                console.error(`重啟錯誤: ${error}`);
                const { BotToken } = require("../../config.json");
                interaction.client.login(BotToken);
                interaction.editReply(`機器人重啟失敗: ${error}`);
            };
            // 這行通常不會執行到，因為 execSync 會替換當前進程
            process.exit();
        } else {
            return await interaction.editReply("不支援目前正在運行機器人的作業系統。");
        };
    },
};