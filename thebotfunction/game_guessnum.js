const { Events } = require("discord.js");

module.exports = {
    setup(client) {
        client.on(Events.MessageCreate, async (msg) => {
            const { load_db, save_db, end_guess_num_game } = require("../module_database.js");
            const { sleep } = require("../module_sleep");
            const db = load_db();
            const reference = msg.reference;
            const user = msg.author;

            if (!reference) return;

            const botId = client.user.id;
            const userId = user.id;

            // 優先檢查機器人的數據，如果沒有再檢查用戶的數據
            const gameUserId = db.guess_num[botId] ? botId : userId;

            if (!db.guess_num[gameUserId]) return;

            const min = db.guess_num[gameUserId].min;
            const max = db.guess_num[gameUserId].max;

            if (user.bot && gameUserId !== botId) return;

            const number = db.guess_num[gameUserId].number;
            const guess = db.guess_num[gameUserId].guess;
            if (!Number.isInteger(Number(msg.content))) return;
            const num = parseInt(msg.content, 10);
            if (num < min || num > max) return msg.reply(`請輸入一個在 ${min} 到 ${max} 之間的整數`);
            if (num === number) {
                msg.react("✅");
                if (min === max) {
                    await msg.reply(`哇!猜對了!`);
                    sleep(1000);
                    await msg.channel.send(`吶!看吧`);
                } else {
                    await msg.reply(`哇!猜對了!棒棒!`);
                };
                end_guess_num_game(gameUserId);
            } else {
                const toobig = num > number;
                const ez = num - 1 === number;
                if (ez && toobig) {
                    msg.reply(`猜大了，試試看小一點的數字吧....\n咦?下一個數字就是最大值了，那肯定就是${min}啦!`);
                } else {
                    msg.reply(`猜${toobig ? "大" : "小"}了，試試看${toobig ? "小" : "大"}一點的數字吧!`);
                };
                guess.push(num);
                save_db(db);
            };
        });
    },
};
