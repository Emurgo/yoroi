class PinCode {
    getPinKey(pinNumber) {
        return driver.$(`//*[@resource-id="pinKey${pinNumber}"]`);
    };

    get backspaceButton() {
        return driver.$('//*[@resource-id="pinKey⌫"]');
    }
}

module.exports = new PinCode();