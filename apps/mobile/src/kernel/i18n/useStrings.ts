import {freeze} from 'immer'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import globalMessages from './global-messages'

export const useStrings = () => {
  const intl = useIntl()

  return React.useMemo(() => {
    const f = intl.formatMessage

    return freeze({
      // Auth strings
      auth: {
        unknownError: f(messages.auth.unknownError),
        tooManyAttempts: f(messages.auth.tooManyAttempts),
        invalidPin: f(messages.auth.invalidPin),
        authorize: f(messages.auth.authorize),
        usePasscode: f(messages.auth.usePasscode),
        titleLoginWithPin: f(messages.auth.titleLoginWithPin),
        titleChangePin: f(messages.auth.titleChangePin),
        subtitleChangePin: f(messages.auth.subtitleChangePin),
        pinInputTitle: f(messages.auth.pinInputTitle),
        pinInputSubtitle: f(messages.auth.pinInputSubtitle),
        pinInputConfirmationTitle: f(messages.auth.pinInputConfirmationTitle),
        pinInputConfirmationSubTitle: f(messages.auth.pinInputConfirmationSubTitle),
      },

      // Exchange strings
      exchange: {
        amountTitle: f(messages.exchange.amountTitle),
        and: f(messages.exchange.and),
        banxa: f(messages.exchange.banxa),
        buyCrypto: f(messages.exchange.buyCrypto),
        buySellCrypto: f(messages.exchange.buySellCrypto),
        congrats: f(messages.exchange.congrats),
        contact: f(messages.exchange.contact),
        contentDisclaimer: f(messages.exchange.contentDisclaimer),
        cryptoAmountYouGet: f(messages.exchange.cryptoAmountYouGet),
        currentBalance: f(messages.exchange.currentBalance),
        customerSupport: f(messages.exchange.customerSupport),
        descriptionBuySellADATransaction: f(messages.exchange.descriptionBuySellADATransaction),
        disclaimer: f(messages.exchange.disclaimer),
        contentDisclaimerPreprod: f(messages.exchange.contentDisclaimerPreprod),
        fiatAmountYouGet: f(messages.exchange.fiatAmountYouGet),
        goToTransactions: f(messages.exchange.goToTransactions),
        notEnoughBalance: f(messages.exchange.notEnoughBalance),
        minAdaRequired: f(messages.exchange.minAdaRequired),
        proceed: f(messages.exchange.proceed),
        provider: f(messages.exchange.provider),
        providerFee: f(messages.exchange.providerFee),
        sellCrypto: f(messages.exchange.sellCrypto),
        significant: f(messages.exchange.significant),
        sellCurrencyWarning: f(messages.exchange.sellCurrencyWarning),
        title: f(messages.exchange.title),
        getFirstCrypto: f(messages.exchange.getFirstCrypto),
        ourTrustedPartners: f(messages.exchange.ourTrustedPartners),
        needMoreCrypto: f(messages.exchange.needMoreCrypto),
        fee: f(messages.exchange.fee),
        preprodFaucetBannerTitle: f(messages.exchange.preprodFaucetBannerTitle),
        preprodFaucetBannerText: f(messages.exchange.preprodFaucetBannerText),
        preprodFaucetBannerButtonText: f(messages.exchange.preprodFaucetBannerButtonText),
        createOrderPreprodFaucetButtonText: f(messages.exchange.createOrderPreprodFaucetButtonText),
        createOrderPreprodNoticeTitle: f(messages.exchange.createOrderPreprodNoticeTitle),
        createOrderPreprodNoticeText: f(messages.exchange.createOrderPreprodNoticeText),
        playground: f(messages.exchange.playground),
        loadingLink: f(messages.exchange.loadingLink),
        linkError: f(messages.exchange.linkError),
      },

      // Scan strings
      scan: {
        scanTitle: f(messages.scan.scanTitle),
        cameraPermissionDeniedTitle: f(messages.scan.cameraPermissionDeniedTitle),
        cameraPermissionDeniedHelp: f(messages.scan.cameraPermissionDeniedHelp),
        errorUnknownTitle: f(messages.scan.errorUnknownTitle),
        errorUnknownHelp: f(messages.scan.errorUnknownHelp),
        errorUnknownContentTitle: f(messages.scan.errorUnknownContentTitle),
        errorUnknownContentHelp: f(messages.scan.errorUnknownContentHelp),
        linksErrorExtraParamsDeniedTitle: f(messages.scan.linksErrorExtraParamsDeniedTitle),
        linksErrorExtraParamsDeniedHelp: f(messages.scan.linksErrorExtraParamsDeniedHelp),
        linksErrorForbiddenParamsProvidedTitle: f(messages.scan.linksErrorForbiddenParamsProvidedTitle),
        linksErrorForbiddenParamsProvidedHelp: f(messages.scan.linksErrorForbiddenParamsProvidedHelp),
        linksErrorRequiredParamsMissingTitle: f(messages.scan.linksErrorRequiredParamsMissingTitle),
        linksErrorRequiredParamsMissingHelp: f(messages.scan.linksErrorRequiredParamsMissingHelp),
        linksErrorParamsValidationFailedTitle: f(messages.scan.linksErrorParamsValidationFailedTitle),
        linksErrorParamsValidationFailedHelp: f(messages.scan.linksErrorParamsValidationFailedHelp),
        linksErrorUnsupportedAuthorityTitle: f(messages.scan.linksErrorUnsupportedAuthorityTitle),
        linksErrorUnsupportedAuthorityHelp: f(messages.scan.linksErrorUnsupportedAuthorityHelp),
        linksErrorUnsupportedVersionTitle: f(messages.scan.linksErrorUnsupportedVersionTitle),
        linksErrorUnsupportedVersionHelp: f(messages.scan.linksErrorUnsupportedVersionHelp),
        linksErrorSchemeNotImplementedTitle: f(messages.scan.linksErrorSchemeNotImplementedTitle),
        linksErrorSchemeNotImplementedHelp: f(messages.scan.linksErrorSchemeNotImplementedHelp),
        continue: f(messages.scan.continue),
        openAppSettings: f(messages.scan.openAppSettings),
      },

      // Wallet Manager strings
      walletManager: {
        addWalletButton: f(messages.walletManager.addWalletButton),
        supportTicketLink: f(messages.walletManager.supportTicketLink),
      },

      // Portfolio strings
      portfolio: {
        portfolio: f(messages.portfolio.portfolio),
        totalWalletValue: f(messages.portfolio.totalWalletValue),
        buyADATitle: f(messages.portfolio.buyADATitle),
        buyADADescription: f(messages.portfolio.buyADADescription),
        buyCrypto: f(messages.portfolio.buyCrypto),
        tradeTokens: f(messages.portfolio.tradeTokens),
        swap: f(messages.portfolio.swap),
        tokenList: f(messages.portfolio.tokenList),
        walletToken: f(messages.portfolio.walletToken),
        dappsToken: f(messages.portfolio.dappsToken),
        searchTokens: f(messages.portfolio.searchTokens),
        noTokensFound: f(messages.portfolio.noTokensFound),
        totalDAppValue: f(messages.portfolio.totalDAppValue),
        liquidityPool: f(messages.portfolio.liquidityPool),
        openOrders: f(messages.portfolio.openOrders),
        lendAndBorrow: f(messages.portfolio.lendAndBorrow),
        tokenDetail: f(messages.portfolio.tokenDetail),
        availableSoon: f(messages.portfolio.availableSoon),
        noDataFound: f(messages.portfolio.noDataFound),
        value: f(messages.portfolio.value),
        dex: f(messages.portfolio.dex),
        lp: f(messages.portfolio.lp),
        total: f(messages.portfolio.total),
        assetPrice: f(messages.portfolio.assetPrice),
        assetAmount: f(messages.portfolio.assetAmount),
        txId: f(messages.portfolio.txId),
        performance: f(messages.portfolio.performance),
        overview: f(messages.portfolio.overview),
        transactions: f(messages.portfolio.transactions),
        _1_week: f(messages.portfolio._1_week),
        _24_hours: f(messages.portfolio._24_hours),
        _1_month: f(messages.portfolio._1_month),
        _6_months: f(messages.portfolio._6_months),
        _1_year: f(messages.portfolio._1_year),
        all_time: f(messages.portfolio.all_time),
        netInvested: f(messages.portfolio.netInvested),
        bought: f(messages.portfolio.bought),
        received: f(messages.portfolio.received),
        sent: f(messages.portfolio.sent),
        send: f(messages.portfolio.send),
        sold: f(messages.portfolio.sold),
        failed: f(messages.portfolio.failed),
        stakeDelegated: f(messages.portfolio.stakeDelegated),
        stakingReward: f(messages.portfolio.stakingReward),
        unknown: f(messages.portfolio.unknown),
        assets: f(messages.portfolio.assets),
        marketData: f(messages.portfolio.marketData),
        tokenPriceChange: f(messages.portfolio.tokenPriceChange),
        tokenPrice: f(messages.portfolio.tokenPrice),
        marketCap: f(messages.portfolio.marketCap),
        _24hVolume: f(messages.portfolio._24hVolume),
        rank: f(messages.portfolio.rank),
        circulating: f(messages.portfolio.circulating),
        totalSupply: f(messages.portfolio.totalSupply),
        maxSupply: f(messages.portfolio.maxSupply),
        allTimeHigh: f(messages.portfolio.allTimeHigh),
        allTimeLow: f(messages.portfolio.allTimeLow),
        info: f(messages.portfolio.info),
        website: f(messages.portfolio.website),
        policyID: f(messages.portfolio.policyID),
        fingerprint: f(messages.portfolio.fingerprint),
        news: f(messages.portfolio.news),
        detailsOn: f(messages.portfolio.detailsOn),
        totalPortfolioValue: f(messages.portfolio.totalPortfolioValue),
        totalPortfolioValueTooltip: f(messages.portfolio.totalPortfolioValueTooltip),
        totalWalletValueTooltip: f(messages.portfolio.totalWalletValueTooltip),
        totalDAppsValueTooltip: f(messages.portfolio.totalDAppsValueTooltip),
        portfolioSwapTokensTitle: f(messages.portfolio.portfolioSwapTokensTitle),
        portfolioSwapTokensDescription: f(messages.portfolio.portfolioSwapTokensDescription),
        startSwapping: f(messages.portfolio.startSwapping),
        titleMediaDetails: f(messages.portfolio.titleMediaDetails),
        title: f(messages.portfolio.title),
        search: f(messages.portfolio.search),
      },

      // Global strings
      global: {
        error: f(globalMessages.error),
        cancel: f(globalMessages.cancel),
        ok: f(globalMessages.ok),
        close: f(globalMessages.close),
      },
    })
  }, [intl])
}

