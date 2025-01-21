function time() {
    // YYYY-MM-DD HH:MM:SS
    return new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '); // 取得當前時間
};

function time2() {
    // YYYY-MM-DD HH:MM:SS.ms
    return new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 23).replace('T', ' '); // 取得當前時間
};

module.exports = {
    time,
    time2
};