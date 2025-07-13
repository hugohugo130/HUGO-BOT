const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('切換無限簽到')
        .setDescription('調整無限簽到權限（僅限管理員使用） change infsign'),
    async execute(interaction) {
        const { saveUserData, loadData } = require("../../module_database.js");
        await interaction.deferReply();
        let userid = interaction.user.id;
        let data = loadData(userid);
        if (!loadData(interaction.user.id).admin) return await interaction.editReply("您不是機器人管理員。無法使用此指令。");
        data.infsign = !data.infsign;
        saveUserData(userid, data);
        await interaction.editReply(`您的無限簽到權限已更新。目前狀態：${data.infsign ? "已啟用" : "已停用"}（包含自動簽到功能）`);
    },
};