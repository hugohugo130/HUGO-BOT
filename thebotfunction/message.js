const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getVoiceConnection } = require('@discordjs/voice');

async function unlock_waiting_handler(lock_name) {
    await new Promise((resolve) => {
        const startTime = Date.now();
        const checkLock = () => {
            if (!lock[lock_name]) {
                resolve();
            } else if (Date.now() - startTime >= 20000) {
                console.warn(`等待${lock_name}解鎖超時，已進行操作(強制解鎖)`);
                resolve();
            } else {
                setTimeout(checkLock, 100);
            };
        };
        checkLock();
    });
};

function generateRandomEmoji(amount) {
    const emojis = [
        ':eyes:', // 內建表情符號
        '<:angry:1279090863879884901>', // 自訂表情符號
        '<:bruh:1261592422094475284>' // 自訂表情符號
    ];
    const result = [];
    for (let i = 0; i < amount; i++) {
        result.push(emojis[Math.floor(Math.random() * emojis.length)]);
    };
    return result;
};

function message_count_handler({ client, message, user }) {
    try {
        const { loadData, saveUserData } = require("../module_database.js");
        if (user.bot) return;
        let userid = user.id;
        let data = loadData(userid);

        data.message_count++;
        if (message.content.includes("e")) {
            data.count_for_e++;
        };

        saveUserData(userid, data);
    } catch (error) {
        require("../module_senderr").senderr({ client: client, msg: `處理訊息數量時出錯：${error.stack}`, clientready: true });
    };
};

async function level_exp_handler({ client, message, user }) {
    try {
        const { loadData, saveUserData } = require("../module_database.js");
        if (user.bot) return;
        const { level_channel_ID, exp_need, spam_free_channel_ID } = require("../config.json");
        if (message.channel.id === spam_free_channel_ID) return;
        let userid = user.id;

        let data = loadData(userid);

        let gotexp = Math.floor(Math.random() * 5) + 1; // 隨機增加1-5經驗值
        data.exp += gotexp;
        const channel = client.channels.cache.get(level_channel_ID);
        while (data.exp >= exp_need) {
            data.exp -= exp_need;
            data.level++;
            if (channel) {
                await channel.send({ content: `${user} 已達到 ${data.level} 級!`});
            };
        };
        saveUserData(userid, data);
    } catch (error) {
        require("../module_senderr").senderr({ client: client, msg: `處理等級經驗值時出錯：${error.stack}`, clientready: true });
    };
};

function BetterEval(obj) {
    return Function(`"use strict";return ${obj}`)();
};

