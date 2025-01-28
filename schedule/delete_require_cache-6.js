const fs = require("fs");

module.exports = {
    run: async function (client) {
        try {
            let deletelist = ["../config.json"];
            let modules = fs.readdirSync("../").filter(file => file.endsWith(".js") && file.startsWith("module_"));
            deletelist.push(...modules.map(file => `../${file}`));

            for (const module of deletelist) {
                delete require.cache[require.resolve(module)];
            };
        } catch (error) {
            require("../module_senderr.js").senderr({
                client: client,
                msg: `自動清除require快取時出錯: ${error.stack}`,
                clientready: true
            });
        };
    },
};