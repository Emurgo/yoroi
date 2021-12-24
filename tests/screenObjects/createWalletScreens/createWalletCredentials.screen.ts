const getAllEditFields = () => driver.$$('//android.widget.EditText')

export const walletNameEdit = () => getAllEditFields()[0]
export const spendingPasswordEdit = () => getAllEditFields()[1]
export const repeatSpendingPasswordEdit = () => getAllEditFields()[2]
export const continueButton = () => driver.$('//*[@resource-id="walletFormContinueButton"]')
