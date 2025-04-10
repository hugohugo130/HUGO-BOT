const schedule = require("node-schedule");
const { Events } = require("discord.js");
const fs = require('fs');
const path = require('path');

let run_lock = false // 使用 run lock 來避免上次事件未完成，下次的事件也開始
let run_lock_specials = {} // 使用 run lock 來避免上次事件未完成，下次的事件也開始

module.exports = {
    setup(client) {
        client.on(Events.ClientReady, async () => {
            // 載入每秒執行的排程
            const schedule_sec_dir = path.join(__dirname, '../schedule/everysec');
            const schedule_sec_js_list = fs.readdirSync(schedule_sec_dir)
                .filter(file => file.endsWith('.js'))
                .map(file => `../schedule/everysec/${file}`);

            for (const schedulename of schedule_sec_js_list) {
                const basename = path.basename(schedulename, '.js');
                run_lock_specials[basename] = false;
            };

            schedule.scheduleJob("* * * * * *", async function () {
                for (const schedulename of schedule_sec_js_list) {
                    const basename = path.basename(schedulename, '.js');
                    if (run_lock_specials[basename]) continue;
                    run_lock_specials[basename] = true;
                    try {
                        delete require.cache[require.resolve(schedulename)];
                        await require(schedulename).run(client);
                    } catch (error) {
                        require("../module_senderr.js").senderr({ client: client, msg: `處理每秒排程 ${basename} 時出錯：${error.stack}`, clientready: true });
                    } finally {
                        run_lock_specials[basename] = false;
                    };
                };
            });

            // 載入每分鐘執行的排程
            const schedule_dir = path.join(__dirname, '../schedule/everymin');
            const schedule_js_list = fs.readdirSync(schedule_dir)
                .filter(file => file.endsWith('.js'))
                .map(file => `../schedule/everymin/${file}`);

            client.schedules = schedule_js_list;

            for (const schedule of client.schedules) {
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
                    for (const schedulename of client.schedules) {
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
                    require("../module_senderr.js").senderr({ client: client, msg: `處理排程時出錯：${error.stack}`, clientready: true });
                } finally {
                    run_lock = false;
                };
            });

            client.schedules = [...client.schedules, ...schedule_sec_js_list];
            const { time } = require("../module_time.js");
            console.log(`[${time()}] 已加載${client.schedules.length}個排程`);
        });
    },
};
