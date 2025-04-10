const { EmbedBuilder } = require("discord.js");

module.exports = {
    run: async function (client) {
        try {
            const { giveaway_channel_ID } = require("../../config.json");
            const { loadData, saveUserData } = require("../../module_database.js");
            const { loadGiveawayData, saveGiveawayData } = require("../../module_giveaway.js");
            let giveawaydata = loadGiveawayData();
            if (!giveawaydata.active) return;
            const endts = giveawaydata.endts;
            let now = Math.floor(Date.now() / 1000);
            if (now >= endts) {
                giveawaydata.active = false;
                const giveawaychannel = client.channels.cache.get(giveaway_channel_ID);
                let msg = giveawaychannel.messages.cache.get(giveawaydata.messageID) || await giveawaychannel.messages.fetch(giveawaydata.messageID);
                const host_user = client.users.cache.get(giveawaydata.host_userid);
                const winner_userid = giveawaydata.participants[Math.floor(Math.random() * giveawaydata.participants.length)];
                const winner_user = client.users.cache.get(winner_userid);
                giveawaydata.winner = winner_userid;
                saveGiveawayData(giveawaydata);
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`🎊${giveawaydata.name}🎊`)
                    .setDescription(`
> 發起者: ${host_user.toString()}
> 獲獎人: ${winner_user.toString()}
> 哈狗幣數量: ${giveawaydata.amount}
> 參加人數: ${giveawaydata.participants.length}
抽獎已結束於 <t:${now}>

🗒️備註:
\`${giveawaydata.note}\`
                `);
                if (msg) {
                    await msg.edit({ content: "🎉 抽獎活動結束啦!", embeds: [embed] });
                } else {
                    msg = await giveawaychannel.send({ content: "🎉 抽獎活動結束啦!", embeds: [embed] });
                    giveawaydata.messageID = msg.id;
                    saveGiveawayData(giveawaydata);
                };
                const userdata = loadData(winner_userid);
                userdata.hacoin += giveawaydata.amount;
                saveUserData(winner_userid, userdata);
                if (giveawaydata.amount > 0) {
                    await msg.reply(`恭喜 ${winner_user.toString()} 獲得 ${giveawaydata.amount} 哈狗幣！`);
                } else {
                    await msg.reply(`恭喜 ${winner_user.toString()} 贏得本抽獎的獎品！`);
                };
            };
        } catch (error) {
            require("../../module_senderr.js").senderr({ client: client, msg: `處理抽獎時出錯：${error.stack}`, clientready: true });
        };
    },
};