const { loadData, saveUserData, sethacoin } = require("../module_database.js");
const { Events } = require("discord.js");

module.exports = {
    setup(client) {
        try {
            isQuestionIng = false;
            questionMessageID = 0;
            questionUserID = 0;
            questionAmount = 0;
            questionGlobal = "";
            client.on(Events.InteractionCreate, async (interaction) => {
                if (!interaction.isChatInputCommand()) return;
                if (interaction.commandName != "建立問題") return;
                const { question_channel_ID, question_ans_time, GuildID } = require("../config.json");
                await interaction.deferReply({ ephemeral: true });
                let amount = interaction.options.getNumber("數量");
                let question = interaction.options.getString("問題");
                answers = interaction.options.getString("正確解答").split(",");
                let user = interaction.user;
                let userid = user.id;
                if (isQuestionIng) return await interaction.editReply(`目前有人出題中，請稍後再試`);
                if (amount <= 0) return await interaction.editReply(`${amount}哈狗幣?蛤?`);
                if (
                    question.includes("<@") ||
                    question.includes("@everyone") ||
                    question.includes("@here") ||
                    question.includes("<!@")
                ) {
                    return await interaction.editReply(
                        `Hmm. 你是不是在嘗試亂tag? 把所有的提及刪掉再試一次。`
                    );
                };
                let data = loadData(userid);
                if (data.hacoin < amount) {
                    return await interaction.editReply(`你不夠哈狗幣, 你只有${data.hacoin}哈狗幣`);
                };
                sethacoin(userid, -amount, true);
                questionUserID = userid;
                questionAmount = amount;
                isQuestionIng = true;
                let qmsg = `
# 新的問題!
發起人: <@${userid}>
獎勵: ${amount} 哈狗幣
出題者的問題如下:
> ## ${question}
剩餘時間: <t:${Math.floor(Date.now() / 1000) + question_ans_time}:R>
                `;
                let questionmsg = await client.channels.cache
                    .get(question_channel_ID)
                    .send(qmsg);
                questionMessageID = questionmsg.id;

                setTimeout(async () => {
                    if (isQuestionIng) {
                        sethacoin(questionUserID, questionAmount, true);
                        await questionmsg.edit(
                            `# 此問題已結束!\n問題:${question}\n沒有人答對...已歸還哈狗幣到問題發送者`
                        );
                        questionMessageID = 0;
                        isQuestionIng = false;
                    };
                }, question_ans_time * 1000);

                await interaction.editReply(`已成功發起問題: https://discord.com/channels/${GuildID}/${question_channel_ID}/${questionMessageID}`);
            });
            client.on(Events.MessageCreate, async (msg) => {
                const { question_channel_ID, beta } = require("../config.json");
                if (msg.channel.id != question_channel_ID) return;
                if (!isQuestionIng) return;
                if (msg.reference == null) return;
                if (msg.reference.messageId != questionMessageID) return;
                if (msg.author.id == questionUserID) return msg.reply("你不能自己回答自己的問題哦~");
                if (!answers.includes(msg.content)) return msg.react("❌");
                if (beta) await msg.react("✅");
                else await msg.react("a:TickTick:1232270331218235423");
                await msg.reply("yeeeee 你答對了!");
                isQuestionIng = false;
                sethacoin(msg.author.id, questionAmount, true)
                return await msg.reply(`你已成功獲得 ${questionAmount} 哈狗幣`);
            });
        } catch (error) {
            require("../module_senderr").senderr({ client: client, msg: `處理問題事件時出錯：${error.stack}`, clientready: true });
        };
    },
};