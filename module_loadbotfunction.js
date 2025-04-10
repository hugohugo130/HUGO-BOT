const fs = require("fs");
const path = require('node:path');

module.exports = {
    loadbotfunction(client, reload = false) {
        try {
            const { load_skiplist, thebotfunctionFolderPath } = require("./config.json");
            const { time } = require("./module_time.js");
            const functionPath = path.join(__dirname, thebotfunctionFolderPath);

            function processDirectory(dirPath) {
                const items = fs.readdirSync(dirPath).filter(item => !load_skiplist.includes(item));
                let loadedFiles = 0;

                for (const item of items) {
                    const itemPath = path.join(dirPath, item);
                    const stat = fs.statSync(itemPath);

                    if (stat.isDirectory()) {
                        loadedFiles += processDirectory(itemPath);
                    } else if (item.endsWith('.js')) {
                        delete require.cache[require.resolve(itemPath)];
                        const botfunction = require(itemPath);
                        if (botfunction.setup) {
                            botfunction.setup(client); // 舊版相容
                        } else if (botfunction.name && botfunction.execute) {
                            // 新版
                            const event_name = botfunction.name;
                            const once = botfunction.once;
                            if (once) {
                                client.once(event_name, botfunction.execute);
                            } else {
                                client.on(event_name, botfunction.execute);
                            };
                        } else {
                            console.warn(`[${time()}] 未找到 ${itemPath} 的 setup(舊版) 或 [name, execute](新版) 屬性`);
                            continue;
                        }
                        loadedFiles++;
                    };
                };
                return loadedFiles;
            };

            const totalFiles = processDirectory(functionPath);
            console.log(`[${time()}] 已${reload ? "重新" : ""}加載${totalFiles}個程式碼`);

        } catch (error) {
            require("./module_senderr.js").senderr({
                client: null,
                msg: `加載程式碼(botfunction)時出錯:\n${error.stack}`,
                clientready: false
            });
        };
    },
};