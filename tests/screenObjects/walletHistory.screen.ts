export const sendButton = () => driver.$('//*[@resource-id="sendButton"]')
export const receiveButton = () => driver.$('//*[@resource-id="receiveButton"]')
export const transactionsTabButton = () => driver.$('//*[@resource-id="transactionsTabButton"]')
export const assetsTabButton = () => driver.$('//*[@resource-id="assetsTabButton"]')

// assets list
export const assetsListComponent = () => driver.$('//*[@resource-id="assetList"]')
export const assetItemSelector = '//*[@resource-id="assetItem"]'
export const tokenNameSelector = '//*[@resource-id="tokenInfoText"]'
export const tokenFingerPrintSelector = '//*[@resource-id="tokenFingerprintText"]'
export const tokenAmountSelector = '//*[@resource-id="tokenAmount"]'

export const isDisplayed = async () => {
  return (await sendButton().isDisplayed) && (await receiveButton().isDisplayed)
}
