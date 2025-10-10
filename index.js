const { slashcmd, botfunction, beta } = require('./config.json');
const { loadbotfunction } = require("./module_loadbotfunction.js")
const { rlcmd } = require("./module_readlinecmd.js")
const { getclient } = require("./module_createclient.js");
const { getrl } = require("./module_createrl.js");
const { loadslashcmd } = require("./module_regcmd.js");
const { Events } = require("discord.js");
const { updateDatabaseDefaults, checkAllDatabaseFilesContent, check_database_files, check_db_files_exists } = require("./module_database.js");
const { check_item_data } = require("./rpg.js");
const fs = require("fs");
require("dotenv").config();

let client = getclient();
client.setMaxListeners(Infinity);

client.on(Events.Error, (error) => {
    if (error.code != "UND_ERR_CONNECT_TIMEOUT") {
        require(`./module_senderr.js`).senderr({
            client: client,
            msg: `機器人發生了錯誤：${error.stack}`,
            clientready: true,
            channel: 2
        });
    };
});

//                    程式出Bug了？
//                    　　　∩∩
//                    　　（´･ω･）
//                    　 ＿|　⊃／(＿＿
//                    　／ └-(＿＿＿／
//                    　￣￣￣￣￣￣￣
//                    算了反正不是我寫的
//                    　　 ⊂⌒／ヽ-、＿
//                    　／⊂/＿＿＿＿ ／
//                    　￣￣￣￣￣￣￣
//                    萬一是我寫的呢
//                    　　　∩∩
//                    　　（´･ω･）
//                    　 ＿|　⊃／(＿＿
//                    　／ └-(＿＿＿／
//                    　￣￣￣￣￣￣￣
//                    算了反正改了一個又出三個
//                    　　 ⊂⌒／ヽ-、＿
//                    　／⊂/＿＿＿＿ ／
//                    　￣￣￣￣￣￣￣ 
// 
//                        _oo0oo_
//                       o8888888o
//                       88" . "88
//                       (| -_- |)
//                       0\  =  /0
//                     ___/`---'\___
//                   .' \\|     |// '.
//                  / \\|||  :  |||// \
//                 / _||||| -:- |||||- \
//                |   | \\\  -  /// |   |
//                | \_|  ''\---/''  |_/ |
//                \  .-\__  '-'  ___/-. /
//              ___'. .'  /--.--\  `. .'___
//           ."" '<  `.___\_<|>_/___.' >' "".
//          | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//          \  \ `_.   \_ __\ /__ _/   .-` /  /
//      =====`-.____`.___ \_____/___.-`___.-'=====
//                        `=---='
// 
// 
//      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 
//                佛祖保佑         永無BUG

console.log(beta ? `
██████╗ ███████╗████████╗ █████╗     ██████╗  ██████╗ ████████╗
██╔══██╗██╔════╝╚══██╔══╝██╔══██╗    ██╔══██╗██╔═══██╗╚══██╔══╝
██████╔╝█████╗     ██║   ███████║    ██████╔╝██║   ██║   ██║   
██╔══██╗██╔══╝     ██║   ██╔══██║    ██╔══██╗██║   ██║   ██║   
██████╔╝███████╗   ██║   ██║  ██║    ██████╔╝╚██████╔╝   ██║   
╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝    ╚═════╝  ╚═════╝    ╚═╝   
` : `
██████╗ ███████╗██╗     ███████╗ █████╗ ███████╗███████╗    ██████╗  ██████╗ ████████╗
██╔══██╗██╔════╝██║     ██╔════╝██╔══██╗██╔════╝██╔════╝    ██╔══██╗██╔═══██╗╚══██╔══╝
██████╔╝█████╗  ██║     █████╗  ███████║███████╗█████╗      ██████╔╝██║   ██║   ██║   
██╔══██╗██╔══╝  ██║     ██╔══╝  ██╔══██║╚════██║██╔══╝      ██╔══██╗██║   ██║   ██║   
██║  ██║███████╗███████╗███████╗██║  ██║███████║███████╗    ██████╔╝╚██████╔╝   ██║   
╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝    ╚═════╝  ╚═════╝    ╚═╝   
`);

(async () => {
    await check_database_files();

    check_db_files_exists();
    updateDatabaseDefaults();

    await checkAllDatabaseFilesContent();

    check_item_data();

    if (slashcmd) client.commands = loadslashcmd(true);
    if (botfunction) loadbotfunction(client);

    const temp_folder = `./temp`;
    if (fs.existsSync(temp_folder)) {
        const files = fs.readdirSync(temp_folder);
        for (const file of files) {
            if (file.startsWith('backup') && file.endsWith('.txt')) {
                fs.unlinkSync(`${temp_folder}/${file}`);
            };
        };
    };

    getrl().on("line", async (input) => {
        await rlcmd(client, input);
    });

    client.login(process.env.TOKEN);
})();
