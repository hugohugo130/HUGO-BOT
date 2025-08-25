module.exports = {
    sleep(ms) {
        const sharedArray = new Int32Array(new SharedArrayBuffer(4));
        Atomics.wait(sharedArray, 0, 0, ms);
    },
    async asleep(waitTimeInMs) {
        return new Promise(resolve => setTimeout(resolve, waitTimeInMs))
    },
};