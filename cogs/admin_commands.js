const { Events } = require("discord.js");
module.exports = {
    setup(client) {
        const prefix = "?!";
        client.on(Events.MessageCreate, async function (message) {
            const { BotChannelID } = require("../config.json")
            if (message.channel.id != BotChannelID) return;
            if (message.author.bot) return;
            if (message.content.startsWith(prefix + "kick")) {
                if (!message.member.permissions.has("KICK_MEMBERS")) {
                    await message.reply(":x: 你沒有權限使用這個指令|");
                    return;
                };
                const args = message.content.slice(7).trim().split(" ");
                const user = message.mentions.users.first();
                if (args.length === 0)
                    return await message.channel.send("請提及要踢出的用戶");
                if (user) {
                    const member = message.guild.member(user);
                    if (member) {
                        try {
                            await member.kick("你被踢出了哈狗伺服器");
                            await message.channel.send(`:white_check_mark: 成功踢出 ${user.username} !`);
                        } catch (err) {
                            console.error(`機器人無法踢出用戶: ${err}`);
                            await message.channel.send(`抱歉 ${message.author.username} 我無法踢出 "${member.displayName}" Error: ${err}`);
                            return;
                        };
                    } else {
                        return await message.channel.send("member不存在");
                    };
                } else {
                    return await message.channel.send("user不存在");
                }
            } else if (message.content.startsWith(prefix + "cut")) {
                let args = message.content.replace(prefix + "cut", "").split(" ").join(",");
                await message.channel.send(`以下是分割內容 --- split:\n${args}`);
            }
        });
    }
}