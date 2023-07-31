import { by, element } from 'detox'

export const pageTitle = () => element(by.text('My wallets'))
export const addWalletButton = () => element(by.id('addWalletOnHaskellShelleyButton'))
export const addWalletByronButton = () => element(by.id('addWalletOnByronButton'))
export const addWalletTestnetButton = () => element(by.id('addWalletPreprodShelleyButton'))
export const walletByNameButton = (walletName: string) => element(by.text(walletName))
export const createWalletButton = () => element(by.id('createWalletButton'))
export const restoreWalletButton = () => element(by.id('restoreWalletButton'))
export const connectLedgerWalletButton = () => element(by.id('createLedgerWalletButton'))
