const { loadData, saveUserData } = require("../module_database.js");
const { Events, InteractionType } = require("discord.js");

module.exports = {
    setup(client) {
        try {
            client.on(Events.InteractionCreate, async (interaction) => {
                if (interaction.type != InteractionType.ModalSubmit) return;
                if (interaction.customId != 'set_birthday_modal') return;
                let user = interaction.user;
                let userid = user.id;
                let birthday = interaction.fields.getTextInputValue('birthday_input');
                if (!birthday.match(/^\d{2}-\d{2}$/)) {
                    return await interaction.reply('日期格式須為MM-DD!');
                };
                let data = loadData(userid)
                data.birthday = birthday;
                
                saveUserData(userid, data);

                await interaction.reply(`您的生日已設為 ${birthday}!`);
            });
        } catch (error) {
            require("../module_senderr").senderr({ client: client, msg: `處理設定生日時出錯：${error.stack}`, clientready: true });
        };
    },
};