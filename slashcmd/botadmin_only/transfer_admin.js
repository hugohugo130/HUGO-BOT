const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('管理員轉賬哈狗幣')
        .setDescription('把某個人的哈狗幣給其他人(僅機器人管理員可用) transfer admin')
        .addUserOption(option =>
            option.setName('來源')
                .setDescription('誰要給別人哈狗幣?')
                .setRequired(true),
        )
        .addUserOption(option =>
            option.setName('目標')
                .setDescription('哈狗幣要給誰?')
                .setRequired(true),
        )
        .addNumberOption(option =>
            option.setName("數量")
                .setDescription("要給的數量")
                .setRequired(true),
        ),
    async execute(interaction) {
        await interaction.deferReply();
        // const { loadData, sethacoin, saveUserData } = require("../../module_database.js");
        const { loadData, sethacoin } = require("../../module_database.js");
        // const { emptyeg } = require("../../config.json");
        let sourceuser = interaction.options.getUser("來源");
        let targetuser = interaction.options.getUser("目標");
        // [interaction.user.id, sourceuser.id, targetuser.id].forEach(userId => {
        //     if (!data) {
        //         data = emptyeg;
        //         saveUserData(userid, data);
        //     };
        // });
        let isadmin = data.admin;
        if (!isadmin) return await interaction.editReply("您不是機器人管理員。無法使用此指令。");
        if (targetuser.bot) return await interaction.editReply("不能轉賬給機器人, 不然哈狗幣會被吞掉!");
        let amount = interaction.options.getNumber("數量");
        if (1 < amount) return await interaction.editReply(`給別人${amount}哈狗幣是什麼意思啦`);
        if (sourceuser.id == targetuser.id) return await interaction.editReply(`:grey_question: 自己轉賬給自己幹嘛w`);
        let sourcedata = loadData(sourceuser.id);
        sethacoin(sourceuser.id, -sourcedata.hacoin, true);
        sethacoin(targetuser.id, amount, true);
        await interaction.editReply(`已成功轉賬${amount}哈狗幣到${targetuser.toString()}`);
    },
};