import {by, element} from 'detox'

export const inputSellQuantity = () => element(by.id('inputSellQuantity'))
export const selectSellToken = () => element(by.id('selectTokenSell'))
export const inputBuyQuantity = () => element(by.id('inputBuyQuantity'))
export const selectBuyToken = () => element(by.id('selectTokenBuy'))
export const swapTokenName = (tokenName: string) =>
 element(by.text(`${tokenName}`))
export const buttonSwapAction = () => element(by.id('swapButton'))
