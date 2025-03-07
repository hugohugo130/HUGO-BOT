const { EmbedBuilder, Events } = require("discord.js");

module.exports = {
    setup(client) {
        client.on(Events.GuildMemberRemove, async (data) => {
            const { time } = require("../module_time.js");
            try {
                const { ServerMsgChannelID } = require("../config.json");
                const user = data.user;
                const username = user.globalName || user.username;
                console.log(`[${time()}] ${username}離開了${data.guild.name}!`);
                const channel = client.channels.cache.get(ServerMsgChannelID);
                if (channel) {
                    const useravator = user.avatarURL();
                    const goodbye_embed = new EmbedBuilder()
                        .setTitle("再見!")
                        .setDescription(`${user.toString()} 在 ${time()} 離開了此伺服器`)
                        .setColor(0x00BBFF)
                        .setImage(useravator);
                    await channel.send({ embeds: [goodbye_embed] });
                };
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `處理成員離開事件時出錯：${error.stack}`, clientready: true });
            }
        });
        client.on(Events.GuildMemberAdd, async (data) => {
            const { time } = require("../module_time.js");
            try {
                const { ServerMsgChannelID, GuildID, rule_channel_ID, get_role_channel_ID, LoginDone_identity_ID } = require("../config.json");
                const user = data.user;
                const username = user.globalName || user.username;
                console.log(`[${time()}] ${username}加入了${data.guild.name}!`);
                const channel = client.channels.cache.get(ServerMsgChannelID);
                if (channel) {
                    const jointimestamp = parseInt(data.joinedTimestamp / 1000);
                    const useravator = user.avatarURL() || user.defaultAvatarURL;
                    const welcome_embed = new EmbedBuilder()
                        .setTitle(`歡迎來到哈狗伺服器!`)
                        .setColor(0x00BBFF)
                        .setDescription(`
嗨${user.toString()}!
你在 <t:${jointimestamp}:D> <t:${jointimestamp}:T> 加入了 ${data.guild.name}
歡迎歡迎!!
請記得去閱讀規則喲!感謝配合!
建議在開始聊天之前，先[領取身份組](<https://discord.com/channels/${GuildID}/${get_role_channel_ID}>)!
`)
                        .setImage(useravator);
                    await channel.send({ embeds: [welcome_embed] });
                    const guild = client.guilds.cache.get(GuildID);
                    const role = guild.roles.cache.get(LoginDone_identity_ID)
                    await guild.members.cache.get(user.id).roles.add(role);
                };

                if (user.bot) return;
                let dm_embed = new EmbedBuilder()
                    .setTitle("歡迎來到哈狗伺服器!")
                    .setDescription(`
嗨${user.toString()}!
歡迎來到哈狗伺服器!
加入伺服器後請[閱讀規則](<https://discord.com/channels/${GuildID}/${rule_channel_ID}>)
如果要領取其他身份組，請進入[獲取身份組的頻道](<https://discord.com/channels/${GuildID}/${get_role_channel_ID}>)獲取身份組!
                `);
                try {
                    await user.send({ embeds: [dm_embed] });
                } catch (_) { };
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `處理成員加入事件時出錯：${error.stack}`, clientready: true });
            };
        });
    },
};