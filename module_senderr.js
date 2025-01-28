function senderr({ client, msg, clientready, channel = 1 }) {
    if (msg == undefined) {
        const error = new Error();
        const stack = error.stack.split("\n");
        console.log(`undefined message called from: ${stack[2]}`);
        return;
    };
    const { HugoUserID, err_channel_ID, err2_channel_ID } = require("./config.json");
    const { time } = require("./module_time.js");
    console.error(`[${time()}] ${msg}`);
    if (!msg.includes("\`\`\`")) {
        msg = "\`\`\`" + msg + "\`\`\`"
    };
    msg = msg.replace(/：/g, "：\n"); // 在冒號後面加入\n換行
    if (clientready && client) {
        client.channels.cache.get(channel == 1 ? err_channel_ID : err2_channel_ID).send(`[${time()}] ${msg}`).then(message => {
            client.users.send(HugoUserID, `[${time()}] ${msg}: ${message.url}`);
        });
    };
};

module.exports = {
    senderr,
};
