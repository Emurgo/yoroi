class RecoveryPhraseEnter {
  async enterRecoveryPhrase(phraseArray) {
    for (const phraseArrayWord of phraseArray) {
      const element = await driver.$(`//*[@resource-id="wordBadgeNonTapped-${phraseArrayWord}"]`);
      await element.click();
    }
  }

  async removeLastWord() {
  }

  get confirmButton() {
    return driver.$('//*[@resource-id="mnemonicCheckScreen::confirm"]');
  }
}

module.exports = new RecoveryPhraseEnter();