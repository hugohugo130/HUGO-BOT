// const schedule = require("node-schedule");

module.exports = {
    run: async function (client) {
        delete require.cache[require.resolve("../module_senderr.js")];
        try {
            const { backup_database_channel_ID, databasefilename } = require("../config.json");
            const channel = await client.channels.fetch(backup_database_channel_ID);
            if (!channel) return;

            try {
                await channel.send({ content: `[<t:${Math.floor(Date.now() / 1000)}:f>] 資料庫備份`, files: [databasefilename], flags: [4096] });
            } catch (error) {
                await channel.send({ content: `資料庫備份失敗: ${error.message}` });
            };
        } catch (error) {
            if (error.message.includes("getaddrinfo ENOTFOUND discord.com")) {} else {
                require("../module_senderr.js").senderr({ client: client, msg: `備份資料庫時出錯：${error.stack}`, clientready: true });
            };
        };
    },
};