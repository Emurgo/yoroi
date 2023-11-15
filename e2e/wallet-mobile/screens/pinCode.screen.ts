import {by, element} from 'detox'

export const pinKeyButton = (digit: string) => element(by.id(`pinKey${digit}`))
export const backspaceButton = () => element(by.id('pinKey⌫'))
