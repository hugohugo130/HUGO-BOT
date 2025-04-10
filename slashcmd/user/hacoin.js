const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("哈狗幣")
        .setDescription("看看你自己有多少哈狗幣")
        .setNameLocalizations({
            "zh-TW": "哈狗幣",
            "zh-CN": "哈狗币",
            "en-US": "hacoin",
        })
        .setDescriptionLocalizations({
            "zh-TW": "看看你自己有多少哈狗幣 hacoin",
            "zh-CN": "看看你自己有多少哈狗币 hacoin",
            "en-US": "Check how many hacoin you have",
        })
        .addUserOption(option =>
            option.setName("用戶")
                .setDescription("要查看的用戶(非必填)")
                .setRequired(false),
        ),
    async execute(interaction) {
        const { loadData } = require("../../module_database.js");
        await interaction.deferReply();
        let member = interaction.member;
        let user = interaction.options.getUser("用戶") ?? member.user;
        let userid = user.id;
        let data = loadData(userid);
        let userhacoin = data.hacoin;
        await interaction.editReply(`${userid === member.user.id ? "你" : user.toString()}有 ${userhacoin} 個哈狗幣`);
    },
};