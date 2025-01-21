const { Events, EmbedBuilder } = require("discord.js");

module.exports = {
    setup(client) {
        client.on(Events.MessageReactionAdd, async (reaction, user) => {
            const { loadGiveawayData, saveGiveawayData } = require("../module_giveaway.js");
            try {
                let giveawaydata = loadGiveawayData();
                if (!giveawaydata.active) return;
                if (reaction.message.id !== giveawaydata.messageID) return;
                if (reaction.emoji.name !== giveawaydata.emoji) return;
                if (user.bot) return;
                if (giveawaydata.participants.includes(user.id)) return;
                giveawaydata.participants.push(user.id);
                saveGiveawayData(giveawaydata);
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`🎊${giveawaydata.name}🎊`)
                    .setDescription(`
快按下🎉來參加抽獎!
> 發起者: ${user.toString()}
> 哈狗幣數量: ${giveawaydata.amount}
> 剩餘時間: <t:${giveawaydata.endts}:R> (±6秒)
> 參加人數: ${giveawaydata.participants.length}

🗒️備註:
\`${giveawaydata.note}\`
`);
                reaction.message.edit({ content: "🎉 抽獎活動開始啦!", embeds: [embed] });
            } catch (error) {
                require("../module_senderr.js").senderr({ client: client, msg: `處理抽獎時出錯：${error.stack}`, clientready: true });
            };
        });

        client.on(Events.MessageReactionRemove, async (reaction, user) => {
            const { loadGiveawayData, saveGiveawayData } = require("../module_giveaway.js");
            try {
                let giveawaydata = loadGiveawayData();
                if (!giveawaydata.active) return;
                if (reaction.message.id !== giveawaydata.messageID) return;
                if (reaction.emoji.name !== giveawaydata.emoji) return;
                if (user.bot) return;
                if (!giveawaydata.participants.includes(user.id)) return;
                giveawaydata.participants = giveawaydata.participants.filter(participant => participant !== user.id);
                saveGiveawayData(giveawaydata);
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`🎊${giveawaydata.name}🎊`)
                    .setDescription(`
快按下🎉來參加抽獎!
> 發起者: ${user.toString()}
> 哈狗幣數量: ${giveawaydata.amount}
> 剩餘時間: <t:${giveawaydata.endts}:R> (±6秒)
> 參加人數: ${giveawaydata.participants.length}

🗒️備註:
\`${giveawaydata.note}\`
`);
                reaction.message.edit({ content: "🎉 抽獎活動開始啦!", embeds: [embed] });
            } catch (error) {
                require("../module_senderr.js").senderr({ client: client, msg: `處理抽獎時出錯：${error.stack}`, clientready: true });
            };
        });
    },
};
