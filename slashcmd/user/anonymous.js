const { SlashCommandBuilder, ChannelType } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("匿名訊息")
        .setDescription("匿名發送訊息")
        .setNameLocalizations({
            "zh-TW": "匿名訊息",
            "zh-CN": "匿名消息",
            "en-US": "anonymous_message",
        })
        .setDescriptionLocalizations({
            "zh-TW": "匿名發送訊息",
            "zh-CN": "匿名发送消息",
            "en-US": "Send an anonymous message",
        })
        .addStringOption(option =>
            option.setName("訊息內容")
                .setDescription("要發送的訊息內容")
                .setRequired(true),
        )
        .addBooleanOption(option =>
            option.setName("是否也發送你的名字")
                .setDescription("是否也發送你的名字 (username, 訊息內容)")
                .setRequired(false),
        )
        .addChannelOption(option =>
            option.setName("發送在哪個頻道")
                .setDescription("在哪個頻道發送訊息")
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildText),
        )
        .addIntegerOption(option =>
            option.setName("訊息發送後多久刪除")
                .setDescription("訊息發送後多久刪除 單位:秒")
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(120),
        ),
    async execute(interaction) {
        const { anonymous_channel_can_use } = require("../../config.json"); 
        const { sleep } = require("../../module_sleep.js");
        await interaction.deferReply({ ephemeral: true });
        let user = interaction.user;
        let msgcontent = interaction.options.getString("訊息內容");
        let isName = interaction.options.getBoolean("是否也發送你的名字") ?? false;
        let sendchannel = interaction.options.getChannel("發送在哪個頻道") ?? interaction.channel;
        let afterdelete = interaction.options.getInteger("訊息發送後多久刪除") ?? null;
        if (!anonymous_channel_can_use.includes(sendchannel.id)) {
            let channel_list = anonymous_channel_can_use.map(channel => `* <#${channel}>`).join("\n");
            return await interaction.editReply(`你不能在這個頻道發送匿名訊息\n你只能在以下頻道發送:\n${channel_list}`);
        };
        if (isName) {
            msgcontent = `${user.globalName || user.username}, ${msgcontent}`;
        };
        // await interaction.editReply(`已發送訊息於 ${sendchannel.toString()} 訊息內容如下:\n${msgcontent}`);
        // sendchannel.send(msgcontent).then(msg => {
        //     if (afterdelete) {
        //         setTimeout(async () => {
        //             await msg.delete();
        //             await interaction.followUp({ content: "訊息已刪除", ephemeral: true });
        //         }, afterdelete * 1000);
        //     };
        // });
        const msg = await sendchannel.send(msgcontent);
        await interaction.editReply(`已發送訊息於 ${sendchannel.toString()} 訊息內容如下:\n${msg.content}`);
        if (!afterdelete) return;
        sleep(afterdelete * 1000);
        await msg.delete();
        await interaction.followUp({ content: "訊息已刪除", ephemeral: true });
    }
};