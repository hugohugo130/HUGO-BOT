// const schedule = require("node-schedule");
// const { saveUserData, loadData } = require("../module_database.js");
// const { Events } = require("discord.js");

// module.exports = {
//     setup(client) {
//         try {
//             client.on(Events.ClientReady, async () => {
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
//                 schedule.scheduleJob(`8 * * * * *`, async function () {
//                     const { GuildID, emptyeg } = require("../config.json");
//                     let guild = client.guilds.cache.get(GuildID);
//                     let members = guild.members.cache;
//                     let membersArray = Array.from(members.values());

//                     for (let member of membersArray) {
//                         let user = member.user;
//                         // if (user.bot) return;
//                         if (user.bot) continue;
//                         let userid = user.id;
//                         let data = loadData(userid);
//                         if (data) {
//                             for (const [key, value] of Object.entries(emptyeg)) {
//                                 if (!data[key]) {
//                                     data[key] = value;
//                                 };
//                             };
//                         };
//                         saveUserData(userid, data || emptyeg);
//                     };
//                 });
//             });
//         } catch (error) {
//             let datetime = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '); // 取得當前時間
//             console.error(`[${datetime}] 自動更新用戶資料時出錯：`, error);
//             const { chatting_channel_ID, HugoUserID } = require("../config.json");
//             client.channels.cache.get(chatting_channel_ID).send(`[${datetime}] 自動更新用戶資料時出錯：${error}\n<@${HugoUserID}>`);
//             client.users.send(HugoUserID, `[${datetime}] 自動更新用戶資料時出錯：${error}`);
//         };
//     },
// };
const { saveUserData, loadData } = require("../module_database.js");

module.exports = {
    run: async function (client) {
        try {
            const { GuildID, emptyeg } = require("../config.json");
            let guild = client.guilds.cache.get(GuildID);
            let members = guild.members.cache;
            let membersArray = Array.from(members.values());

            for (let member of membersArray) {
                let user = member.user;
                // if (user.bot) return;
                if (user.bot) continue;
                let userid = user.id;
                let data = loadData(userid);
                if (data) {
                    for (const [key, value] of Object.entries(emptyeg)) {
                        if (!data[key]) {
                            data[key] = value;
                        };
                    };
                };
                saveUserData(userid, data || emptyeg);
            };
        } catch (error) {
            const { time } = require("../module_time.js");
            console.error(`[${time()}] 自動更新用戶資料時出錯：`, error);
            const { chatting_channel_ID, HugoUserID } = require("../config.json");
            client.channels.cache.get(chatting_channel_ID).send(`[${time()}] 自動更新用戶資料時出錯：${error}\n<@${HugoUserID}>`);
            client.users.send(HugoUserID, `[${time()}] 自動更新用戶資料時出錯：${error}`);
        };
    },
};