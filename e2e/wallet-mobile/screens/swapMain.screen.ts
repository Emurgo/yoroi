import {by, element} from 'detox'

export const inputSellQuantity = () => element(by.id('swap:sell-edit-amount-input'))
export const selectSellToken = () => element(by.id('swap:sell-edit-token-input'))
export const inputBuyQuantity = () => element(by.id('swap:buy-edit-amount-input'))
export const selectBuyToken = () => element(by.id('swap:buy-edit-token-input'))
export const swapTokenName = (tokenName: string) => element(by.text(`${tokenName}`))
export const buttonSwapAction = () => element(by.id('swapButton'))
