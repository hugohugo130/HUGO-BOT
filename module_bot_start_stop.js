const { EmbedBuilder } = require("discord.js");

module.exports = {
    start_send_msg: async function ({ client, amount, reload }) {
        const { time } = require("./module_time.js");
        const { BotAnnouncementChannelID, slashcmd } = require("./config.json");
        const channel = client.channels.cache.get(BotAnnouncementChannelID);
        if (reload) return;
        if (!channel) return console.log("[警告] 機器人無法發送訊息，請檢查config.json的BotAnnouncementChannelID是否正確");
        let text = "";
        // text = log;
        if (slashcmd) {
            text += `已加載${client.commands.size}個斜線指令`;
            text += "\n";
        };

        text += `已加載${amount}個程式碼`;

        let waitForSchedules = async () => {
            return new Promise(resolve => {
                const checkSchedules = () => {
                    if (client.schedules) {
                        resolve();
                    } else {
                        setImmediate(checkSchedules);
                    }
                };
                checkSchedules();
            });
        };

        await waitForSchedules(); // 等待排程加載完成

        text += `\n已加載${client.schedules.length}個排程`

        const embed = new EmbedBuilder()
            .setColor(0x00BBFF)
            .setTitle("哈狗機器人啟動成功!")
            .setDescription(text);
        await channel.send({ embeds: [embed] });

        console.log(`[${time()}] 機器人啟動成功!`);
        console.log(`[${time()}] 輸入stop停止機器人`);
    },

    stop_send_msg: async function (client) {
        const { time } = require("./module_time.js");
        const { BotAnnouncementChannelID } = require("./config.json");
        try {
            const channel = client.channels.cache.get(BotAnnouncementChannelID);
            if (!channel) return;
            console.log(`[${time()}] 正在關機...`);
            const embed = new EmbedBuilder()
                .setColor(0x00BBFF)
                .setTitle("哈狗機器人已關機!");
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(`[${time()}] 無法發送關機訊息:`, error);
        } finally {
            await client.destroy();
            process.exit();
        };
    },
};