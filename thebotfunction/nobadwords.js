const { Events } = require("discord.js");

const badwordsUrl = 'https://pastebin.com/raw/rXiyHz9Y';
async function fetchBadwords() {
    try {
        const response = await fetch(badwordsUrl);
        const data = await response.text();
        return data.split(',');
    } catch (error) {
        const { time } = require("../module_time.js");
        console.error(`[${time()}] 無法獲取不當詞列表:`, error);
        return null;
    };
};

let badwords;
let simple_badwords = ["幹"]

module.exports = {
    setup(client) {
        try {
            client.once(Events.ClientReady, async () => {
                badwords = await fetchBadwords();
            });
            client.on(Events.MessageCreate, async (message) => {
                if (!badwords) return;
                const content = message.content.toLowerCase();
                const author = message.author;
                const channel = message.channel;
                const badword_regex = new RegExp(badwords.join("|"), "gi");
                const simple_badword_regex = new RegExp(simple_badwords.join("|"), "gi");
                if (
                    (
                        badword_regex.test(content)
                        && !simple_badword_regex.test(content)
                    ) || simple_badwords.includes(content)
                ) {
                    await message.react("🚨");
                    return channel.send(`${author} 疑似發送不當的言論!`);
                };
            });
        } catch (error) {
            const { time } = require("../module_time.js");
            console.error(`[${time()}] 處理不當詞事件時出錯：`, error);
            const { chatting_channel_ID, HugoUserID } = require("../config.json");
            client.channels.cache.get(chatting_channel_ID).send(`[${time()}] 處理不當詞事件時出錯：${error}\n<@${HugoUserID}>`);
            client.users.send(HugoUserID, `[${time()}] 處理不當詞事件時出錯：${error}`);
        };
    },
};
