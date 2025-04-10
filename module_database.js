const fs = require("fs");
const backupdb_queue_file = `${process.cwd()}/backup_database_send_queue.json`;

function loadData(userid = null, mode = 0) {
    /*
    mode: 0 取得用戶資料, 1 取得所有資料
    */
    if (![0, 1].includes(mode)) {
        throw new TypeError("Invalid mode");
    };
    const { databasefilename, emptyeg } = require("./config.json");
    if (fs.existsSync(databasefilename)) {
        const rawData = fs.readFileSync(databasefilename);
        let data = JSON.parse(rawData);
        if (mode == 0 && userid) {
            if (!data[userid]) {
                data[userid] = emptyeg;
                saveUserData(userid, data[userid], false);
            };
            return data[userid];
        } else {
            return data;
        };
    } else {
        return {};
    };
};

function saveUserData(userid, userData, backup = true) {
    const { databasefilename, emptyeg } = require("./config.json");
    let old_data = {};
    if (backup) {
        old_data = loadData(null, 1);
    };
    let data = {};
    if (fs.existsSync(databasefilename)) {
        const rawData = fs.readFileSync(databasefilename);
        data = JSON.parse(rawData);
    };

    if (!data[userid]) {
        data[userid] = emptyeg;
    };

    data[userid] = { ...data[userid], ...userData };
    fs.writeFileSync(databasefilename, JSON.stringify(data, null, 4));
    if (!backup) return;
    if (old_data === data) return;

    let backupdb_queue = [];
    if (fs.existsSync(backupdb_queue_file)) {
        backupdb_queue = JSON.parse(fs.readFileSync(backupdb_queue_file));
    };

    backupdb_queue.push({
        original_file: old_data,
        new_file: data
    });
    fs.writeFileSync(backupdb_queue_file, JSON.stringify(backupdb_queue, null, 4));
};

function deleteUserData(userid) {
    const { databasefilename } = require("./config.json");
    let data = loadData(null, 1); // 取得所有資料
    delete data[userid]; // 刪除資料
    data = JSON.stringify(data, null, 4); // 轉換成 JSON 格式
    fs.writeFileSync(databasefilename, data); // 寫入檔案
};

function load_db() {
    const databasefilename = "./db.json";
    if (fs.existsSync(databasefilename)) {
        const rawData = fs.readFileSync(databasefilename);
        return JSON.parse(rawData);
    } else {
        return {};
    };
};

function save_db(data) {
    const databasefilename = "./db.json";
    data = JSON.stringify(data, null, 4); // 轉換成 JSON 格式
    fs.writeFileSync(databasefilename, data); // 寫入檔案
};

function end_guess_num_game(userid) {
    const db = load_db();
    if (!db.guess_num[userid]) return null;
    delete db.guess_num[userid];
    save_db(db);
    return 1;
};

function get_boosters(client, mode = 0) {
    if (mode !== 1 && mode !== 0) {
        throw new TypeError("Invalid mode");
    };
    const data = loadData(null, 1);
    const userid_list = Object.keys(data).filter(key => data[key].roles && data[key].roles.includes("1221819716323250320"));
    if (mode == 0) {
        return userid_list; // 取得今天加成的人 (userid)
    } else {
        let member_list = []
        const { GuildID } = require("./config.json");
        const guild = client.guilds.cache.get(GuildID);
        for (let userid of userid_list) {
            member_list.push(guild.members.cache.get(userid));
        };
        return member_list; // 取得今天加成的人 (member)
    };
};

// 更新資料庫檔案的預設值
function updateDatabaseDefaults() {
    let { default_value, giveaway_eg } = require('./config.json');
    default_value = { ...default_value, "giveaway.json": giveaway_eg };
    for (const file of ["db.json", "giveaway.json"]) {
        try {
            let data = JSON.parse(fs.readFileSync(file));
            let defaultData = default_value[file];
            let changed = false;

            // 遞迴檢查和更新物件的所有層級
            function updateObject(current, defaults) {
                for (const [key, value] of Object.entries(defaults)) {
                    if (!(key in current)) {
                        current[key] = value;
                        changed = true;
                    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        if (typeof current[key] !== 'object') {
                            current[key] = {};
                            changed = true;
                        }
                        updateObject(current[key], value);
                    };
                };
            };

            updateObject(data, defaultData);

            if (changed) {
                fs.writeFileSync(file, JSON.stringify(data, null, 2));
            };
        } catch (error) {
            console.error(`更新${file}時出錯：${error.stack}`);
        };
    };
};

