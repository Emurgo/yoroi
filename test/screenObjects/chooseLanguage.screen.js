class ChooseLanguage {
    get chooseLanguageButton() {
        // return $('~chooseLangButton');
        return driver.$('//android.view.ViewGroup[@resource-id="chooseLangButton"]');
    };
}

module.exports = new ChooseLanguage();