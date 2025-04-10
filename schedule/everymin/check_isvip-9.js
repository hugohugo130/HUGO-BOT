const { saveUserData, loadData } = require("../../module_database.js");

module.exports = {
    run: async function (client) {
        try {
            const { GuildID, vip } = require("../../config.json");
            let guild = client.guilds.cache.get(GuildID);
            let members = guild.members.cache;
            let membersArray = Array.from(members.values());
            for (let member of membersArray) {
                let user = member.user;
                if (user.bot) continue;
                let userid = user.id;
                let data = loadData(userid);
                let isvip = vip.includes(userid);
                data.vip = Boolean(isvip);
                saveUserData(userid, data);
            };
        } catch (error) {
            require("../../module_senderr.js").senderr({ client: client, msg: `檢查是否為VIP(自動刷新)時出錯：${error.stack}`, clientready: true });
        }
    },
};
