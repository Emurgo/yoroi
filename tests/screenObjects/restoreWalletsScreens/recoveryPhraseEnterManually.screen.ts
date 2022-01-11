export const restoreWalletButton = () => driver.$('//*[@resource-id="restoreButton"]')
export const getMnemonicField = (index) => driver.$(`//*[@resource-id="mnemonicInput${index}"]`)