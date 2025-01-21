const { SlashCommandBuilder } = require("discord.js");

function get_response_message_self(mode, executor, amount, totalhacoin) {
    if (mode !== 0 && mode !== 1 && mode !== 2) {
        throw new TypeError("模式必須是 0、1 或 2");
    };
    if (amount < 0) {
        amount = -amount;
    };
    if (mode === 0) {
        return `${executor.toString()} 成功把 ${amount} 個哈狗幣給自己! 他現在有 ${totalhacoin} 個哈狗幣`;
    } else if (mode === 1) {
        return `${executor.toString()} 設定了自己的哈狗幣數量為 ${amount} 個`;
    } else {
        return `${executor.toString()} 扣除了自己的哈狗幣 ${amount} 個, 他現在剩下 ${totalhacoin} 個哈狗幣`;
    };
}

function get_response_message(mode, executor, target, amount, totalhacoin) {
    if (mode !== 0 && mode !== 1 && mode !== 2) {
        throw new TypeError("模式必須是 0、1 或 2");
    };
    if (amount < 0) {
        amount = -amount;
    };

    if (executor.id === target.id) {
        return get_response_message_self(mode, executor, amount, totalhacoin);
    };
    if (mode === 0) {
        return `${executor.toString()} 把 ${amount} 個哈狗幣給了 ${target.toString()}! 他現在有 ${totalhacoin} 個哈狗幣`;
    } else if (mode === 1) {
        return `${executor.toString()} 設定了 ${target.toString()} 的哈狗幣數量為 ${amount} 個`;
    } else {
        return `${executor.toString()} 扣除了 ${target.toString()} 的哈狗幣 ${amount} 個, 他現在剩下 ${totalhacoin} 個哈狗幣`;
    };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("設定哈狗幣")
        .setDescription("給哈狗幣用戶(如果你有權限) set hacoin")
        .addStringOption(option =>
            option.setName("模式")
                .setDescription("哈狗幣操作模式")
                .setRequired(true)
                .addChoices(
                    { name: "增加哈狗幣", value: "0" },
                    { name: "設定哈狗幣", value: "1" },
                    { name: "減少哈狗幣", value: "2" },
                ),
        )
        .addUserOption(option =>
            option.setName("用戶")
                .setDescription("要給哈狗幣的用戶")
                .setRequired(true),
        )
        .addNumberOption(option =>
            option.setName("數量")
                .setDescription("增加哈狗幣的數量")
                .setRequired(true),
        ),
    async execute(interaction) {
        const { sethacoin, loadData } = require("../../module_database.js");
        await interaction.deferReply();
        if (!loadData(interaction.user.id).admin) return await interaction.editReply("您不是機器人管理員。無法使用此指令。");
        let mode = parseInt(interaction.options.getString("模式"));
        /*
        { name: "增加哈狗幣", value: "0" },
        { name: "設定哈狗幣", value: "1" },
        { name: "減少哈狗幣", value: "2" },
        */
        let user = interaction.options.getUser("用戶");
        let amount = interaction.options.getNumber("數量");
        let add = mode === 0 || mode === 2 ? true : false;
        amount = mode === 2 ? -amount : amount;

        sethacoin(user.id, amount, add);
        let totalhacoin = loadData(user.id).hacoin;
        return await interaction.editReply(get_response_message(mode, interaction.user, user, amount, totalhacoin));
    },
};