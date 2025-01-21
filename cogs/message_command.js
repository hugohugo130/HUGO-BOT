const { Events } = require("discord.js");
module.exports = {
    setup(client) {
        client.on(Events.MessageCreate, async (msg) => {
            const { BotChannelID, GuildID, BotAnnouncementChannelID, HugoUserID, BotID } = require("../config.json");
            if (msg.author.bot || msg.channel.id != BotChannelID) return;
            if (msg.content.toLowerCase() == "!test") return await msg.channel.send("test");
            if (msg.content == `<@${BotID}> 關機` && msg.author.id === HugoUserID) {
                async function stopbot(msg) {
                    await msg.reply("機器人正在關機!")
                    const channel = client.guilds.cache.get(GuildID).channels.cache.get(BotAnnouncementChannelID);
                    if (channel) {
                        await channel.send("哈狗cogs機器人已關機!");
                    } else {
                        await client.users.cache.get(HugoUserID).send(":warning: 未找到機器人公告頻道!");
                    };
                    await client.destroy();
                    process.exit();
                };
                console.log("正在關機...");
                await stopbot(msg);
            }
        });
        client.on(Events.MessageCreate, async function (message) {
            const { BotChannelID } = require("../config.json");
            if (message.channel.id != BotChannelID) return;
            if (message.author.bot) return;
            if (message.content.startsWith("> u說")) {
                if (message.content.replace("> u說", "") === null || message.content == "> u說") {
                    return await message.channel.send("你要我說什麼?");
                };
                if (message.content != "> u說") {
                    let saymessage = message.content.substring(4);
                    await message.delete();
                    return await message.channel.send(`${message.author.username}, ${saymessage}`);
                };
            }
        });
        client.on(Events.MessageCreate, async function (message) {
            const { BotChannelID } = require("../config.json");
            if (message.channel.id != BotChannelID) return;
            if (message.author.bot) return;
            if (message.content.startsWith("> 說")) {
                if (message.content === "> 說") return await message.channel.send("你要我說什麼?");
                let saymessage = message.content.substring(3);
                await message.delete();
                return await message.channel.send(saymessage);
            };
        });
    },
};