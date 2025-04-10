const { saveUserData, loadData } = require("../../module_database.js");

function getdiff(a, b) {
    if (a > b) {
        return a - b;
    } else {
        return b - a;
    };
};

module.exports = {
    run: async function (client) {
        try {
            const { GuildID, BotAnnouncementChannelID } = require("../../config.json"); // 讀取配置
            let guild = client.guilds.cache.get(GuildID); // 獲取伺服器
            let members = guild.members.cache; // 獲取伺服器成員列表
            let membersArray = Array.from(members.values());

            for (let member of membersArray) {
                let user = member.user; // 獲取成員
                if (user.bot) continue; // 如果是機器人，則跳過
                let data = loadData(user.id); // 讀取用戶數據
                let userid = user.id; // 獲取成員ID

                if (!data.installment) { // 如果用戶分期付款數據不存在，則創建分期付款數據 (雖然這很難發生)
                    data.installment = {};
                    saveUserData(userid, data);
                    continue;
                };

                // if (!data[userid]['installment'].latestrundate) return; // 如果用戶分期付款數據不存在，則跳過
                if (!data.installment.latestrundate) continue; // 如果用戶分期付款數據不存在，則跳過
                if (data.installment.remainamount <= 0) { // 如果用戶分期付款餘額為0，則清空分期付款數據
                    data.installment = {};
                    saveUserData(userid, data);
                    continue;
                };

                let date = new Date(); // 獲取當前日期
                let year = date.getFullYear(); // 獲取當前年份
                let month = date.getMonth() + 1; // 獲取當前月份
                let day = date.getDate(); // 獲取當前日期
                let curdate = `${year} ${month} ${day}`; // 將當前日期格式化為YYYY MM DD

                today_int = parseInt(day); // 將當前日期轉換為整數
                latestrunday = parseInt(data.installment.latestrundate.split(" ")[2]); // 將上次分期付款日期轉換為整數
                diff = getdiff(today_int, latestrunday); // 計算當前日期與上次分期付款日期的差值
                interval_day = data.installment.intervalday; // 獲取分期付款間隔天數
                times = data.installment.times; // 獲取分期付款期數

                let curamount;
                if (diff >= interval_day) { // 如果差值大於等於分期付款間隔天數
                    if (data.installment.fullint) {
                        curamount = data.installment.remainamount / data.installment.times;
                        data.hacoin -= curamount;
                        data.installment.remainamount -= curamount;
                        data.installment.times -= 1
                        data.installment.latestrundate = curdate;
                    } else {
                        let curnextreduce = data.installment.nextreduce;
                        curamount = data.installment.remainamount + curnextreduce;
                        let nextreduce = curamount % times;
                        curamount /= data.installment.times;
                        data.installment.nextreduce = nextreduce;
                        data.hacoin -= curamount;
                        data.installment.remainamount -= curamount;
                        data.installment.times -= 1
                        data.installment.latestrundate = curdate;
                    };

                    let channel = client.guilds.cache.get(GuildID).channels.cache.get(BotAnnouncementChannelID);
                    if (channel) {
                        let curtime = Math.floor(Date.now() / 1000);
                        let remainamount = data.installment.remainamount;
                        await channel.send(`[分期付款] 時間:<t:${curtime}>\n用戶:${user.toString()}\n剩下${data.installment.times}期(${remainamount}哈狗幣)\n已扣${curamount}`);
                    };

                    saveUserData(userid, data);
                };
            };
        } catch (error) {
            require("../../module_senderr.js").senderr({ client: client, msg: `處理分期付款時出錯：${error.stack}`, clientready: true });
        };
    },
};