const { Events, MessageFlags } = require("discord.js");
const fs = require("fs");

function loadredpacketData() {
    const { redpacketfilename } = require("../config.json");
    if (fs.existsSync(redpacketfilename)) {
        const rawData = fs.readFileSync(redpacketfilename);
        return JSON.parse(rawData);
    } else {
        return [];
    };
};

function saveredpacketData(data) {
    const { redpacketfilename } = require("../config.json");
    data = JSON.stringify(data, null, 2);
    fs.writeFileSync(redpacketfilename, data);
};

module.exports = {
    loadredpacketData,
    saveredpacketData,
    setup(client) {
        try {
            let redpacketgotmember = [];

            client.on(Events.InteractionCreate, async (interaction) => {
                const { loadData, sethacoin } = require("../module_database.js");
                if (!interaction.isChatInputCommand()) return;
                if (interaction.commandName != "紅包" && interaction.commandName != "結束紅包") return;
                const { red_packet_Channel_ID } = require("../config.json");
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                let redpacketdata = loadredpacketData();
                if (interaction.commandName == "結束紅包") {
                    if (!loadData()[interaction.user.id].admin) return await interaction.editReply("你不是機器人管理員! (機器人每1分鐘刷新一次)");
                    const packet = loadredpacketData().find(packet => packet.messageID == interaction.options.getString("訊息id"));
                    if (!packet) return await interaction.editReply("沒有紅包!");
                    let redpacketUserID = packet.userid;
                    let redpacketremain = packet.remainhacoin;
                    let redpacketMessageID = packet.messageID;
                    sethacoin(redpacketUserID, redpacketremain, true);
                    let channel = await client.channels.fetch(red_packet_Channel_ID);
                    let message = await channel.messages.fetch(redpacketMessageID);
                    await message.edit("紅包已被管理員結束!");
                    redpacketdata = redpacketdata.filter(packet => packet.messageID !== redpacketMessageID);
                    saveredpacketData(redpacketdata);
                    return await interaction.editReply("已結束紅包!");
                };
                let amount = interaction.options.getNumber("數量");
                let packets = interaction.options.getInteger("封");
                let redpacketexpire = interaction.options.getString("時間");
                let formatcorrect = /^(\d+[mhdw])$/.test(redpacketexpire);
                if (!formatcorrect) return await interaction.editReply("格式錯誤, 參考例子:1d, 不能使用疊加:1w2d3h4m");
                multiples = {
                    "m": 60,
                    "h": 60 * 60,
                    "d": 24 * 60 * 60,
                    "w": 7 * 24 * 60 * 60
                };
                ["m", "h", "d", "w"].every(key => {
                    let newredpacketexpire = redpacketexpire.replace(new RegExp(key, 'g'), "");
                    if (newredpacketexpire != redpacketexpire) {
                        redpacketexpire = parseInt(newredpacketexpire) * multiples[key];
                        return false;
                    };
                    return true;
                });
                if (redpacketexpire < 60) return await interaction.editReply("紅包過期時間不能少於1分鐘!");
                if (redpacketexpire > 10 * 12 * 30 * 24 * 60 * 60) return await interaction.editReply("過期時間超過10年是怎樣啦...");
                if (redpacketexpire > 6 * 30 * 24 * 60 * 60) return await interaction.editReply("紅包過期時間不能超過6個月!");
                let expiredts = Math.floor(Date.now() / 1000) + redpacketexpire;
                let user = interaction.user;
                let userid = user.id;
                if (amount <= 0) return await interaction.editReply(`紅包要有多少?...${amount}哈狗幣?蛤?`);
                if (packets <= 0) return await interaction.editReply(`紅包要有多少封?...${packets}封?蛤?`);
                let data = loadData(userid);
                if (data.hacoin < amount) {
                    return await interaction.editReply(`你沒有足夠的哈狗幣, 你只有${data.hacoin}哈狗幣`);
                };
                sethacoin(userid, -amount, true);
                let redpacketUserID = userid;
                let redpacketremain = amount;
                let redpacketAmount = amount;
                let redpacketsAmount = packets;
                let qmsg = `
# 搶紅包啦!!
發起人: <@${userid}>
共 ${amount} 哈狗幣
點擊🎉反應，搶紅包!
0人 已領取 / ${packets}
剩餘時間: <t:${expiredts}:R>
            `;
                const channel = await client.channels.cache.get(red_packet_Channel_ID);
                const message = await channel.send({ content: qmsg, allowedMentions: { repliedUser: false } });
                await message.react("🎉");


                let redpacketMessageID = message.id;
                redpacketdata.push({
                    userid: redpacketUserID,
                    expiredts: expiredts,
                    hacoin: redpacketAmount,
                    gotmember: redpacketgotmember,
                    packets: redpacketsAmount,
                    remainhacoin: redpacketremain,
                    messageID: redpacketMessageID
                });

                saveredpacketData(redpacketdata);
                await interaction.editReply(`已成功發起紅包: ${message.url}`);
            });
        } catch (error) {
            require("../module_senderr").senderr({ client: client, msg: `處理紅包事件時出錯：${error.stack}`, clientready: true });
        };

        try {
            client.on(Events.MessageReactionAdd, async (reaction, user) => {
                const { sethacoin } = require("../module_database.js");
                const { randomDecimal } = require("../module_getrandomhacoin.js");
                const { red_packet_Channel_ID, red_packet_min } = require("../config.json");
                let redpacketdata = loadredpacketData(); // 讀取紅包數據
                let isredpacketIng = redpacketdata.length > 0;
                if (!isredpacketIng) return; // 如果不在進行紅包，則返回
                if (user.bot) return;
                const message = reaction.message;
                const packet = redpacketdata.find(packet => packet.messageID === message.id);
                if (!packet) return;
                const channel = message.channel;
                const redpacketgotmember = packet.gotmember;
                if (channel.id != red_packet_Channel_ID) return; // 如果消息不在紅包頻道，則返回
                if (reaction.emoji.name != "🎉") return; // 如果反應不是🎉，則返回
                if (redpacketgotmember.includes(user.id)) return; // 如果用戶已經領取過紅包，則返回

                // 確保剩餘的哈狗幣數量足夠分配
                let redpacketremain = packet.remainhacoin; // 剩餘的哈狗幣數量
                let redpacketAmount = packet.hacoin; // 紅包總數量
                let redpacketsAmount = packet.packets; // 紅包封數量
                let redpacketUserID = packet.userid; // 發起人ID
                let expiredts = packet.expiredts; // 紅包結束timestamp
                let maxpackethacoin = redpacketremain / 2; // 每個紅包的最大哈狗幣數量
                if (Math.floor(Date.now() / 1000) >= expiredts) { // 如果紅包已經結束
                    sethacoin(redpacketUserID, redpacketremain, true); // 將剩餘的哈狗幣歸還給發起人
                    redpacketdata = redpacketdata.filter(packet => packet.expiredts !== expiredts);
                    saveredpacketData(redpacketdata); // 清空紅包數據
                    await message.edit(`
## 紅包結束啦!
發起人: <@${redpacketUserID}>
已歸還 ${redpacketremain} 哈狗幣到發起人
`);
                    return;
                };

                let gothacoin = randomDecimal(red_packet_min, maxpackethacoin); // 隨機分配哈狗幣
                if (redpacketgotmember.length == redpacketsAmount - 1) { // 如果是最後一個紅包
                    gothacoin = redpacketremain; // 最後一個紅包獲得剩餘的所有哈狗幣
                };

                redpacketremain -= gothacoin; // 減去已分配的哈狗幣
                redpacketgotmember.push(user.id); // 將用戶ID加入已領取列表
                redpacketdata = redpacketdata.map(packet => {
                    if (packet.expiredts === expiredts) {
                        return {
                            ...packet,
                            gotmember: redpacketgotmember,
                            remainhacoin: redpacketremain,
                        };
                    }
                    return packet;
                });
                saveredpacketData(redpacketdata); // 保存紅包數據
                sethacoin(user.id, gothacoin, true); // 給用戶分配哈狗幣
                await message.reply({ content: `${user.toString()} 獲得了 ${gothacoin} 哈狗幣!`, allowedMentions: { repliedUser: false } });
                let qmsg = `
# 搶紅包啦!!
發起人: <@${redpacketUserID}>
共 ${redpacketAmount} 哈狗幣
點擊🎉反應，搶紅包!
${redpacketgotmember.length} 人已領取 / ${redpacketsAmount}
剩餘時間: <t:${expiredts}:R>
`;
                await message.edit(qmsg); // 更新消息
                if (redpacketgotmember.length == redpacketsAmount && isredpacketIng) { // 如果紅包被領完
                    sethacoin(redpacketUserID, redpacketremain, true); // 將剩餘的哈狗幣歸還給發起人
                    redpacketdata = redpacketdata.filter(packet => packet.expiredts !== expiredts);
                    saveredpacketData(redpacketdata); // 清空紅包數據
                    let redpacketgotmembers = []
                    for (let i = 0; i < redpacketgotmember.length; i++) {
                        let member = await client.users.fetch(redpacketgotmember[i]);
                        redpacketgotmembers.push(`<@${member.id}>`);
                    };
                    await message.edit(`
## 紅包被領完啦!
共${redpacketAmount}哈狗幣
由<@${redpacketUserID}>發出
${redpacketgotmembers.length > 5 ? `${redpacketgotmembers.length}人` : `${redpacketgotmembers.join(",")}`}領取了紅包
`);
                };
            });
        } catch (error) {
            require("../module_senderr.js").senderr({ client: client, msg: `處理紅包反應事件時出錯：${error.stack}`, clientready: true });
        };
    },
};