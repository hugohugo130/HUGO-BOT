let stopping = false;
const { scheduleJob, cancelJob, listJobs } = require('./module_schedule.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    setup() { },
    async rlcmd(client, input) {
        try {
            console.log("----------");
            if (input === "stop" && !stopping) {
                stopping = true;
                const { stop_send_msg } = require("./module_bot_start_stop.js");
                await stop_send_msg(client);
            } else if (input.startsWith("schedule ")) {
                const args = input.slice(9).split(" ");
                if (args[0] === "list") {
                    const schedule_dir = path.join(__dirname, 'schedule');
                    const everymin_dir = path.join(schedule_dir, 'everymin');
                    const everysec_dir = path.join(schedule_dir, 'everysec');

                    console.log("可用的排程任務：");

                    if (fs.existsSync(everymin_dir)) {
                        const min_files = fs.readdirSync(everymin_dir)
                            .filter(file => file.endsWith('.js'))
                            .map(file => file.replace('.js', ''));
                        console.log("\n每分鐘排程：");
                        min_files.forEach(file => console.log(`- ${file}`));
                    } else {
                        console.log("\n每分鐘排程目錄不存在");
                    };

                    if (fs.existsSync(everysec_dir)) {
                        const sec_files = fs.readdirSync(everysec_dir)
                            .filter(file => file.endsWith('.js'))
                            .map(file => file.replace('.js', ''));
                        console.log("\n每秒排程：");
                        sec_files.forEach(file => console.log(`- ${file}`));
                    } else {
                        console.log("\n每秒排程目錄不存在");
                    };
                } else if (args[0] === "run" && args.length >= 2) {
                    const taskName = args[1];
                    const schedule_dir = path.join(__dirname, 'schedule');
                    const everymin_dir = path.join(schedule_dir, 'everymin');
                    const everysec_dir = path.join(schedule_dir, 'everysec');

                    let taskPath = null;
                    if (fs.existsSync(path.join(everymin_dir, `${taskName}.js`))) {
                        taskPath = path.join(everymin_dir, `${taskName}.js`);
                    } else if (fs.existsSync(path.join(everysec_dir, `${taskName}.js`))) {
                        taskPath = path.join(everysec_dir, `${taskName}.js`);
                    };

                    if (taskPath) {
                        try {
                            delete require.cache[require.resolve(taskPath)];
                            const task = require(taskPath);
                            if (task.run) {
                                task.run(client);
                                console.log(`已執行排程任務: ${taskName}`);
                            } else {
                                console.log(`排程任務 ${taskName} 沒有 run 方法`);
                            };
                        } catch (error) {
                            console.log(`執行排程任務 ${taskName} 時出錯：${error.stack}`);
                        };
                    } else {
                        console.log(`找不到排程任務: ${taskName}`);
                    };
                } else {
                    console.log("使用方法：");
                    console.log("schedule list - 列出所有可用的排程任務");
                    console.log("schedule run <任務名稱> - 執行指定的排程任務");
                };
            } else if (input === "fixed") {
                const { err_channel_ID, err2_channel_ID } = require("./config.json");
                const channel1 = client.channels.cache.get(err_channel_ID) || await client.channels.fetch(err_channel_ID);
                const channel2 = client.channels.cache.get(err2_channel_ID) || await client.channels.fetch(err2_channel_ID);
                await channel1.send("已修復所有錯誤");
                await channel2.send("已修復所有錯誤");
            }
            console.log("----------");
        } catch (error) {
            require("./module_senderr").senderr({ client: client, msg: `處理readline時出錯：${error.stack}`, clientready: true });
        };
    },
};