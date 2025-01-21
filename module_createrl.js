module.exports = {
    getrl() {
        try {
            const readline = require("readline");
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            return rl;
        } catch (error) {
            const { time } = require("./module_time.js");
            console.error(`[${time()}] 建立readline時出錯：`, error);
            process.exit(1);
        };
    },
};