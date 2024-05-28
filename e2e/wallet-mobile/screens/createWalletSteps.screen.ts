import {by, element} from 'detox'

export const step1Title = () => element(by.text('About recovery phrase'))
export const step1TextToValidate = () =>
 element(by.text('You are the only person who knows and stores your Recovery phrase'))
export const step1NextButton = () => element(by.id('setup-step1-next-button'))
export const step2TextToValidate1 = () => element(by.text('How to save your recovery phrase?'))
export const step2TextToValidate2 = () =>
 element(by.text('DO NOT share the recovery phrase as this will allow anyone to access your assets and wallet.'))
export const step2ContinueButton = () => element(by.id('setup-step2-continue-button'))
export const step2InfoIcon = () => element(by.id('step2-info-icon'))
export const step2ShowRecoveryPhraseButton = () => element(by.id('step2-show_hide-recovery-phrase-button'))
export const step2NextButton = () => element(by.id('setup-step2-next-button'))
