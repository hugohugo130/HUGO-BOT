let stopping = false;
const fs = require('fs');
const path = require('path');
const { uploadAllDatabaseFiles, downloadDatabaseFile, onlineDB_uploadFile } = require('./module_database.js');

module.exports = {
    setup() { },
    async rlcmd(client, input) {
        try {
            console.log("----------");
            if (input === "stop" && !stopping) {
                stopping = true;
                const { stop_send_msg } = require("./module_bot_start_stop.js");
                try {
                    await uploadAllDatabaseFiles();
                    console.log("所有資料庫檔案已上傳");
                } catch (error) {
                    console.log(error.stack);
                };
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
            } else if (input === "uploadAll") {
                await uploadAllDatabaseFiles();
                console.log("已上載所有資料庫檔案");
            } else if (input.startsWith("upload")) {
                // upload src [dst]
                const args = input.split(" ").slice(1);
                if (args.length < 1) {
                    console.log("用法: upload <src> [dst]");
                } else {
                    const src = args[0];
                    const dst = args[1];
                    try {
                        if (!require('fs').existsSync(src)) {
                            console.log(`找不到檔案: ${src}`);
                        } else {
                            await onlineDB_uploadFile(src, dst);
                            console.log(`已上傳: ${src} ${dst ? `-> ${dst}` : ''}`);
                        }
                    } catch (error) {
                        console.log(error.stack);
                    }
                }
            } else if (input.startsWith("download ")) {
                // download src [dst]
                const args = input.split(" ").slice(1);
                if (args.length < 1) {
                    console.log("用法: download <src> [dst]");
                } else {
                    const src = args[0];
                    const dst = args[1];
                    try {
                        await downloadDatabaseFile(src, dst);
                        console.log(`已下載: ${src} ${dst ? `-> ${dst}` : ''}`);
                    } catch (error) {
                        console.log(error.stack);
                    }
                }
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