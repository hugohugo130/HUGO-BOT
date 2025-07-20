const { Client, GatewayIntentBits, Options } = require('discord.js');

module.exports = {
    getclient() {
        try {
            const client = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMembers,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.MessageContent,
                    GatewayIntentBits.DirectMessages,
                ],
                rest: {
                    timeout: 15000,
                    retries: 3
                },
                allowedMentions: {
                    repliedUser: false,
                },
                sweepers: {
                    ...Options.DefaultMakeCacheSettings,
                    channels: {
                        interval: 3_600,
                        lifetime: 1_800,
                    },
                    guilds: {
                        interval: 3_600,
                        lifetime: 1_800,
                    },
                    users: {
                        interval: 3_600,
                        filter: () => user => user.bot && user.id !== user.client.user.id,
                    },
                    messages: {
                        interval: 3_600,
                        lifetime: 1_800,
                    }
                }
            });
            return client;
        } catch (error) {
            require("./module_senderr").senderr({ client: null, msg: `建立機器人客戶端時出錯：${error.stack}`, clientready: false });
            process.exit(1);
        };
    },
};