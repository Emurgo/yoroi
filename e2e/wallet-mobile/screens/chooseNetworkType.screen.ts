import {by, element} from 'detox'

export const networkMainnetButton = () => element(by.id('setup-network-select-mainnet-button'))
export const networkTestnetButton = () => element(by.id('setup-network-select-testnet-button'))
export const pageTitleCreateFlow = () => element(by.text('Create wallet'))
export const pageTitleRestoreFlow = () => element(by.text('Restore wallet'))
