const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('踢出')
        .setDescription('踢出用戶 kick')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('要踢出的用戶')
                .setRequired(true),
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('踢出原因(選填)')
                .setRequired(false),
        ),
    async execute(interaction) {
        const { HugoUserID, XiaoziUserID, BotAnnouncementChannelID } = require('../../config.json');
        const { loadData } = require("../../module_database.js");
        await interaction.deferReply();
        const target_user = interaction.options.getUser('user'); // 獲取要踢出的用戶
        const target_member = interaction.guild.members.cache.get(target_user.id); // 獲取目標用戶
        const member = interaction.member; // 獲取發送指令的用戶
        const reason = interaction.options.getString('reason') ?? "無"; // 獲取踢出原因

        if (!member.permissions.has("KICK_MEMBERS")) { // 檢查用戶是否有踢出用戶的權限
            await interaction.editReply(":x: 你沒有權限使用這個指令！");
            return;
        };

        if (!loadData(target_user.id).admin) {
            await interaction.editReply(":x: 你不是機器人管理員！");
            return;
        };

        // if (target_user.bot) { // 檢查目標用戶是否機器人
        //     await interaction.editReply(":x: 你不能踢出機器人！");
        //     return;
        // };

        if (target_user.id === HugoUserID) { // 檢查目標用戶是否哈狗
            await interaction.editReply(":x: 你不能踢出哈狗！他是服主！<:angry:1279090863879884901>");
            return;
        };

        if (target_user.id === XiaoziUserID) { // 檢查目標用戶是否小仔
            await interaction.editReply(":x: 你不能踢出小仔！他是服主的好朋友！<:angry:1279090863879884901>");
            return;
        };

        if (loadData(target_user.id).admin) { // 檢查目標用戶是否機器人管理員
            await interaction.editReply(":x: 你不能踢出機器人管理員！");
            return;
        };

        if (target_member.permissions.has("ADMINISTRATOR")) { // 檢查目標用戶是否管理員
            await interaction.editReply(":x: 你不能踢出管理員！");
            return;
        };

        try {
            if (!target_user.bot) {
                await interaction.client.users.send(target_user.id, `你被踢出了哈狗伺服器 :(\n原因: ${reason}`);
            };
            await interaction.client.channels.cache.get(BotAnnouncementChannelID).send(`${target_user.toString()} 被踢出了哈狗伺服器\n原因: ${reason}`);
            await target_member.kick(reason); // 踢出用戶
        } catch (err) {
            require('../../module_senderr.js').senderr({ client: interaction.client, msg: `機器人在踢出用戶 ${target_user.username} 時發生錯誤: ${err.stack}`, clientready: true });
            await interaction.editReply(`機器人在踢出用戶 ${target_user.username} 時發生錯誤: ${err.stack}`);
            return;
        };

        await interaction.editReply(`已成功踢出 ${target_user.toString()}`); // 回傳踢出用戶成功的訊息
    },
};