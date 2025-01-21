// const schedule = require("node-schedule");
// const { saveUserData, loadData } = require("../module_database.js");
// const { Events } = require("discord.js");

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
//                 schedule.scheduleJob(`4 * * * * *`, async function () {
//                     const { GuildID, admins } = require("../config.json");
//                     let guild = client.guilds.cache.get(GuildID);
//                     let members = guild.members.cache;
//                     let membersArray = Array.from(members.values());
//                     for (let member of membersArray) {
//                         let user = member.user;
//                         // if (user.bot) return;
//                         if (user.bot) continue;
//                         let userid = user.id;
//                         let data = loadData(userid);
//                         // let isadmin = admins.find((admin) => admin === userid);
//                         let isadmin = admins.includes(userid);
//                         data.admin = Boolean(isadmin);
//                         if (!isadmin && data.infsign) data.infsign = false;
//                         saveUserData(userid, data);
//                     };
//                 });
//             } catch (error) {
//                 require("../module_senderr").senderr({ client: client, msg: `檢查是否為管理員(自動刷新)時出錯：${error}`, clientready: true });
//             }
//         });
//     },
// };
// const schedule = require("node-schedule");
const { saveUserData, loadData } = require("../module_database.js");
// const { Events } = require("discord.js");

module.exports = {
    run: async function (client) {
        try {
            const { GuildID, admins } = require("../config.json");
            let guild = client.guilds.cache.get(GuildID);
            let members = guild.members.cache;
            let membersArray = Array.from(members.values());
            for (let member of membersArray) {
                let user = member.user;
                // if (user.bot) return;
                if (user.bot) continue;
                let userid = user.id;
                let data = loadData(userid);
                // let isadmin = admins.find((admin) => admin === userid);
                let isadmin = admins.includes(userid);
                data.admin = Boolean(isadmin);
                if (!isadmin && data.infsign) data.infsign = false;
                saveUserData(userid, data);
            };
        } catch (error) {
            require("../module_senderr").senderr({ client: client, msg: `檢查是否為管理員(自動刷新)時出錯：${error.stack}`, clientready: true });
        }
    },
};
