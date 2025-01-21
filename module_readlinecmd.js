let stopping = false;

module.exports = {
    setup() { },
    rlcmd(client, input) {
        try {
            console.log("----------");
            if (input === "stop" && !stopping) {
                stopping = true;
                const { stop_send_msg } = require("./module_bot_start_stop.js");
                stop_send_msg(client);
            };
        } catch (error) {
            const { time } = require("./module_time.js");
            console.error(`[${time()}] 處理readline時出錯：`, error);
            const { chatting_channel_ID, HugoUserID } = require("./config.json");
            client.channels.cache.get(chatting_channel_ID).send(`[${time()}] 處理readline時出錯：${error}\n<@${HugoUserID}>`);
            client.users.send(HugoUserID, `[${time()}] 處理readline時出錯：${error}`);
        };
    },
};