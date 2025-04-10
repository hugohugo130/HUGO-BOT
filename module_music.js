// const fs = require('fs');
// const path = require('path');

// // 定義 JSON 文件路徑
// const queueFilePath = path.join(__dirname, 'queue.json');

// // 讀取佇列的函數
// function loadQueue() {
//     if (fs.existsSync(queueFilePath)) {
//         try {
//             const data = fs.readFileSync(queueFilePath);
//             const jsonData = JSON.parse(data);

//             // 確保 jsonData 是陣列並且有內容
//             if (Array.isArray(jsonData) && jsonData.length > 0) {
//                 // 將陣列轉換為正確的 Map 格式
//                 const queueMap = {};
//                 jsonData.forEach(([guildId, queueData]) => {
//                     queueMap[guildId] = queueData;
//                 });
//                 return queueMap;
//             };
//             return {};
//         } catch (error) {
//             console.error('載入隊列時發生錯誤:', error);
//             return {};
//         };
//     };
//     return {};
// };

// // 寫入佇列的函數
// function saveQueue(queue) {
//     try {
//         // 將 Map 轉換為陣列格式
//         const queueToSave = Array.from(queue.entries()).map(([guildId, serverQueue]) => {
//             if (!serverQueue || !serverQueue.songs) return null;

//             // 添加安全檢查，但移除歌曲長度檢查
//             const queueData = {
//                 textChannel: serverQueue.textChannel?.id || serverQueue.textChannel,
//                 voiceChannel: serverQueue.voiceChannel?.id || serverQueue.voiceChannel,
//                 songs: serverQueue.songs,
//             };

//             // 只要有基本資料就保存
//             if (queueData.textChannel && queueData.voiceChannel) {
//                 return [guildId, queueData];
//             };
//             return null;
//         }).filter(entry => entry !== null); // 過濾掉無效的條目

//         // 寫入文件，不再檢查長度
//         fs.writeFileSync(queueFilePath, JSON.stringify(queueToSave, null, 4));
//         // console.log('成功保存隊列');
//     } catch (error) {
//         console.error('保存佇列時發生錯誤:', error);
//         console.error('隊列內容:', JSON.stringify(Array.from(queue.entries()), null, 2));
//     };
// };

// module.exports = {
//     loadQueue,
//     saveQueue,
// };

