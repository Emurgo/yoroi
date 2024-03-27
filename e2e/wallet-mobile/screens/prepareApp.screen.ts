import {by, element} from 'detox'

export const btn_SelectLanguageEnglish = () => element(by.id('languageSelect_en-US'))
export const btn_Next = () => element(by.id('chooseLangButton'))
export const chkbox_AcceptTos = () => element(by.id('acceptTosCheckbox'))
export const btn_Accept = () => element(by.id('acceptTosButton'))
