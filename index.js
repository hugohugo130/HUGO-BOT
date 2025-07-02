const { slashcmd, botfunction } = require('./config.json');
const { loadbotfunction } = require("./module_loadbotfunction.js")
const { rlcmd } = require("./module_readlinecmd.js")
const { getclient } = require("./module_createclient.js");
const { getrl } = require("./module_createrl.js");
const { loadslashcmd } = require("./module_regcmd.js");
const { Events } = require("discord.js");
const { updateDatabaseDefaults, checkAllDatabaseFilesLastModified, check_database_files, update_database_files } = require("./module_database.js");
const { check_item_name } = require("./rpg.js");
const fs = require("fs");
require("dotenv").config();

(async () => {
    await check_database_files();

    update_database_files();
    updateDatabaseDefaults();

    await checkAllDatabaseFilesLastModified();

    check_item_name()

    let client = getclient();
    client.setMaxListeners(Infinity);

    if (slashcmd) client.commands = loadslashcmd(true);
    if (botfunction) loadbotfunction(client);

    getrl().on("line", async (input) => {
        await rlcmd(client, input);
    });

    const temp_folder = `${process.cwd()}/temp`;
    if (fs.existsSync(temp_folder)) {
        const files = fs.readdirSync(temp_folder);
        for (const file of files) {
            if (file.startsWith('backup') && file.endsWith('.txt')) {
                fs.unlinkSync(`${temp_folder}/${file}`);
            };
        };
    };

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

    // client.cooking_interactions = [];

    client.login(process.env.TOKEN);
})();