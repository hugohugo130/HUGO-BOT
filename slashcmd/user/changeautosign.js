const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("切換自動簽到")
        .setDescription("開啟或關閉自動簽到功能")
        .setNameLocalizations({
            "zh-TW": "切換自動簽到",
            "zh-CN": "切换自动签到",
            "en-US": "toggle_auto_sign-in",
        })
        .setDescriptionLocalizations({
            "zh-TW": "開啟或關閉自動簽到功能",
            "zh-CN": "开启或关闭自动签到功能",
            "en-US": "Toggle auto sign-in",
        }),
    async execute(interaction) {
        const { loadData, saveUserData } = require("../../module_database.js");
        await interaction.deferReply();
        let userid = interaction.member.id;
        let userData = loadData(userid);
        userData.autosign = !userData.autosign;
        saveUserData(userid, userData);
        return await interaction.editReply(`自動簽到功能已${userData.autosign ? "開啟" : "關閉"}。${userData.autosign ? "系統將會為您自動完成每日簽到。" : ""}`);
    }
};