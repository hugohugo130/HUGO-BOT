module.exports = {
    run: async function (client) {
        try {
            // 引入所需模組
            const { GuildID } = require("../../config.json");
            const { loadData, deleteUserData } = require("../../module_database.js");

            // 獲取伺服器成員列表
            let guild = client.guilds.cache.get(GuildID);
            let members = guild.members.cache.filter(member => member.user.bot);
            let membersArray = Array.from(members.values());

            // 遍歷所有成員
            for (let member of membersArray) {
                let user = member.user;
                let userid = user.id;

                // 檢查用戶是否存在於資料庫中
                let data = loadData(userid);
                if (data) {
                    // 如果存在則刪除該用戶資料
                    deleteUserData(userid);
                };
            };
        } catch (error) {
            require("../../module_senderr.js").senderr({ client: client, msg: `刪除機器人資料庫時出錯: ${error.stack}`, clientready: true });
        };
    },
};