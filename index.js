const { BotToken, slashcmd, botfunction, giveaway_eg } = require('./config.json');
const { loadbotfunction } = require("./module_loadbotfunction.js")
const { rlcmd } = require("./module_readlinecmd.js")
const { getclient } = require("./module_createclient.js");
const { getrl } = require("./module_createrl.js");
const { loadslashcmd } = require("./module_regcmd.js");
const { time } = require("./module_time.js");
const { Events } = require("discord.js");
const { updateDatabaseDefaults } = require("./module_database.js");
const fs = require("fs");

const database_files = [
    "data_red_packet.json",
    "database.json",
    "db.json",
    "giveaway.json",
]

let { default_value } = require('./config.json');
default_value = { ...default_value, "giveaway.json": giveaway_eg };
for (const file of database_files) {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify(default_value[file], null, 4));
    };
};
updateDatabaseDefaults();

// 刪除temp資料夾和queue.json檔案
if (fs.existsSync("temp")) {
    fs.rmSync("temp", { recursive: true, force: true });
};

if (fs.existsSync("queue.json")) {
    fs.unlinkSync("queue.json");
};

let client = getclient();
client.setMaxListeners(Infinity); // 設定最大監聽器數量為無限

if (slashcmd) {
    client.commands = loadslashcmd(true);
} else {
    console.log(`[${time()}] 斜線指令已禁用，建議啟用`);
};

if (botfunction) {
    loadbotfunction(client);
} else {
    console.log(`[${time()}] 機器人功能已禁用，建議啟用`);
};

getrl().on("line", async (input) => {
    rlcmd(client, input);
});

client.on(Events.Error, (error) => {
    if (error.code != "UND_ERR_CONNECT_TIMEOUT") {
        require("./module_senderr.js").senderr({ client: client, msg: `機器人發生了錯誤：${error.stack}`, clientready: true, channel: 2 });
    } else { // 採用另外一種方式來處理連接超時的錯誤
        console.log(`[${time()}] 網絡連接連接超時 :|`);
    };
});

client.login(BotToken);