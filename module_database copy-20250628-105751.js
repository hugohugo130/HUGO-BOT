const fs = require("fs");
const FormData = require('form-data');;
const readline = require('readline');
const isEqual = require('lodash.isequal');
const axios = require('axios');
const path = require('path');
const { beta } = require("../config.json")

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

    // 增加重試機制
    let retries = 3;
    let lastError = null;

    while (retries > 0) {
        try {
            fs.writeFileSync(databasefilename, JSON.stringify(data, null, 4));
            break;
        } catch (error) {
            lastError = error;
            retries--;
            if (retries > 0) {
                // 使用 Atomics.wait 來實現同步延遲
                const sharedArray = new Int32Array(new SharedArrayBuffer(4));
                Atomics.wait(sharedArray, 0, 0, 1000); // 等待 1000 毫秒
            };
        };
    };

    if (retries === 0) {
        throw lastError;
    };

    if (!backup || isEqual(old_data, data)) return;

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

function load_cooking_interactions() {
    const databasefilename = "./cooking_interactions.json";
    if (fs.existsSync(databasefilename)) {
        const rawData = fs.readFileSync(databasefilename);
        return JSON.parse(rawData);
    } else {
        return [];
    };
};

function save_cooking_interactions(data) {
    const databasefilename = "./cooking_interactions.json";
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

// =========================================================================================================
let SERVER_URL = 'http://26.38.173.246:3001';
if (!beta) SERVER_URL = 'http://26.38.173.246:3002';

// 列出所有檔案
async function onlineDB_listFiles() {
    try {
        const res = await axios.get(`${SERVER_URL}/files`);
        return res.data.files;
    } catch (err) {
        console.error(`列出檔案時遇到錯誤: ${err.stack}`);
    }
};

// 下載檔案
async function onlineDB_downloadFile(filename, savePath = null) {
    try {
        const res = await axios.get(`${SERVER_URL}/files/${filename}`, { responseType: 'stream' });
        if (savePath === null) savePath = filename;
        const writer = fs.createWriteStream(savePath);
        res.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        return savePath;
    } catch (err) {
        if (err.response.status === 404) {
            console.error(`下載檔案時遇到錯誤: 檔案 ${filename} 不存在`);
            return [err, `下載檔案時遇到錯誤: 檔案 ${filename} 不存在`];
        } else {
            console.error(`下載檔案時遇到未知錯誤: ${err.stack}`);
            return [err, `下載檔案時遇到未知錯誤: ${err.stack}`];
        };
    }
};

// 上傳檔案
async function onlineDB_uploadFile(filepath) {
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(filepath));
        const res = await axios.post(`${SERVER_URL}/files`, form, { headers: form.getHeaders() });
        return res.data;
    } catch (err) {
        console.error(`上傳檔案時遇到錯誤: ${err.stack}`);
    }
};

// 刪除檔案
async function onlineDB_deleteFile(filename) {
    try {
        const res = await axios.delete(`${SERVER_URL}/files/${filename}`);
        return res.data;
    } catch (err) {
        if (err.response.status === 404) {
            console.error(`刪除檔案時遇到錯誤: 檔案 ${filename} 不存在`);
            return [err, `刪除檔案時遇到錯誤: 檔案 ${filename} 不存在`];
        } else {
            console.error(`刪除檔案時遇到未知錯誤: ${err.stack}`);
            return [err, `刪除檔案時遇到未知錯誤: ${err.stack}`];
        };
    }
};

// 獲取檔案最後修改日期
async function onlineDB_FileEditDate(filename) {
    try {
        const res = await axios.get(`${SERVER_URL}/files/${filename}/last-modified`);
        return res.data.lastModified;
    } catch (err) {
        if (err.response && err.response.status === 404) {
            console.error(`獲取檔案最後修改日期時遇到錯誤: 檔案 ${filename} 不存在`);
            return [err, `獲取檔案最後修改日期時遇到錯誤: 檔案 ${filename} 不存在`];
        } else {
            console.error(`獲取檔案最後修改日期時遇到未知錯誤: ${err.stack}`);
            return [err, `獲取檔案最後修改日期時遇到未知錯誤: ${err.stack}`];
        };
    }
};

function IsGotErr(response) {
    if (response instanceof Array && response.length > 0 && response[0] instanceof axios.AxiosError) {
        return true;
    };

    return false;
};

function askUserWithTimeout(question, filename) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        let timeout = setTimeout(() => {
            rl.close();
            // 備份檔案
            const backupDir = path.join(__dirname, 'backup');
            if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(backupDir, `${filename}.${timestamp}.bak`);
            try {
                fs.copyFileSync(filename, backupFile);
                console.log(` - - -\n10秒未回應，已自動備份目前檔案到 ${backupFile}，並自動選擇「是」`);
            } catch (err) {
                console.error(`\n備份檔案時遇到錯誤: ${err.stack}`);
            }
            resolve('y');
        }, 10000);

        rl.question(question, (answer) => {
            clearTimeout(timeout);
            rl.close();
            resolve(answer.trim().toLowerCase());
        });
    });
};

async function onlineDB_checkFileLastModifiedDate(filename) {
    let lastModifiedDate_local;
    try {
        const stats = fs.statSync(filename);
        lastModifiedDate_local = stats.mtime.getTime();
    } catch (err) {
        console.error(`讀取本地檔案最後修改日期時遇到錯誤: ${err.stack}`);
        lastModifiedDate_local = null;
    };

    const lastModifiedDate_remote = await onlineDB_FileEditDate(filename);
    if (!IsGotErr(lastModifiedDate_remote)) {

        if (lastModifiedDate_local !== null && lastModifiedDate_local < lastModifiedDate_remote) {
            const answer = await askUserWithTimeout(`[${filename}]本地檔案較新，是否要上傳本地檔案覆蓋遠端？(Y/N) `, filename);
            if (answer === 'y') {
                let res = await onlineDB_uploadFile(filename);
            }
        } else if (lastModifiedDate_local !== null && lastModifiedDate_local > lastModifiedDate_remote) {
            const answer = await askUserWithTimeout(`[${filename}]遠端檔案較新，是否要下載遠端檔案覆蓋本地？(Y/N) `, filename);
            if (answer === 'y') {
                let res = await onlineDB_downloadFile(filename);
            }
        } else {
            // console.log("本地與遠端檔案最後修改日期相同，無需同步。");
        };
    };
}

async function test() {
    const filelist = await onlineDB_listFiles();
    if (!IsGotErr(filelist))
        console.log(`檔案列表: ${filelist}`);

    let res = await onlineDB_downloadFile("example.txt");
    if (!IsGotErr(res))
        console.log(`下載完成: ${res}`);

    res = await onlineDB_uploadFile('example2.txt');
    if (!IsGotErr(res))
        console.log(`上載完成: ${res}`);

    res = await onlineDB_deleteFile('abc.txt');
    if (!IsGotErr(res))
        console.log(`已刪除檔案: ${res}`);

    await onlineDB_checkFileLastModifiedDate("example.txt");
};

// =========================================================================================================

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
    load_cooking_interactions,
    save_cooking_interactions,
    sethacoin,
    sethacoin_forsign,
    onlineDB_FileEditDate,
    onlineDB_checkFileLastModifiedDate,
    onlineDB_deleteFile,
    onlineDB_downloadFile,
    onlineDB_listFiles,
    onlineDB_uploadFile,
};