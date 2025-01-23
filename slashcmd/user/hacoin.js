const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("哈狗幣")
        .setDescription("看看你自己有多少哈狗幣 hacoin")
        .addUserOption(option =>
            option.setName("用戶")
                .setDescription("要查看的用戶(非必填)")
                .setRequired(false),
        ),
    async execute(interaction) {
        const { loadData, saveUserData } = require("../../module_database.js");
        const { emptyeg } = require("../../config.json");
        await interaction.deferReply();
        let member = interaction.member;
        let user = interaction.options.getUser("用戶") ?? member.user;
        let userid = user.id;
        let data = loadData(userid);
        let userhacoin = data.hacoin;
        await interaction.editReply(`${userid === member.user.id ? "你" : user.toString()}有 ${userhacoin} 個哈狗幣`);
    },
};