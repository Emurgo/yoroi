import { by, element } from 'detox'

export const btn_selectLanguageEnglish = () => element(by.id('languageSelect_en-US'))
export const btn_Next = () => element(by.id('chooseLangButton'))
export const chkbox_acceptTos = () => element(by.id('acceptTosCheckbox'))
export const btn_accept = () => element(by.id('acceptTosButton'))