export const stakePoolHashText = () => driver.$('//*[@resource-id="stakePoolHashText"]')
export const stakingAmountInput = () => driver.$('//*[@resource-id="stakingAmount"]').$('android.widget.EditText')
export const spendingPasswordInput = () => driver.$('//*[@resource-id="spendingPassword"]').$('android.widget.EditText')
export const confirmDelegationButton = () => driver.$('//*[@resource-id="confirmTxButton"]')