async function message_command_handler({ client, message }) {
    try {
        if (message.author.bot) return;
        let msgcon = message.content.toLowerCase();
        if (!msgcon.startsWith("h!")) return;
        msgcon = msgcon.slice(2);
        let cmd = msgcon.split(" ")[0];
        // let commands = [
        //     "help",
        //     "calc",
        //     "ping",
        //     "c",
        //     "c set",
        //     "c set2",
        //     "pin",
        //     "unpin"
        // ];

        let help = {
            "h": "幫助 - 顯示此頁面",
            "help": "幫助 - 顯示此頁面",
            "calc <運算式>": "計算",
            "ping": "顯示延遲",
            "c": "顯示關於數數的資訊",
            "c set <數字>": "設定數數的數字",
            "c set2 <數字>": "設定數數的**最高**數字",
            "pin <訊息ID>": "釘選訊息",
            "unpin <訊息ID>": "取消釘選訊息",
            "vping": "顯示語音延遲",
            "ip": "顯示Minecraft伺服器IP"
        };

        let mathConstants = {
            e: Math.E,
            pi: Math.PI,
            sqrt2: Math.SQRT2,
            ln2: Math.LN2,
            ln10: Math.LN10,
            log2e: Math.LOG2E,
            log10e: Math.LOG10E
        };

        // if (!commands.includes(cmd)) return;
        if (cmd === "h" || cmd === "help") {
            let showhelp = '指令列表```\n';
            for (const [cmd, description] of Object.entries(help)) {
                showhelp += `h!${cmd}: ${description}\n`;
            };
            showhelp += '```';

            const embed = new EmbedBuilder()
                .setColor(0x00BBFF)
                .setDescription(showhelp);

            return message.reply({ embeds: [embed]});
        };

        if (cmd === "calc") {
            let expression = msgcon.slice(5).trim(); // 移除 "calc "
            let result;
            for (const [constant, value] of Object.entries(mathConstants)) {
                expression = expression.replace(new RegExp(`\\b${constant}\\b`, 'g'), value);
            };

            try {
                result = BetterEval(expression);
                result = `${expression} = ${result}`;
            } catch (error) {
                result = ":x: 計算失敗。";
            };

            if (!result && result != 0) {
                result = ":x: 計算失敗。";
            };


            const embed = new EmbedBuilder()
                // .setColor(0x00BBFF)
                .setColor(0x8965D6)
                .setDescription(`\`\`\`${result}\`\`\``);

            return message.reply({ embeds: [embed]});
        };

        if (cmd === "ping") {
            const start = Date.now(); // 記錄開始時間  
            const msg = await message.channel.send('Pinging...'); // 發送消息  
            const end = Date.now(); // 記錄結束時間  
            const ping = end - start; // 計算延遲
            const embed = new EmbedBuilder()
                .setColor(0x00BBFF)
                .addFields(
                    { name: '🔗 API延遲', value: `${client.ws.ping}ms` },
                    { name: '🌐 Global 全域延遲', value: `${ping}ms` }
                );
            return msg.edit({ content: "Pong!", embeds: [embed]});
        };

        if (cmd === "c") {
            if (msgcon.split(" ").length == 1 || msgcon.split(" ")[1] != "set" && msgcon.split(" ")[1] != "set2") {
                const num = JSON.parse(require('fs').readFileSync('./db.json', 'utf8')).counting_num;
                const highest = JSON.parse(require('fs').readFileSync('./db.json', 'utf8')).counting_highest;
                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setDescription(`
目前數字： **${num}**
最高數字： **${highest}**
`);
                return message.reply({ embeds: [embed]});
            } else if (msgcon.split(" ")[1] == "set") {
                const { loadData } = require("../module_database.js");
                if (!loadData(message.author.id).admin) return message.reply("您不是機器人管理員。無法使用此指令。");

                const num = parseInt(msgcon.split(" ")[2]);
                if (!num) return message.reply({ content: `請輸入數字`});
                let db = JSON.parse(require('fs').readFileSync('./db.json', 'utf8'));
                const oldnum = db.counting_num;
                let highest = db.counting_highest;

                if (num >= highest) {
                    db.counting_highest = num;
                    highest = num;
                };

                db.counting_num = num;
                require('fs').writeFileSync('./db.json', JSON.stringify(db, null, 2));

                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setDescription(`
設定成功!
目前數字： **${oldnum}** -> **${num}**
最高數字： **${highest}**
`);
                return message.reply({ embeds: [embed]});
            } else if (msgcon.split(" ")[1] == "set2") {
                const { loadData } = require("../module_database.js");
                if (!loadData(message.author.id).admin) return message.reply("您不是機器人管理員。無法使用此指令。");

                const num = parseInt(msgcon.split(" ")[2]);
                if (!num) return message.reply({ content: `請輸入數字`});
                let db = JSON.parse(require('fs').readFileSync('./db.json', 'utf8'));
                const oldnum = db.counting_highest;
                db.counting_highest = num;
                require('fs').writeFileSync('./db.json', JSON.stringify(db, null, 2));

                const embed = new EmbedBuilder()
                    .setColor(0x00BBFF)
                    .setDescription(`
設定成功!
目前數字： **${db.counting_num}**
最高數字： **${oldnum}** -> **${num}**
`);
                return message.reply({ embeds: [embed]});
            };
        };

        if (cmd === "pin") {
            const { loadData } = require("../module_database.js");
            if (!loadData(message.author.id).admin) return message.reply("您不是機器人管理員。無法使用此指令。");

            const messageID = msgcon.split(" ")[1];
            const guild = message.guild;
            if (!guild) return;
            const channel = message.channel;
            const msg = await channel.messages.fetch(messageID);
            if (msg) {
                await msg.pin();
                return message.reply({ content: `已釘選訊息: ${msg.url}`});
            };
            return message.reply({ content: `找不到訊息，你是不是跨頻道了？: ${messageID}`});
        };

        if (cmd === "unpin") {
            const { loadData } = require("../module_database.js");
            if (!loadData(message.author.id).admin) return message.reply("您不是機器人管理員。無法使用此指令。");

            const messageID = msgcon.split(" ")[1];
            const guild = message.guild;
            if (!guild) return;
            const channel = message.channel;
            const msg = await channel.messages.fetch(messageID);
            if (msg) {
                await msg.unpin();
                return message.reply({ content: `已取消釘選訊息: ${msg.url}`});
            };
            return message.reply({ content: `找不到訊息，你是不是跨頻道了？: ${messageID}`});
        };

        if (cmd === "vping") {
            const connection = getVoiceConnection(message.guild.id);
            if (!connection) return message.reply({ content: `機器人不在語音頻道`});

            const embed = new EmbedBuilder()
                .setColor(0x00BBFF)
                .addFields(
                    { name: 'WebSocket 語音延遲', value: `${connection.ping.ws || "無"}ms` },
                    { name: 'UDP 語音延遲', value: `${connection.ping.udp || "無"}ms` }
                );
            return message.reply({ embeds: [embed]});
        };

        if (cmd === "ip") {
            return message.reply({ content: `\`mc.yanpl.com:25105\``});
        };
    } catch (error) {
        require("../module_senderr").senderr({ client: client, msg: `處理訊息指令時出錯：${error.stack}`, clientready: true });
    };
};

