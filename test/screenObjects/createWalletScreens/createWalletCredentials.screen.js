class CreateNewWalletScreen1 {
  getAllEditFields() {
    return driver.$$('//android.widget.EditText');
  }

  get walletNameEdit() {
    return this.getAllEditFields()[0];
  }

  get spendingPasswordEdit() {
    return this.getAllEditFields()[1];
  }

  get repeatSpendingPasswordEdit() {
    return this.getAllEditFields()[2];
  }

  get continueButton() {
    return driver.$('//*[@resource-id="walletFormContinueButton"]');
  }
}

module.exports = new CreateNewWalletScreen1();