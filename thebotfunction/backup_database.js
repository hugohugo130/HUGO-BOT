const { Events } = require("discord.js");

module.exports = {
    setup(client) {
        client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isChatInputCommand()) return;
            if (interaction.commandName !== '備份資料庫') return;
            try {
                const { databasefilename } = require("../config.json");
                const { loadData } = require("../module_database.js");
                await interaction.deferReply({ ephemeral: true });
                let userid = interaction.user.id;
                let data = loadData(userid);

                let isadmin = data.admin;
                if (!isadmin) return interaction.editReply("你不是機器人管理員! (機器人每1分鐘刷新一次)");

                /*
                if (interaction.channel) {
                    return interaction.editReply({ content: '此指令只能在私訊中使用。' });
                };
                */

                try {
                    await interaction.editReply({ content: `[<t:${Math.floor(Date.now() / 1000)}:f>] 資料庫備份`, files: [databasefilename] });
                } catch (error) {
                    await interaction.editReply({ content: `資料庫備份失敗: ${error.message}` });
                };
            } catch (error) {
                if (error.message.includes("getaddrinfo ENOTFOUND discord.com")) {
                    await interaction.editReply({ content: "資料庫備份失敗: 網路連接失敗" });
                } else {
                    require("../module_senderr").senderr({ client: client, msg: `備份資料庫時出錯：${error.stack}`, clientready: true });
                };
            };
        });
    },
};
