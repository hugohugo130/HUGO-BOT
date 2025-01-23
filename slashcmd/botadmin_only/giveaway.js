const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("建立抽獎")
        .setDescription("建立一個抽獎活動, 僅機器人管理員可用 give away")
        .addStringOption(option =>
            option.setName("時間")
                .setDescription("為這個抽獎提供一個有效期間 (例如: 1m, 1h, 1d, 1w)")
                .setRequired(true),
        )
        .addStringOption(option =>
            option.setName("名稱")
                .setDescription("抽獎名稱")
                .setRequired(true),
        )
        .addIntegerOption(option =>
            option.setName("金額")
                .setDescription("獲獎人能獲得的哈狗幣數量")
                .setRequired(true),
        )
        .addStringOption(option =>
            option.setName("備註")
                .setDescription("抽獎備註(選填)")
                .setRequired(false),
        ),
    async execute(interaction) {
        const { loadData, saveUserData } = require("../../module_database.js");
        const { loadGiveawayData, saveGiveawayData } = require("../../module_giveaway.js");
        const { giveaway_eg, giveaway_channel_ID } = require("../../config.json");
        await interaction.deferReply();
        const user = interaction.user;
        const userid = user.id;
        let userdata = loadData(userid);
        const time = interaction.options.getString("時間");
        const name = interaction.options.getString("名稱");
        const amount = interaction.options.getInteger("金額");
        const note = interaction.options.getString("備註") ?? "(無備註)";
        const isadmin = userdata.admin;
        if (!isadmin) return await interaction.editReply("您不是機器人管理員。無法使用此指令。");
        // if (amount < 1) return await interaction.editReply("哈狗幣數量必須大於0。");
        if (amount > userdata.hacoin) return await interaction.editReply("您的哈狗幣數量不足。");
        if (loadGiveawayData().active) return await interaction.editReply("目前有抽獎活動正在進行中，無法建立新的抽獎活動。");
        let giveawaydata = giveaway_eg;
        if (!time.match(/^(\d+)(m|h|d|w)$/)) return await interaction.editReply("時間格式錯誤，請使用正確的時間格式。例子：1d 或 1w 或 1h 或 1m");
        const multiples = {
            m: 60,
            h: 3600,
            d: 86400,
            w: 604800
        };
        const endts = parseInt(Date.now() / 1000) + multiples[time.slice(-1)] * parseInt(time.slice(0, -1));
        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle(`🎊${name}🎊`)
            .setDescription(`
快按下🎉來參加抽獎!
> 發起者: ${user.toString()}
> 哈狗幣數量: ${amount}
> 剩餘時間: <t:${endts}:R> (±6秒)
> 參加人數: ${giveawaydata.participants.length}

🗒️備註:
\`${note}\`
`);
        const giveawaychannel = interaction.guild.channels.cache.get(giveaway_channel_ID);
        if (!giveawaychannel) return await interaction.editReply("抽獎頻道設定錯誤，請聯繫服主");
        const message = await giveawaychannel.send({ content: "🎉 抽獎活動開始啦!", embeds: [embed] });
        userdata.hacoin -= amount;
        saveUserData(userid, userdata);
        giveawaydata.active = true;
        giveawaydata.name = name;
        giveawaydata.amount = amount;
        giveawaydata.note = note;
        giveawaydata.endts = endts;
        giveawaydata.messageID = message.id;
        giveawaydata.emoji = "🎉";
        giveawaydata.host_userid = userid;
        saveGiveawayData(giveawaydata);
        await message.react(giveawaydata.emoji);
        await interaction.editReply(":white_check_mark: 成功創辦抽獎活動！");
    },
};