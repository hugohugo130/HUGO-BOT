const fs = require("fs");

function loadGiveawayData() {
    const { giveawayfilename } = require("./config.json");
    if (fs.existsSync(giveawayfilename)) {
        const rawData = fs.readFileSync(giveawayfilename);
        return JSON.parse(rawData);
    } else {
        return {};
    };
};

function saveGiveawayData(data) {
    const { giveawayfilename } = require("./config.json");
    data = JSON.stringify(data, null, 2);
    fs.writeFileSync(giveawayfilename, data);
};

module.exports = {
    loadGiveawayData,
    saveGiveawayData,
};
