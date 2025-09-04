const { Events, EmbedBuilder } = require("discord.js");

let mathConstants = {
    e: Math.E,
    pi: Math.PI,
    sqrt2: Math.SQRT2,
    ln2: Math.LN2,
    ln10: Math.LN10,
    log2e: Math.LOG2E,
    log10e: Math.LOG10E
};

const prefix = "C "

module.exports = {
    setup(client) {
        // 訊息回應
        client.on(Events.MessageCreate, async (message) => {
            if (message.author.bot) return;
            const channel = message.channel;
            if (channel.id !== "1402811558299570277") return;

            const msgcon = message.content.trim();
            if (!msgcon.startsWith(prefix)) return;

            let expression = msgcon.slice(prefix.length).trim();
            let result;
            for (const [constant, value] of Object.entries(mathConstants)) {
                expression = expression.replace(new RegExp(`\\b${constant}\\b`, 'g'), value);
            };

            try {
                result = eval(expression);
                result = `${expression} = ${result}`;
            } catch (error) {
                result = ":x: 計算失敗。";
            };

            if (!result && result != 0) {
                result = ":x: 計算失敗。";
            };
            

            const embed = new EmbedBuilder()
                // .setColor(0x00BBFF)
                .setColor(0x8965D6)
                .setDescription(`\`\`\`${result}\`\`\``);

            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        });
    },
};