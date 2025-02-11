const schedule = require("node-schedule");
const { Events } = require("discord.js");
const fs = require('fs');
const path = require('path');

let run_lock = {} // 使用 run lock 來避免上次事件未完成，下次的事件也開始

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

            // 每5秒執行一次database_operations，特殊事件
            schedule.scheduleJob("*/5 * * * * *", async function () {
                if (run_lock['database_operations']) return;
                try {
                    run_lock['database_operations'] = true;
                    await require("../schedule/backup_database-2.js").run(client);
                    await require("../schedule/delete_require_cache-6.js").run(client);
                    await require("../schedule/delete_bot_database-5.js").run(client);
                } finally {
                    run_lock['database_operations'] = false;
                };
            });

            const skip_list = [
                "../schedule/giveaway_run-per6.js",
                "../schedule/red_packet_reaction_operation_per5.js",
                "../schedule/check_internet-7.js",
            ];

            const schedule_dir = path.join(__dirname, '../schedule');
            const schedule_js_list = fs.readdirSync(schedule_dir)
                .filter(file => file.endsWith('.js'))
                .map(file => `../schedule/${file}`);

            let schedules = schedule_js_list.filter(item => !skip_list.includes(item));

            client.schedules = schedules;

            for (const schedule of schedule_js_list) {
                run_lock[schedule] = false;
            };

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

                        if (run_lock[schedulename]) {
                            continue;
                        };

                        run_lock[schedulename] = true;

                        delete require.cache[require.resolve(schedulename)];
                        const schedule = require(schedulename);

                        if (schedule.run) {
                            await schedule.run(client);
                        };

                        if (schedule.run2) {
                            await schedule.run2(client);
                        };

                        if (schedule.run3) {
                            await schedule.run3(client);
                        };  
                    } catch (error) {
                        require("../module_senderr").senderr({ client: client, msg: `處理排程時出錯：${error.stack}`, clientready: true });
                    } finally {
                        run_lock[schedulename] = false;
                    };
                };
            });

            const { time } = require("../module_time.js");
            console.log(`[${time()}] 已加載${client.schedules.length}個排程`);
        });
    },
};
