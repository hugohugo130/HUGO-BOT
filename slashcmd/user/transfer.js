const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('轉賬')
        .setDescription('把自己的哈狗幣給其他人')
        .setNameLocalizations({
            "zh-TW": "轉賬",
            "zh-CN": "转账",
            "en-US": "transfer_hacoin",
        })
        .setDescriptionLocalizations({
            "zh-TW": "把自己的哈狗幣給其他人",
            "zh-CN": "把自己的哈狗币给其他人",
            "en-US": "Transfer hacoin to other users",
        })
        .addUserOption(option =>
            option.setName("用戶")
                .setDescription("要給的人")
                .setRequired(true),
        )
        .addNumberOption(option =>
            option.setName("數量")
                .setDescription("要給的數量")
                .setRequired(true),
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const { sethacoin } = require("../../module_database.js");
        let userid = interaction.user.id;
        let targetuser = interaction.options.getUser("用戶");
        if (targetuser.bot) return await interaction.editReply("你不能轉賬給機器人");
        if (targetuser.id == userid) return await interaction.editReply("你轉賣給自己幹嘛w");
        let amount = interaction.options.getNumber("數量");
        if (amount < 1) return await interaction.editReply(`你484想反轉變成別人轉給你 👀`);
        if (amount > curhacoin) return await interaction.editReply(`你要確定你有足夠的哈狗幣...`);
        sethacoin(userid, -amount, true);
        sethacoin(targetuser.id, amount, true);
        await interaction.editReply(`你轉了${amount}哈狗幣給${targetuser.toString()}`);
    },
};