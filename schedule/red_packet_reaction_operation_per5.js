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