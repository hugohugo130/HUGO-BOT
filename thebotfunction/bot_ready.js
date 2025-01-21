const { Events } = require("discord.js");
const fs = require("fs");

module.exports = {
    setup(client) {
        client.once(Events.ClientReady, async () => {
            try {
                const { load_skiplist, thebotfunctionFolderPath } = require("../config.json");
                const { start_send_msg } = require("../module_bot_start_stop.js");
                const Folder = `${process.cwd()}/${thebotfunctionFolderPath}`;
                let FolderFiles = fs.readdirSync(Folder).filter(file => file.endsWith('.js')).filter(file => !load_skiplist.includes(file));
                start_send_msg({ client: client, amount: FolderFiles.length, reload: false });
            } catch (error) {
                require("../module_senderr.js").senderr({ client: client, msg: `機器人啟動時出錯：${error.stack}`, clientready: true });
            };
        });
    },
};