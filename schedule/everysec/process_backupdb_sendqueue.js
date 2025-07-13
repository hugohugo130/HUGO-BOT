const fs = require("fs");
const backupdb_queue_file = `${process.cwd()}/backup_database_send_queue.json`;

function processFileDiff(original_file, new_file) {
    const diffMessages = ["檔案變更內容：\n```diff\n"];
    const originalLines = original_file.split('\n');
    const newLines = new_file.split('\n');

    // 取得變更的用戶 ID
    try {
        const originalData = JSON.parse(original_file);
        const newData = JSON.parse(new_file);
        const changedUserIds = Object.keys(newData).filter(userId => {
            // 檢查是否為新增的用戶
            if (!originalData[userId]) return true;
            // 檢查用戶資料是否有變更
            return JSON.stringify(originalData[userId]) !== JSON.stringify(newData[userId]);
        });
        
        if (changedUserIds.length > 0) {
            diffMessages[0] += `變更的用戶 ID: ${changedUserIds.join(', ')}\n\n`;
        } else {
            diffMessages[0] += "沒有用戶資料變更\n\n";
        };
    } catch (error) {
        diffMessages[0] += "無法解析用戶 ID\n\n";
    };

    let currentDiff = "";
    for (let i = 0; i < Math.max(originalLines.length, newLines.length); i++) {
        if (originalLines[i] !== newLines[i]) {
            if (originalLines[i]) currentDiff += `- [行 ${i + 1}] ${originalLines[i]}\n`;
            if (newLines[i]) currentDiff += `+ [行 ${i + 1}] ${newLines[i]}\n`;
        };
    };

    // 將差異內容分割成多個訊息
    const chunks = currentDiff.match(/.{1,1900}/gs) || [];
    chunks.forEach((chunk, index) => {
        if (index === 0) {
            diffMessages[0] += chunk;
            diffMessages[0] += "```";
        } else {
            diffMessages.push(`\`\`\`diff\n${chunk}\`\`\``);
        };
    });

    return diffMessages;
};

module.exports = {
    run: async function (client) {
        const temp_folder = `${process.cwd()}/temp`;
        const filename = `${temp_folder}/backup_database_send_queue_diff_${Date.now()}.txt`;
        try {
            const { backup_database_channel_ID } = require("../../config.json");
            if (!fs.existsSync(temp_folder)) {
                fs.mkdirSync(temp_folder, { recursive: true });
            };
            const backupdb_queue = JSON.parse(fs.readFileSync(backupdb_queue_file, "utf8"));
            if (backupdb_queue.length === 0) return;
            const backupdb_queue_item = backupdb_queue.shift();
            const channel = await client.channels.fetch(backup_database_channel_ID);
            if (!channel) return;

            const original_file = JSON.stringify(backupdb_queue_item.original_file, null, 4);
            const new_file = JSON.stringify(backupdb_queue_item.new_file, null, 4);

            if (original_file === new_file) {
                fs.writeFileSync(backupdb_queue_file, JSON.stringify(backupdb_queue, null, 4));
                return;
            };

            const diffMessages = processFileDiff(original_file, new_file);
            fs.writeFileSync(filename, new_file);

            // 分批發送訊息
            for (let i = 0; i < diffMessages.length; i++) {
                if (i === diffMessages.length - 1) {
                    await channel.send({
                        content: diffMessages[i],
                        files: [filename],
                    });
                } else {
                    await channel.send({
                        content: diffMessages[i]
                    });
                };
            };

            fs.writeFileSync(backupdb_queue_file, JSON.stringify(backupdb_queue, null, 4));
        } catch (error) {
            require("../../module_senderr.js").senderr({ client: client, msg: `處理發送資料庫備份佇列時出錯：${error.stack}`, clientready: true });
        } finally {
            if (fs.existsSync(filename)) {
                fs.unlinkSync(filename);
            };
        };
    },
};