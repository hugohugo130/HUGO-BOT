const { sethacoin } = require("../module_database.js");
const { loadredpacketData, saveredpacketData } = require("../thebotfunction/slashcmd_red_packet.js");


module.exports = {
    run: async function (client) {
        try {
            const { red_packet_Channel_ID } = require("../config.json");
            let data = loadredpacketData();
            if (!data.some(packet => packet.expiredts)) return;
            data.forEach(async (packet) => {
                if (Math.floor(Date.now() / 1000) >= packet.expiredts) {
                    sethacoin(packet.userid, packet.remainhacoin, true);
                    data = data.filter(p => p.messageID !== packet.messageID);
                    saveredpacketData(data);
                    let message = await (await client.channels.fetch(red_packet_Channel_ID)).messages.fetch(packet.messageID);
                    return await message.edit(`
## 紅包結束啦!
發起人: <@${packet.userid}>
已歸還 ${packet.remainhacoin} 哈狗幣到發起人
`);
                };
            });
        } catch (error) {
            require("../module_senderr.js").senderr({ client: client, msg: `處理紅包定期事件時出錯：${error.stack}`, clientready: true });
        };
    },
};