function load_rpg_data(userid) {
    const { rpg_emptyeg } = require("./config.json");
    const databasefilename = "./rpg_database.json";
    if (fs.existsSync(databasefilename)) {
        const rawData = fs.readFileSync(databasefilename);
        const data = JSON.parse(rawData);
        if (!data[userid]) {
            save_rpg_data(userid, rpg_emptyeg);
            return rpg_emptyeg;
        };
        // 確保按照 rpg_emptyeg 的順序
        const orderedData = {};
        for (const key of Object.keys(rpg_emptyeg)) {
            orderedData[key] = data[userid][key] ?? rpg_emptyeg[key];
        };
        return orderedData;
    } else {
        save_rpg_data(userid, rpg_emptyeg);
        return rpg_emptyeg;
    };
};

function save_rpg_data(userid, userData) {
    const { rpg_emptyeg } = require("./config.json");
    const databasefilename = "./rpg_database.json";
    let data = {};
    if (fs.existsSync(databasefilename)) {
        const rawData = fs.readFileSync(databasefilename);
        data = JSON.parse(rawData);
    };

    if (!data[userid]) {
        data[userid] = rpg_emptyeg;
    };

    data[userid] = { ...data[userid], ...userData };

    // 檢查並清理 inventory 中數量為 0 或 null 的物品
    if (data[userid].inventory) {
        Object.keys(data[userid].inventory).forEach(item => {
            if (data[userid].inventory[item] === 0 || data[userid].inventory[item] === null) {
                delete data[userid].inventory[item];
            };
        });
    };

    // const orderedData = {};
    // for (const key of Object.keys(rpg_emptyeg)) {
    //     orderedData[key] = userData[key] ?? rpg_emptyeg[key];
    // };

    // data[userid] = orderedData;
    fs.writeFileSync(databasefilename, JSON.stringify(data, null, 4));
};

function load_shop_data(userid) {
    const { shop_emptyeg } = require("./config.json");
    const databasefilename = "./rpg_shop.json";
    if (fs.existsSync(databasefilename)) {
        const rawData = fs.readFileSync(databasefilename);
        const data = JSON.parse(rawData);
        if (!data[userid]) {
            save_shop_data(userid, shop_emptyeg);
            return shop_emptyeg;
        };

        const orderedData = {};
        for (const key of Object.keys(shop_emptyeg)) {
            orderedData[key] = data[userid][key] ?? shop_emptyeg[key];
        };

        return orderedData;
    } else {
        save_shop_data(userid, shop_emptyeg);
        return shop_emptyeg;
    };
};

function save_shop_data(userid, userData) {
    const { shop_emptyeg } = require("./config.json");
    const databasefilename = "./rpg_shop.json";
    let data = {};
    if (fs.existsSync(databasefilename)) {
        const rawData = fs.readFileSync(databasefilename);
        data = JSON.parse(rawData);
    };

    if (!data[userid]) {
        data[userid] = shop_emptyeg;
    };

    data[userid] = { ...data[userid], ...userData };

    // 清除數量為0的物品
    if (data[userid].items) {
        for (const [item, itemData] of Object.entries(data[userid].items)) {
            if (itemData.amount <= 0) {
                delete data[userid].items[item];
            };
        };
    };

    fs.writeFileSync(databasefilename, JSON.stringify(data, null, 4));
};

function sethacoin(userId, amount, add) {
    let userData = loadData(userId);
    if (add) {
        userData.hacoin += amount;
    } else {
        userData.hacoin = amount;
    };
    saveUserData(userId, userData);
    return userData.hacoin;
};

function sethacoin_forsign(userId, amount, add = false) {
    let userData = loadData(userId);
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let curdate = `${year} ${month} ${day}`;
    if (add) {
        userData.hacoin += amount;
    } else {
        userData.hacoin = amount;
    };
    userData.latestdate = curdate;
    saveUserData(userId, userData);
};

module.exports = {
    loadData,
    saveUserData,
    deleteUserData,
    load_db,
    save_db,
    end_guess_num_game,
    get_boosters,
    updateDatabaseDefaults,
    load_rpg_data,
    save_rpg_data,
    load_shop_data,
    save_shop_data,
    sethacoin,
    sethacoin_forsign,
};