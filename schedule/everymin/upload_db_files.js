module.exports = {
    run: async function (client) {
        try {
            const { uploadAllDatabaseFiles } = require("../../module_database.js");

            await uploadAllDatabaseFiles();
        } catch (error) {
            require("../../module_senderr.js").senderr({ client: client, msg: `自動上載資料庫檔案時出錯：${error.stack}`, clientready: true });
        };
    },
};