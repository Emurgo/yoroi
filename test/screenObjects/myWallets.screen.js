class MyWallets{
    get pageTitle() {
        return driver.$('[text="My wallets"]');
    }

    get addWalletButton(){
        return driver.$('//*[@resource-id="addWalletOnHaskellShelleyButton"]');
    }

    get addWalletByronButton(){
        return driver.$('//*[@resource-id="addWalletOnByronButton"]');
    }

    get addWalletTestnetButton(){
        return driver.$('[text="ADD WALLET ON TESTNET (SHELLEY-ERA)"]');
    }

    get isDisplayed() {
        driver.setImplicitTimeout(500);
        return this.pageTitle.isDisplayed();
    }
}

module.exports = new MyWallets();