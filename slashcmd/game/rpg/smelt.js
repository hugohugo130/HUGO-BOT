// const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
// const { smelt, name } = require("../../../rpg.js");

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName("smelt")
//         .setDescription("冶煉一切！")
//         .setNameLocalizations({
//             "zh-TW": "冶煉",
//             "zh-CN": "冶炼",
//             "en-US": "smelt",
//         })
//         .setDescriptionLocalizations({
//             "zh-TW": "冶煉一切！",
//             "zh-CN": "冶炼一切！",
//             "en-US": "Smelt Everything!",
//         })
//         .addStringOption(option =>
//             option.setName("item")
//                 .setNameLocalizations({
//                     "zh-TW": "物品",
//                     "zh-CN": "物品",
//                     "en-US": "item",
//                 })
//                 .setDescription("Items to smelt")
//                 .setDescriptionLocalizations({
//                     "zh-TW": "要冶煉的物品",
//                     "zh-CN": "要冶炼的物品",
//                     "en-US": "Items to smelt",
//                 })
//                 .setRequired(true)
//                 .addChoices(
//                     ...Object.entries(smelt).map(([item_id, time]) => {
//                         return {
//                             name: `${name[item_id]} (${time}s)`,
//                             value: `${item_id}|${time}`,
//                         };
//                     })
//                 ),
//         )
//         .addIntegerOption(option =>
//             option.setName("數量")
//                 .setDescription("要冶煉的數量 (預設1)")
//                 .setMinValue(1)
//                 .setMaxValue(10)
//                 .setRequired(false),
//         )
//         .addIntegerOption(option => 
//             option.setName("煤炭")
//                 .setDescription("要放多少煤炭 (預設1)")
//                 .setMinValue(1)
//                 .setRequired(false),
//         ),
//     async execute(interaction) {
//         const { load_rpg_data, save_rpg_data } = require("../../../module_database.js");
//         const { name } = require("../../../rpg.js");
//         const { setEmbedFooter, get_emoji } = require("../../../thebotfunction/rpg/msg_handler.js");
//         await interaction.deferReply();

//         const userid = interaction.user.id;
//         let rpg_data = load_rpg_data(userid);

//         let item_data = interaction.options.getString("物品");
//         const amount = interaction.options.getInteger("數量") ?? 1;
//         const coal_amount = interaction.options.getInteger("煤炭") ?? 1;

//         let [item_id, duration] = item_data.split("|");
//         duration = parseInt(duration);


//         let item_need = [
//             {
//                 item: item_id,
//                 amount,
//             },
//             {
//                 item: "coal",
//                 amount: coal_amount,
//             },
//         ];
//         let item_missing = [];

//         for (const need_item in item_need) {
//             const item_id = need_item.item
//             const need_amount = need_item.amount;
//             const have_amount = (rpg_data.inventory[item_id] || 0);

//             if (have_amount < need_amount) {
//                 item_missing.push({
//                     name: name[item_id] || need_item,
//                     amount: need_amount - have_amount,
//                 });
//             };
//         };

//         if (item_missing.length > 0) {
//             const items = [];
//             for (const missing of item_missing) {
//                 items.push(`${missing.name} \`x${missing.amount}\`個`);
//             };

//             const embed = new EmbedBuilder()
//                 .setTitle("你沒有足夠的材料")
//                 .setColor(0xF04A47)
//                 .setDescription(`你缺少了 ${items.join("、")}`);

//             return await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)], ephemeral: true });
//         };

//         for (const need_item in item_need) {
//             rpg_data.inventory[need_item] -= item_need[need_item];
//         };

//         const output_amount = amount;

//         rpg_data.inventory[item_id] += output_amount;
//         save_rpg_data(userid, rpg_data);

//         const emoji = get_emoji(interaction.guild, "bread")
//         const embed = new EmbedBuilder()
//             .setColor(0x0099ff)
//             .setTitle(`${emoji} | 烘焙物品`)
//             .setDescription("烘焙物品，啟動!");
        
//         interaction.client.cooking_interactions.push({
//             userid,
//             item_id,
//             amount,
//             coal_amount,
//             duration,
//             interaction,
//             current: 0,
//             legal: amount >= coal_amount,
//         });

//         await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)] });
//     },
// };
