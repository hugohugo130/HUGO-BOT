const { Events, EmbedBuilder, MessageFlags } = require("discord.js");

function show_transactions(userid) {
    const { load_rpg_data } = require("../module_database.js");
    const { transactions = [] } = load_rpg_data(userid);
    const oneDayAgo = Math.floor(Date.now() / 1000) - 86400; // 只顯示24小時內的交易記錄

    return transactions
        .filter(t => t.timestamp >= oneDayAgo)
        .map(({ timestamp, detail, amount, type }) =>
            `- <t:${timestamp}:R> ${detail} ${amount}(${type})`
        ).join('\n');
};

function get_transaction_embed(user) {
    const userid = user.id;
    const username = user.username;
    const transactions = show_transactions(userid);
    const embed = new EmbedBuilder()
        .setColor(0x00BBFF)
        .setAuthor({
            name: `${username} 的交易紀錄`,
            iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(transactions || "- 沒有交易紀錄")
        .setTimestamp();
    return embed;
};

function get_failed_embed(user, guild) {
    let emoji = guild.emojis.cache.find(emoji => emoji.name === "crosS");
    emoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
    const embed = new EmbedBuilder()
        .setColor(0x00BBFF)
        .setTitle(`${emoji} | 沒事戳這顆按鈕幹嘛?`)
        .setFooter({
            text: `哈狗機器人 ∙ 讓 Discord 不再只是聊天軟體`,
            iconURL: user.displayAvatarURL({ dynamic: true }),
        });
    return embed;
};

module.exports = {
    setup(client) {
        client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isButton()) return;
            const message = interaction.message;
            const user = interaction.user;
            const notThisBotSendMessage = message.author.id !== client.user.id;
            if (notThisBotSendMessage) return;
            if (interaction.customId === 'rpg_transaction') {
                const embed = get_transaction_embed(user);
                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            };
        });
    },
};