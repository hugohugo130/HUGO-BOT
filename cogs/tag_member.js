// const { Events } = require("discord.js");
module.exports = {
    setup(client) {
        // const prefix = "?!";
        // function isNumber(value) {
        //     let numberTag = "[object Number]";
        //     let objectToString = Object.prototype.toString;
        //     return typeof value === "number" || ((!!value && typeof value === "object") && objectToString.call(value) === numberTag);
        // };
        // client.on(Events.MessageCreate, async function (message) {
        //     const { BotChannelID, HugoUserID } = require("../config.json");
        //     if (message.channel.id != BotChannelID) return;
        //     if (message.author.bot) return;
        //     if (message.content.startsWith(prefix + "蛙蛙")) {
        //         if (message.content === (prefix + "蛙蛙")) return await message.reply("指令後面需要一個數字哦~例如 ?!蛙蛙 1");
        //         try {
        //             const num = message.content.substring(prefix.length + 1 + 2);
        //             const checknum = parseInt(num);
        //             if (checknum === 0) return await message.reply("執行時發生錯誤 `:(` **Error 001** ");
        //             if (isNumber(checknum) != true || checknum == NaN) return await message.reply("執行時發生錯誤 `:(` **Error 002** ");
        //             if (num >= 11) return await message.reply("重複發送數量不可以超過10哦");
        //             await message.delete();
        //             await message.channel.send(`以下的tag是${messageauthor.username}讓我tag的哦~`);
        //             for (var i = 0; i < num; i++) {
        //                 await message.channel.send("<@1001016404289536051>");
        //             }
        //         } catch (err) {
        //             console.error(`========error========\n${err}\n========error========`);
        //             await message.reply("執行時發生錯誤 `:(` **Error 003** ");
        //         }
        //     } else if (message.content.startsWith(prefix + "PG72")) {
        //         if (message.content === (prefix + "PG72")) return await message.reply("指令後面需要一個數字哦~例如 ?!PG72 1");
        //         try {
        //             const num = message.content.substring(prefix.length + 1 + 2);
        //             const checknum = parseInt(num);
        //             if (checknum === 0) return await message.reply("執行時發生錯誤 `:(` **Error 001** ");
        //             if (isNumber(checknum) != true || checknum == NaN) return await message.reply("執行時發生錯誤 `:(` **Error 002** ");
        //             if (num >= 11) return await message.reply("重複發送數量不可以超過10哦");
        //             await message.delete();
        //             await message.channel.send(`以下的tag是${messageauthor.username}讓我tag的哦~`);
        //             for (var i = 0; i < num; i++) {
        //                 await message.channel.send("<@609189792571457550>");
        //             }
        //         } catch (err) {
        //             console.error(`========error========\n${err}\n========error========`);
        //             await message.reply("執行時發生錯誤 `:(` **Error 003** ");
        //         }
        //     } else if (message.content.startsWith(prefix + "哈狗")) {
        //         if (message.content === (prefix + "哈狗")) return message.reply(`指令後面需要一個數字哦~例如 ${prefix}哈狗 1`);
        //         try {
        //             const num = message.content.substring(prefix.length + 1 + 2);
        //             const checknum = parseInt(num);
        //             if (checknum === 0) return message.reply("執行時發生錯誤 `:(` **Error 001** ");
        //             if (isNumber(checknum) != true) message.reply("執行時發生錯誤 `:(` **Error 002-1** ");
        //             if (checknum == NaN) message.reply("執行時發生錯誤 `:(` **Error 002-2** ")
        //             if (isNumber(checknum) != true || checknum == NaN) return;
        //             if (num >= 11) return message.reply("重複發送數量不可以超過10哦");
        //             await message.delete();
        //             await message.channel.send(`以下的tag是${messageauthor.username}讓我tag的哦~`);
        //             for (var i = 0; i < num; i++) {
        //                 await message.channel.send(`<@${HugoUserID}>`);
        //             }
        //         } catch (err) {
        //             console.error(`========error========\n${err}\n========error========`);
        //             message.reply("執行時發生錯誤 `:(` **Error 003** ");
        //         };
        //     };
        // });
    }
}