const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('轉賬')
        .setDescription('把自己的哈狗幣給其他人 transfer')
        .addUserOption(option =>
            option.setName('用戶')
                .setDescription('要給的人')
                .setRequired(true),
        )
        .addNumberOption(option =>
            option.setName("數量")
                .setDescription("要給的數量")
                .setRequired(true),
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const { loadData, sethacoin, saveUserData } = require("../../module_database.js");
        let userid = interaction.user.id;
        let targetuser = interaction.options.getUser("用戶");
        if (targetuser.bot) return await interaction.editReply("你不能轉賬給機器人, 不然你的哈狗幣就會被吞掉了!");
        let data = loadData(userid);
        if (targetuser.id == userid) return await interaction.editReply("你轉賣給自己幹嘛w");
        let amount = interaction.options.getNumber("數量");
        if (1 > amount) return await interaction.editReply(`最少要給1哈狗幣, 而不是${amount}哈狗幣`);
        // [userid, targetuser.id].forEach(userId => {
        //     if (!data[userId]) {
        //         data[userId] = emptyeg;
        //         saveUserData(data);
        //     };
        // });
        let curhacoin = data.hacoin;
        let targetuserhacoin = data.hacoin + amount;
        if (amount > curhacoin) return await interaction.editReply(`你不夠哈狗幣, 你只有${curhacoin}哈狗幣`);
        let sourceuser_hacoin = curhacoin - amount;
        sethacoin(userid, sourceuser_hacoin, false);
        sethacoin(targetuser.id, amount, true);
        await interaction.editReply(`已成功轉賬!你剩下${sourceuser_hacoin}哈狗幣, 對方有${targetuserhacoin}哈狗幣`);
    }
};