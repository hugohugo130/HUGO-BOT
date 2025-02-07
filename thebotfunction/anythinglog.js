const { Events, EmbedBuilder } = require("discord.js");

module.exports = {
    setup(client) {
        client.on(Events.MessageCreate, async (message) => {
            if (!message.guild) return;
            try {
                const { backend_channel_ID, backup_database_channel_ID, counting_channel_ID } = require("../config.json");
                const backendchannel = client.channels.cache.get(backend_channel_ID);
                if (!backendchannel) return;
                let user = message.author;
                let channel = message.channel;
                if (user.id === client.user.id && channel.id === backend_channel_ID) return;
                if (channel.id === backup_database_channel_ID) return;
                if (channel.id === counting_channel_ID) return;
                let content = message.content || "無內容";
                let referenceurl = "無";
                if (message.reference) {
                    let refrence_message_id = message.reference.messageId;
                    let reference_message = await message.channel.messages.fetch(refrence_message_id);
                    referenceurl = reference_message.url || "無";
                };
                let time = Math.floor(message.createdTimestamp / 1000);
                let embed = new EmbedBuilder()
                    .setColor("#00BBFF")
                    .setTitle("訊息記錄(新增)")
                    .addFields(
                        { name: "發送者", value: user.toString(), inline: true },
                        { name: "訊息ID", value: message.id, inline: true },
                        { name: "訊息頻道", value: channel.toString(), inline: true },
                        { name: "訊息發送時間", value: `<t:${time}:f> (<t:${time}:R>)`, inline: true },
                        { name: "附件數", value: message.attachments.size.toString(), inline: true },
                        { name: "引用訊息", value: referenceurl, inline: true },
                        { name: "嵌入數", value: message.embeds.length.toString(), inline: true },
                        { name: "訊息內容", value: content.length > 1024 ? content.substring(0, 1021) + "..." : content, inline: false }
                    )
                    .setTimestamp();
                backendchannel.send({ embeds: [embed], flags: [4096] });
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `發送訊息記錄時出錯：${error.stack}`, clientready: true });
            }
        });

        client.on(Events.MessageDelete, async (message) => {
            if (!message.guild) return;
            try {
                const { backend_channel_ID, backup_database_channel_ID } = require("../config.json");
                const backendchannel = client.channels.cache.get(backend_channel_ID);
                if (!backendchannel) return;

                let user = message.author;
                if (!user) return;

                let channel = message.channel;
                if (user.id === client.user.id && channel.id === backend_channel_ID) return;
                if (channel.id === backup_database_channel_ID) return;

                let content = message.content || "無內容";
                let time = Math.floor(new Date().getTime() / 1000);

                let embed = new EmbedBuilder()
                    .setColor("#00BBFF")
                    .setTitle("訊息記錄(刪除)")
                    .addFields(
                        { name: "發送者", value: `<@${user.id}>`, inline: true },
                        { name: "訊息ID", value: message.id, inline: true },
                        { name: "訊息頻道", value: channel.toString(), inline: true },
                        { name: "訊息發送時間", value: `<t:${time}:f> (<t:${time}:R>)`, inline: true },
                        { name: "訊息內容", value: content.substring(0, 1024), inline: false }
                    )
                    .setTimestamp();

                await backendchannel.send({ embeds: [embed], flags: [4096] });
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `發送訊息刪除記錄時出錯：${error.stack}`, clientready: true });
            }
        });

        client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
            if (!newMessage.guild) return;
            try {
                const { backend_channel_ID, backup_database_channel_ID } = require("../config.json");
                const backendchannel = client.channels.cache.get(backend_channel_ID);
                if (!backendchannel) return;
                let user = newMessage.author;
                let channel = newMessage.channel;
                if (user.id === client.user.id && channel.id === backend_channel_ID) return;
                if (channel.id === backup_database_channel_ID) return;
                let content = newMessage.content;
                let time = Math.floor(new Date().getTime() / 1000);
                let embed = new EmbedBuilder()
                    .setColor("#00BBFF")
                    .setTitle("訊息記錄(編輯)")
                    .addFields(
                        { name: "發送者", value: `<@${user.id}>`, inline: true },
                        { name: "訊息頻道", value: channel.toString(), inline: true },
                        { name: "訊息發送時間", value: `<t:${time}:f> (<t:${time}:R>)`, inline: true },
                        { name: "舊訊息內容", value: oldMessage.content || "無內容", inline: false },
                        { name: "新訊息內容", value: content || "無內容", inline: false }
                    )
                    .setTimestamp();
                backendchannel.send({ embeds: [embed], flags: [4096] });
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `發送訊息編輯記錄時出錯：${error.stack}`, clientready: true });
            }
        });

        client.on(Events.ChannelCreate, async (channel) => {
            try {
                const { backend_channel_ID } = require("../config.json");
                const backendchannel = client.channels.cache.get(backend_channel_ID);
                if (!backendchannel) return;
                let time = Math.floor(channel.createdTimestamp / 1000);
                let embed = new EmbedBuilder()
                    .setColor("#00BBFF")
                    .setTitle("頻道新增")
                    .addFields(
                        { name: "頻道ID", value: channel.id.toString(), inline: true },
                        { name: "頻道名稱", value: channel.name.toString(), inline: true },
                        { name: "頻道連結", value: channel.url ? channel.url.toString() : "無", inline: true },
                        { name: "頻道類型", value: channel.type.toString(), inline: true },
                        { name: "頻道新增時間", value: `<t:${time}:f> (<t:${time}:R>)`, inline: true }
                    )
                    .setTimestamp();
                backendchannel.send({ embeds: [embed] });
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `發送頻道新增記錄時出錯：${error.stack}`, clientready: true });
            }
        });

        client.on(Events.ChannelDelete, async (channel) => {
            try {
                const { backend_channel_ID } = require("../config.json");
                const backendchannel = client.channels.cache.get(backend_channel_ID);
                if (!backendchannel) return;
                let time = Math.floor(new Date().getTime() / 1000);
                let embed = new EmbedBuilder()
                    .setColor("#00BBFF")
                    .setTitle("頻道刪除")
                    .addFields(
                        { name: "頻道ID", value: channel.id.toString(), inline: true },
                        { name: "頻道名稱", value: channel.name.toString(), inline: true },
                        { name: "頻道連結", value: channel.url ? channel.url.toString() : "無", inline: true },
                        { name: "頻道類型", value: channel.type.toString(), inline: true },
                        { name: "頻道說明", value: channel.topic ? channel.topic.toString() : "無", inline: false },
                        { name: "頻道刪除時間", value: `<t:${time}:f> (<t:${time}:R>)`, inline: true }
                    )
                    .setTimestamp();
                await backendchannel.send({ embeds: [embed] });
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `發送頻道刪除記錄時出錯：${error.stack}`, clientready: true });
            }
        });

        client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
            try {
                const { backend_channel_ID } = require("../config.json");
                const backendchannel = client.channels.cache.get(backend_channel_ID);
                if (!backendchannel) return;
                const oldc = oldChannel.toJSON();
                const newc = newChannel.toJSON();
                let embed = new EmbedBuilder()
                    .setColor("#00BBFF")
                    .setTitle("頻道更新")
                    .addFields(
                        { name: "頻道ID", value: newChannel.id, inline: true },
                        { name: "頻道名稱", value: newChannel.name, inline: true },
                        {
                            name: "更新內容", value: Object.keys(oldc).map(key => {
                                if (oldc[key] !== newc[key]) {
                                    return `${key}: \`${oldc[key]}\` -> \`${newc[key]}\``;
                                }
                                return null;
                            }).filter(Boolean).join('\n') || "無變更", inline: false
                        },
                    )
                    .setTimestamp();
                await backendchannel.send({ embeds: [embed] });
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `發送頻道更新記錄時出錯：${error.stack}`, clientready: true });
            }
        });

        client.on(Events.GuildMemberAdd, async (member) => {
            try {
                const { backend_channel_ID } = require("../config.json");
                const backendchannel = client.channels.cache.get(backend_channel_ID);
                if (!backendchannel) return;
                let time = Math.floor(member.user.createdTimestamp / 1000);
                let embed = new EmbedBuilder()
                    .setColor("#00BBFF")
                    .setTitle("成員加入")
                    .addFields(
                        { name: "成員ID", value: member.id, inline: true },
                        { name: "成員名稱", value: member.user.username, inline: true },
                        { name: "加入時間", value: `<t:${time}:f> (<t:${time}:R>)`, inline: true },
                    )
                    .setTimestamp();
                backendchannel.send({ embeds: [embed] });
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `發送成員加入記錄時出錯：${error.stack}`, clientready: true });
            }
        });

        client.on(Events.GuildMemberRemove, async (member) => {
            try {
                const { backend_channel_ID } = require("../config.json");
                const backendchannel = client.channels.cache.get(backend_channel_ID);
                if (!backendchannel) return;
                let time = Math.floor(new Date().getTime() / 1000);
                let embed = new EmbedBuilder()
                    .setColor("#00BBFF")
                    .setTitle("成員離開")
                    .addFields(
                        { name: "成員ID", value: member.id, inline: true },
                        { name: "成員名稱", value: member.user.username, inline: true },
                        { name: "離開時間", value: `<t:${time}:f> (<t:${time}:R>)`, inline: true },
                    )
                    .setTimestamp();
                backendchannel.send({ embeds: [embed] });
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `發送成員離開記錄時出錯：${error.stack}`, clientready: true });
            }
        });

        client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
            try {
                const { backend_channel_ID } = require("../config.json");
                const backendchannel = client.channels.cache.get(backend_channel_ID);
                if (!backendchannel) return;
                const oldm = oldMember.toJSON();
                const newm = newMember.toJSON();
                let embed = new EmbedBuilder()
                    .setColor("#00BBFF")
                    .setTitle("成員更新")
                    .addFields(
                        { name: "成員ID", value: newMember.id, inline: true },
                        { name: "成員名稱", value: newMember.user.username, inline: true },
                        {
                            name: "更新內容", value: Object.keys(oldm).map(key => {
                                if (oldm[key] !== newm[key]) {
                                    return `${key}: \`${oldm[key]}\` -> \`${newm[key]}\``;
                                }
                                return null;
                            }).filter(Boolean).join('\n') || "無變更", inline: false
                        },
                    )
                    .setTimestamp();
                backendchannel.send({ embeds: [embed] });
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `發送成員更新記錄時出錯：${error.stack}`, clientready: true });
            }
        });

        client.on(Events.GuildBanAdd, async (ban) => {
            try {
                const { backend_channel_ID } = require("../config.json");
                const backendchannel = client.channels.cache.get(backend_channel_ID);
                if (!backendchannel) return;
                let time = Math.floor(new Date().getTime() / 1000);
                let embed = new EmbedBuilder()
                    .setColor("#00BBFF")
                    .setTitle("成員被停權")
                    .addFields(
                        { name: "成員ID", value: ban.user.id, inline: true },
                        { name: "成員名稱", value: ban.user.username, inline: true },
                        { name: "停權時間", value: `<t:${time}:f> (<t:${time}:R>)`, inline: true },
                    )
                    .setTimestamp();
                backendchannel.send({ embeds: [embed] });
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `發送成員停權記錄時出錯：${error.stack}`, clientready: true });
            }
        });

        client.on(Events.GuildBanRemove, async (ban) => {
            try {
                const { backend_channel_ID } = require("../config.json");
                const backendchannel = client.channels.cache.get(backend_channel_ID);
                if (!backendchannel) return;
                let time = Math.floor(new Date().getTime() / 1000);
                let embed = new EmbedBuilder()
                    .setColor("#00BBFF")
                    .setTitle("成員被解除停權")
                    .addFields(
                        { name: "成員ID", value: ban.user.id, inline: true },
                        { name: "成員名稱", value: ban.user.username, inline: true },
                        { name: "解除停權時間", value: `<t:${time}:f} (<t:${time}:R>)`, inline: true },
                    )
                    .setTimestamp();
                backendchannel.send({ embeds: [embed] });
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `發送成員解除停權記錄時出錯：${error.stack}`, clientready: true });
            }
        });

        client.on(Events.GuildEmojiUpdate, async (oldEmoji, newEmoji) => {
            try {
                const { backend_channel_ID } = require("../config.json");
                const backendchannel = client.channels.cache.get(backend_channel_ID);
                if (!backendchannel) return;
                const olde = oldEmoji.toJSON();
                const newe = newEmoji.toJSON();
                let embed = new EmbedBuilder()
                    .setColor("#00BBFF")
                    .setTitle("表情符號更新")
                    .addFields(
                        { name: "表情符號ID", value: newEmoji.id, inline: true },
                        { name: "表情符號名稱", value: newEmoji.name, inline: true },
                        {
                            name: "更新內容", value: Object.keys(olde).map(key => {
                                if (olde[key] !== newe[key]) {
                                    return `${key}: \`${olde[key]}\` -> \`${newe[key]}\``;
                                }
                                return null;
                            }).filter(Boolean).join('\n') || "無變更", inline: false
                        },
                    )
                    .setTimestamp();
                backendchannel.send({ embeds: [embed] });
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `發送表情符號更新記錄時出錯：${error.stack}`, clientready: true });
            }
        });

        client.on(Events.GuildEmojiDelete, async (emoji) => {
            try {
                const { backend_channel_ID } = require("../config.json");
                const backendchannel = client.channels.cache.get(backend_channel_ID);
                if (!backendchannel) return;
                let time = Math.floor(new Date().getTime() / 1000);
                let embed = new EmbedBuilder()
                    .setColor("#00BBFF")
                    .setTitle("表情符號刪除")
                    .addFields(
                        { name: "表情符號名稱", value: emoji.name, inline: true },
                        { name: "表情符號刪除時間", value: `<t:${time}:f> (<t:${time}:R>)`, inline: true },
                    )
                    .setTimestamp();
                backendchannel.send({ embeds: [embed] });
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `發送表情符號刪除記錄時出錯：${error.stack}`, clientready: true });
            }
        });

        client.on(Events.GuildRoleCreate, async (role) => {
            try {
                const { backend_channel_ID } = require("../config.json");
                const backendchannel = client.channels.cache.get(backend_channel_ID);
                if (!backendchannel) return;
                let time = Math.floor(role.createdTimestamp / 1000);
                let embed = new EmbedBuilder()
                    .setColor("#00BBFF")
                    .setTitle("身份組新增")
                    .addFields(
                        { name: "身份組ID", value: role.id, inline: true },
                        { name: "身份組名稱", value: role.name, inline: true },
                        { name: "身份組新增時間", value: `<t:${time}:f> (<t:${time}:R>)`, inline: true },
                    )
                    .setTimestamp();
                backendchannel.send({ embeds: [embed] });
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `發送身份組新增記錄時出錯：${error.stack}`, clientready: true });
            }
        });

        client.on(Events.GuildRoleDelete, async (role) => {
            try {
                const { backend_channel_ID } = require("../config.json");
                const backendchannel = client.channels.cache.get(backend_channel_ID);
                if (!backendchannel) return;
                let time = Math.floor(new Date().getTime() / 1000);
                let embed = new EmbedBuilder()
                    .setColor("#00BBFF")
                    .setTitle("身份組刪除")
                    .addFields(
                        { name: "身份組ID", value: role.id, inline: true },
                        { name: "身份組名稱", value: role.name, inline: true },
                        { name: "身份組刪除時間", value: `<t:${time}:f> (<t:${time}:R>)`, inline: true },
                    )
                    .setTimestamp();
                backendchannel.send({ embeds: [embed] });
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `發送身份組刪除記錄時出錯：${error.stack}`, clientready: true });
            }
        });

        client.on(Events.GuildRoleUpdate, async (oldRole, newRole) => {
            try {
                const { backend_channel_ID } = require("../config.json");
                const backendchannel = client.channels.cache.get(backend_channel_ID);
                if (!backendchannel) return;
                const oldr = oldRole.toJSON();
                const newr = newRole.toJSON();
                let embed = new EmbedBuilder()
                    .setColor("#00BBFF")
                    .setTitle("身份組更新")
                    .addFields(
                        { name: "身份組ID", value: newRole.id, inline: true },
                        { name: "身份組名稱", value: newRole.name, inline: true },
                        {
                            name: "更新內容", value: Object.keys(oldr).map(key => {
                                if (oldr[key] !== newr[key]) {
                                    return `${key}: \`${oldr[key]}\` -> \`${newr[key]}\``;
                                }
                                return null;
                            }).filter(Boolean).join('\n') || "無變更", inline: false
                        },
                    )
                    .setTimestamp();
                backendchannel.send({ embeds: [embed] });
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `發送身份組更新記錄時出錯：${error.stack}`, clientready: true });
            }
        });

        client.on(Events.GuildUpdate, async (oldGuild, newGuild) => {
            try {
                const { backend_channel_ID } = require("../config.json");
                const backendchannel = client.channels.cache.get(backend_channel_ID);
                if (!backendchannel) return;
                const oldg = oldGuild.toJSON();
                const newg = newGuild.toJSON();
                let embed = new EmbedBuilder()
                    .setColor("#00BBFF")
                    .setTitle("伺服器更新")
                    .addFields(
                        { name: "伺服器ID", value: newGuild.id, inline: true },
                        { name: "伺服器名稱", value: newGuild.name, inline: true },
                        {
                            name: "更新內容", value: Object.keys(oldg).map(key => {
                                if (oldg[key] !== newg[key]) {
                                    return `${key}: \`${oldg[key]}\` -> \`${newg[key]}\``;
                                }
                                return null;
                            }).filter(Boolean).join('\n') || "無變更", inline: false
                        },
                    )
                    .setTimestamp();
                backendchannel.send({ embeds: [embed] });
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `發送伺服器更新記錄時出錯：${error.stack}`, clientready: true });
            }
        });

        client.on(Events.GuildIntegrationsUpdate, async (guild) => {
            try {
                const { backend_channel_ID } = require("../config.json");
                const backendchannel = client.channels.cache.get(backend_channel_ID);
                if (!backendchannel) return;
                let time = Math.floor(new Date().getTime() / 1000);
                let embed = new EmbedBuilder()
                    .setColor("#00BBFF")
                    .setTitle("整合更新")
                    .addFields(
                        { name: "伺服器ID", value: guild.id, inline: true },
                        { name: "整合更新時間", value: `<t:${time}:f> (<t:${time}:R>)`, inline: true },
                    )
                    .setTimestamp();
                backendchannel.send({ embeds: [embed] });
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `發送整合更新記錄時出錯：${error.stack}`, clientready: true });
            }
        });

        client.on(Events.GuildMembersChunk, async (members, guild) => {
            try {
                const { backend_channel_ID } = require("../config.json");
                const backendchannel = client.channels.cache.get(backend_channel_ID);
                if (!backendchannel) return;
                let time = Math.floor(new Date().getTime() / 1000);
                let embed = new EmbedBuilder()
                    .setColor("#00BBFF")
                    .setTitle("成員分塊")
                    .addFields(
                        { name: "伺服器ID", value: guild.id, inline: true },
                        { name: "成員分塊時間", value: `<t:${time}:f> (<t:${time}:R>)`, inline: true },
                    )
                    .setTimestamp();
                backendchannel.send({ embeds: [embed] });
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `發送成員分塊記錄時出錯：${error.stack}`, clientready: true });
            }
        });

        client.on(Events.GuildAuditLogEntryCreate, async (entry) => {
            try {
                const { backend_channel_ID } = require("../config.json");
                const backendchannel = client.channels.cache.get(backend_channel_ID);
                if (!backendchannel) return;
                let time = Math.floor(new Date().getTime() / 1000);
                let embed = new EmbedBuilder()
                    .setColor("#00BBFF")
                    .setTitle("審查日誌新增")
                    .addFields(
                        { name: "審查日誌ID", value: entry.id, inline: true },
                        { name: "審查日誌類型", value: entry.actionType, inline: true },
                        { name: "審查日誌時間", value: `<t:${time}:f> (<t:${time}:R>)`, inline: true },
                    )
                    .setTimestamp();
                backendchannel.send({ embeds: [embed] });
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `發送審查日誌新增記錄時出錯：${error.stack}`, clientready: true });
            }
        });
    },
};