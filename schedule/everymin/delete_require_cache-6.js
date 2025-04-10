const fs = require("fs");
const path = require('path');

module.exports = {
    run: async function (client) {
        try {
            let basePath = path.join(__dirname, '../..');
            let deletelist = [path.join(basePath, 'config.json')];
            let modules = fs.readdirSync(basePath)
                .filter(file => file.endsWith(".js") && file.startsWith("module_"))
                .map(file => path.join(basePath, file));
            deletelist.push(...modules);

            for (const module of deletelist) {
                delete require.cache[require.resolve(module)];
            };
        } catch (error) {
            require("../../module_senderr.js").senderr({
                client: client,
                msg: `自動清除require快取時出錯: ${error.stack}`,
                clientready: true
            });
        };
    },
};