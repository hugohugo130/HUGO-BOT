const { Events } = require("discord.js");

module.exports = {
    setup(client) {
        try {
            client.on(Events.InviteCreate, async (invite) => {
                const { invite_link } = require("../config.json");
                const { sleep } = require("../module_sleep");
                let creator = invite.inviter;
                let createts = Math.floor(invite.createdTimestamp / 1000);
                let code = invite.code;
                let invite_link_code = invite_link.split("/")[invite_link.split("/").length - 1];
                if (invite_link_code === code) return;
                let msg = `你在 <t:${createts}> 創建的邀請(` + code + `)已被刪除, 請使用 ` + "`" + invite_link + "`" + " 邀請用戶!"
                await creator.send(msg);
                await sleep(5000);
                await invite.delete();
            });
        } catch (error) {
            const { time } = require("../module_time.js");
            console.error(`[${time()}] 處理邀請事件時出錯：`, error);
            const { chatting_channel_ID, HugoUserID } = require("../config.json");
            client.channels.cache.get(chatting_channel_ID).send(`[${time()}] 處理邀請事件時出錯：${error}\n<@${HugoUserID}>`);
            client.users.send(HugoUserID, `[${time()}] 處理邀請事件時出錯：${error}`);
        };
    },
};