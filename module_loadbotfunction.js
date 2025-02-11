const fs = require("fs");
const path = require('node:path');

module.exports = {
    loadbotfunction(client, reload = false) {
        try {
            const { load_skiplist, thebotfunctionFolderPath } = require("./config.json");
            const functionPath = path.join(__dirname, thebotfunctionFolderPath);

            function processDirectory(dirPath) {
                const items = fs.readdirSync(dirPath);
                let loadedFiles = 0;
                
                for (const item of items) {
                    const itemPath = path.join(dirPath, item);
                    const stat = fs.statSync(itemPath);
                    
                    if (stat.isDirectory()) {
                        loadedFiles += processDirectory(itemPath);
                    } else if (item.endsWith('.js') && !load_skiplist.includes(item)) {
                        delete require.cache[require.resolve(itemPath)];
                        const botfunction = require(itemPath);
                        botfunction.setup(client);
                        loadedFiles++;
                    };
                };
                return loadedFiles;
            };

            const totalFiles = processDirectory(functionPath);
            const { time } = require("./module_time.js");
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