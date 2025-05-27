const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("申請身份組")
        .setDescription("選擇並申請特定身份組")
        .setNameLocalizations({
            "zh-TW": "申請身份組",
            "zh-CN": "申请身份组",
            "en-US": "apply_role",
        })
        .setDescriptionLocalizations({
            "zh-TW": "選擇並申請特定身份組",
            "zh-CN": "选择并申请特定身份组",
            "en-US": "Select and get a role",
        })
        .addRoleOption(option =>
            option.setName("身份組")
                .setDescription("請選擇您想申請的身份組")
                .setRequired(true),
        ),
    async execute(interaction) {
        // const { Apply_identity_channel_ID, can_apply_identities, admins } = require("../../config.json");
        // await interaction.deferReply();
        // if (interaction.channel.id != Apply_identity_channel_ID) return await interaction.editReply(`抱歉，申請身份組僅限於 <#${Apply_identity_channel_ID}> 頻道進行。請移步至該頻道申請。`);
        // let role = await interaction.options.getRole("身份組");
        // let canapply = can_apply_identities.find((identity) => identity == role.id)
        // if (!canapply) {
        //     return await interaction.editReply(`很抱歉，${role.name} 身份組目前不開放申請。目前開放申請的身份組有：${can_apply_identities.map(identity => `<@&${identity}>`).join(" ")}`);
        // };
        // let member = interaction.member;
        // if (member.roles.cache.has(role.id)) {
        //     return await interaction.editReply("您已擁有此身份組，無需重複申請。");
        // };
        // await member.roles.add(role.id).then(async () => {
        //     await interaction.editReply(`:white_check_mark: 已成功為您添加 ${role.name} 身份組。`);
        // }).catch(async (err) => {
        //     err = err.message;
        //     if (err.includes("Missing Permissions")) return await interaction.editReply(`很抱歉，我沒有足夠的權限為您添加 ${role.name} 身份組。請聯繫管理員協助。`)
        //     await interaction.editReply(`發生錯誤：請將以下資訊提供給管理員或服主以協助解決問題：\n${err}\n${admins.map(admin => `<@${admin}>`).join(" ")}`);
        // });
        await interaction.reply({ content: "此功能已關閉，請見諒。", ephemeral: true });
    }
};