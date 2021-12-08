class RecoveryPhraseRemember {
  async getAllWords() {
    let allWords = [];
    for (let i = 0; i < 15; i++) {
      const elementText = await driver.$(`//*[@resource-id="mnemonic-${i}"]`).getText();
      allWords.push(elementText);
    }
    return allWords;
  }

  get writtenItDownButton(){
    return driver.$('//*[@resource-id="mnemonicShowScreen::confirm"]');
  }
}

module.exports = new RecoveryPhraseRemember();