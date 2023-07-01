export const connectLedgerTitle = () => driver.$('//*[@text="Connect to Ledger Device"]')
export const continueButton = () => driver.$('//*[@resource-id="continueButton"]')

export const allowUsingLocation = () => driver.$('//*[@resource-id="com.android.permissioncontroller:id/permission_allow_foreground_only_button"]')
export const scanningTitle = () => driver.$('//*[@text="Scanning bluetooth devices..."]')
export const getDevices = () => driver.$$('//android.widget.ScrollView')

export const walletNameInput = () => driver.$('//android.widget.EditText')
export const saveWalletButton = () => driver.$('//*[@resource-id="saveWalletButton"]')