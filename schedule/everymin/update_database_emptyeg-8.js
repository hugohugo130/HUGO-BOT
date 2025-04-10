module.exports = {
    run: async function (client) {
        try {
            const { saveUserData, loadData, load_rpg_data, save_rpg_data, load_shop_data, save_shop_data } = require(`../../module_database.js`);
            const { GuildID, emptyeg, rpg_emptyeg, shop_emptyeg } = require(`../../config.json`);
            let guild = client.guilds.cache.get(GuildID);
            let members = guild.members.cache;
            let membersArray = Array.from(members.values());

            for (let member of membersArray) {
                let user = member.user;
                if (user.bot) continue;
                let userid = user.id;
                let data = loadData(userid);
                let rpg_data = load_rpg_data(userid);
                let shop_data = load_shop_data(userid);
                let modified = false;
                for (const [key, value] of Object.entries(emptyeg)) {
                    if (!data[key]) {
                        data[key] = value;
                        modified = true;
                    };
                };

                // 檢查並更新 rpg_data 的值，保持順序
                let orderedData = {};
                for (const key of Object.keys(rpg_emptyeg)) {
                    orderedData[key] = rpg_data[key] ?? rpg_emptyeg[key];
                };

                if (JSON.stringify(rpg_data) !== JSON.stringify(orderedData)) {
                    rpg_data = orderedData;
                    modified = true;
                };

                // 檢查並更新 shop_data 的值，保持順序
                orderedData = {};
                for (const key of Object.keys(shop_emptyeg)) {
                    orderedData[key] = shop_data[key] ?? shop_emptyeg[key];
                };

                if (JSON.stringify(shop_data) !== JSON.stringify(orderedData)) {
                    shop_data = orderedData;
                    modified = true;
                };

                if (modified) {
                    saveUserData(userid, data);
                    save_rpg_data(userid, rpg_data);
                    save_shop_data(userid, shop_data);
                };
            };
        } catch (error) {
            require(`${process.cwd()}/module_senderr.js`).senderr({ client: client, msg: `處理更新用戶資料時出錯：${error.stack}`, clientready: true });
        };
    },
};