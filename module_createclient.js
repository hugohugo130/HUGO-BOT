const { Client, GatewayIntentBits } = require('discord.js');

module.exports = {
    getclient() {
        try {
            const client = new Client({
                intents: [
                    GatewayIntentBits.AutoModerationConfiguration,
                    GatewayIntentBits.AutoModerationExecution,
                    GatewayIntentBits.DirectMessagePolls,
                    GatewayIntentBits.DirectMessageReactions,
                    GatewayIntentBits.DirectMessageTyping,
                    GatewayIntentBits.DirectMessages,
                    GatewayIntentBits.GuildExpressions,
                    GatewayIntentBits.GuildIntegrations,
                    GatewayIntentBits.GuildInvites,
                    GatewayIntentBits.GuildMembers,
                    GatewayIntentBits.GuildMessagePolls,
                    GatewayIntentBits.GuildMessageReactions,
                    GatewayIntentBits.GuildMessageTyping,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.GuildModeration,
                    GatewayIntentBits.GuildPresences,
                    GatewayIntentBits.GuildScheduledEvents,
                    GatewayIntentBits.GuildVoiceStates,
                    GatewayIntentBits.GuildWebhooks,
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.MessageContent,
                ],
                rest: {
                    timeout: 15000, // 設定更長的超時時間（預設是 10 秒）
                    retries: 3     // 設定重試次數
                },
                allowedMentions: {
                    repliedUser: false,
                },
            });
            return client;
        } catch (error) {
            require("./module_senderr").senderr({ client: null, msg: `建立機器人客戶端時出錯：${error.stack}`, clientready: false });
            process.exit(1);
        };
    },
};