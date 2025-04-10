module.exports = {
    run: async function (client) {
        try {
            const { randomhacoin } = require("../../module_getrandomhacoin.js");
            const { loadData, sethacoin_forsign, get_boosters } = require("../../module_database.js");
            const { check_can_sign } = require("../../slashcmd/user/sign.js");
            const { GuildID, BotChannelID, minhacoin, maxhacoin } = require('../../config.json');

            const guild = client.guilds.cache.get(GuildID);
            let members = guild.members.cache.filter(member => !member.user.bot);
            let autosigntext = [];
            let boosterstext = [];

            const membersArray = Array.from(members.values());
            for (const member of membersArray) {
                let user = member.user;
                let userid = user.id;

                let data = loadData(userid);
                if (!data.autosign) continue;
                if (check_can_sign(userid)) {
                    let gothacoin = randomhacoin(minhacoin, maxhacoin + 1);
                    for (let booster of get_boosters(client, 1)) {
                        const user = booster.user;
                        sethacoin(user.id, gothacoin, true);
                        boosterstext.push(`**${user.toString()}** 今天加成了 **${booster.guild.name}** 所以獲得了 1 哈狗幣!`);
                    };
                    sethacoin_forsign(userid, gothacoin, true);
                    const data = loadData(userid);

                    if (data.infsign) return; // 使用return並不會中斷迴圈
                    autosigntext.push(`[自動簽到] ${user.toString()} 簽到成功! 獲得了${gothacoin}個哈狗幣 他現在有${data.hacoin}個哈狗幣 好欸!`);
                };
            };

            if (autosigntext.length === 0) return;
            const channel = guild.channels.cache.get(BotChannelID);
            const sentmsg = await channel.send({ content: autosigntext.join("\n"), allowedMentions: { repliedUser: false } });
            await sentmsg.react('✅');
    
            if (boosterstext.length === 0) return;
            const boosterchannel = guild.channels.cache.get(BotChannelID);
            const booster_sentmsg = await boosterchannel.send({ content: boosterstext.join("\n"), allowedMentions: { repliedUser: false } });
            await booster_sentmsg.react('✅');
        } catch (error) {
            require("../../module_senderr.js").senderr({ client: client, msg: `進行自動簽到時出錯：${error.stack}`, clientready: true });
        };

    },
};