let lock = {
    message_count_handler: false,
    level_exp_handler: false,
    message_command_handler: false,
};

module.exports = {
    setup(client) {
        // 計算訊息數量
        client.on(Events.MessageCreate, async (message) => {
            try {
                if (lock.message_count_handler) {
                    await unlock_waiting_handler("message_count_handler");
                };
                lock.message_count_handler = true;
                message_count_handler({ client: client, message: message, user: message.author });
            } finally {
                lock.message_count_handler = false;
            };
        });



        // 等級, 經驗值
        client.on(Events.MessageCreate, async (message) => {
            try {
                if (lock.level_exp_handler) {
                    await unlock_waiting_handler("level_exp_handler");
                };
                lock.level_exp_handler = true;
                await level_exp_handler({ client: client, message: message, user: message.author });
            } finally {
                lock.level_exp_handler = false;
            };
        });


        // 訊息指令
        client.on(Events.MessageCreate, async (message) => {
            try {
                if (lock.message_command_handler) {
                    await unlock_waiting_handler("message_command_handler");
                };
                lock.message_command_handler = true;
                await message_command_handler({ client: client, message: message });
            } finally {
                lock.message_command_handler = false;
            };
        });

        // 訊息回應
        client.on(Events.MessageCreate, async (message) => {
            if (message.author.bot) return;
            const channel = message.channel;
            const content = message.content.toLowerCase().trim();

            // if (content === "." && message.author.id === "1197913368519004191") {
            //     const randomEmoji = generateRandomEmoji(Math.floor(Math.random() * 3) + 2); // 2~4個
            //     return message.reply(`<@1197913368519004191> 點什麼點 ${randomEmoji.join(" ")}`);
            // };

            if (
                content === "暗夜" ||
                content === "風暴" ||
                content === "風暴." ||
                content === "袋子" ||
                content === "darknight" ||
                content === "daiz" ||
                content === "daiz01"
            ) {
                return channel.send("大佬!!我非常肯定!他是!大佬!!!");
            };
        });
    },
};