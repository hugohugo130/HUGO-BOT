// const { Events } = require("discord.js");
// const { randomDecimal } = require("../module_getrandomhacoin.js");
// const { sethacoin } = require("../module_database.js");
// const schedule = require("node-schedule");
// const fs = require("fs");

// function loadredpacketData() {
//     const { redpacketfilename } = require("../config.json");
//     if (fs.existsSync(redpacketfilename)) {
//         const rawData = fs.readFileSync(redpacketfilename);
//         return JSON.parse(rawData);
//     } else {
//         return {};
//     };
// };

// function saveredpacketData(data) {
//     const { redpacketfilename } = require("../config.json");
//     data = JSON.stringify(data, null, 2);
//     fs.writeFileSync(redpacketfilename, data);
// };

// module.exports = {
//     setup(client) {
//         try {
//             client.on(Events.MessageReactionAdd, async (reaction, user) => {
//                 const { red_packet_Channel_ID, red_packet_min } = require("../config.json");
//                 let redpacketdata = loadredpacketData(); // 讀取紅包數據
//                 let isredpacketIng = Boolean(redpacketdata.expiredts); // 是否正在進行紅包
//                 if (!isredpacketIng) return; // 如果不在進行紅包，則返回
//                 let message = reaction.message;
//                 let channel = message.channel;
//                 let redpacketgotmember = redpacketdata.gotmember;
//                 if (channel.id != red_packet_Channel_ID) return; // 如果消息不在紅包頻道，則返回
//                 if (user.bot) return; // 如果用戶是機器人，則返回
//                 if (reaction.emoji.name != "🎉") return; // 如果反應不是🎉，則返回
//                 if (redpacketgotmember.includes(user.id)) return; // 如果用戶已經領取過紅包，則返回

//                 // 確保剩餘的哈狗幣數量足夠分配
//                 let redpacketremain = redpacketdata.remainhacoin; // 剩餘的哈狗幣數量
//                 let redpacketAmount = redpacketdata.hacoin; // 紅包總數量
//                 let redpacketsAmount = redpacketdata.packets; // 紅包封數量
//                 let redpacketUserID = redpacketdata.userid; // 發起人ID
//                 let expiredts = redpacketdata.expiredts; // 紅包結束timestamp
//                 let maxpackethacoin = redpacketremain / 2; // 每個紅包的最大哈狗幣數量
//                 if (Math.floor(Date.now() / 1000) >= expiredts) { // 如果紅包已經結束
//                     sethacoin(redpacketUserID, redpacketremain, true); // 將剩餘的哈狗幣歸還給發起人
//                     saveredpacketData({}); // 清空紅包數據
//                     message.edit(`
// ## 紅包結束啦!
// 發起人: <@${redpacketUserID}>
// 已歸還 ${redpacketremain} 哈狗幣到發起人
// `);
//                     return;
//                 };

//                 let gothacoin = randomDecimal(red_packet_min, maxpackethacoin); // 隨機分配哈狗幣
//                 if (redpacketgotmember.length == redpacketsAmount - 1) { // 如果是最後一個紅包
//                     gothacoin = redpacketremain; // 最後一個紅包獲得剩餘的所有哈狗幣
//                 };

