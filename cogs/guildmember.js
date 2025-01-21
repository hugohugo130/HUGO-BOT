const { EmbedBuilder, Events } = require("discord.js");
module.exports = {
    setup(client) {
        async function sendmsgtohugo(msgcontent) {
            const { HugoUserID } = require("../config.json");
            await client.users.send(HugoUserID, msgcontent);
        };
        async function givemembersroleifnorole() {
            const { GuildID, LoginDone_identity_ID } = require("../config.json");
            let added_identity_to_user = [];
            client.guilds.cache.get(GuildID).members.cache.forEach(async (member) => {
                if (member.user.bot) return;
                if (!member.roles.cache.has(LoginDone_identity_ID)) {
                    await member.roles.add(LoginDone_identity_ID);
                    added_identity_to_user.push(member.displayName);
                };
            });
            let added_identity_to_users = added_identity_to_user.join(",");
            if (added_identity_to_user.length != 0) {
                console.log(`成功把登入成功身份組給${added_identity_to_users}`);
                await sendmsgtohugo(`成功把登入成功身份組給${added_identity_to_users}`);
            };
        };
        client.on(Events.GuildMemberRemove, async (data) => {
            const { ServerMsgChannelID } = require("../config.json");
            console.log(`${data.user.username}離開了${data.guild.name}!`);
            const channel = client.channels.cache.get(ServerMsgChannelID);
            if (channel) {
                let username = data.user.username;
                let useravator = data.user.avatarURL();
                let thecolorR = Math.floor(Math.random() * 255);
                let thecolorG = Math.floor(Math.random() * 255);
                let thecolorB = Math.floor(Math.random() * 255);
                const goodbye_embed = new EmbedBuilder()
                    .setTitle("再見!")
                    .setDescription(`${username}離開了此伺服器`)
                    .setColor([thecolorR, thecolorG, thecolorB])
                    .setImage(useravator)
                await channel.send(goodbye_embed);
            };
        });
        client.on(Events.GuildMemberAdd, async (data) => {
            const { ServerMsgChannelID } = require("../config.json");
            console.log(`${data.user.username}加入了${data.guild.name}!`);
            const channel = client.channels.cache.get(ServerMsgChannelID);
            if (channel) {
                let jointimestamp_ss = data.joinedTimestamp / 1000;
                let jointimestamp_s = parseInt(jointimestamp_ss);
                let join_username = data.user.username;
                let useravator = data.user.avatarURL();
                let thecolorR = Math.floor(Math.random() * 255);
                let thecolorG = Math.floor(Math.random() * 255);
                let thecolorB = Math.floor(Math.random() * 255);
                const welcome_embed = new EmbedBuilder()
                    .setTitle("歡迎來到哈狗伺服器!")
                    .setColor([thecolorR, thecolorG, thecolorB])
                    .setImage(useravator)
                if (data.user.bot) {
                    welcome_embed.setDescription(`${join_username}(機器人) 加入了伺服器!\n加入時間: <t:${jointimestamp_s}:F>`)
                } else {
                    welcome_embed.setDescription(`${join_username}加入了伺服器!\n加入時間: <t:${jointimestamp_s}:F>`)
                };
                await channel.send(welcome_embed);
                givemembersroleifnorole();
            };
        });
    },
};