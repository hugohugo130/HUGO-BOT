const schedule = require('node-schedule');

module.exports = {
    // 添加一個排程任務
    // cronExpression - cron 表達式，例如 '*/5 * * * *' 表示每5分鐘執行一次
    // callback - 要執行的回調函數
    // 返回排程任務物件
    scheduleJob(cronExpression, callback) {
        return schedule.scheduleJob(cronExpression, callback);
    },

    // 取消一個排程任務
    // job - 要取消的排程任務
    cancelJob(job) {
        if (job) {
            job.cancel();
        };
    },

    // 列出所有正在運行的排程任務
    // 返回所有排程任務的陣列
    listJobs() {
        return schedule.scheduledJobs;
    }
}; 