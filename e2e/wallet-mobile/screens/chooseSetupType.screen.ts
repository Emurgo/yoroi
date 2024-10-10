import {by, element} from 'detox'

export const createNewWalletButton = () => element(by.id('setup-create-new-wallet-button'))
export const restoreWalletButton = () => element(by.id('setup-restore-wallet-button'))
export const connectHwWalletButton = () => element(by.id('setup-connect-HW-wallet-button'))
export const pageTitle = () => element(by.text('Add new wallet'))
