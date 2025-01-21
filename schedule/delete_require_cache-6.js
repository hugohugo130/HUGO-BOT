// const schedule = require("node-schedule");
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
//                 schedule.scheduleJob(`6 * * * * *`, function () {
//                     let deletelist = ["../config.json", "../module_database.js", "../module_getrandomhacoin.js", "../module_regcmd.js", "../module_sleep.js"];
//                     for (const module of deletelist) {
//                         delete require.cache[require.resolve(module)];
//                     };
//                 });
//             } catch (error) {
//                 require("../module_senderr").senderr({ client: client, msg: `自動清除require快取時出錯：${error}`, clientready: true });
//             }
//         });
//     },
// };
const fs = require("fs");

module.exports = {
    run: async function (client) {
        try {
            let deletelist = ["../config.json"];
            let modules = fs.readdirSync("../").filter(file => file.endsWith(".js") && file.startsWith("module_"));
            deletelist.push(...modules.map(file => `../${file}`));

            for (const module of deletelist) {
                delete require.cache[require.resolve(module)];
            };
        } catch (error) {
            require("../module_senderr.js").senderr({
                client: client,
                msg: `自動清除require快取時出錯: ${error.stack}`,
                clientready: true
            });
        };
    },
};