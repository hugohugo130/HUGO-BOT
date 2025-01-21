const { SlashCommandBuilder } = require("discord.js");

function check_can_sign(userid) {
    const { loadData, saveUserData } = require("../../module_database.js");
    const { emptyeg } = require("../../config.json");
    let data = loadData(userid);
    if (!data[userid]) {
        data[userid] = emptyeg;
        saveUserData(data);
        return true;
    };

    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let curdate = [year, month, day];
    let latestdate = data.latestdate;
    if (
        latestdate === "" ||
        (
            data.admin &&
            data.infsign
        )
    ) return true;
    latestdate = latestdate.split(" ");
    for (var index = 0; index < latestdate.length; index++) {
        a = latestdate[index];
        b = curdate[index];
        if (b > a) return true;
    };
    return false;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("簽到")
        .setDescription("簽到並獲得哈狗幣 sign"),
    async execute(interaction) {
        const { minhacoin, maxhacoin, BotChannelID } = require("../../config.json");
        const { loadData, sethacoin_forsign, sethacoin, get_boosters } = require("../../module_database.js");
        const { randomhacoin } = require("../../module_getrandomhacoin.js");
        await interaction.deferReply();
        let user = interaction.user;
        let userid = user.id;

        if (check_can_sign(userid)) {
            let gothacoin = randomhacoin(minhacoin, maxhacoin + 1);
            for (let booster of get_boosters(1)) {
                const user = booster.user;
                const channel = booster.guild.channels.cache.get(BotChannelID);
                sethacoin(user.id, gothacoin, true);
                await channel.send(`**${user.toString()}** 今天加成了 **${booster.guild.name}** 所以獲得了 1 哈狗幣!`);
            };
            sethacoin_forsign(userid, gothacoin, true);
            let totalhacoin = loadData(userid).hacoin;
            await interaction.editReply(`簽到成功!獲得了${gothacoin}哈狗幣!你現在有${totalhacoin}哈狗幣 好耶!`);
        } else {
            await interaction.editReply("今天你已經簽到過啦!明天再來吧!");
        };
    },
};