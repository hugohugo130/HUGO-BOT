const { Events, WebhookClient } = require("discord.js");
const fs = require("fs");

module.exports = {
    setup(client) {
        client.on(Events.MessageCreate, async (message) => {
            const { counting_channel_ID } = require("../config.json");
            try {
                if (message.author.bot || message.channel.id !== counting_channel_ID) return;
                if (!/^\d+$/.test(message.content.split(" ")[0])) return message.react("🇪");

                let db = JSON.parse(fs.readFileSync("./db.json", "utf8"));
                const messageContent = message.content.split(" ")[0];
                const countingInteger = parseInt(messageContent, 10);
                if (countingInteger !== db.counting_num + 1) {
                    if (countingInteger != 6) {
                        message.reply({ content: `數錯了! 正確數字是：${db.counting_num + 1}，數字沒有重設。`, allowedMentions: { repliedUser: false } });
                        return message.react("❌");
                    };
                };

                db.counting_num = countingInteger;
                let higher = false;
                if (countingInteger > db.counting_highest) {
                    db.counting_highest = countingInteger;
                    higher = true;
                };

                fs.writeFileSync('./db.json', JSON.stringify(db, null, 2));

                const { beta } = require("../config.json");
                if (!higher) return message.react("✅");
                else if (beta) return message.react("☑️");
                else return message.react("<:good:1238854252282122372>");
                // if (!higher) {
                //     return message.react("✅");
                // } else {
                //     if (beta) {
                //         return message.react("☑️");
                //     } else {
                //         return message.react("<:good:1238854252282122372>");
                //     };
                // };
            } catch (error) {
                require("../module_senderr.js").senderr({ client: client, msg: `處理數數訊息時出錯：${error.stack}`, clientready: true });
            }
        });
        client.on(Events.MessageDelete, async (msg) => {
            const { counting_channel_ID, beta, beta_webhook_url, main_webhook_url } = require("../config.json");
            if (msg.channel.id !== counting_channel_ID) return;
            if (msg.author.bot) return;
            if (!/^\d+$/.test(msg.content.split(" ")[0])) return;

            // const webhook = new WebhookClient({ url: "https://discord.com/api/webhooks/1310960260680515634/7h-fpo065VUJC1YebFD1VGPRagkoNaRnPbc0HtGevs9GAUy5UxAAAuRmmRyDzSdYeUUE" });
            let db = JSON.parse(fs.readFileSync("./db.json", "utf8"));
            const webhook = new WebhookClient({ url: beta ? beta_webhook_url : main_webhook_url });
            const counting_num = parseInt(msg.content.split(" ")[0], 10);
            await webhook.send({ content: `
${msg.author.toString()} 刪除了${counting_num === db.counting_num ? "新的" : "舊的"}數字 ${counting_num}!
目前的數字是 ${db.counting_num}!
下一個數字是 ${db.counting_num + 1}!
`});
        });

        client.on(Events.ClientReady, async () => {
            const { counting_channel_ID, beta } = require("../config.json");
            const { load_db, save_db } = require("../module_database.js");
            const channel = client.channels.cache.get(counting_channel_ID);
            if (!channel) return;
            let messages = await channel.messages.fetch({ limit: 100 });

            messages = Array.from(messages
                .filter(msg => !msg.author.bot) // 過濾掉機器人
                .filter(msg => /^\d+$/.test(msg.content.split(" ")[0])) // 過濾掉非數字
                .filter(msg => !msg.reactions.cache.find(reaction =>
                    reaction.users.cache.has(client.user.id)
                )) // 過濾掉機器人已反應過的訊息
                .values())
                .reverse();

            if (messages.length === 0) return;

            let db = load_db();

            const msg = await channel.send(`機器人已恢復運作，正在處理之前未處理的${messages.length}則訊息`);

            for (const msg of messages) {
                const counting_num = parseInt(msg.content.split(" ")[0], 10);

                if (counting_num !== db.counting_num + 1) {
                    await msg.react("❌");
                    continue;
                };

                db.counting_num = counting_num;

                if (counting_num > db.counting_highest) {
                    db.counting_highest = counting_num;
                    await msg.react(beta ? "☑️" : "<:good:1238854252282122372>");
                    continue;
                };

                await msg.react("✅");
            };

            save_db(db);
            await msg.edit(`機器人已恢復運作並處理了之前未處理的${messages.length}則訊息\n目前數字：${db.counting_num}\n最高數字：${db.counting_highest}`);
        });
    },
};