const { Events } = require("discord.js");

module.exports = {
    setup(client) {
        client.on(Events.GuildMemberUpdate, async (member) => {
            if (!member.premiumSince) return;
            const { loadData, saveUserData } = require("../module_database.js");
            const { chatting_channel_ID, BotChannelID } = require("../config.json");
            let data = loadData(member.id);
            data.boost_date = member.premiumSince.toISOString().slice(0, 10).replace(/-/g, " "); // YYYY MM DD
            data.hacoin += 100;
            saveUserData(member.id, data);
            const chatchannel = member.guild.channels.cache.get(chatting_channel_ID);
            const channel = member.guild.channels.cache.get(BotChannelID);
            const msg = `**${member}** 加成了 **${member.guild.name}**! 獲得 100 哈狗幣並且該天每人簽到你都會獲得 1 哈狗幣!`;
            await chatchannel.send(msg);
            await channel.send(msg);
        });
    }
};
