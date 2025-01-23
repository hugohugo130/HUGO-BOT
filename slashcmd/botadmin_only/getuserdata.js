const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("取得用戶數據")
        .setDescription("取得用戶在數據庫中的數據 get userdata")
        .addUserOption(option =>
            option.setName("用戶")
                .setDescription("選擇用戶")
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option.setName("ephemeral")
                .setDescription("是否以私密模式顯示")
                .setRequired(false)
        ),
    async execute(interaction) {
        const { loadData } = require("../../module_database.js");
        await interaction.deferReply({ ephemeral: interaction.options.getBoolean("ephemeral") ?? true });
        const user = interaction.options.getUser("用戶") ?? interaction.user;
        const member = interaction.guild.members.cache.get(user.id);
        const username = member.user.globalName || member.user.username;

        if (!loadData(interaction.user.id).admin) return await interaction.editReply("您不是機器人管理員。無法使用此指令。");
        const userData = loadData(user.id);

        if (!userData) {
            return await interaction.editReply({
                content: "該用戶在數據庫中沒有數據。",
                ephemeral: true,
            });
        };

        const description = {
            "hacoin": "哈狗幣擁有數量",
            "latestdate": "最後簽到日期",
            "autosign": "是否啟用自動簽到",
            "admin": "是否為機器人管理員",
            "vip": "是否為VIP",
            "infsign": "是否啟用無限簽到",
            "birthday": "生日日期",
            "birthday_year": "最後一次慶祝生日的年份",
            "count_for_e": "消息中含有e的次數",
            "message_count": "發送消息的次數",
            "level": "等級",
            "exp": "經驗值",
            "installment": "分期付款資訊",
        };

        const fields = [];

        for (const [key, value] of Object.entries(userData)) {
            if (value !== null && value !== undefined && value.toString().trim() !== '') {
                fields.push({
                    name: description[key] || key,
                    value: key === "installment" ? JSON.stringify(value) : value.toString(),
                    inline: true,
                });
            };
        };

        const embed = new EmbedBuilder()
            .setTitle("用戶數據")
            .setColor(0x00BBFF)
            .setDescription(`用戶: ${username} (${user.id})`)
            .setTimestamp();

        if (fields.length > 0) {
            embed.addFields(fields);
        };

        await interaction.editReply({ embeds: [embed] });
    },
};