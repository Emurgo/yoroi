import {WALLET_ALREADY_EXISTS, MUST_BE_FILLED} from '../../helpers/errors'

const getAllEditFields = () => driver.$$('//android.widget.EditText')

export const credentialsView = () => driver.$('//*[@resource-id="credentialsView"]')
export const walletNameEdit = () => getAllEditFields()[0]
export const walletNameExistsError = () => driver.$(`[text="${WALLET_ALREADY_EXISTS}"]`);
export const walletNameIsEmptyError = () => driver.$(`text="${MUST_BE_FILLED}"`);
export const spendingPasswordEdit = () => getAllEditFields()[1]
export const repeatSpendingPasswordEdit = () => getAllEditFields()[2]
export const continueButton = () => driver.$('//*[@resource-id="walletFormContinueButton"]')
