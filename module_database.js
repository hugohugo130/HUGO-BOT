const fs = require("fs");
const FormData = require('form-data');
const { isDeepStrictEqual } = require("node:util")
const axios = require('axios');
const path = require('path');
const { beta } = require("./config.json")

const backupdb_queue_file = `${process.cwd()}/backup_database_send_queue.json`;

// === 資料庫檔案清單 ===
const databaseFiles = [
    'backup_database_send_queue.json',
    'bake_db.json',
    'data_red_packet.json',
    'database.json',
    'db.json',
    'giveaway.json',
    'rpg_database.json',
    'rpg_shop.json',
    "smelt_db.json",
    "serverIP.json",
];

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

    if (!backup || isDeepStrictEqual(old_data, data)) return;

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
    try {
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
    } finally {
        delete default_value;
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

function load_bake_data() {
    const databasefilename = "./bake_db.json";
    if (fs.existsSync(databasefilename)) {
        const rawData = fs.readFileSync(databasefilename);
        return JSON.parse(rawData);
    } else {
        return [];
    };
};

function save_bake_data(data) {
    const databasefilename = "./bake_db.json";
    fs.writeFileSync(databasefilename, JSON.stringify(data, null, 4));
};

function load_smelt_data() {
    const databasefilename = "./smelt_db.json";
    if (fs.existsSync(databasefilename)) {
        const rawData = fs.readFileSync(databasefilename);
        return JSON.parse(rawData);
    } else {
        return [];
    };
};

function save_smelt_data(data) {
    const databasefilename = "./smelt_db.json";
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
const serverIPFile = path.join(process.cwd(), 'serverIP.json');
const DEFAULT_IP = "hugo.904037.xyz";

function getServerIPSync() {
    let serverIP = null;
    if (fs.existsSync(serverIPFile)) {
        try {
            serverIP = JSON.parse(fs.readFileSync(serverIPFile, 'utf8'));
        } catch (e) {
            serverIP = null;
        };
    };

    if (serverIP === "26.146.150.194") { // 舊檔案相容
        serverIP = "hugo.904037.xyz";
    };

    if (!serverIP) {
        try {
            let { default_value } = require("./config.json");
            let IP = default_value["serverIP.json"]?.IP || DEFAULT_IP;
            let PORT = beta ? 3001 : 3002;
            try {
                // 用 powershell 偵測本地伺服器
                const res = require('child_process').execSync(`powershell -Command \"try { (Invoke-WebRequest -Uri 'http://127.0.0.1:${PORT}/verify' -UseBasicParsing -TimeoutSec 1).StatusCode } catch { '' }\"`).toString().trim();
                if (res === "200") {
                    IP = "127.0.0.1";
                    console.log("偵測到本地伺服器，已切換 IP 為 127.0.0.1");
                };
            } catch (_) { }
            if (IP === "26.146.150.194") { // 舊檔案相容
                IP = "hugo.904037.xyz";
            };

            serverIP = { IP, PORT };
            fs.writeFileSync(serverIPFile, JSON.stringify(serverIP, null, 4));
        } finally {
            delete default_value;
        };
    };

    return serverIP;
};

const { IP, PORT } = getServerIPSync();
const SERVER_URL = `http://${IP}:${PORT}`;

// 列出所有檔案
async function onlineDB_listFiles() {
    try {
        const res = await axios.get(`${SERVER_URL}/files`);
        return res.data.files;
    } catch (err) {
        console.error(`列出檔案時遇到錯誤: ${err.stack}`);
    };
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
        // === 備份遠端檔案 ===
        const filename = path.basename(filepath);
        const filenameWithoutExt = filename.replace(/\.json$/, "");
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const year = now.getFullYear();
        const month = pad(now.getMonth() + 1);
        const backupDir = `backup/${year}-${month}/${filenameWithoutExt}`;
        const timestamp = `${year}-${month}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
        const backupFile = `${backupDir}/${filename}-${timestamp}.json`;

        // 建立 backupDir
        await axios.post(`${SERVER_URL}/mkdir`, { dir: backupDir });
        // 複製檔案
        try {
            await axios.post(`${SERVER_URL}/copy`, { src: filename, dst: backupFile });
        } catch (err) {
            if (err.response?.status === 404) {
                console.warn(`[警告] 備份遠端檔案時: 來源文件 ${filename} 不存在`);
            } else {
                throw err;
            };
        };
        // === 上傳新檔案 ===
        const form = new FormData();
        form.append('file', fs.createReadStream(filepath));
        // 取得本地檔案的 mtime
        const stats = fs.statSync(filepath);
        form.append('mtime', stats.mtime.getTime());
        const res = await axios.post(`${SERVER_URL}/files`, form, { headers: form.getHeaders() });
        return res.data;
    } catch (err) {
        if (err)
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

async function onlineDB_checkFileContent(filename) {
    // 讀取本地檔案內容
    let localContent;
    try {
        localContent = fs.readFileSync(filename, 'utf8');
    } catch (err) {
        console.error(`讀取本地檔案內容時遇到錯誤: ${err.stack}`);
        localContent = null;
    }

    // 從遠端獲取檔案內容
    let remoteContent;
    try {
        const response = await axios.get(`${SERVER_URL}/files/${filename}`);
        remoteContent = JSON.stringify(response.data);
        localContent = JSON.stringify(JSON.parse(localContent)); // 格式化本地內容以進行比較
    } catch (err) {
        if (err.response?.status === 404) {
            console.error(`遠端檔案不存在: ${filename}`);
        } else {
            console.error(`獲取遠端檔案內容時遇到錯誤: ${err.stack}`);
        }
        remoteContent = null;
    }

    if (localContent && remoteContent) {
        if (localContent !== remoteContent) {
            const rl = require("readline/promises").createInterface({
                input: process.stdin,
                output: process.stdout
            });

            console.log("=".repeat(30));
            console.log(`檔案 ${filename} 內容不同:`);
            console.log('1. 上傳本地檔案到遠端');
            console.log('2. 下載遠端檔案到本地');
            console.log('3. 不做任何事');

            let result = false;

            const answer = await rl.question('請選擇操作 (1/2/3): ');
            rl.close();
            result = true;
            switch (answer.trim()) {
                case '1':
                    await onlineDB_uploadFile(filename);
                    break;
                case '2':
                    await onlineDB_downloadFile(filename);
                    break;
                default:
                    console.log('未進行任何操作');
            };

            console.log("=".repeat(30));
            delete rl;
        };
    } else if (localContent && !remoteContent) {
        console.log(`遠端無 ${filename} 檔案，準備上傳本地檔案`);
        await onlineDB_uploadFile(filename);
    } else if (!localContent && remoteContent) {
        console.log(`本地無 ${filename} 檔案，準備下載遠端檔案`);
        await onlineDB_downloadFile(filename);
    };
};

// === 批量檢查所有資料庫檔案 ===
async function checkAllDatabaseFilesContent() {
    for (const file of databaseFiles) {
        await onlineDB_checkFileContent(file);
    }
}

// === 批量上傳所有資料庫檔案 ===
async function uploadAllDatabaseFiles() {
    for (const file of databaseFiles) {
        if (fs.existsSync(file)) {
            await onlineDB_uploadFile(file);
        }
    }
}

// === 下載單一檔案到指定路徑 ===
async function downloadDatabaseFile(src, dst = null) {
    // 預設下載到 download/ 資料夾
    if (!dst) {
        const downloadDir = path.join(process.cwd(), 'download');
        if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);
        dst = path.join(downloadDir, path.basename(src));
    } else {
        // 若dst資料夾不存在則自動建立
        const dstDir = path.dirname(dst);
        if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, { recursive: true });
    }
    await onlineDB_downloadFile(src, dst);
}

// =========================================================================================================
const database_files = databaseFiles;

async function check_database_files() {
    for (const file of database_files) {
        if (!fs.existsSync(file)) {
            try {
                await onlineDB_downloadFile(file);
                console.log(`[檢查本地資料庫文件] 文件 ${file} 在本地中不存在，已下載檔案`)
            } catch (err) {
                if (err.response?.status === 404) {
                    console.warn(`[警告] [module_database.check_database_files] 本地和遠端也沒有檔案 ${file}`)
                } else {
                    console.error(`[錯誤] 檢查本地資料庫文件是否存在時遇到未知錯誤：\n${err.stack}`)
                };
            };
        };
    };
};

function check_db_files_exists() {
    // for (const file of database_files) {
    //     if (fs.existsSync(file)) {
    //         let fileData = JSON.parse(fs.readFileSync(file, 'utf8'));
    //         let defaultData = default_value[file];
    //         let modified = false;

    //         for (const key in defaultData) {
    //             if (!(key in fileData)) {
    //                 fileData[key] = defaultData[key];
    //                 modified = true;
    //             };
    //         };

    //         if (!modified) continue;
    //         fs.writeFileSync(file, JSON.stringify(fileData, null, 4));
    //     };
    // };
    let error = false;
    try {
        for (const file of database_files) {
            if (!fs.existsSync(file)) {
                let { default_value } = require("./config.json");
                let defaultData = default_value[file];
                if (!defaultData) {
                    console.error(`文件 ${file} 沒有對應的預設值，必須設定！`)
                    error = true;
                };

                fs.writeFileSync(file, JSON.stringify(defaultData, null, 4));
            };
        };
    } finally {
        delete default_value;
    };
    if (error) process.exit(1);
};

async function uploadChangedDatabaseFiles() {
    for (const file of databaseFiles) {
        if (fs.existsSync(file)) {
            let localContent;
            try {
                localContent = fs.readFileSync(file, 'utf8');
                localContent = JSON.stringify(JSON.parse(localContent)); // 格式化本地內容
            } catch (err) {
                console.error(`讀取本地檔案內容時遇到錯誤: ${err.stack}`);
                continue;
            }

            let remoteContent;
            try {
                const response = await axios.get(`${SERVER_URL}/files/${file}`);
                remoteContent = JSON.stringify(response.data);
            } catch (err) {
                if (err.response?.status === 404) {
                    console.log(`遠端無 ${file} 檔案，準備上傳本地檔案`);
                    await onlineDB_uploadFile(file);
                } else {
                    console.error(`獲取遠端檔案內容時遇到錯誤: ${err.stack}`);
                }
                continue;
            }

            if (localContent !== remoteContent) {
                const { time } = require("./module_time.js");
                console.log(`[${time()}] 檔案 ${file} 內容不同，上傳本地版本`);
                await onlineDB_uploadFile(file);
            };
        }
    }
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
    load_bake_data,
    save_bake_data,
    load_smelt_data,
    save_smelt_data,
    sethacoin,
    sethacoin_forsign,
    onlineDB_FileEditDate,
    onlineDB_checkFileContent,
    onlineDB_deleteFile,
    onlineDB_downloadFile,
    onlineDB_listFiles,
    onlineDB_uploadFile,
    databaseFiles,
    checkAllDatabaseFilesContent,
    uploadAllDatabaseFiles,
    downloadDatabaseFile,
    check_database_files,
    check_db_files_exists,
    uploadChangedDatabaseFiles,
};