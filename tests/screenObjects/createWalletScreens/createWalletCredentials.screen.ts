import {WALLET_ALREADY_EXISTS, MUST_BE_FILLED} from '../../helpers/errors'

const getAllEditFields = () => driver.$$('//android.widget.EditText')

export const credentialsView = () => driver.$('//*[@resource-id="credentialsView"]')
// @ts-ignore
export const walletNameEdit = (): WebdriverIO.Element => getAllEditFields()[0]
export const walletNameExistsError = () => driver.$(`[text="${WALLET_ALREADY_EXISTS}"]`);
export const walletNameIsEmptyError = () => driver.$(`text="${MUST_BE_FILLED}"`);
// @ts-ignore
export const spendingPasswordEdit = (): WebdriverIO.Element => getAllEditFields()[1]
// @ts-ignore
export const repeatSpendingPasswordEdit = (): WebdriverIO.Element => getAllEditFields()[2]
export const continueButton = () => driver.$('//*[@resource-id="walletFormContinueButton"]')
