const { Events } = require("discord.js");

module.exports = {
    setup(client) {
        client.once(Events.ClientReady, async () => {
            const { GuildID, BotAnnouncementChannelID, beta } = require("../config.json")
            const guild = client.guilds.cache.get(GuildID);
            if (guild) {
                const channel = guild.channels.cache.get(BotAnnouncementChannelID);
                if (channel) {
                    await channel.send("哈狗 cogs 機器人啟動成功!");
                } else {
                    console.log("未找到機器人頻道!");
                };
            } else {
                console.warn(`機器人不在id為${GuildID}的伺服器`);
            };
            console.log(`${beta ? "BETA" : ""}機器人啟動成功\n輸入stop停止機器人`);
        });
    },
};