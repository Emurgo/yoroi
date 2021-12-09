class AddWallet {
  get createWalletButton() {
    return driver.$('//*[@resource-id="createWalletButton"]');
  }

  get restoreWalletButton() {
    return driver.$('//*[@resource-id="restoreWalletButton"]');
  }
}

module.exports = new AddWallet();