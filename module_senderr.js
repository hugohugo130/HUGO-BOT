function senderr({ client, msg, clientready, channel = 1 }) {
    if (msg == undefined) {
        // 發送錯誤然後使用錯誤的stack來找出是哪裡發送了空發送訊息
        const error = new Error();
        const stack = error.stack.split("\n");
        console.log(`undefined message called from: ${stack[2]}`);
        return;
    };
    const { HugoUserID, err_channel_ID, err2_channel_ID } = require("./config.json");
    const { time } = require("./module_time.js");
    console.error(`[${time()}] ${msg}`);
    if (clientready && client) {
        client.channels.cache.get(channel == 1 ? err_channel_ID : err2_channel_ID).send(`[${time()}] ${msg}`).then(message => {
            client.users.send(HugoUserID, `[${time()}] ${msg}: ${message.url}`);
        });
    };
};

module.exports = {
    senderr,
};
