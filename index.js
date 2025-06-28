const { BotToken, slashcmd, botfunction, giveaway_eg } = require('./config.json');
const { loadbotfunction } = require("./module_loadbotfunction.js")
const { rlcmd } = require("./module_readlinecmd.js")
const { getclient } = require("./module_createclient.js");
const { getrl } = require("./module_createrl.js");
const { loadslashcmd } = require("./module_regcmd.js");
const { Events } = require("discord.js");
const { updateDatabaseDefaults, checkAllDatabaseFilesLastModified } = require("./module_database.js");
const { check_item_name } = require("./rpg.js");
const fs = require("fs");
require("dotenv").config();

let { default_value } = require('./config.json');
default_value = { ...default_value, "giveaway.json": giveaway_eg };
const database_files = Object.keys(default_value);

for (const file of database_files) {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify(default_value[file], null, 4));
    } else {
        let fileData = JSON.parse(fs.readFileSync(file, 'utf8'));
        let defaultData = default_value[file];
        let modified = false;

        for (const key in defaultData) {
            if (!(key in fileData)) {
                fileData[key] = defaultData[key];
                modified = true;
            };
        };

        if (!modified) continue;
        fs.writeFileSync(file, JSON.stringify(fileData, null, 4));
    };
};
updateDatabaseDefaults();

(async () => {
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