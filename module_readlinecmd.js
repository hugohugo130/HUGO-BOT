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
            require("./module_senderr").senderr({ client: client, msg: `處理readline時出錯：${error.stack}`, clientready: true });
        };
    },
};