let internet_broken = [false, null];

const checkUrls = [
    'https://api.ipify.org',
    'https://www.google.com',
    'https://www.cloudflare.com'
];

const timeout = 5000; // 5秒超時

module.exports = {
    run: async function (client) {
        const { time } = require("../../module_time.js");
        try {
            const results = await Promise.allSettled(
                checkUrls.map(url =>
                    fetch(url, {
                        method: 'HEAD',
                        timeout: timeout
                    })
                )
            );

            const isAnySuccess = results.some(result => result.status === 'fulfilled');

            if (isAnySuccess) {
                if (internet_broken[0]) {
                    const { chatting_channel_ID } = require('../../config.json');
                    const channel = client.channels.cache.get(chatting_channel_ID);
                    await channel.send(`機器人網路連接於 <t:${internet_broken[1]}:D><t:${internet_broken[1]}:T> (<t:${internet_broken[1]}:R>)斷開，現已恢復`);
                    console.log(`[${time()}] 已偵測到網絡斷開`);
                    internet_broken = [false, null];
                };
            } else {
                if (!internet_broken[0]) {
                    internet_broken = [true, Date.now() / 1000];
                };
            };
        } catch (error) {
            if (!internet_broken[0]) {
                require("../../module_senderr.js").senderr({
                    client: client,
                    msg: `檢查網路連接時出錯：${error.stack}`,
                    clientready: true
                });
            } else {
                console.log(`[${time()}] 已偵測到網絡斷開`);
            };
        };
    },
};