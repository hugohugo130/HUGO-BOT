const { SlashCommandBuilder, EmbedBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("投票")
        .setDescription("建立投票 vote")
        .addStringOption(option =>
            option.setName("標題")
                .setDescription("投票標題")
                .setRequired(true),
        )
        .addIntegerOption(option =>
            option.setName("回答選項數")
                .setDescription("投票回答選項數")
                .setRequired(true)
                .setMinValue(2)
                .setMaxValue(10),
        )
        .addStringOption(option =>
            option.setName("描述")
                .setDescription("投票描述")
                .setRequired(false),
        )
        .addIntegerOption(option =>
            option.setName("期間")
                .setDescription("投票期間")
                .addChoices(
                    { name: "1小時", value: 60 * 60 },
                    { name: "4小時", value: 4 * 60 * 60 },
                    { name: "8小時", value: 8 * 60 * 60 },
                    { name: "1天", value: 24 * 60 * 60 },
                    { name: "3天", value: 3 * 24 * 60 * 60 },
                    { name: "1週", value: 7 * 24 * 60 * 60 },
                    { name: "2週", value: 14 * 24 * 60 * 60 },
                )
                .setRequired(false),
        )
        .addBooleanOption(option =>
            option.setName("強制")
                .setDescription("是否強制投票(覆蓋已經存在的投票, 如有, 僅限機器人管理員可用)")
                .setRequired(false),
        ),
    async execute(interaction) {
        const { load_db, save_db, loadData } = require("../../../module_database.js");
        const { default_value } = require("../../../config.json");
        let db = load_db();

        const title = interaction.options.getString('標題');
        const optionnum = interaction.options.getInteger('回答選項數');
        const description = interaction.options.getString('描述') ?? "無";
        const period = interaction.options.getInteger('期間') ?? 60 * 60;
        const force = interaction.options.getBoolean('強制') ?? false;

        if (force && !loadData(interaction.user.id).admin) return interaction.reply({ content: "你不是機器人管理員，不能啟用強制投票模式", ephemeral: true });

        if (db.vote.active && !force) {
            return interaction.reply({ content: "目前已有投票進行中，請稍後再試", ephemeral: true });
        };

        const modal = new ModalBuilder()
            .setCustomId('voteOptionsModal')
            .setTitle('輸入投票選項');

        let optionInputs = [];
        for (let i = 0; i < optionnum; i++) {
            optionInputs.push(
                new TextInputBuilder()
                    .setCustomId(`option${i}`)
                    .setLabel(`選項${i + 1}`)
                    .setPlaceholder(`請輸入選項${i + 1}的內容`)
                    .setStyle(TextInputStyle.Short)
                    .setMinLength(1)
                    .setMaxLength(100)
                    .setRequired(true),
            );
        };

        const rows = optionInputs.map(input => new ActionRowBuilder().addComponents(input));
        modal.addComponents(...rows);

        await interaction.showModal(modal);

        const modalSubmit = await interaction.awaitModalSubmit({
            time: 300000, // 300秒
            filter: i => i.customId === 'voteOptionsModal'
        });

        const optionValues = [];
        for (let i = 0; i < optionnum; i++) {
            optionValues.push(modalSubmit.fields.getTextInputValue(`option${i}`));
        };

        const endtime = Math.floor(Date.now() / 1000) + period;

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor(0x00BBFF)
            .setDescription(description + `\n> 投票結束時間: <t:${endtime}:D><t:${endtime}:T> (<t:${endtime}:R>)`);

        const option_choose_result_embed = new EmbedBuilder()
            .setTitle("投票結果")
            .setColor(0x00BBFF)
            .addFields(
                { name: "空", value: "正在等待投票" },
            );

        const row = new ActionRowBuilder()
            .addComponents(
                ...optionValues.map((value, index) =>
                    new ButtonBuilder()
                        .setCustomId(`vote_${index}`)
                        .setLabel(value)
                        .setStyle(ButtonStyle.Primary)
                ),
            );

        const message = await interaction.channel.send({ content: `${interaction.user.toString()} 發起了一個投票!`, embeds: [embed, option_choose_result_embed], components: [row], allowedMentions: { repliedUser: false } });

        if (force) {
            db.vote = default_value["db.json"].vote;
            save_db(db);
        };

        db.vote = {
            active: true,
            host: interaction.user.id,
            title: title,
            description: description,
            options: optionValues,
            endtime: endtime,
            message_id: message.id,
            participants: {
                ...optionValues.map(option => ({
                    option: option,
                    count: 0,
                    user_ids: [],
                })),
            },
        };

        save_db(db);

        try {
            await modalSubmit.reply("投票已建立");
        } catch (error) {
            if (!error.message.includes("Interaction has already been acknowledged.")) throw error;
        };
    },
};