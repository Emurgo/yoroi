export const confirmTxView = () => driver.$('//*[@resource-id="twoActionView"]')
export const recoveredBalanceText = () => driver.$('//*[@resource-id="recoveredBalanceText"]')
export const feeAmountText = () => driver.$('//*[@resource-id="feeAmountText"]')
export const totalAmountText = () => driver.$('//*[@resource-id="totalAmountText"]')
export const walletPasswordInput = () =>
  driver.$('//*[@resource-id="walletPasswordInput"]').$('android.widget.EditText')
export const cancelTxButton = () => driver.$('//*[@resource-id="cancelTxButton"]')
export const confirmTxButton = () => driver.$('//*[@resource-id="confirmTxButton"]')

export const isDisplayed = async () => {
  return (await confirmTxView().isDisplayed()) && (await totalAmountText().isDisplayed())
}
