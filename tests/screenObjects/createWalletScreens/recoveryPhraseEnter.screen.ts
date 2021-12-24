export const enterRecoveryPhrase = async (phraseArray: string[]): Promise<void> => {
  for (const phraseArrayWord of phraseArray) {
    const element = await driver.$(`//*[@resource-id="wordBadgeNonTapped-${phraseArrayWord}"]`)
    await element.click()
  }
}

export const confirmButton = () => driver.$('//*[@resource-id="mnemonicCheckScreen::confirm"]')
