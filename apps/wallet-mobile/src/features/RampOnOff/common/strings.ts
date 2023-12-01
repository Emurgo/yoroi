import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const intl = useIntl()

  return {
    currentBalance: intl.formatMessage(messages.currentBalance),
    proceed: intl.formatMessage(messages.proceed),
    disclaimer: intl.formatMessage(messages.disclaimer),
    contentDisclaimer: intl.formatMessage(messages.contentDisclaimer),
    amountTitle: intl.formatMessage(messages.amountTitle),
    providerFee: intl.formatMessage(messages.providerFee),
    provider: intl.formatMessage(messages.provider),
    banxa: intl.formatMessage(messages.banxa),
    title: intl.formatMessage(messages.title),
    notEnoughtBalance: intl.formatMessage(messages.notEnoughtBalance),
  }
}

export const messages = defineMessages({
  currentBalance: {
    id: 'swap.swapScreen.currentBalance',
    defaultMessage: '!!!Current Balance',
  },
  proceed: {
    id: 'global.proceed',
    defaultMessage: '!!!PROCEED',
  },
  disclaimer: {
    id: 'rampOnOff.createRampOnOff.disclaimer',
    defaultMessage: '!!!Disclaimer',
  },
  contentDisclaimer: {
    id: 'rampOnOff.createRampOnOff.contentDisclaimer',
    defaultMessage:
      '!!!"Yoroi uses Banxa to provide direct Fiat-ADA exchange. By clicking “Proceed,” you also acknowledge that you will be redirected to our partner’s website, where you may be asked to accept their terms and conditions. Banxa may have buy and sell limitations depending on your location and your financial institution."',
  },
  amountTitle: {
    id: 'rampOnOff.createRampOnOff.amountTitle',
    defaultMessage: '!!!ADA amount',
  },
  providerFee: {
    id: 'rampOnOff.createRampOnOff.providerFee',
    defaultMessage: '!!!Provider Fee',
  },
  provider: {
    id: 'rampOnOff.createRampOnOff.provider',
    defaultMessage: '!!!Provider',
  },
  banxa: {
    id: 'rampOnOff.createRampOnOff.banxa',
    defaultMessage: '!!!Banxa',
  },
  title: {
    id: 'global.buyTitle',
    defaultMessage: '!!!Exchange ADA',
  },
  notEnoughtBalance: {
    id: 'swap.swapScreen.notEnoughBalance',
    defaultMessage: '!!!Not Enough Balannce',
  },
})
