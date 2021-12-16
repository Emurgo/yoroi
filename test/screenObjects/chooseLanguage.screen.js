class ChooseLanguage {
    get chooseLanguageButton() {
        return driver.$('//*[@resource-id="chooseLangButton"]');
    };
}

module.exports = new ChooseLanguage();