// const { randomhacoin } = require("../module_getrandomhacoin.js");
// const { loadData, sethacoin_forsign } = require("../module_database.js");
// const { Events } = require("discord.js");
// const schedule = require("node-schedule");

// module.exports = {
//     setup(client) {
//         client.on(Events.ClientReady, async () => {
//             try {
//                 /*
//                 schedule.scheduleJob('* * * * * *', function(){
//                 });
//                 second (0 - 59, OPTIONAL)
//                 minute (0 - 59)
//                 hour (0 - 23)
//                 day of month (1 - 31)
//                 month (1 - 12)
//                 day of week (0 - 7) (0 or 7 is Sun)
//                 */
//                 schedule.scheduleJob(`1 * * * * *`, async function () {
//                     // const { GuildID, BotChannelID, emptyeg, maxhacoin, minhacoin } = require('../config.json');
//                     const { GuildID, BotChannelID, maxhacoin, minhacoin } = require('../config.json');
//                     let guild = client.guilds.cache.get(GuildID);
//                     let members = guild.members.cache;

//                     const membersArray = Array.from(members.values());
//                     // members.forEach(async (member) => {
//                     for (const member of membersArray) {
//                         let user = member.user;
//                         // if (user.bot) return;
//                         if (user.bot) continue;
//                         let userid = user.id;

//                         async function incrementhugodollar(userid) {
//                             let channel = client.guilds.cache.get(GuildID).channels.cache.get(BotChannelID);
//                             let gothacoin = randomhacoin(minhacoin, maxhacoin + 1);
//                             sethacoin_forsign(userid, gothacoin, true);
//                             let data = loadData(userid);
//                             if (data.infsign) return; // 使用return並不會中斷迴圈
//                             let curhacoin = data.hacoin;
//                             let autosigntext = `[自動簽到] ${user.globalName || user.username} 簽到成功! 獲得了${gothacoin}個哈狗幣 他現在有${curhacoin}個哈狗幣 好欸!`;
//                             if (channel) {
//                                 sentmsg = await channel.send(autosigntext);
//                                 // return sentmsg.react('✅');
//                                 sentmsg.react('✅');
//                             } else {
//                                 // return await client.users.send(userid, autosigntext);
//                                 await client.users.send(userid, autosigntext);
//                             };
//                         };

//                         let data = loadData(userid);
//                         // if (!data) {
//                         //     data = emptyeg;
//                         //     saveUserData(data);
//                         // };

//                         // if (!data.autosign) return;
//                         if (!data.autosign) continue;

//                         let date = new Date();
//                         let year = date.getFullYear();
//                         let month = date.getMonth() + 1;
//                         let day = date.getDate();
//                         let curdate = [year, month, day];
//                         let latestdate = data.latestdate;
//                         if (
//                             latestdate === "" ||
//                             (
//                                 data.admin &&
//                                 data.infsign
//                             )
//                         ) await incrementhugodollar(userid);
//                         latestdate = latestdate.split(" ");
//                         for (var index = 0; index < latestdate.length; index++) {
//                             a = latestdate[index];
//                             b = curdate[index];
//                             if (b > a) await incrementhugodollar(userid);
//                         };
//                         // });
//                     };
//                 });
//             } catch (error) {
//                 require("../module_senderr").senderr(client, `進行自動簽到時出錯：${error}`, true);
//             }
//         });
//     },
// };
const { randomhacoin } = require("../module_getrandomhacoin.js");
const { loadData, sethacoin_forsign } = require("../module_database.js");
// const { Events } = require("discord.js");
// const schedule = require("node-schedule");

module.exports = {
    run: async function (client) {
        try {
            // const { GuildID, BotChannelID, emptyeg, maxhacoin, minhacoin } = require('../config.json');
            const { GuildID, BotChannelID, maxhacoin, minhacoin } = require('../config.json');
            let guild = client.guilds.cache.get(GuildID);
            let members = guild.members.cache;

            const membersArray = Array.from(members.values());
            // members.forEach(async (member) => {
            for (const member of membersArray) {
                let user = member.user;
                // if (user.bot) return;
                if (user.bot) continue;
                let userid = user.id;

                async function incrementhugodollar(userid) {
                    let channel = client.guilds.cache.get(GuildID).channels.cache.get(BotChannelID);
                    let gothacoin = randomhacoin(minhacoin, maxhacoin + 1);
                    sethacoin_forsign(userid, gothacoin, true);
                    let data = loadData(userid);
                    if (data.infsign) return; // 使用return並不會中斷迴圈
                    let curhacoin = data.hacoin;
                    let autosigntext = `[自動簽到] ${user.globalName || user.username} 簽到成功! 獲得了${gothacoin}個哈狗幣 他現在有${curhacoin}個哈狗幣 好欸!`;
                    if (channel) {
                        sentmsg = await channel.send(autosigntext);
                        // return sentmsg.react('✅');
                        sentmsg.react('✅');
                    } else {
                        // return await client.users.send(userid, autosigntext);
                        await client.users.send(userid, autosigntext);
                    };
                };

                let data = loadData(userid);
                // if (!data) {
                //     data = emptyeg;
                //     saveUserData(data);
                // };

                // if (!data.autosign) return;
                if (!data.autosign) continue;

                let date = new Date();
                let year = date.getFullYear();
                let month = date.getMonth() + 1;
                let day = date.getDate();
                let curdate = [year, month, day];
                let latestdate = data.latestdate;
                if (
                    latestdate === "" ||
                    (
                        data.admin &&
                        data.infsign
                    )
                ) await incrementhugodollar(userid);
                latestdate = latestdate.split(" ");
                for (var index = 0; index < latestdate.length; index++) {
                    a = latestdate[index];
                    b = curdate[index];
                    if (b > a) await incrementhugodollar(userid);
                };
                // });
            };
        } catch (error) {
            require("../module_senderr").senderr({ client: client, msg: `進行自動簽到時出錯：${error.stack}`, clientready: true });
        }
    },
};