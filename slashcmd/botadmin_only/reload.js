const { SlashCommandBuilder } = require('discord.js');
const { loadbotfunction } = require("../../module_loadbotfunction.js")
const { loadslashcmd } = require("../../module_regcmd");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('重載機器人文件')
        .setDescription('重載機器人文件 reload')
        .addStringOption(option =>
            option.setName('類型')
                .setDescription('要重載的文件類型')
                .setRequired(true)
                .addChoices(
                    { name: '功能與指令', value: '功能與指令' },
                    { name: '模塊', value: '模塊' },
                    { name: '設定檔', value: '設定檔' },
                ),
        ),
    async execute(interaction) {
        const { loadData } = require("../../module_database.js");
        await interaction.deferReply();
        if (!loadData(interaction.user.id).admin) return await interaction.editReply("您不是機器人管理員。無法使用此指令。");
        const type = interaction.options.getString('類型');
        let error = false;
        const { time } = require("../../module_time.js");
        if (type === '功能與指令') {
            try {
                interaction.client.commands = loadslashcmd(true); // 重新載入指令
                interaction.client.removeAllListeners(); // 移除所有事件監聽器
                loadbotfunction(interaction.client, true); // 重新載入功能
            } catch (error) {
                console.error(`[${time()}] 無法重載功能與指令: ${error.message}`);
                await interaction.followUp(`[${time()}] 無法重載功能與指令: ${error.message}`);
                error = true;
            };
        } else if (type === '模塊') {
            let deletelist = ["../../module_database.js", "../../module_getrandomhacoin.js", "../../module_regcmd.js", "../../module_sleep.js"];
            for (const module of deletelist) {
                try {
                    delete require.cache[require.resolve(module)];
                } catch (error) {
                    console.error(`[${time()}] 無法重載模塊 ${module}: ${error.message}`);
                    await interaction.followUp(`[${time()}] 無法重載模塊 ${module}: ${error.message}`);
                    error = true;
                };
            };
        } else {
            let deletelist = ["../../config.json"];
            for (const module of deletelist) {
                try {
                    delete require.cache[require.resolve(module)];
                } catch (error) {
                    console.error(`[${time()}] 無法重載設定檔 ${module}: ${error.message}`);
                    await interaction.followUp(`[${time()}] 無法重載設定檔 ${module}: ${error.message}`);
                    error = true;
                };
            };
        };
        if (!error) await interaction.editReply(`已重載 ${type} 文件。`);
    },
};