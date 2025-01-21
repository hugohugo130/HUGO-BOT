// module.exports = {
//     loadcog(client) {
//         try {
//             const fs = require('fs');
//             const cogsFolder = "./cogs"
//             const cogFiles = fs.readdirSync(cogsFolder).filter(file => file.endsWith('.js'));
//             for (const file of cogFiles) {
//                 const cog = require(`${cogsFolder}/${file}`);
//                 cog.setup(client);
//                 let datetime = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '); // 取得當前時間
//                 console.log(`[${datetime}] 已加載cog程式碼 ${file}`);
//             };
//         } catch (error) {
//             let datetime = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '); // 取得當前時間
//             console.error(`[${datetime}] 加載cog程式碼時出錯：`, error);
//             const { chatting_channel_ID, HugoUserID } = require("../config.json");
//             client.channels.cache.get(chatting_channel_ID).send(`[${datetime}] 加載cog程式碼時出錯：${error}\n<@${HugoUserID}>`);
//             client.users.send(HugoUserID, `[${datetime}] 加載cog程式碼時出錯：${error}`);
//         };
//     },
// };