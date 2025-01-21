// const { Events, EmbedBuilder } = require("discord.js");
// const schedule = require("node-schedule");
// const fs = require("fs");

// function loadGiveawayData() {
//     const { giveawayfilename } = require("../config.json");
//     if (fs.existsSync(giveawayfilename)) {
//         const rawData = fs.readFileSync(giveawayfilename);
//         return JSON.parse(rawData);
//     } else {
//         return {};
//     };
// };

// function saveGiveawayData(data) {
//     const { giveawayfilename } = require("../config.json");
//     data = JSON.stringify(data, null, 2);
//     fs.writeFileSync(giveawayfilename, data);
// };

// module.exports = {
//     setup(client) {
//         /*
//         schedule.scheduleJob('* * * * * *', function(){
//         });
//         second (0 - 59, OPTIONAL)
//         minute (0 - 59)
//         hour (0 - 23)
//         day of month (1 - 31)
//         month (1 - 12)
//         day of week (0 - 7) (0 or 7 is Sun)
//         */
//         client.on(Events.ClientReady, async () => {
//             schedule.scheduleJob("*/6 * * * * *", async () => {
//                 try {
//                     const { giveaway_channel_ID, emptyeg } = require("../config.json");
//                     const { loadData, saveUserData } = require("../module_database.js")
//                     let giveawaydata = loadGiveawayData();
//                     if (!giveawaydata.active) return;
//                     const endts = giveawaydata.endts;
//                     let now = Math.floor(Date.now() / 1000);
//                     if (now >= endts) {
//                         giveawaydata.active = false;
//                         const giveawaychannel = client.channels.cache.get(giveaway_channel_ID);
//                         const msg = giveawaychannel.messages.cache.get(giveawaydata.messageID);
//                         const host_user = client.users.cache.get(giveawaydata.host_userid);
//                         const winner_userid = giveawaydata.participants[Math.floor(Math.random() * giveawaydata.participants.length)];
//                         const winner_user = client.users.cache.get(winner_userid);
//                         giveawaydata.winner = winner_userid;
//                         saveGiveawayData(giveawaydata);
//                         const embed = new EmbedBuilder()
//                             .setColor(0x00BBFF)
//                             .setTitle(`🎊${giveawaydata.name}🎊`)
//                             .setDescription(`
// > 發起者: ${host_user.toString()}
// > 獲獎人: ${winner_user.toString()}
// > 哈狗幣數量: ${giveawaydata.amount}
// > 參加人數: ${giveawaydata.participants.length}
// 抽獎已結束於 <t:${now}>

// 🗒️備註:
// \`${giveawaydata.note}\`
// `);
//                         msg.edit({ content: "🎉 抽獎活動結束啦!", embeds: [embed] });
//                         const userdata = loadData(winner_userid);
//                         // if (!userdata) {
//                         //     userdata = emptyeg;
//                         // };
//                         userdata.hacoin += giveawaydata.amount;
//                         saveUserData(winner_userid, userdata);
//                         msg.reply(`恭喜 ${winner_user.toString()} 獲得 ${giveawaydata.amount} 哈狗幣！`);
//                     };
//                 } catch (error) {
//                     require("../module_senderr").senderr({ client: client, msg: `處理抽獎時出錯：${error}`, clientready: true });
//                 }
//             });
//         });
//         client.on(Events.MessageReactionAdd, async (reaction, user) => {
//             try {
//                 let giveawaydata = loadGiveawayData();
//                 if (!giveawaydata.active) return;
//                 if (reaction.message.id !== giveawaydata.messageID) return;
//                 if (reaction.emoji.name !== giveawaydata.emoji) return;
//                 if (user.bot) return;
//                 if (giveawaydata.participants.includes(user.id)) return;
//                 giveawaydata.participants.push(user.id);
//                 saveGiveawayData(giveawaydata);
//                 const embed = new EmbedBuilder()
//                     .setColor(0x00BBFF)
//                     .setTitle(`🎊${giveawaydata.name}🎊`)
//                     .setDescription(`
// 快按下🎉來參加抽獎!
// > 發起者: ${user.toString()}
// > 哈狗幣數量: ${giveawaydata.amount}
// > 剩餘時間: <t:${giveawaydata.endts}:R> (±6秒)
// > 參加人數: ${giveawaydata.participants.length}

// 🗒️備註:
// \`${giveawaydata.note}\`
// `);
//                 reaction.message.edit({ content: "🎉 抽獎活動開始啦!", embeds: [embed] });
//             } catch (error) {
//                 require("../module_senderr").senderr({ client: client, msg: `處理抽獎時出錯：${error}`, clientready: true });
//             }
//         });
//         client.on(Events.MessageReactionRemove, async (reaction, user) => {
//             try {
//                 let giveawaydata = loadGiveawayData();
//                 if (!giveawaydata.active) return;
//                 if (reaction.message.id !== giveawaydata.messageID) return;
//                 if (reaction.emoji.name !== giveawaydata.emoji) return;
//                 if (user.bot) return;
//                 if (!giveawaydata.participants.includes(user.id)) return;
//                 giveawaydata.participants = giveawaydata.participants.filter(participant => participant !== user.id);
//                 saveGiveawayData(giveawaydata);
//                 const embed = new EmbedBuilder()
//                     .setColor(0x00BBFF)
//                     .setTitle(`🎊${giveawaydata.name}🎊`)
//                     .setDescription(`
// 快按下🎉來參加抽獎!
// > 發起者: ${user.toString()}
// > 哈狗幣數量: ${giveawaydata.amount}
// > 剩餘時間: <t:${giveawaydata.endts}:R> (±6秒)
// > 參加人數: ${giveawaydata.participants.length}

// 🗒️備註:
// \`${giveawaydata.note}\`
// `);
//                 reaction.message.edit({ content: "🎉 抽獎活動開始啦!", embeds: [embed] });
//             } catch (error) {
//                 require("../module_senderr").senderr({ client: client, msg: `處理抽獎時出錯：${error}`, clientready: true });
//             }
//         });
//     },
//     loadGiveawayData,
//     saveGiveawayData,
// };
const { EmbedBuilder } = require("discord.js");

module.exports = {
    run: async function (client) {
        try {
            const { giveaway_channel_ID } = require("../config.json");
            const { loadData, saveUserData } = require("../module_database.js");
            const { loadGiveawayData, saveGiveawayData } = require("../module_giveaway.js");
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
                // if (!userdata) {
                //     userdata = emptyeg;
                // };
                userdata.hacoin += giveawaydata.amount;
                saveUserData(winner_userid, userdata);
                if (giveawaydata.amount > 0) {
                    await msg.reply(`恭喜 ${winner_user.toString()} 獲得 ${giveawaydata.amount} 哈狗幣！`);
                } else {
                    await msg.reply(`恭喜 ${winner_user.toString()} 贏得本抽獎的獎品！`);
                };
            };
        } catch (error) {
            require("../module_senderr.js").senderr({ client: client, msg: `處理抽獎時出錯：${error.stack}`, clientready: true });
        };
    },
};