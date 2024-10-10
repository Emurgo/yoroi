import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import globalMessages from '../../../kernel/i18n/global-messages'

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
    contentDisclaimerPreprod: intl.formatMessage(messages.contentDisclaimerPreprod),
    fiatAmountYouGet: intl.formatMessage(messages.fiatAmountYouGet),
    goToTransactions: intl.formatMessage(messages.goToTransactions),
    notEnoughBalance: intl.formatMessage(messages.notEnoughBalance),
    minAdaRequired: intl.formatMessage(messages.minAdaRequired),
    proceed: intl.formatMessage(messages.proceed),
    provider: intl.formatMessage(messages.provider),
    providerFee: intl.formatMessage(messages.providerFee),
    sellCrypto: intl.formatMessage(messages.sellCrypto),
    significant: intl.formatMessage(messages.significant),
    sellCurrencyWarning: intl.formatMessage(messages.sellCurrencyWarning),
    title: intl.formatMessage(messages.title),
    getFirstCrypto: intl.formatMessage(messages.getFirstCrypto),
    ourTrustedPartners: intl.formatMessage(messages.ourTrustedPartners),
    needMoreCrypto: intl.formatMessage(messages.needMoreCrypto),
    fee: intl.formatMessage(messages.fee),
    preprodFaucetBannerTitle: intl.formatMessage(messages.preprodFaucetBannerTitle),
    preprodFaucetBannerText: intl.formatMessage(messages.preprodFaucetBannerText),
    preprodFaucetBannerButtonText: intl.formatMessage(messages.preprodFaucetBannerButtonText),
    sanchoFaucetBannerTitle: intl.formatMessage(messages.sanchoFaucetBannerTitle),
    sanchoFaucetBannerText: intl.formatMessage(messages.sanchoFaucetBannerText),
    sanchoFaucetBannerButtonText: intl.formatMessage(messages.sanchoFaucetBannerButtonText),
    createOrderPreprodFaucetButtonText: intl.formatMessage(messages.createOrderPreprodFaucetButtonText),
    createOrderPreprodNoticeTitle: intl.formatMessage(messages.createOrderPreprodNoticeTitle),
    createOrderPreprodNoticeText: intl.formatMessage(messages.createOrderPreprodNoticeText),
    createOrderSanchonetFaucetButtonText: intl.formatMessage(messages.createOrderSanchonetFaucetButtonText),
    createOrderSanchonetNoticeTitle: intl.formatMessage(messages.createOrderSanchonetNoticeTitle),
    createOrderSanchonetNoticeText: intl.formatMessage(messages.createOrderSanchonetNoticeText),
    playground: intl.formatMessage(messages.playground),
    close: intl.formatMessage(globalMessages.close),
    error: intl.formatMessage(globalMessages.error),
    loadingLink: intl.formatMessage(messages.loadingLink),
    linkError: intl.formatMessage(messages.linkError),
  }).current
}

