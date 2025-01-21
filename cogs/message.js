const { EmbedBuilder, Events } = require("discord.js");

module.exports = {
    setup(client) {
        client.on(Events.MessageCreate, async function (message) {
            if (message.author.bot) return;
            if (message.channel.id != BotChannelID) return;
            const { BotChannelID } = require("../config.json");
            switch (message.content) {
                case "你好":
                    await message.channel.send(`你好呀!${message.author.username}`);
                    break;
                case "掰掰":
                    await message.channel.send("掰掰!" + " " + message.author.username);
                    break;
                case "拜拜":
                    await message.channel.send("拜拜!" + " " + message.author.username);
                    break;
                case "BYE":
                    await message.channel.send("Bye," + " " + message.author.username);
                    break;
                case "安安":
                    await message.channel.send("安安啊" + " " + message.author.username)
                    break;
                case "88":
                    await message.channel.send("88," + " " + message.author.username);
                    break;
                case "早安":
                    await message.channel.send("早安啊," + " " + message.author.username);
                    break;
                case "午安":
                    await message.channel.send("午安啊," + " " + message.author.username);
                    break;
                case "晚安":
                    await message.channel.send("晚安啊," + " " + message.author.username);
                    break;
                case "現在的時間是什麼":
                    const now = new Date();
                    const time_str = now.toLocaleString("zh-HK", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
                    await message.channel.send("現在的時間是 : " + ` ${time_str} ` + " " + "哦," + " " + message.author.username);
                    break;
                case "bruh":
                    if (message.author.bot) return;
                    setTimeout(async () => {
                        await message.channel.send("bruh");
                    }, 1520);
                    break;
                case "Bruh":
                    if (message.author.bot) return;
                    setTimeout(async () => {
                        await message.channel.send("Bruh");
                    }, 1520);
                    break;
                case "BRUH":
                    if (message.author.bot) return;
                    setTimeout(async () => {
                        await message.channel.send("BRUH");
                    }, 1520);
                    break;
                case "help" || "cmd" || "command":
                    await message.channel.send(`有以下指令！\n你好，掰掰，拜拜，BYE，ByE，安安，88，早安，午安，晚安，現在的時間是什麼，bruh，Bruh，BRUH，不客氣，謝謝，kick，serverinfo，randice，cut，蛙蛙 [次數]，PG72 [次數]，哈狗 [次數]\n還有一個查詢時間的指令！`);
                    await message.channel.send(" `> time` ");
                    break;
                case "不客氣":
                    if (message.author.bot) return;
                    setTimeout(async () => {
                        await message.channel.send("嘿嘿");
                    }, 1520);
                    break;
                case "謝謝":
                    if (message.author.bot) return;
                    setTimeout(async () => {
                        await message.channel.send("不客氣~");
                    }, 1520);
                    break;
                case "嗨":
                    if (message.author.bot) return;
                    setTimeout(async () => {
                        await message.channel.send("嗨！" + message.author.username);
                    }, 1520);
                    break;
                case "bye" || "BYE" || "Bye" || " byE":
                    if (message.author.bot) return;
                    setTimeout(async () => {
                        await message.channel.send(message.content);
                    }, 1520);
                    break;
                case "serverinfo":
                    if (message.guild) {
                        let embed = new EmbedBuilder()
                            .setTitle(message.guild.name + " 的伺服器資料")
                            .setDescription("伺服器id:" + message.guild.id)
                            .setThumbnail(message.guild.iconURL())
                            .addField("服主:", message.guild.owner.nickname)
                            .addField("成員數:", message.guild.memberCount)
                            .addField("表情數:", message.guild.emojis.cache.size)
                            .addField("身份組數:", message.guild.roles.cache.size);
                        await message.channel.send(embed);
                    };
                    break;
                case "randice":
                    let randice = Math.floor(Math.random() * 1000);
                    await message.channel.send(`Weeee~1至1000的隨機數是: ${randice} `);
                    break;
                case "myprofilepic":
                    const embed = new EmbedBuilder()
                        .setColor("#00BBFF")
                        .setTitle("你的個人檔案的照片")
                        .setImage(message.author.avatarURL());
                    await message.channel.send(embed);
                default:
                    break;
            }
        });
    },
};