class PinCode {
    getPinKey(pinNumber) {
        return driver.$(`//android.view.ViewGroup[@resource-id="pinKey${pinNumber}"]`);
    };

    get backspaceButton() {
        return driver.$('//android.view.ViewGroup[@resource-id="pinKey⌫"]');
    }
}

module.exports = new PinCode();