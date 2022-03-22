export const restoreWalletButton = () => driver.$('//*[@resource-id="restoreButton"]')
export const mnemonicInputsView = () => driver.$('//*[@resource-id="mnemonicInputsView"]')
export const getMnemonicField = (index) => driver.$(`//*[@resource-id="mnemonicInput${index}"]`)