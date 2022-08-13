export const receiverAddressInput = () => driver.$('//*[@resource-id="addressInput"]').$('android.widget.EditText')
export const amountInput = () => driver.$('//*[@resource-id="amountFieldInput"]').$('android.widget.EditText')
export const sendAllCheckbox = () => driver.$('//*[@resource-id="sendAllCheckbox"]')
export const continueButton = () => driver.$('//*[@resource-id="continueButton"]')

export const feesText = () => driver.$('//*[@resource-id="feesText"]')
export const balanceAfterText = () => driver.$('//*[@resource-id="balanceAfterTxText"]')

export const receiverAddressText = () => driver.$('//*[@resource-id="receiverAddressText"]')
export const totalAmountText = () => driver.$('//*[@resource-id="totalAmountText"]')
export const selectAssetButton = () => driver.$('//*[@resource-id="selectAssetButton"]')
export const confirmSpendingPasswordInput = () => driver.$('//android.widget.EditText')

// token selector screen
export const assetsListComponent = () => driver.$('//*[@resource-id="assetsList"]')
export const assetItemSelector = '//*[@resource-id="assetSelectorItem"]'
export const tokenNameSelector = '//*[@resource-id="tokenInfoText"]'
export const tokenFingerPrintSelector = '//*[@resource-id="tokenFingerprintText"]'
export const tokenAmountSelector = '//*[@resource-id="tokenAmountText"]'

export const confirmTxButton = () => driver.$('//*[@resource-id="confirmTxButton"]')
