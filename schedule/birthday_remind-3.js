// const schedule = require("node-schedule");
// const { saveUserData, loadData } = require("../module_database.js");
// const { Events, EmbedBuilder, AttachmentBuilder } = require("discord.js");

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
//                 schedule.scheduleJob(`3 * * * * *`, async function () {
//                     // const { GuildID, emptyeg, chatting_channel_ID } = require("../config.json");
//                     const { GuildID, chatting_channel_ID } = require("../config.json");
//                     let guild = client.guilds.cache.get(GuildID);
//                     let members = guild.members.cache;
//                     let membersArray = Array.from(members.values());
//                     for (let member of membersArray) {
//                         let user = member.user;
//                         if (user.bot) return;
//                         let userid = user.id;
//                         let data = loadData(userid);
//                         // if (!data[userid]) {
//                         //     data[userid] = emptyeg;
//                         // };
//                         // if (!data.birthday) return;
//                         if (!data.birthday) continue;
//                         let date = new Date();
//                         let year = date.getFullYear().toString();
//                         let month = (date.getMonth() + 1).toString();
//                         let day = date.getDate().toString();
//                         let curdate = `${month}-${day}`;
//                         if (month.length == 1) month = "0" + month;
//                         if (day.length == 1) day = "0" + day;
//                         let curdate2 = `${month}-${day}`;
//                         // if (curdate != data.birthday && curdate2 != data.birthday) return;
//                         if (curdate != data.birthday && curdate2 != data.birthday) continue;
//                         // if (year == data.birthday_year) return;
//                         if (year == data.birthday_year) continue;
//                         let username = user.globalName || user.username;
//                         const attachment = new AttachmentBuilder(`./images/birthday.png`, { name: "birthday.png" });
//                         const embed = new EmbedBuilder()
//                             .setColor(0x00BBFF)
//                             .setTitle(`生日快樂!`)
//                             .setDescription(`今天是 ${username} 的生日!\n${username} 生日快樂!!`)
//                             .setImage("attachment://birthday.png");
//                         await guild.channels.cache.get(chatting_channel_ID).send({ embeds: [embed], files: [attachment] });
//                         data.birthday_year = year;
//                         saveUserData(userid, data);
//                     };
//                 });
//             } catch (error) {
//                 require("../module_senderr").senderr({ client: client, msg: `生日提醒時出錯：${error}`, clientready: true });
//             };
//         });
//     },
// };
const { saveUserData, loadData } = require("../module_database.js");
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

module.exports = {
    run: async function (client) {
        try {
            // const { GuildID, emptyeg, chatting_channel_ID } = require("../config.json");
            const { GuildID, chatting_channel_ID } = require("../config.json");
            let guild = client.guilds.cache.get(GuildID);
            let members = guild.members.cache;
            let membersArray = Array.from(members.values());
            for (let member of membersArray) {
                let user = member.user;
                if (user.bot) return;
                let userid = user.id;
                let data = loadData(userid);
                // if (!data[userid]) {
                //     data[userid] = emptyeg;
                // };
                // if (!data.birthday) return;
                if (!data.birthday) continue;
                let date = new Date();
                let year = date.getFullYear().toString();
                let month = (date.getMonth() + 1).toString();
                let day = date.getDate().toString();
                let curdate = `${month}-${day}`;
                if (month.length == 1) month = "0" + month;
                if (day.length == 1) day = "0" + day;
                let curdate2 = `${month}-${day}`;
                // if (curdate != data.birthday && curdate2 != data.birthday) return;
                if (curdate != data.birthday && curdate2 != data.birthday) continue;
                // if (year == data.birthday_year) return;
                if (year == data.birthday_year) continue;
                let username = user.globalName || user.username;
                const attachment = new AttachmentBuilder(`./f_images/birthday.png`, { name: "birthday.png" });
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setTitle(`生日快樂!`)
                    .setDescription(`今天是 ${username} 的生日!\n讓我們一起祝 ${username} 生日快樂吧!!`)
                    .setImage("attachment://birthday.png");
                await guild.channels.cache.get(chatting_channel_ID).send({ embeds: [embed], files: [attachment] });
                data.birthday_year = year;
                saveUserData(userid, data);
            };
        } catch (error) {
            require("../module_senderr").senderr({ client: client, msg: `生日提醒時出錯：${error.stack}`, clientready: true });
        };
    },
};