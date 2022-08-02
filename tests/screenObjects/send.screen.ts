export const receiverAddressInput = () => driver.$('//*[@resource-id="addressInput"]').$('android.widget.EditText')
export const amountInput = () => driver.$('//*[@resource-id="amountFieldInput"]').$('android.widget.EditText')
export const sendAllCheckbox = () => driver.$('//*[@resource-id="sendAllCheckbox"]')
export const continueButton = () => driver.$('//*[@resource-id="continueButton"]')

export const feesText = () => driver.$('//*[@resource-id="feesText"]')
export const balanceAfterText = () => driver.$('//*[@resource-id="balanceAfterTxText"]')
export const totalAmountText = () => driver.$('//*[@resource-id="totalAmountText"]')
export const receiverAddressText = () => driver.$('//*[@resource-id="receiverAddressText"]')
export const confirmSpendingPasswordInput = () => driver.$('//android.widget.EditText')

export const confirmTxButton = () => driver.$('//*[@resource-id="confirmTxButton"]')