//                 redpacketremain -= gothacoin; // 減去已分配的哈狗幣
//                 redpacketgotmember.push(user.id); // 將用戶ID加入已領取列表
//                 saveredpacketData({ // 保存紅包數據
//                     ...redpacketdata,
//                     gotmember: redpacketgotmember,
//                     remainhacoin: redpacketremain,
//                 });
//                 sethacoin(user.id, gothacoin, true); // 給用戶分配哈狗幣
//                 channel.send(`${user.globalName || user.username} 獲得了 ${gothacoin} 哈狗幣!`); // 發送消息
//                 let qmsg = `
// # 搶紅包啦!!
// 發起人: <@${redpacketUserID}>
// 共 ${redpacketAmount} 哈狗幣
// 點擊🎉反應，搶紅包!
// ${redpacketgotmember.length} 人已領取 / ${redpacketsAmount}
// 剩餘時間: <t:${expiredts}:R>
// `;
//                 message.edit(qmsg); // 更新消息
//                 if (redpacketgotmember.length == redpacketsAmount && isredpacketIng) { // 如果紅包被領完
//                     sethacoin(redpacketUserID, redpacketremain, true); // 將剩餘的哈狗幣歸還給發起人
//                     saveredpacketData({}); // 清空紅包數據
//                     message.edit(`
// ## 紅包被領完啦!
// 共${redpacketAmount}哈狗幣
// 由<@${redpacketUserID}>發出
// ${redpacketgotmember.length > 5 ? `${redpacketgotmember.length}人` : `${redpacketgotmember.join(",")}`}領取了紅包
// `);
//                 };
//             });
//             client.on(Events.ClientReady, async () => {
//                 /*
//                 schedule.scheduleJob('* * * * * *', function(){
//                 });
//                 second (0 - 59, OPTIONAL)
//                 minute (0 - 59)
//                 hour (0 - 23)
//                 day of month (1 - 31)
//                 month (1 - 12)
//                 day of week (0 - 7) (0 or 7 is Sun)
//                 */
//                 schedule.scheduleJob("*/5 * * * * *", async function () {
//                     const { red_packet_Channel_ID } = require("../config.json");
//                     let data = loadredpacketData();
//                     if (!data.expiredts) return;
//                     let redpacketMessageID = data.messageID;
//                     let expiredts = data.expiredts;
//                     let redpacketUserID = data.userid;
//                     let redpacketremain = data.remainhacoin;
//                     if (Math.floor(Date.now() / 1000) >= expiredts) {
//                         sethacoin(redpacketUserID, redpacketremain, true);
//                         saveredpacketData({});
//                         let message = await (await client.channels.fetch(red_packet_Channel_ID)).messages.fetch(redpacketMessageID);
//                         return await message.edit(`
// ## 紅包結束啦!
// 發起人: <@${redpacketUserID}>
// 已歸還 ${redpacketremain} 哈狗幣到發起人
// `);
//                     };
//                 });
//             });
//         } catch (error) {
//             let datetime = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '); // 取得當前時間
//             console.error(`[${datetime}] 處理紅包事件時出錯：`, error);
//             const { chatting_channel_ID, HugoUserID } = require("../config.json");
//             client.channels.cache.get(chatting_channel_ID).send(`[${datetime}] 處理紅包事件時出錯：${error}\n<@${HugoUserID}>`);
//             client.users.send(HugoUserID, `[${datetime}] 處理紅包事件時出錯：${error}`);
//         };
//     },
// };
const { Events } = require("discord.js");
const { randomDecimal } = require("../module_getrandomhacoin.js");
const { sethacoin } = require("../module_database.js");
const fs = require("fs");

function loadredpacketData() {
    const { redpacketfilename } = require("../config.json");
    if (fs.existsSync(redpacketfilename)) {
        const rawData = fs.readFileSync(redpacketfilename);
        return JSON.parse(rawData);
    } else {
        return {};
    };
};

function saveredpacketData(data) {
    const { redpacketfilename } = require("../config.json");
    data = JSON.stringify(data, null, 2);
    fs.writeFileSync(redpacketfilename, data);
};

module.exports = {
    run: async function (client) {
        try {
            const { red_packet_Channel_ID } = require("../config.json");
            let data = loadredpacketData();
            if (!data.expiredts) return;
            let redpacketMessageID = data.messageID;
            let expiredts = data.expiredts;
            let redpacketUserID = data.userid;
            let redpacketremain = data.remainhacoin;
            if (Math.floor(Date.now() / 1000) >= expiredts) {
                sethacoin(redpacketUserID, redpacketremain, true);
                saveredpacketData({});
                let message = await (await client.channels.fetch(red_packet_Channel_ID)).messages.fetch(redpacketMessageID);
                return await message.edit(`
## 紅包結束啦!
發起人: <@${redpacketUserID}>
已歸還 ${redpacketremain} 哈狗幣到發起人
`);
            };
        } catch (error) {
            require("../module_senderr.js").senderr({ client: client, msg: `處理紅包定期事件時出錯：${error.stack}`, clientready: true });
        };
    },
};