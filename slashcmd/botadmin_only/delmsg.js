const { SlashCommandBuilder } = require('discord.js');

async function getMessages(channel, limit) {
    let out = [];
    if (limit > 500) {
        return null;
    };

    limit = parseInt(limit);

    if (limit <= 100) {
        let messages = await channel.messages.fetch({ limit: limit });
        out.push(...messages.map(m => m));
    } else {
        let rounds = Math.ceil(limit / 100);
        let last_id = "";
        for (let x = 0; x < rounds; x++) {
            const options = {
                limit: 100,
            };
            if (last_id.length > 0) {
                options.before = last_id;
            };
            const messages = await channel.messages.fetch(options);
            const messageArray = Array.from(messages.values());
            out.push(...messageArray);

            if (messageArray.length > 0) {
                last_id = messageArray[messageArray.length - 1].id;
            };

            if (out.length >= limit) {
                out = out.slice(0, limit);
                break;
            };
        };
    };

    return out;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('刪除訊息')
        .setDescription('刪除訊息 delete message')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('要刪除的訊息數量 (最多500)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(500),
        )
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('選擇要刪除訊息的頻道')
                .setRequired(false),
        )
        .addStringOption(option =>
            option.setName('contentincluded')
                .setDescription('要刪除的訊息是否包含特定內容')
                .setRequired(false),
        )
        .addUserOption(option =>
            option.setName('user')
                .setDescription('要刪除的訊息是否包含特定使用者')
                .setRequired(false),
        )
        .addStringOption(option =>
            option.setName('until')
                .setDescription('刪除直到指定訊息的id(包含該訊息)')
                .setRequired(false),
        ),
    async execute(interaction) {
        const { loadData } = require("../../module_database.js");
        await interaction.deferReply();
        let userid = interaction.user.id;
        let data = loadData(userid);

        if (!data.admin) return await interaction.editReply("您不是機器人管理員。無法使用此指令。");
        const msgnum = interaction.options.getInteger('number');
        const channel = interaction.options.getChannel('channel') ?? interaction.channel;
        const contentincluded = interaction.options.getString('contentincluded');
        const until = interaction.options.getString('until');
        const user = interaction.options.getUser('user');
        const messages = await getMessages(channel, msgnum + 1);

        let untilmsg;
        if (until) {
            try {
                untilmsg = await channel.messages.fetch(until);
                if (!untilmsg) return await interaction.editReply({ content: '找不到指定訊息，請重新輸入' });
            } catch (error) {
                return await interaction.editReply({ content: '指定的訊息ID無效，請重新輸入' });
            };
        };

        let progressMessage = null; // 追蹤進度訊息
        const reply = await interaction.editReply('開始刪除訊息...');
        progressMessage = reply;

        // 根據條件過濾訊息
        let filteredMessages = messages;

        // 排除機器人的回應訊息
        filteredMessages = filteredMessages.filter(msg => msg.id !== reply.id);

        if (contentincluded) {
            filteredMessages = filteredMessages.filter(msg => msg.content.includes(contentincluded));
        };

        if (user) {
            filteredMessages = filteredMessages.filter(msg => msg.author.id === user.id);
        };

        if (until && untilmsg) {
            const untilIndex = filteredMessages.findIndex(msg => msg.id === until);
            if (untilIndex !== -1) {
                filteredMessages = filteredMessages.slice(0, untilIndex + 1);
            } else {
                return await interaction.editReply({ content: '我找不到指定訊息欸...' });
            };
        };

        if (filteredMessages.length === 0) {
            return await interaction.editReply({ content: '找不到符合條件的訊息' });
        };

        let progress = 0;
        let updateFrequency;
        const totalMessages = filteredMessages.length;

        if (totalMessages <= 10) {
            updateFrequency = 2;
        } else if (totalMessages <= 20) {
            updateFrequency = 3;
        } else if (totalMessages <= 50) {
            updateFrequency = 5;
        } else if (totalMessages <= 100) {
            updateFrequency = 10;
        } else {
            updateFrequency = 20;
        };

        const empty = '○';
        const full = '●';


        for (let i = 0; i < filteredMessages.length; i++) {
            try {
                await filteredMessages[i].delete();
                progress = Math.floor((i + 1) / totalMessages * 100);

                if ((i + 1) % updateFrequency === 0 && i + 1 < filteredMessages.length) {
                    const progressBar = full.repeat(progress / 5) + empty.repeat(20 - progress / 5);
                    try {
                        await progressMessage.edit(`正在刪除訊息中...(${progress}%)\n${progressBar}`);
                    } catch (error) {
                        console.error(`更新進度時發生錯誤：${error}`);
                    };
                };
            } catch (error) {
                console.error(`刪除訊息時發生錯誤：${error}`);
                continue;
            };
        };

        let replyContent = `已成功刪除 ${totalMessages} 條訊息`;
        if (contentincluded) {
            replyContent += `\n包含內容: ${contentincluded}`;
        };
        if (user) {
            replyContent += `\n來自使用者: ${user.tag}`;
        };
        replyContent += `\n進度：100%\n${full.repeat(20)}`;
        if (until) {
            replyContent += `\n刪除直到訊息ID: ${until}`;
        };

        try {
            await progressMessage.edit(replyContent);
        } catch (error) {
            console.error(`發送最終訊息時發生錯誤：${error}`);
            await interaction.editReply(replyContent);
        };
    },
};