const schedule = require("node-schedule");
const { Events } = require("discord.js");

module.exports = {
    setup(client) {
        client.on(Events.ClientReady, async () => {
            // 每5秒檢查一次紅包，特殊事件
            schedule.scheduleJob("*/5 * * * * *", async function () {
                await require("../schedule/red_packet_reaction_operation_per5.js").run(client);
            });
            // 每6秒執行一次giveaway，特殊事件
            schedule.scheduleJob("*/6 * * * * *", async function () {
                await require("../schedule/giveaway_run-per6.js").run(client);
            });
            // 每7秒執行一次check_internet，特殊事件
            schedule.scheduleJob("*/7 * * * * *", async function () {
                await require("../schedule/check_internet-per7.js").run(client);
            });

            const skip_list = [
                "../schedule/giveaway_run-per6.js",
                "../schedule/red_packet_reaction_operation_per5.js",
                "../schedule/check_internet-7.js",
            ];

            const fs = require('fs');
            const path = require('path');
            
            const schedule_dir = path.join(__dirname, '../schedule');
            const schedule_js_list = fs.readdirSync(schedule_dir)
                .filter(file => file.endsWith('.js'))
                .map(file => `../schedule/${file}`);

            let schedules = schedule_js_list.filter(item => !skip_list.includes(item));

            client.schedules = schedules;

            /*
            schedule.scheduleJob('* * * * * *', function(){
            });
            second (0 - 59, OPTIONAL)
            minute (0 - 59)
            hour (0 - 23)
            day of month (1 - 31)
            month (1 - 12)
            day of week (0 - 7) (0 or 7 is Sun)
            */
            schedule.scheduleJob("0 * * * * *", async function () {
                // 順序執行一般事件
                for (const schedulename of schedules) {
                    try {
                        const schedule = require(schedulename);

                        await schedule.run(client);

                        if (schedule.run2) {
                            await schedule.run2(client);
                        };

                        if (schedule.run3) {
                            await schedule.run3(client);
                        };
                    } catch (error) {
                        require("../module_senderr").senderr({ client: client, msg: `處理排程時出錯：${error.stack}`, clientready: true });
                    };
                };
            });

            const { time } = require("../module_time.js");
            console.log(`[${time()}] 已加載${client.schedules.length}個排程`);
        });
    },
};
