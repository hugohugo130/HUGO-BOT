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
                for (const [key, value] of Object.entries(emptyeg)) {
                    if (!data[key]) {
                        data[key] = value;
                    };
                };
                saveUserData(userid, data);
            };
        } catch (error) {
            require("../module_senderr").senderr({ client: client, msg: `處理更新用戶資料時出錯：${error.stack}`, clientready: true });
        };
    },
};