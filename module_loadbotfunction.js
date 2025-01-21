const fs = require("fs");

module.exports = {
    loadbotfunction(client, reload = false) {
        try {
            const { load_skiplist, thebotfunctionFolderPath } = require("./config.json");
            const Folder = `${process.cwd()}/${thebotfunctionFolderPath}`;
            let FolderFiles = fs.readdirSync(Folder).filter(file => file.endsWith('.js')).filter(file => !load_skiplist.includes(file));
            for (let file of FolderFiles) {
                let file2 = `${Folder}/${file}`;
                delete require.cache[require.resolve(file2)];
                const botfunction = require(file2);
                botfunction.setup(client);
                // let datetime = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 23).replace('T', ' ');
                // let text = `[${datetime}] 已${reload ? "重新" : ""}加載程式碼 ${file}`;
                // console.log(text);
            };
            const { time } = require("./module_time.js");
            console.log(`[${time()}] 已${reload ? "重新" : ""}加載${FolderFiles.length}個程式碼`);
        } catch (error) {
            const { HugoUserID } = require("./config.json");
            let errorlog = `[${time()}] 加載程式碼(botfunction)時出錯:\n${error.stack}`;
            require("./module_senderr.js").senderr({
                client: null,
                msg: errorlog + `\n<@${HugoUserID}>`,
                clientready: false
            });
        };
    },
};