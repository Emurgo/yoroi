class NobodyLookingNotification {
  get crossButton() {
    // filler
  }

  get understandButton() {
    return driver.$('//android.view.ViewGroup[@resource-id="mnemonicExplanationModal"]');
  }
}

module.exports = new NobodyLookingNotification();