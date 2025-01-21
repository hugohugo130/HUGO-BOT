// const schedule = require("node-schedule");
// const { Events } = require("discord.js");

// module.exports = {
//     setup(client) {
//         client.on(Events.ClientReady, async () => {
//             /*
//             schedule.scheduleJob('* * * * * *', function(){
//             });
//             second (0 - 59, OPTIONAL)
//             minute (0 - 59)
//             hour (0 - 23)
//             day of month (1 - 31)
//             month (1 - 12)
//             day of week (0 - 7) (0 or 7 is Sun)
//             */
//             schedule.scheduleJob(`5 * * * * *`, async function () {
//                 try {
//                     // 引入所需模組
//                     const { GuildID } = require("../config.json");
//                     const { loadData, deleteUserData } = require("../module_database.js");

//                     // 獲取伺服器成員列表
//                     let guild = client.guilds.cache.get(GuildID);
//                     let members = guild.members.cache;
//                     let membersArray = Array.from(members.values());

//                     // 遍歷所有成員
//                     for (let member of membersArray) {
//                         let user = member.user;
//                         // 跳過非機器人用戶
//                         if (!user.bot) continue;
//                         let userid = user.id;

//                         // 檢查用戶是否存在於資料庫中
//                         let data = loadData(userid);
//                         if (data) {
//                             // 如果存在則刪除該用戶資料
//                             await deleteUserData(userid);
//                         };
//                     };
//                 } catch (error) {
//                     require("../module_senderr.js").senderr(client, `刪除機器人資料庫時出錯：${error}`, true);
//                 };
//             });
//         });
//     },
// };
// const schedule = require("node-schedule");
// const { Events } = require("discord.js");

module.exports = {
    run: async function (client) {
        try {
            // 引入所需模組
            const { GuildID } = require("../config.json");
            const { loadData, deleteUserData } = require("../module_database.js");

            // 獲取伺服器成員列表
            let guild = client.guilds.cache.get(GuildID);
            let members = guild.members.cache;
            let membersArray = Array.from(members.values());

            // 遍歷所有成員
            for (let member of membersArray) {
                let user = member.user;
                // 跳過非機器人用戶
                if (!user.bot) continue;
                let userid = user.id;

                // 檢查用戶是否存在於資料庫中
                let data = loadData(userid);
                if (data) {
                    // 如果存在則刪除該用戶資料
                    await deleteUserData(userid);
                };
            };
        } catch (error) {
            require("../module_senderr.js").senderr({ client: client, msg: `刪除機器人資料庫時出錯: ${error.stack}`, clientready: true });
        };
    },
};