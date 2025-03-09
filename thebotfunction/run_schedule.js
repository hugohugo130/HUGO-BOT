const schedule = require("node-schedule");
const { Events } = require("discord.js");
const fs = require('fs');
const path = require('path');

let run_lock = false // 使用 run lock 來避免上次事件未完成，下次的事件也開始
let run_lock_specials = {} // 使用 run lock 來避免上次事件未完成，下次的事件也開始

module.exports = {
    setup(client) {
        client.on(Events.ClientReady, async () => {
            // 每4秒檢查一次投票，特殊事件
            schedule.scheduleJob("*/4 * * * * *", async function () {
                if (run_lock_specials["vote-per4"]) return;
                run_lock_specials["vote-per4"] = true;
                await require("../schedule/vote-per4.js").run(client);
                run_lock_specials["vote-per4"] = false;
            });

            // 每5秒檢查一次紅包，特殊事件
            schedule.scheduleJob("*/5 * * * * *", async function () {
                if (run_lock_specials["red_packet_reaction_operation_per5"]) return;
                run_lock_specials["red_packet_reaction_operation_per5"] = true;
                await require("../schedule/red_packet_reaction_operation_per5.js").run(client);
                run_lock_specials["red_packet_reaction_operation_per5"] = false;
            });
            // 每6秒執行一次giveaway，特殊事件
            schedule.scheduleJob("*/6 * * * * *", async function () {
                if (run_lock_specials["giveaway_run-per6"]) return;
                run_lock_specials["giveaway_run-per6"] = true;
                await require("../schedule/giveaway_run-per6.js").run(client);
                run_lock_specials["giveaway_run-per6"] = false;
            });

            // 每7秒執行一次check_internet，特殊事件
            schedule.scheduleJob("*/7 * * * * *", async function () {
                if (run_lock_specials["check_internet-per7"]) return;
                run_lock_specials["check_internet-per7"] = true;
                await require("../schedule/check_internet-per7.js").run(client);
                run_lock_specials["check_internet-per7"] = false;
            });

            const skip_list = [
                "../schedule/vote-per4.js",
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
                try {
                    if (run_lock) return;
                    run_lock = true;
                    for (const schedulename of schedules) {
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
                    };
                } catch (error) {
                    require("../module_senderr").senderr({ client: client, msg: `處理排程時出錯：${error.stack}`, clientready: true });
                } finally {
                    run_lock = false;
                };
            });

            const { time } = require("../module_time.js");
            console.log(`[${time()}] 已加載${client.schedules.length}個排程`);
        });
    },
};
