const { BotToken, slashcmd, botfunction } = require('./config.json');
const { loadbotfunction } = require("./module_loadbotfunction.js")
const { rlcmd } = require("./module_readlinecmd.js")
const { getclient } = require("./module_createclient.js");
const { getrl } = require("./module_createrl.js");
const { loadslashcmd } = require("./module_regcmd.js");
const { time } = require("./module_time.js");
const { Events } = require("discord.js");

let client = getclient();
client.setMaxListeners(Infinity);

if (slashcmd) {
    client.commands = loadslashcmd(true);
    console.log(`[${time()}] 斜線指令已加載`);
} else {
    console.log(`[${time()}] 斜線指令已禁用，建議啟用`);
};

if (botfunction) {
    loadbotfunction(client);
    console.log(`[${time()}] 機器人功能已加載`);
} else {
    console.log(`[${time()}] 機器人功能已禁用，建議啟用`);
};

getrl().on("line", async (input) => {
    rlcmd(client, input);
});

client.on(Events.Error, (error) => {
    if (error.code != "UND_ERR_CONNECT_TIMEOUT") {
        require("./module_senderr").senderr({ client: client, msg: `機器人發生了錯誤：\n\`\`\`${error.stack}\`\`\``, clientready: true, channel: 2 });
    } else { // 採用另外一種方式來處理連接超時的錯誤
        console.log(`[${time()}] 機器人連接超時，請檢查網路連接`);
    };
});

client.login(BotToken);