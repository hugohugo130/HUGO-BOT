const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    setup(client) {
        // 訊息回應
        client.on(Events.MessageCreate, async (message) => {
            if (message.author.bot) return;
            const channel = message.channel;
            if (channel.id !== "1402811558299570277") return;

            const msgcon = message.content.trim()

            let expression = msgcon.slice(5).trim(); // 移除 "calc "
            let result;
            for (const [constant, value] of Object.entries(mathConstants)) {
                expression = expression.replace(new RegExp(`\\b${constant}\\b`, 'g'), value);
            };

            try {
                result = eval(expression);
            } catch (error) {
                result = ":x: 計算失敗。";
            };

            if (!result) {
                result = ":x: 計算失敗。";
            };

            result = `${expression} = ${result}`;

            const embed = new EmbedBuilder()
                // .setColor(0x00BBFF)
                .setColor(0x8965D6)
                .setDescription(`\`\`\`${result}\`\`\``);

            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        });
    },
};