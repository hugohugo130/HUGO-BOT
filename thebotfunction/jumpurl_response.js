const { EmbedBuilder, Events, MessageFlags, time } = require("discord.js");

module.exports = {
    setup(client) {
        try {
            client.on(Events.MessageCreate, async (message) => {
                const { GuildID, BotID } = require("../config.json");
                if (message.author.bot) {
                    return;
                };

                if (!message.content.startsWith(`<@${BotID}> `)) return;

                let msgcontent = message.content.replace(`<@${BotID}> `, "");

                const match = msgcontent.match(
                    /^https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)$/,
                );

                if (match == null) {
                    return;
                };

                if (match[1] != GuildID) {
                    return;
                };

                const mentioned = await message.guild.channels.cache
                    .get(match[2])
                    .messages.fetch({ message: match[3] })
                    .catch(() => void 0);

                if (mentioned == null || mentioned.partial) {
                    return;
                };

                if (mentioned.content.length) {
                    if (mentioned.member == null) {
                        await mentioned.guild.members.fetch({ user: mentioned.author.id });
                    };

                    const embed = new EmbedBuilder()
                        .setColor(mentioned.member.displayHexColor)
                        .setAuthor({
                            name: mentioned.member.displayName,
                            iconURL: mentioned.member.displayAvatarURL(),
                        })
                        .setDescription(mentioned.content)
                        .setTimestamp(mentioned.createdAt);
                    await message.reply({
                        content: `${mentioned.author} ${time(mentioned.createdAt, "F")}, 在 ${mentioned.channel}, 在 ${mentioned.guild}`,
                        embeds: [embed, ...mentioned.embeds],
                        allowedMentions: { parse: [] },
                        flags: MessageFlags.SuppressNotifications,
                    });
                } else if (mentioned.embeds.length) {
                    await message.reply({
                        content: `${mentioned.author} ${time(mentioned.createdAt, "F")}, 在 ${mentioned.channel}, 在 ${mentioned.guild}`,
                        embeds: mentioned.embeds,
                        allowedMentions: { parse: [] },
                        flags: MessageFlags.SuppressNotifications,
                    });
                };
            });
        } catch (error) {
            require("../module_senderr").senderr({ client: client, msg: `處理跳轉URL時出錯：${error.stack}`, clientready: true });
        };
    },
};