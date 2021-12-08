class AddWallet {
  get createWalletButton() {
    return driver.$('//android.view.ViewGroup[@resource-id="createWalletButton"]');
  }

  get restoreWalletButton() {
    return driver.$('//android.view.ViewGroup[@resource-id="restoreWalletButton"]');
  }
}

module.exports = new AddWallet();