function senderr({ client, msg, clientready, channel = 1 }) {
    if (msg == undefined) {
        const error = new Error();
        const stack = error.stack.split("\n");
        process.emitWarning(`undefined message called from: ${stack[2]}`, {
            code: 'UNDEFINED_MSG',
            detail: '訊息未定義'
        });
        return;
    };
    const { HugoUserID, err_channel_ID, err2_channel_ID } = require("./config.json");
    const { time } = require("./module_time.js");
    if (msg.stack) {
        process.emitWarning(`調用senderr函數的地方傳送參數msg為error而不是error.stack`, {
            code: 'WRONG_PARAMETER',
            detail: '應該使用 error.stack 而不是 error 物件'
        });
        return;
    };
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