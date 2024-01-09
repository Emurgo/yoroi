import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const intl = useIntl()

  return React.useRef({
    amountTitle: intl.formatMessage(messages.amountTitle),
    and: intl.formatMessage(messages.and),
    banxa: intl.formatMessage(messages.banxa),
    buyCrypto: intl.formatMessage(messages.buyCrypto),
    buySellCrypto: intl.formatMessage(messages.buySellCrypto),
    congrats: intl.formatMessage(messages.congrats),
    contact: intl.formatMessage(messages.contact),
    contentDisclaimer: intl.formatMessage(messages.contentDisclaimer),
    cryptoAmountYouGet: intl.formatMessage(messages.cryptoAmountYouGet),
    currentBalance: intl.formatMessage(messages.currentBalance),
    customerSupport: intl.formatMessage(messages.customerSupport),
    descriptionBuySellADATransaction: intl.formatMessage(messages.descriptionBuySellADATransaction),
    disclaimer: intl.formatMessage(messages.disclaimer),
    fiatAmountYouGet: intl.formatMessage(messages.fiatAmountYouGet),
    goToTransactions: intl.formatMessage(messages.goToTransactions),
    notEnoughBalance: intl.formatMessage(messages.notEnoughBalance),
    proceed: intl.formatMessage(messages.proceed),
    provider: intl.formatMessage(messages.provider),
    providerFee: intl.formatMessage(messages.providerFee),
    rampOnOffTitle: intl.formatMessage(messages.rampOnOffTitle),
    sellCrypto: intl.formatMessage(messages.sellCrypto),
    significant: intl.formatMessage(messages.significant),
    title: intl.formatMessage(messages.title),
    getFirstCrypto: intl.formatMessage(messages.getFirstCrypto),
    ourTrustedPartners: intl.formatMessage(messages.ourTrustedPartners),
    needMoreCrypto: intl.formatMessage(messages.needMoreCrypto),
  }).current
}

export const messages = Object.freeze(
  defineMessages({
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
    buyCrypto: {
      id: 'rampOnOff.createRampOnOff.buyCrypto',
      defaultMessage: '!!!Buy ADA',
    },
    sellCrypto: {
      id: 'rampOnOff.createRampOnOff.sellCrypto',
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
    notEnoughBalance: {
      id: 'swap.swapScreen.notEnoughBalance',
      defaultMessage: '!!!Not Enough Balannce',
    },
    congrats: {
      id: 'rampOnOff.resultRampOnOff.congrats',
      defaultMessage: '!!!Congrats🎉 Your ADA will come in a few minutes',
    },
    cryptoAmountYouGet: {
      id: 'rampOnOff.resultRampOnOff.cryptoAmountYouGet',
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
    buySellCrypto: {
      id: 'rampOnOff.resultRampOnOff.buySellCrypto',
      defaultMessage: '!!!Buy ADA/Sell transaction',
    },
    descriptionBuySellADATransaction: {
      id: 'rampOnOff.resultRampOnOff.descriptionBuySellADATransaction',
      defaultMessage:
        '!!!Normally the Buy ADA/Sell transaction takes 3-5 of minutes for the order to be fulfilled. However, there are instances where the order cannot be fulfilled instantly because the compliance team can be doing a manual verification of the KYC docs or any other issues.',
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
    },
    getFirstCrypto: {
      id: 'rampOnOff.rampOnOffScreen.getFirstCrypto',
      defaultMessage: '!!!Welcome to Yoroi 👋️ Get your first ADA fast & easy',
    },
    ourTrustedPartners: {
      id: 'rampOnOff.rampOnOffScreen.ourTrustedPartners',
      defaultMessage: '!!!Top up your wallet safely using our trusted partners',
    },
    needMoreCrypto: {
      id: 'rampOnOff.rampOnOffScreen.needMoreCrypto',
      defaultMessage: '!!!Need more ADA for staking or swap?',
    },
  }),
)
