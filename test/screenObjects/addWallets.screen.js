class AddWallets {
    get addWalletButton(){
        return driver.$('//*[@resource-id="addWalletOnHaskellShelleyButton"]');
    }

    get addWalletByronButton(){
        return driver.$('//*[@resource-id="addWalletOnByronButton"]');
    }

    // temporary solution
    get addWalletTestnetButton(){
        return driver.$('[text="ADD WALLET ON TESTNET (SHELLEY-ERA)"]');
    }

    get isDisplayed() {
        driver.setImplicitTimeout(400);
        return this.addWalletButton.isDisplayed();
    }
}

module.exports = new AddWallets();