const messages = Object.freeze(
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
    contentDisclaimerPreprod: {
      id: 'rampOnOff.createRampOnOff.contentDisclaimer.preprod',
      defaultMessage: `!!!You can test the off-ramp capabilities with test ADA using a 3rd party provider. No real transactions will take place, but you can interact with the interface. By clicking 'Proceed,' you acknowledge that you will be redirected to our partner's website, where you may need to accept their terms and conditions.`,
    },
    contentDisclaimer: {
      id: 'rampOnOff.createRampOnOff.contentDisclaimer',
      defaultMessage:
        '!!!Yoroi uses third party web3 on-and-off ramp solution to provide direct Fiat-ADA exchange. By clicking "Proceed", you also acknowledge that you will be redirected to our partner\'s website, where you may be asked to accept their terms and conditions. The third party web3 on-and-off ramp solution may have a certain limitation that will vary depending on your location and your financial institution.',
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
    minAdaRequired: {
      id: 'rampOnOff.createRampOnOff.minAdaRequired',
      defaultMessage: '!!!Minimum required is 100 ADA',
    },
    sellCurrencyWarning: {
      id: 'rampOnOff.createRampOnOff.sellCurrencyWarning',
      defaultMessage: '!!!You can currently sell only to USD using ACH.',
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
      defaultMessage: '!!!Welcome to Yoroi 👋️\nGet your first ADA fast & easy',
    },
    ourTrustedPartners: {
      id: 'rampOnOff.rampOnOffScreen.ourTrustedPartners',
      defaultMessage: '!!!Top up your wallet safely using our trusted partners',
    },
    needMoreCrypto: {
      id: 'rampOnOff.rampOnOffScreen.needMoreCrypto',
      defaultMessage: '!!!Need more ADA for staking or swap?',
    },
    fee: {
      id: 'rampOnOff.createRampOnOff.fee',
      defaultMessage: '!!!fee',
    },
    preprodFaucetBannerTitle: {
      id: 'rampOnOff.createRampOnOff.preprodfaucetbanner.title',
      defaultMessage: '!!!Learn Cardano with test ADA ⭐️',
    },
    preprodFaucetBannerText: {
      id: 'rampOnOff.createRampOnOff.preprodfaucetbanner.text',
      defaultMessage: `!!!Get started with Cardano's test currency, TADA. It's your key to testing a new world of possibilities.`,
    },
    preprodFaucetBannerButtonText: {
      id: 'rampOnOff.createRampOnOff.preprodfaucetbanner.button.text',
      defaultMessage: '!!!Go to tada faucet',
    },
    sanchoFaucetBannerTitle: {
      id: 'rampOnOff.createRampOnOff.sanchofaucetbanner.title',
      defaultMessage: '!!!Learn Cardano with test ADA ⭐️',
    },
    sanchoFaucetBannerText: {
      id: 'rampOnOff.createRampOnOff.sanchofaucetbanner.text',
      defaultMessage: `!!!Get started with Cardano's test currency, TADA. It's your key to testing a new world of possibilities.`,
    },
    sanchoFaucetBannerButtonText: {
      id: 'rampOnOff.createRampOnOff.sanchofaucetbanner.button.text',
      defaultMessage: '!!!Go to tada faucet',
    },
    createOrderPreprodFaucetButtonText: {
      id: 'rampOnOff.createRampOnOff.createorder.preprodfaucet.button.text',
      defaultMessage: '!!!Add test ada',
    },
    createOrderPreprodNoticeTitle: {
      id: 'rampOnOff.createRampOnOff.createorder.preprodnotice.title',
      defaultMessage: '!!!ADA purchases can only be made on the mainnet',
    },
    createOrderPreprodNoticeText: {
      id: 'rampOnOff.createRampOnOff.createorder.preprodnotice.text',
      defaultMessage: '!!!Switch network or top up your testnet network wallet with the free Cardano faucet',
    },
    createOrderSanchonetFaucetButtonText: {
      id: 'rampOnOff.createRampOnOff.createorder.sanchofaucet.button.text',
      defaultMessage: '!!!Add test ada',
    },
    createOrderSanchonetNoticeTitle: {
      id: 'rampOnOff.createRampOnOff.createorder.sanchonotice.title',
      defaultMessage: '!!!ADA purchases can only be made on the mainnet',
    },
    createOrderSanchonetNoticeText: {
      id: 'rampOnOff.createRampOnOff.createorder.sanchonotice.text',
      defaultMessage: '!!!Switch network or top up your testnet network wallet with the free Cardano faucet',
    },
    playground: {
      id: 'rampOnOff.createRampOnOff.createorder.playground',
      defaultMessage: '!!!Playground',
    },
    loadingLink: {
      id: 'rampOnOff.createRampOnOff.loadingLink',
      defaultMessage: '!!!We are redirecting you outside Yoroi. Please wait',
    },
    linkError: {
      id: 'rampOnOff.createRampOnOff.linkError',
      defaultMessage: '!!!This service is currently unavailable. Please try again later',
    },
  }),
)
