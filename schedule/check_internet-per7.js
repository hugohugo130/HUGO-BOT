let internet_broken = [false, null];

module.exports = {
    run: async function (client) {
        try {
            await fetch('https://api.ipify.org');
            if (internet_broken[0]) {
                const { chatting_channel_ID } = require('../config.json');
                const channel = client.channels.cache.get(chatting_channel_ID);
                await channel.send(`機器人網路連接於<t:${internet_broken[1]}> (<t:${internet_broken[1]}:R>)斷開，現已恢復`);
                internet_broken = [false, null];
            };
        } catch (error) {
            if (error.message.includes("fetch failed") && !internet_broken[0]) {
                internet_broken = [true, parseInt(Date.now() / 1000)];
            } else {
                require("../module_senderr").senderr({ client: client, msg: `檢查網路連接時出錯：${error.stack}`, clientready: true });
            };
        };
    },
};