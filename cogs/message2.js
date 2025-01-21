const { Events } = require("discord.js");
module.exports = {
    setup(client) {
        async function sendmsgtohugo(msgcontent) {
            const { HugoUserID } = require("../config.json");
            await client.users.send(HugoUserID, msgcontent);
        };
        client.on(Events.MessageCreate, async function (message) {
            const { BotChannelID } = require("../config.json");
            if (message.channel.id != BotChannelID) return;
            if (message.author.bot) return;
            if (message.content.startsWith("w")) {
                if (message.content.startsWith("wow") || message.content.startsWith("Wow") || message.content.startsWith("woW")) {
                    setTimeout(async () => {
                        await message.channel.send("wow");
                    }, 1520);
                } else {
                    setTimeout(async () => {
                        await message.channel.send("www");
                    }, 1520);
                }
            };
            if (message.content.startsWith("E")) {
                if (message.content === "em" || message.content === "Em" || message.content === "EM" || message.content === "eM" || message.content.startsWith("EME")) {
                    if (message.content.startsWith("E?")) {
                        setTimeout(async () => {
                            await message.channel.send("E?");
                        }, 1520);
                    } else {
                        setTimeout(async () => {
                            await message.channel.send("EME");
                        }, 1520);
                    }

                } if (message.content !== "em" && message.content !== "Em" && message.content !== "EM" && message.content !== "eM" && message.content.startsWith("EME") == false) {
                    setTimeout(async () => {
                        await message.channel.send("E~Eee");
                    }, 1520);
                };
            };
            if (message.content.startsWith("e")) {
                if (message.content === "em" || message.content === "Em" || message.content === "EM" || message.content === "eM" || message.content.startsWith("eme")) {
                    setTimeout(async () => {
                        await message.channel.send("eme");
                    }, 1520);
                } if (message.content !== "em" && message.content !== "Em" && message.content !== "EM" && message.content !== "eM" && message.content.startsWith("eme") == false) {
                    setTimeout(async () => {
                        await message.channel.send("e~eEE");
                    }, 1520);
                };
            };
            if (message.content.startsWith("W")) {
                setTimeout(async () => {
                    await message.channel.send("WWW");
                }, 1520);
            } else if (message.content.startsWith("> time")) {
                if (message.content === "> time") return;
                const concontent = `資訊 : ${message.content}`
                console.log(`> time獲取到以下資訊! : ${concontent}`);
                await sendmsgtohugo(`> time獲取到以下資訊! : ${concontent}`);
                const now2 = new Date();
                const time_str2 = now2.toLocaleString("zh-HK", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
                setTimeout(async () => {
                    await message.channel.send("time is : " + ` ${time_str2} `);
                }, 1520);
            };
        });
    },
};