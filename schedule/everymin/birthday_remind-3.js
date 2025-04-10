const { saveUserData, loadData } = require("../../module_database.js");
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

module.exports = {
    run: async function (client) {
        try {
            const { GuildID, chatting_channel_ID } = require("../../config.json");
            let guild = client.guilds.cache.get(GuildID);
            let members = guild.members.cache;
            let membersArray = Array.from(members.values());
            for (let member of membersArray) {
                let user = member.user;
                if (user.bot) return;
                let userid = user.id;
                let data = loadData(userid);
                if (!data.birthday) continue;
                let date = new Date();
                let year = date.getFullYear().toString();
                let month = (date.getMonth() + 1).toString();
                let day = date.getDate().toString();
                let curdate = `${month}-${day}`;
                if (month.length == 1) month = "0" + month;
                if (day.length == 1) day = "0" + day;
                let curdate2 = `${month}-${day}`;
                if (curdate != data.birthday && curdate2 != data.birthday) continue;
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
            require("../../module_senderr.js").senderr({ client: client, msg: `處理生日提醒時出錯：${error.stack}`, clientready: true });
        };
    },
};