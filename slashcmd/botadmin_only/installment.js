const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('分期付款')
        .setDescription('分期付款哈狗幣 installment')
        .addUserOption(option =>
            option.setName("用戶")
                .setDescription("選擇要扣款的用戶")
                .setRequired(true),
        )
        .addNumberOption(option =>
            option.setName("數量")
                .setDescription("一共要扣多少哈狗幣")
                .setRequired(true),
        )
        .addIntegerOption(option =>
            option.setName("次數")
                .setDescription("分多少期")
                .setRequired(true),
        )
        .addIntegerOption(option =>
            option.setName("間隔")
                .setDescription("每多少天扣一次")
                .setRequired(true),
        ),
    async execute(interaction) {
        const { loadData, saveUserData } = require("../../module_database.js");
        const { GuildID, BotAnnouncementChannelID } = require("../../config.json");
        await interaction.deferReply();
        let user = interaction.options.getUser("用戶");
        let userid = user.id;
        let data = loadData(userid);
        let isadmin = data.admin;
        if (!isadmin) return await interaction.editReply("您不是機器人管理員。無法使用此指令。");
        let amount = interaction.options.getNumber("數量");
        let times = interaction.options.getInteger("次數");
        let interval_day = interaction.options.getInteger("間隔");
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let curdate = `${year} ${month} ${day}`;
        today_int = parseInt(curdate.split(" ")[2])
        // if (!data) {
        //     data = emptyeg;
        //     saveUserData(data);
        // };
        data['installment'] = {
            remainamount: amount,
            latestrundate: '',
            fullint: false,
            nextreduce: 0,
            intervalday: interval_day,
            times: times
        };

        if (data['installment'].latestrundate != '') {
            latestrunday = parseInt(data['installment'].latestrundate.split(" ")[2]);
        } else {
            latestrunday = today_int + interval_day;
        };
        let curamount;

        if (amount % times == 0) {
            curamount = amount / times;
            data['installment'].fullint = true;
            data.hacoin -= curamount;
            data['installment'].remainamount -= curamount;
            saveUserData(userid, data);
            let channel = interaction.client.guilds.cache.get(GuildID).channels.cache.get(BotAnnouncementChannelID);
            if (channel) {
                let curtime = Math.floor(Date.now() / 1000);
                await channel.send(`[分期付款] 時間:<t:${curtime}>\n用戶:${user.toString()}\n分${times}期\n已扣${curamount}哈狗幣`);
            };
        } else {
            let nextreduce = amount % times;
            curamount = amount - nextreduce;
            curamount /= times;
            data['installment'].nextreduce = nextreduce;
            data.hacoin -= curamount
            data['installment'].remainamount -= curamount;
            saveUserData(userid, data);
            let channel = interaction.client.guilds.cache.get(GuildID).channels.cache.get(BotAnnouncementChannelID);
            if (channel) {
                let curtime = Math.floor(Date.now() / 1000);
                await channel.send(`[分期付款] 時間:<t:${curtime}>\n用戶:${user.toString()}\n分${times}期\n已扣${curamount}哈狗幣`);
            };
        };
        data['installment'].latestrundate = curdate;
        data['installment'].times -= 1;
        saveUserData(userid, data);
        let remainhacoin = data['installment'].remainamount;
        return await interaction.editReply(`設定完成! 已扣 ${curamount} 哈狗幣\n用戶: ${user.toString()}\n剩下${times - 1}期\n還有${remainhacoin}哈狗幣要扣`);
    },
};