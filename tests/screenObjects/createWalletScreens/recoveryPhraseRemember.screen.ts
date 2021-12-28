export const getAllWords = async (): Promise<string[]> => {
  let allWords: string[] = []
  for (let i = 0; i < 15; i++) {
    const elementText = await driver.$(`//*[@resource-id="mnemonic-${i}"]`).getText()
    allWords.push(elementText)
  }
  return allWords
}

export const writtenItDownButton = () => driver.$('//*[@resource-id="mnemonicShowScreen::confirm"]')
