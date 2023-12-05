import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const intl = useIntl()

  return {
    currentBalance: intl.formatMessage(messages.currentBalance),
    proceed: intl.formatMessage(messages.proceed),
    disclaimer: intl.formatMessage(messages.disclaimer),
    contentDisclaimer: intl.formatMessage(messages.contentDisclaimer),
    buyADA: intl.formatMessage(messages.buyADA),
    sellADA: intl.formatMessage(messages.sellADA),
    amountTitle: intl.formatMessage(messages.amountTitle),
    providerFee: intl.formatMessage(messages.providerFee),
    provider: intl.formatMessage(messages.provider),
    banxa: intl.formatMessage(messages.banxa),
    title: intl.formatMessage(messages.title),
    notEnoughtBalance: intl.formatMessage(messages.notEnoughtBalance),
    congrats: intl.formatMessage(messages.congrats),
    ADAmountYouGet: intl.formatMessage(messages.ADAmountYouGet),
    fiatAmountYouGet: intl.formatMessage(messages.fiatAmountYouGet),
    goToTransactions: intl.formatMessage(messages.goToTransactions),
    buySellADATransaction: intl.formatMessage(messages.buySellADATransaction),
    descriptionBuySellADATransaction: intl.formatMessage(messages.descriptionBuySellADATransaction),
    rampOnOffTitle: intl.formatMessage(messages.rampOnOffTitle),
    contact: intl.formatMessage(messages.contact),
    and: intl.formatMessage(messages.and),
    customerSupport: intl.formatMessage(messages.customerSupport),
    significant: intl.formatMessage(messages.significant),

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
  buyADA: {
    id: 'rampOnOff.createRampOnOff.buyADA',
    defaultMessage: '!!!Buy ADA',
  },
  sellADA: {
    id: 'rampOnOff.createRampOnOff.sellADA',
    defaultMessage: '!!!Sell ADA',
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
  congrats: {
    id: 'rampOnOff.resultRampOnOff.congrats',
    defaultMessage: '!!!Congrats🎉 Your ADA will come in a few minutes',
  },
  ADAmountYouGet: {
    id: 'rampOnOff.resultRampOnOff.ADAmountYouGet',
    defaultMessage: '!!!ADA amount you get',
  },
  fiatAmountYouGet: {
    id: 'rampOnOff.resultRampOnOff.fiatAmountYouGet',
    defaultMessage: '!!!Fiat amount you sell',
  },
  goToTransactions: {
    id: 'rampOnOff.resultRampOnOff.goToTransactions',
    defaultMessage: '!!!GO TO TRANSACTIONS',
  },
  buySellADATransaction: {
    id: 'rampOnOff.resultRampOnOff.buySellADATransaction',
    defaultMessage: '!!!Buy ADA/Sell transaction',
  },
  descriptionBuySellADATransaction: {
    id: 'rampOnOff.resultRampOnOff.descriptionBuySellADATransaction',
    defaultMessage: '!!!Normally the Buy ADA/Sell transaction takes 3-5 of minutes for the order to be fulfilled. However, there are instances where the order cannot be fulfilled instantly because the compliance team can be doing a manual verification of the KYC docs or any other issues.',
  },
  rampOnOffTitle: {
    id: 'rampOnOff.rampOnOffScreen.rampOnOffTitle',
    defaultMessage: '!!!Exchange ADA',
  },
  contact: {
    id: 'rampOnOff.resultRampOnOff.contact',
    defaultMessage: '!!!Contact',
  },
  and: {
    id: 'rampOnOff.resultRampOnOff.and',
    defaultMessage: '!!!and',
  },
  customerSupport: {
    id: 'rampOnOff.resultRampOnOff.customerSupport',
    defaultMessage: '!!!Yoroi Customer Support',
  },
  significant: {
    id: 'rampOnOff.resultRampOnOff.significant',
    defaultMessage: '!!!if you witnessed any significant transaction delays or errors.',
  }
})
