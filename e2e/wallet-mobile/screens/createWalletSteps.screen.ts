import {by, element} from 'detox'

export const step1Title = () => element(by.text('About recovery phrase'))
export const step1TextToValidate = () =>
 element(by.text('You are the only person who knows and stores your Recovery phrase'))
export const step1NextButton = () => element(by.id('setup-step1-next-button'))
