const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('獲取用戶資訊')
        .setDescription('獲取伺服器中用戶的資訊')
        .setNameLocalizations({
            "zh-TW": "獲取用戶資訊",
            "zh-CN": "获取用户信息",
            "en-US": "get_user_information",
        })
        .setDescriptionLocalizations({
            "zh-TW": "獲取伺服器中用戶的資訊",
            "zh-CN": "获取服务器中用户的资讯",
            "en-US": "Get user information of the server",
        })
        .addUserOption(option =>
            option.setName("用戶")
                .setDescription("要獲取資訊的用戶")
                .setRequired(false),
        ),
    async execute(interaction) {
        const { loadData } = require("../../module_database.js");
        await interaction.deferReply();
        let user = interaction.options.getUser("用戶") ?? interaction.user;
        let id = user.id;
        let member = interaction.member;
        let username = user.username;
        let displayName = user.globalName;
        let createdts = Math.floor(user.createdTimestamp / 1000);
        let joinedts = Math.floor(member.joinedTimestamp / 1000);
        let avatarurl = user.avatarURL() || user.defaultAvatarURL;
        let isadminpermission = member.permissions.has("Administrator");
        let isbotadmin = loadData(id).admin;
        let toprole = member.roles.highest;
        let guild = interaction.guild;
        let bot = user.bot;
        let embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setThumbnail(avatarurl)
            .addFields(
                { name: "使用者名稱", value: username, inline: true },
                { name: "暱稱", value: displayName || "無", inline: true },
                { name: "用戶id", value: id, inline: true },
                { name: "最高身份組", value: toprole.name, inline: true },
                { name: "具有伺服器管理員權限", value: isadminpermission ? "是" : "否", inline: true },
                { name: "機器人管理員", value: isbotadmin ? "是" : "否", inline: true },
                { name: "賬號創建於", value: `<t:${createdts}> <t:${createdts}:T> (<t:${createdts}:R>)` },
                { name: `加入 ${guild.name} 於`, value: `<t:${joinedts}> <t:${joinedts}:T> (<t:${joinedts}:R>)` },
                { name: "機器人", value: bot ? "是" : "否", inline: true },
            );
        await interaction.editReply({ embeds: [embed] });
    },
};