function randomhacoin(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
};

function randomDecimal(min, max) {
    return Math.random() * (max - min) + min;
};

module.exports = {
    randomhacoin,
    randomDecimal,
};