// Consolidated messages object
const messages = {
  auth: defineMessages({
    unknownError: {
      id: 'components.send.biometricauthscreen.UNKNOWN_ERROR',
      defaultMessage: '!!!Unknown error!',
    },
    tooManyAttempts: {
      id: 'components.send.biometricauthscreen.SENSOR_LOCKOUT',
      defaultMessage: '!!!Too many attempts',
    },
    invalidPin: {
      id: 'auth.error.invalidPin',
      defaultMessage: '!!!Invalid PIN',
    },
    authorize: {
      id: 'components.send.biometricauthscreen.authorizeOperation',
      defaultMessage: '!!!Authorize',
    },
    usePasscode: {
      id: 'auth.usePasscode',
      defaultMessage: '!!!Use passcode',
    },
    titleLoginWithPin: {
      id: 'components.login.custompinlogin.title',
      defaultMessage: '!!!Enter PIN',
    },
    titleChangePin: {
      id: 'components.settings.changecustompinscreen.CurrentPinInput.title',
      defaultMessage: '!!!Enter PIN',
    },
    subtitleChangePin: {
      id: 'components.settings.changecustompinscreen.CurrentPinInput.subtitle',
      defaultMessage: '!!!Enter your current PIN',
    },
    pinInputTitle: {
      id: 'components.initialization.custompinscreen.pinInputTitle',
      defaultMessage: '!!!Enter PIN',
    },
    pinInputSubtitle: {
      id: 'components.initialization.custompinscreen.pinInputSubtitle',
      defaultMessage: '!!!Choose a new PIN to quickly access your wallet',
    },
    pinInputConfirmationTitle: {
      id: 'components.initialization.custompinscreen.pinConfirmationTitle',
      defaultMessage: '!!!Repeat PIN',
    },
    pinInputConfirmationSubTitle: {
      id: 'components.firstrun.custompinscreen.pinInputConfirmationSubTitle',
      defaultMessage: '!!!Repeat a new PIN to quickly access your wallet',
    },
  }),

  exchange: defineMessages({
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
      defaultMessage:
        '!!!if you witnessed any significant transaction delays or errors.',
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
      defaultMessage:
        '!!!Switch network or top up your testnet network wallet with the free Cardano faucet',
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
      defaultMessage:
        '!!!This service is currently unavailable. Please try again later',
    },
  }),

  scan: defineMessages({
    scanTitle: {
      id: 'scan.title',
      defaultMessage: '!!!Please scan a QR code',
    },
    cameraPermissionDeniedTitle: {
      id: 'scan.cameraPermissionDenied.title',
      defaultMessage: '!!!Missing camera permission',
    },
    cameraPermissionDeniedHelp: {
      id: 'scan.cameraPermissionDenied.help',
      defaultMessage:
        '!!!Open the app settings and enable the camera permission.',
    },
    errorUnknownTitle: {
      id: 'scan.errorUnknown.title',
      defaultMessage: '!!!Unknown error',
    },
    errorUnknownHelp: {
      id: 'scan.errorUnknown.help',
      defaultMessage: '!!!Unknown help',
    },
    errorUnknownContentTitle: {
      id: 'scan.errorUnknownContent.title',
      defaultMessage: '!!!Unknown content error',
    },
    errorUnknownContentHelp: {
      id: 'scan.errorUnknownContent.help',
      defaultMessage: '!!!Unknown content help',
    },
    linksErrorExtraParamsDeniedTitle: {
      id: 'scan.linksErrorExtraParamsDenied.title',
      defaultMessage: '!!!Extra parameter denied',
    },
    linksErrorExtraParamsDeniedHelp: {
      id: 'scan.linksErrorExtraParamsDenied.help',
      defaultMessage: '!!!Extra parameter denied help',
    },
    linksErrorForbiddenParamsProvidedTitle: {
      id: 'scan.linksErrorForbiddenParamsProvided.title',
      defaultMessage: '!!!Forbidden parameter provided',
    },
    linksErrorForbiddenParamsProvidedHelp: {
      id: 'scan.linksErrorForbiddenParamsProvided.help',
      defaultMessage: '!!!Forbidden parameter provided help',
    },
    linksErrorRequiredParamsMissingTitle: {
      id: 'scan.linksErrorRequiredParamsMissing.title',
      defaultMessage: '!!!Missing required parameter',
    },
    linksErrorRequiredParamsMissingHelp: {
      id: 'scan.linksErrorRequiredParamsMissing.help',
      defaultMessage: '!!!Missing required parameter help',
    },
    linksErrorParamsValidationFailedTitle: {
      id: 'scan.linksErrorParamsValidationFailed.title',
      defaultMessage: '!!!Parameter validation failed',
    },
    linksErrorParamsValidationFailedHelp: {
      id: 'scan.linksErrorParamsValidationFailed.help',
      defaultMessage: '!!!Parameter validation failed help',
    },
    linksErrorUnsupportedAuthorityTitle: {
      id: 'scan.linksErrorUnsupportedAuthority.title',
      defaultMessage: '!!!Unsupported authority',
    },
    linksErrorUnsupportedAuthorityHelp: {
      id: 'scan.linksErrorUnsupportedAuthority.help',
      defaultMessage: '!!!Unsupported authority help',
    },
    linksErrorUnsupportedVersionTitle: {
      id: 'scan.linksErrorUnsupportedVersion.title',
      defaultMessage: '!!!Unsupported version',
    },
    linksErrorUnsupportedVersionHelp: {
      id: 'scan.linksErrorUnsupportedVersion.help',
      defaultMessage: '!!!Unsupported version help',
    },
    linksErrorSchemeNotImplementedTitle: {
      id: 'scan.linksErrorSchemeNotImplemented.title',
      defaultMessage: '!!!Scheme not implemented',
    },
    linksErrorSchemeNotImplementedHelp: {
      id: 'scan.linksErrorSchemeNotImplemented.help',
      defaultMessage: '!!!Scheme not implemented help',
    },
    continue: {
      id: 'global.actions.dialogs.commonbuttons.continueButton',
      defaultMessage: '!!!Continue',
    },
    openAppSettings: {
      id: 'global.openAppSettings',
      defaultMessage: '!!!Open app settings',
    },
  }),

  walletManager: defineMessages({
    addWalletButton: {
      id: 'components.walletselection.walletselectionscreen.addWalletButton',
      defaultMessage: '!!!Add wallet',
    },
    supportTicketLink: {
      id: 'components.walletselection.walletselectionscreen.supportTicketLink',
      defaultMessage: '!!!Ask our support team',
    },
  }),

  portfolio: defineMessages({
    portfolio: {
      id: 'portfolio.portfolio',
      defaultMessage: '!!!Portfolio',
    },
    totalWalletValue: {
      id: 'portfolio.totalWalletValue',
      defaultMessage: '!!!Total Wallet Value',
    },
    buyADATitle: {
      id: 'portfolio.buyADATitle',
      defaultMessage: '!!!Buy ADA',
    },
    buyADADescription: {
      id: 'portfolio.buyADADescription',
      defaultMessage: '!!!Buy ADA description',
    },
    buyCrypto: {
      id: 'portfolio.buyCrypto',
      defaultMessage: '!!!Buy Crypto',
    },
    tradeTokens: {
      id: 'portfolio.tradeTokens',
      defaultMessage: '!!!Trade Tokens',
    },
    swap: {
      id: 'portfolio.swap',
      defaultMessage: '!!!Swap',
    },
    tokenList: {
      id: 'portfolio.tokenList',
      defaultMessage: '!!!Token List',
    },
    walletToken: {
      id: 'portfolio.walletToken',
      defaultMessage: '!!!Wallet Token',
    },
    dappsToken: {
      id: 'portfolio.dappsToken',
      defaultMessage: '!!!DApps Token',
    },
    searchTokens: {
      id: 'portfolio.searchTokens',
      defaultMessage: '!!!Search Tokens',
    },
    noTokensFound: {
      id: 'portfolio.noTokensFound',
      defaultMessage: '!!!No Tokens Found',
    },
    totalDAppValue: {
      id: 'portfolio.totalDAppValue',
      defaultMessage: '!!!Total DApp Value',
    },
    liquidityPool: {
      id: 'portfolio.liquidityPool',
      defaultMessage: '!!!Liquidity Pool',
    },
    openOrders: {
      id: 'portfolio.openOrders',
      defaultMessage: '!!!Open Orders',
    },
    lendAndBorrow: {
      id: 'portfolio.lendAndBorrow',
      defaultMessage: '!!!Lend and Borrow',
    },
    tokenDetail: {
      id: 'portfolio.tokenDetail',
      defaultMessage: '!!!Token Detail',
    },
    availableSoon: {
      id: 'portfolio.availableSoon',
      defaultMessage: '!!!Available Soon',
    },
    noDataFound: {
      id: 'portfolio.noDataFound',
      defaultMessage: '!!!No Data Found',
    },
    value: {
      id: 'portfolio.value',
      defaultMessage: '!!!Value',
    },
    dex: {
      id: 'portfolio.dex',
      defaultMessage: '!!!DEX',
    },
    lp: {
      id: 'portfolio.lp',
      defaultMessage: '!!!LP',
    },
    total: {
      id: 'portfolio.total',
      defaultMessage: '!!!Total',
    },
    assetPrice: {
      id: 'portfolio.assetPrice',
      defaultMessage: '!!!Asset Price',
    },
    assetAmount: {
      id: 'portfolio.assetAmount',
      defaultMessage: '!!!Asset Amount',
    },
    txId: {
      id: 'portfolio.txId',
      defaultMessage: '!!!Transaction ID',
    },
    performance: {
      id: 'portfolio.performance',
      defaultMessage: '!!!Performance',
    },
    overview: {
      id: 'portfolio.overview',
      defaultMessage: '!!!Overview',
    },
    transactions: {
      id: 'portfolio.transactions',
      defaultMessage: '!!!Transactions',
    },
    _1_week: {
      id: 'portfolio._1_week',
      defaultMessage: '!!!1 Week',
    },
    _24_hours: {
      id: 'portfolio._24_hours',
      defaultMessage: '!!!24 Hours',
    },
    _1_month: {
      id: 'portfolio._1_month',
      defaultMessage: '!!!1 Month',
    },
    _6_months: {
      id: 'portfolio._6_months',
      defaultMessage: '!!!6 Months',
    },
    _1_year: {
      id: 'portfolio._1_year',
      defaultMessage: '!!!1 Year',
    },
    all_time: {
      id: 'portfolio.all_time',
      defaultMessage: '!!!All Time',
    },
    netInvested: {
      id: 'portfolio.netInvested',
      defaultMessage: '!!!Net Invested',
    },
    bought: {
      id: 'portfolio.bought',
      defaultMessage: '!!!Bought',
    },
    received: {
      id: 'portfolio.received',
      defaultMessage: '!!!Received',
    },
    sent: {
      id: 'portfolio.sent',
      defaultMessage: '!!!Sent',
    },
    send: {
      id: 'portfolio.send',
      defaultMessage: '!!!Send',
    },
    sold: {
      id: 'portfolio.sold',
      defaultMessage: '!!!Sold',
    },
    failed: {
      id: 'portfolio.failed',
      defaultMessage: '!!!Failed',
    },
    stakeDelegated: {
      id: 'portfolio.stakeDelegated',
      defaultMessage: '!!!Stake Delegated',
    },
    stakingReward: {
      id: 'portfolio.stakingReward',
      defaultMessage: '!!!Staking Reward',
    },
    unknown: {
      id: 'portfolio.unknown',
      defaultMessage: '!!!Unknown',
    },
    assets: {
      id: 'portfolio.assets',
      defaultMessage: '!!!Assets',
    },
    marketData: {
      id: 'portfolio.marketData',
      defaultMessage: '!!!Market Data',
    },
    tokenPriceChange: {
      id: 'portfolio.tokenPriceChange',
      defaultMessage: '!!!Token Price Change',
    },
    tokenPrice: {
      id: 'portfolio.tokenPrice',
      defaultMessage: '!!!Token Price',
    },
    marketCap: {
      id: 'portfolio.marketCap',
      defaultMessage: '!!!Market Cap',
    },
    _24hVolume: {
      id: 'portfolio._24hVolume',
      defaultMessage: '!!!24h Volume',
    },
    rank: {
      id: 'portfolio.rank',
      defaultMessage: '!!!Rank',
    },
    circulating: {
      id: 'portfolio.circulating',
      defaultMessage: '!!!Circulating',
    },
    totalSupply: {
      id: 'portfolio.totalSupply',
      defaultMessage: '!!!Total Supply',
    },
    maxSupply: {
      id: 'portfolio.maxSupply',
      defaultMessage: '!!!Max Supply',
    },
    allTimeHigh: {
      id: 'portfolio.allTimeHigh',
      defaultMessage: '!!!All Time High',
    },
    allTimeLow: {
      id: 'portfolio.allTimeLow',
      defaultMessage: '!!!All Time Low',
    },
    info: {
      id: 'portfolio.info',
      defaultMessage: '!!!Info',
    },
    website: {
      id: 'portfolio.website',
      defaultMessage: '!!!Website',
    },
    policyID: {
      id: 'portfolio.policyID',
      defaultMessage: '!!!Policy ID',
    },
    fingerprint: {
      id: 'portfolio.fingerprint',
      defaultMessage: '!!!Fingerprint',
    },
    news: {
      id: 'portfolio.news',
      defaultMessage: '!!!News',
    },
    detailsOn: {
      id: 'portfolio.detailsOn',
      defaultMessage: '!!!Details On',
    },
    totalPortfolioValue: {
      id: 'portfolio.totalPortfolioValue',
      defaultMessage: '!!!Total Portfolio Value',
    },
    totalPortfolioValueTooltip: {
      id: 'portfolio.totalPortfolioValueTooltip',
      defaultMessage: '!!!Total Portfolio Value Tooltip',
    },
    totalWalletValueTooltip: {
      id: 'portfolio.totalWalletValueTooltip',
      defaultMessage: '!!!Total Wallet Value Tooltip',
    },
    totalDAppsValueTooltip: {
      id: 'portfolio.totalDAppsValueTooltip',
      defaultMessage: '!!!Total DApps Value Tooltip',
    },
    portfolioSwapTokensTitle: {
      id: 'portfolio.portfolioSwapTokensTitle',
      defaultMessage: '!!!Portfolio Swap Tokens Title',
    },
    portfolioSwapTokensDescription: {
      id: 'portfolio.portfolioSwapTokensDescription',
      defaultMessage: '!!!Portfolio Swap Tokens Description',
    },
    startSwapping: {
      id: 'portfolio.startSwapping',
      defaultMessage: '!!!Start Swapping',
    },
    titleMediaDetails: {
      id: 'portfolio.titleMediaDetails',
      defaultMessage: '!!!Title Media Details',
    },
    title: {
      id: 'portfolio.title',
      defaultMessage: '!!!Title',
    },
    search: {
      id: 'portfolio.search',
      defaultMessage: '!!!Search',
    },
  }),
} 