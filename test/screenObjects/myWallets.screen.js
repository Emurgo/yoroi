class MyWallets {
    get pageTitle() {
        return driver.$('//android.widget.TextView[@text="My wallets"]');
    }

    get addWalletButton() {
        return driver.$('//android.widget.TextView[@text="My wallets"]');
    }

    get addWalletTestnetButton() {

    }

    get addWalletBayronEraButton(){

    }

    get isDisplayed() {
        driver.setImplicitTimeout(500);
        return this.pageTitle.isDisplayed();
    }
}

module.exports = new MyWallets();