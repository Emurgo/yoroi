class CreateNewWalletScreen1 {
  _getAllEditFields() {
    return driver.$$('//android.widget.EditText');
  }

  get walletNameEdit() {
    return this._getAllEditFields()[0];
  }

  get spendingPasswordEdit() {
    return this._getAllEditFields()[1];
  }

  get repeatSpendingPasswordEdit() {
    return this._getAllEditFields()[2];
  }

  get continueButton() {
    return driver.$('//*[@resource-id="walletFormContinueButton"]');
  }
}

module.exports = new CreateNewWalletScreen1();