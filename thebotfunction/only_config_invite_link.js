const { Events } = require("discord.js");

module.exports = {
    setup(client) {
        try {
            client.on(Events.InviteCreate, async (invite) => {
                const { invite_link } = require("../config.json");
                const { sleep } = require("../module_sleep.js");
                let creator = invite.inviter;
                let createts = Math.floor(invite.createdTimestamp / 1000);
                let code = invite.code;
                let invite_link_code = invite_link.split("/")[invite_link.split("/").length - 1];
                if (invite_link_code === code) return;
                let msg = `你在 <t:${createts}> 創建的邀請(` + code + `)已被刪除, 請使用 ` + "`" + invite_link + "`" + " 邀請用戶!"
                await creator.send(msg);
                sleep(5000);
                await invite.delete();
            });
        } catch (error) {
            require("../module_senderr").senderr({ client: client, msg: `處理邀請事件時出錯：${error.stack}`, clientready: true });
        };
    },
};