const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("關機")
        .setDescription("關閉機器人(僅限機器人管理員) shutdown bot"),
    async execute(interaction) {
        try {
            const { stop_send_msg } = require("../../module_bot_start_stop.js");
            const { loadData, uploadAllDatabaseFiles } = require("../../module_database.js");
            const { time } = require("../../module_time.js");

            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            let user = interaction.user;
            if (!loadData(user.id).admin) return await interaction.editReply("您不是機器人管理員。無法使用此指令。");
            await interaction.editReply("機器人正在關機!");
            console.log(`[${time()}] 正在關機... (${user.globalName || user.username} 要求關機)`);

            await uploadAllDatabaseFiles();
            console.log("所有資料庫檔案已上傳");
            await stop_send_msg(interaction.client);

            await interaction.client.destroy();
            process.exit();
        } catch (error) {
            console.log(error.stack);
            await interaction.editReply("機器人關機時遇到錯誤!");
        };
    },
};