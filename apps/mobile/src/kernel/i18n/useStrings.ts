import {ThemeName} from '@yoroi/theme'
import {freeze} from 'immer'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {CurrencySymbol} from '~/wallets/types/other'
import globalMessages, {
  confirmationMessages,
  currencyNames,
  errorMessages,
  themeNames,
  txLabels,
} from './global-messages'

export const useStrings = () => {
  const intl = useIntl()

  return React.useMemo(() => {
    const f = intl.formatMessage

    return freeze({
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
        descriptionBuySellADATransaction: f(
          messages.exchange.descriptionBuySellADATransaction,
        ),
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
        preprodFaucetBannerButtonText: f(
          messages.exchange.preprodFaucetBannerButtonText,
        ),
        createOrderPreprodFaucetButtonText: f(
          messages.exchange.createOrderPreprodFaucetButtonText,
        ),
        createOrderPreprodNoticeTitle: f(
          messages.exchange.createOrderPreprodNoticeTitle,
        ),
        createOrderPreprodNoticeText: f(
          messages.exchange.createOrderPreprodNoticeText,
        ),
        playground: f(messages.exchange.playground),
        loadingLink: f(messages.exchange.loadingLink),
        linkError: f(messages.exchange.linkError),
      },

      // Scan strings
      scan: {
        scanTitle: f(messages.scan.scanTitle),
        cameraPermissionDeniedTitle: f(
          messages.scan.cameraPermissionDeniedTitle,
        ),
        cameraPermissionDeniedHelp: f(messages.scan.cameraPermissionDeniedHelp),
        errorUnknownTitle: f(messages.scan.errorUnknownTitle),
        errorUnknownHelp: f(messages.scan.errorUnknownHelp),
        errorUnknownContentTitle: f(messages.scan.errorUnknownContentTitle),
        errorUnknownContentHelp: f(messages.scan.errorUnknownContentHelp),
        linksErrorExtraParamsDeniedTitle: f(
          messages.scan.linksErrorExtraParamsDeniedTitle,
        ),
        linksErrorExtraParamsDeniedHelp: f(
          messages.scan.linksErrorExtraParamsDeniedHelp,
        ),
        linksErrorForbiddenParamsProvidedTitle: f(
          messages.scan.linksErrorForbiddenParamsProvidedTitle,
        ),
        linksErrorForbiddenParamsProvidedHelp: f(
          messages.scan.linksErrorForbiddenParamsProvidedHelp,
        ),
        linksErrorRequiredParamsMissingTitle: f(
          messages.scan.linksErrorRequiredParamsMissingTitle,
        ),
        linksErrorRequiredParamsMissingHelp: f(
          messages.scan.linksErrorRequiredParamsMissingHelp,
        ),
        linksErrorParamsValidationFailedTitle: f(
          messages.scan.linksErrorParamsValidationFailedTitle,
        ),
        linksErrorParamsValidationFailedHelp: f(
          messages.scan.linksErrorParamsValidationFailedHelp,
        ),
        linksErrorUnsupportedAuthorityTitle: f(
          messages.scan.linksErrorUnsupportedAuthorityTitle,
        ),
        linksErrorUnsupportedAuthorityHelp: f(
          messages.scan.linksErrorUnsupportedAuthorityHelp,
        ),
        linksErrorUnsupportedVersionTitle: f(
          messages.scan.linksErrorUnsupportedVersionTitle,
        ),
        linksErrorUnsupportedVersionHelp: f(
          messages.scan.linksErrorUnsupportedVersionHelp,
        ),
        linksErrorSchemeNotImplementedTitle: f(
          messages.scan.linksErrorSchemeNotImplementedTitle,
        ),
        linksErrorSchemeNotImplementedHelp: f(
          messages.scan.linksErrorSchemeNotImplementedHelp,
        ),
        continue: f(messages.scan.continue),
        openAppSettings: f(messages.scan.openAppSettings),
      },

      // Wallet Manager strings
      walletManager: {
        addWalletButton: f(messages.walletManager.addWalletButton),
        supportTicketLink: f(messages.walletManager.supportTicketLink),
      },

      // Links strings
      links: {
        trustedPaymentRequestedTitle: f(
          messages.links.trustedPaymentRequestedTitle,
        ),
        trustedPaymentRequestedDescription: f(
          messages.links.trustedPaymentRequestedDescription,
        ),
        untrustedPaymentRequestedTitle: f(
          messages.links.untrustedPaymentRequestedTitle,
        ),
        untrustedPaymentRequestedDescription: f(
          messages.links.untrustedPaymentRequestedDescription,
        ),
        trustedBrowserLaunchDappUrlTitle: f(
          messages.links.trustedBrowserLaunchDappUrlTitle,
        ),
        trustedBrowserLaunchDappUrlDescription: f(
          messages.links.trustedBrowserLaunchDappUrlDescription,
        ),
        untrustedBrowserLaunchDappUrlTitle: f(
          messages.links.untrustedBrowserLaunchDappUrlTitle,
        ),
        untrustedBrowserLaunchDappUrlDescription: f(
          messages.links.untrustedBrowserLaunchDappUrlDescription,
        ),
        askToOpenAWalletTitle: f(messages.links.askToOpenAWalletTitle),
        askToOpenAWalletDescription: f(
          messages.links.askToOpenAWalletDescription,
        ),
        askToRedirectTitle: f(messages.links.askToRedirectTitle),
        askToRedirectDescription: f(messages.links.askToRedirectDescription),
      },

      // Notifications strings
      notifications: {
        tapToView: f(messages.notifications.tapToView),
        stakingRewardsReceived: f(
          messages.notifications.stakingRewardsReceived,
        ),
        assetsReceived: f(messages.notifications.assetsReceived),
        intraWalletTransactionSent: f(
          messages.notifications.intraWalletTransactionSent,
        ),
        multipleAssetsReceived: f(
          messages.notifications.multipleAssetsReceived,
        ),
        received: f(messages.notifications.received),
        multipleAssetsSent: f(messages.notifications.multipleAssetsSent),
        sent: f(messages.notifications.sent),
        noNotifications: f(messages.notifications.noNotifications),
        markAllAsRead: f(messages.notifications.markAllAsRead),
        getImportantAlerts: f(messages.notifications.getImportantAlerts),
        turnOnAlerts: f(messages.notifications.turnOnAlerts),
        skip: f(messages.notifications.skip),
        turnOnNotifications: f(messages.notifications.turnOnNotifications),
      },

      // Claim strings
      claim: {
        askConfirmationTitle: f(messages.claim.askConfirmationTitle),
        showSuccessTitle: f(messages.claim.showSuccessTitle),
        acceptedTitle: f(messages.claim.acceptedTitle),
        acceptedMessage: f(messages.claim.acceptedMessage),
        processingTitle: f(messages.claim.processingTitle),
        processingMessage: f(messages.claim.processingMessage),
        doneTitle: f(messages.claim.doneTitle),
        doneMessage: f(messages.claim.doneMessage),
        addressSharingWarning: f(messages.claim.addressSharingWarning),
        domain: f(messages.claim.domain),
        code: f(messages.claim.code),
        apiErrorTitle: f(messages.claim.apiErrorTitle),
        apiErrorInvalidRequest: f(messages.claim.apiErrorInvalidRequest),
        apiErrorNotFound: f(messages.claim.apiErrorNotFound),
        apiErrorAlreadyClaimed: f(messages.claim.apiErrorAlreadyClaimed),
        apiErrorExpired: f(messages.claim.apiErrorExpired),
        apiErrorTooEarly: f(messages.claim.apiErrorTooEarly),
        apiErrorRateLimited: f(messages.claim.apiErrorRateLimited),
        continue: f(messages.claim.continue),
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
        totalPortfolioValueTooltip: f(
          messages.portfolio.totalPortfolioValueTooltip,
        ),
        totalWalletValueTooltip: f(messages.portfolio.totalWalletValueTooltip),
        totalDAppsValueTooltip: f(messages.portfolio.totalDAppsValueTooltip),
        portfolioSwapTokensTitle: f(
          messages.portfolio.portfolioSwapTokensTitle,
        ),
        portfolioSwapTokensDescription: f(
          messages.portfolio.portfolioSwapTokensDescription,
        ),
        startSwapping: f(messages.portfolio.startSwapping),
        titleMediaDetails: f(messages.portfolio.titleMediaDetails),
        title: f(messages.portfolio.title),
        search: f(messages.portfolio.search),
      },

      // UI strings
      ui: {
        yoroiLogo: f(messages.ui.yoroiLogo),
        tryAgain: f(messages.ui.tryAgain),
        addToken: f(messages.ui.addToken),
        pairedBalanceError: (currency: string) =>
          f(messages.ui.pairedBalanceError, {currency}),
        warning: f(messages.ui.warning),
        contributors: f(messages.ui.contributors),
        header: f(messages.ui.header),
        description: f(messages.ui.description),
        anonymous: f(messages.ui.anonymous),
        optout: f(messages.ui.optout),
        private: f(messages.ui.private),
        noip: f(messages.ui.noip),
        nosell: f(messages.ui.nosell),
        more: f(messages.ui.more),
        skip: f(messages.ui.skip),
        accept: f(messages.ui.accept),
        toggle: f(messages.ui.toggle),
      },

      // RegisterCatalyst strings
      registerCatalyst: {
        title: f(messages.registerCatalyst.title),
        subTitle: f(messages.registerCatalyst.subTitle),
        stakingKeyNotRegistered: f(
          messages.registerCatalyst.stakingKeyNotRegistered,
        ),
        tip: f(messages.registerCatalyst.tip),
        registrationStart: f(messages.registerCatalyst.registrationStart),
        snapshotStart: f(messages.registerCatalyst.snapshotStart),
        votingStart: f(messages.registerCatalyst.votingStart),
        votingEnd: f(messages.registerCatalyst.votingEnd),
        votingResults: f(messages.registerCatalyst.votingResults),
        step2Title: f(messages.registerCatalyst.step2Title),
        step2Description: f(messages.registerCatalyst.step2Description),
        checkbox: f(messages.registerCatalyst.checkbox),
        step3Title: f(messages.registerCatalyst.step3Title),
        step3Description: f(messages.registerCatalyst.step3Description),
        confirmationTitle: f(messages.registerCatalyst.confirmationTitle),
        passwordSignDescription: f(
          messages.registerCatalyst.passwordSignDescription,
        ),
        authOsInstructions: f(messages.registerCatalyst.authOsInstructions),
        confirm: f(messages.registerCatalyst.confirm),
        step4Description: f(messages.registerCatalyst.step4Description),
        step4Title: f(messages.registerCatalyst.step4Title),
        step4QrTitle: f(messages.registerCatalyst.step4QrTitle),
        step4QrShareLabel: f(messages.registerCatalyst.step4QrShareLabel),
        step4QrCopiedText: f(messages.registerCatalyst.step4QrCopiedText),
        step4QrCheckbox: f(messages.registerCatalyst.step4QrCheckbox),
      },

      // HW strings
      hw: {
        error: f(globalMessages.error),
        title: f(messages.hw.title),
        usbExplanation: f(messages.hw.usbExplanation),
        usbButton: f(messages.hw.usbButton),
        usbButtonNotSupported: f(messages.hw.usbButtonNotSupported),
        usbButtonDisabled: f(messages.hw.usbButtonDisabled),
        bluetoothExplanation: f(messages.hw.bluetoothExplanation),
        bluetoothButton: f(messages.hw.bluetoothButton),
        bluetoothError: f(messages.hw.bluetoothError),
        connectUsb: f(ledgerMessages.connectUsb),
        keepUsbConnected: f(ledgerMessages.keepUsbConnected),
        enableLocation: f(ledgerMessages.enableLocation),
        enableTransport: f(ledgerMessages.enableTransport),
        enterPin: f(ledgerMessages.enterPin),
        openApp: f(ledgerMessages.openApp),
        beforeConfirm: f(messages.hw.beforeConfirm),
      },

      // Menu strings
      menu: {
        attention: f(globalMessages.attention),
        back: f(confirmationMessages.commonButtons.backButton),
        catalystVoting: f(messages.menu.catalystVoting),
        settings: f(messages.menu.settings),
        stakingCenter: f(messages.menu.stakingCenter),
        supportTitle: f(messages.menu.supportTitle),
        supportLink: f(messages.menu.supportLink),
        knowledgeBase: f(messages.menu.knowledgeBase),
        menu: f(messages.menu.menu),
        releases: f(messages.menu.releases),
        governanceCentre: f(messages.menu.governanceCentre),
      },

      // Dashboard strings
      dashboard: {
        title: f(messages.dashboard.title),
        warning: f(messages.dashboard.warning),
        goToWebsiteButtonLabel: f(messages.dashboard.goToWebsiteButtonLabel),
        copied: f(messages.dashboard.copied),
        unknownPool: f(messages.dashboard.unknownPool),
        undelegate: f(messages.dashboard.undelegate),
        failedTxTitle: f(messages.dashboard.failedTxTitle),
        failedTxText: f(messages.dashboard.failedTxText),
        failedTxButton: f(messages.dashboard.failedTxButton),
        stakingCenterTitle: f(messages.dashboard.stakingCenterTitle),
        firstLine: f(messages.dashboard.firstLine),
        secondLine: f(messages.dashboard.secondLine),
        availableFunds: f(globalMessages.availableFunds),
        rewardsLabel: f(messages.dashboard.rewardsLabel),
        delegatedLabel: f(messages.dashboard.delegatedLabel),
        withdrawButtonTitle: f(messages.dashboard.withdrawButtonTitle),
      },

      // Settings strings
      settings: {
        changeNetwork: {
          networkNoticeTitle: f(
            messages.settings.changeNetwork.networkNoticeTitle,
          ),
          networkNoticeMessage: f(
            messages.settings.changeNetwork.networkNoticeMessage,
          ),
          networkNoticeListTitle: f(
            messages.settings.changeNetwork.networkNoticeListTitle,
          ),
          networkNoticeList: f(
            messages.settings.changeNetwork.networkNoticeList,
          ),
          networkNoticeButton: f(
            messages.settings.changeNetwork.networkNoticeButton,
          ),
          preparingNetwork: f(messages.settings.changeNetwork.preparingNetwork),
          networkTagModalTitle: f(
            messages.settings.changeNetwork.networkTagModalTitle,
          ),
          networkTagModalText: f(
            messages.settings.changeNetwork.networkTagModalText,
          ),
          cancel: f(globalMessages.cancel),
          switch: f(globalMessages.switch),
        },
        appSettingsTitle: f(messages.settings.appSettingsTitle),
        aboutTitle: f(messages.settings.aboutTitle),
        systemLogTitle: f(messages.settings.systemLogTitle),
        settingsTitle: f(messages.settings.settingsTitle),
        changeWalletNameTitle: f(messages.settings.changeWalletNameTitle),
        termsOfServiceTitle: f(messages.settings.termsOfServiceTitle),
        privacyPolicyTitle: f(messages.settings.privacyPolicyTitle),
        removeWalletTitle: f(messages.settings.removeWalletTitle),
        languageTitle: f(messages.settings.languageTitle),
        currency: f(globalMessages.currency),
        themeTitle: f(messages.settings.themeTitle),
        networkTitle: f(messages.settings.networkTitle),
        enableEasyConfirmationTitle: f(
          messages.settings.enableEasyConfirmationTitle,
        ),
        disableEasyConfirmationTitle: f(
          messages.settings.disableEasyConfirmationTitle,
        ),
        changePasswordTitle: f(messages.settings.changePasswordTitle),
        changeCustomPinTitle: f(messages.settings.changeCustomPinTitle),
        collateral: f(messages.settings.collateral),
        customPinTitle: f(messages.settings.customPinTitle),
        walletTabTitle: f(messages.settings.walletTabTitle),
        appTabTitle: f(messages.settings.appTabTitle),
        notifications: f(messages.settings.notifications),
        about: {
          currentVersion: f(globalMessages.currentVersion),
          commit: f(globalMessages.commit),
          network: f(globalMessages.network),
          walletType: f(messages.settings.about.walletType),
          byronWallet: f(messages.settings.about.byronWallet),
          shelleyWallet: f(messages.settings.about.shelleyWallet),
          unknownWalletType: f(messages.settings.about.unknownWalletType),
          fcmToken: f(messages.settings.about.fcmToken),
        },
        enableLoginWithOs: {
          error: f(globalMessages.error),
          heading: f(messages.settings.enableLoginWithOs.heading),
          subHeading1: f(messages.settings.enableLoginWithOs.subHeading1),
          subHeading2: f(messages.settings.enableLoginWithOs.subHeading2),
          notNowButton: f(messages.settings.enableLoginWithOs.notNowButton),
          linkButton: f(messages.settings.enableLoginWithOs.linkButton),
        },
        easyConfirmation: {
          disableHeading: f(messages.settings.easyConfirmation.disableHeading),
          disableButton: f(messages.settings.easyConfirmation.disableButton),
          enableHeading: f(messages.settings.easyConfirmation.enableHeading),
          enableWarning: f(messages.settings.easyConfirmation.enableWarning),
          enableRootPassword: f(
            messages.settings.easyConfirmation.enableRootPassword,
          ),
          enableButton: f(messages.settings.easyConfirmation.enableButton),
        },
        theme: {
          translateThemeName: (theme: ThemeName) => f(themeNames[theme]),
        },
        currency: {
          translatedName: (symbol: CurrencySymbol) => f(currencyNames[symbol]),
        },
        removeWallet: {
          descriptionParagraph1: f(
            messages.settings.removeWallet.descriptionParagraph1,
          ),
          descriptionParagraph2: f(
            messages.settings.removeWallet.descriptionParagraph2,
          ),
          walletName: f(messages.settings.removeWallet.walletName),
          walletNameInput: f(messages.settings.removeWallet.walletNameInput),
          walletNameMismatchError: f(
            messages.settings.removeWallet.walletNameMismatchError,
          ),
          remove: f(messages.settings.removeWallet.remove),
          hasWrittenDownMnemonic: f(
            messages.settings.removeWallet.hasWrittenDownMnemonic,
          ),
        },
        renameWallet: {
          changeButton: f(messages.settings.renameWallet.changeButton),
          walletNameInputLabel: f(
            messages.settings.renameWallet.walletNameInputLabel,
          ),
          tooLong: f(globalMessages.walletNameErrorTooLong),
          nameAlreadyTaken: f(globalMessages.walletNameErrorNameAlreadyTaken),
          mustBeFilled: f(globalMessages.walletNameErrorMustBeFilled),
        },
        changePassword: {
          oldPasswordInputLabel: f(
            messages.settings.changePassword.oldPasswordInputLabel,
          ),
          newPasswordInputLabel: f(
            messages.settings.changePassword.newPasswordInputLabel,
          ),
          passwordStrengthRequirement: f(
            messages.settings.changePassword.passwordStrengthRequirement,
            {
              requiredPasswordLength: 10,
            },
          ),
          repeatPasswordInputLabel: f(
            messages.settings.changePassword.repeatPasswordInputLabel,
          ),
          repeatPasswordInputNotMatchError: f(
            messages.settings.changePassword.repeatPasswordInputNotMatchError,
          ),
          continueButton: f(messages.settings.changePassword.continueButton),
          incorrectPassword: f(errorMessages.incorrectPassword.title),
        },
        toggleAnalytics: {
          toggleAnalyticsSettingsTitle: f(
            messages.settings.toggleAnalyticsSettingsTitle,
          ),
        },
        walletSettings: {
          general: f(messages.settings.walletSettings.general),
          actions: f(messages.settings.walletSettings.actions),
          switchWallet: f(messages.settings.walletSettings.switchWallet),
          logout: f(messages.settings.walletSettings.logout),
          walletName: f(messages.settings.walletSettings.walletName),
          security: f(messages.settings.walletSettings.security),
          changePassword: f(messages.settings.walletSettings.changePassword),
          easyConfirmation: f(
            messages.settings.walletSettings.easyConfirmation,
          ),
          easyConfirmationInfo: f(
            messages.settings.walletSettings.easyConfirmationInfo,
          ),
          removeWallet: f(messages.settings.walletSettings.removeWallet),
          network: f(messages.settings.walletSettings.network),
          walletType: f(messages.settings.walletSettings.walletType),
          byronWallet: f(messages.settings.walletSettings.byronWallet),
          shelleyWallet: f(messages.settings.walletSettings.shelleyWallet),
          unknownWalletType: f(
            messages.settings.walletSettings.unknownWalletType,
          ),
          about: f(messages.settings.walletSettings.about),
          resync: f(messages.settings.walletSettings.resync),
          collateral: f(messages.settings.walletSettings.collateral),
          multipleAddresses: f(
            messages.settings.walletSettings.multipleAddresses,
          ),
          singleAddress: f(messages.settings.walletSettings.singleAddress),
          multipleAddressesInfo: f(
            messages.settings.walletSettings.multipleAddressesInfo,
          ),
          inAppNotifications: f(
            messages.settings.walletSettings.inAppNotifications,
          ),
          allowNotifications: f(
            messages.settings.walletSettings.allowNotifications,
          ),
          displayDuration: f(messages.settings.walletSettings.displayDuration),
          notifications: f(messages.settings.walletSettings.notifications),
        },
        applicationSettings: {
          general: f(messages.settings.applicationSettings.general),
          securityReporting: f(
            messages.settings.applicationSettings.securityReporting,
          ),
          selectLanguage: f(
            messages.settings.applicationSettings.selectLanguage,
          ),
          selectTheme: f(messages.settings.applicationSettings.selectTheme),
          selectFiatCurrency: f(
            messages.settings.applicationSettings.selectFiatCurrency,
          ),
          about: f(messages.settings.applicationSettings.about),
          changePin: f(messages.settings.applicationSettings.changePin),
          privacyMode: f(messages.settings.applicationSettings.privacyMode),
          privacyModeInfo: f(
            messages.settings.applicationSettings.privacyModeInfo,
          ),
          biometricsSignIn: f(
            messages.settings.applicationSettings.biometricsSignIn,
          ),
          biometricsSignInInfo: f(
            messages.settings.applicationSettings.biometricsSignInInfo,
          ),
          termsOfservice: f(
            messages.settings.applicationSettings.termsOfservice,
          ),
          crashReporting: f(
            messages.settings.applicationSettings.crashReporting,
          ),
          crashReportingInfo: f(
            messages.settings.applicationSettings.crashReportingInfo,
          ),
          analytics: f(messages.settings.applicationSettings.analytics),
          privacyPolicy: f(messages.settings.applicationSettings.privacyPolicy),
          screenSharing: f(messages.settings.applicationSettings.screenSharing),
          screenSharingInfo: f(
            messages.settings.applicationSettings.screenSharingInfo,
          ),
          network: f(messages.settings.applicationSettings.network),
        },
      },

      // Scan strings
      scan: {
        scanTitle: f(messages.scan.scanTitle),
        ok: f(globalMessages.ok),
        cameraPermissionDeniedTitle: f(
          messages.scan.cameraPermissionDeniedTitle,
        ),
        cameraPermissionDeniedHelp: f(messages.scan.cameraPermissionDeniedHelp),
        errorUnknownTitle: f(messages.scan.errorUnknownTitle),
        errorUnknownHelp: f(messages.scan.errorUnknownHelp),
        errorUnknownContentTitle: f(messages.scan.errorUnknownContentTitle),
        errorUnknownContentHelp: f(messages.scan.errorUnknownContentHelp),
        linksErrorExtraParamsDeniedTitle: f(
          messages.scan.linksErrorExtraParamsDeniedTitle,
        ),
        linksErrorExtraParamsDeniedHelp: f(
          messages.scan.linksErrorExtraParamsDeniedHelp,
        ),
        linksErrorForbiddenParamsProvidedTitle: f(
          messages.scan.linksErrorForbiddenParamsProvidedTitle,
        ),
        linksErrorForbiddenParamsProvidedHelp: f(
          messages.scan.linksErrorForbiddenParamsProvidedHelp,
        ),
        linksErrorRequiredParamsMissingTitle: f(
          messages.scan.linksErrorRequiredParamsMissingTitle,
        ),
        linksErrorRequiredParamsMissingHelp: f(
          messages.scan.linksErrorRequiredParamsMissingHelp,
        ),
        linksErrorParamsValidationFailedTitle: f(
          messages.scan.linksErrorParamsValidationFailedTitle,
        ),
        linksErrorParamsValidationFailedHelp: f(
          messages.scan.linksErrorParamsValidationFailedHelp,
        ),
        linksErrorUnsupportedAuthorityTitle: f(
          messages.scan.linksErrorUnsupportedAuthorityTitle,
        ),
        linksErrorUnsupportedAuthorityHelp: f(
          messages.scan.linksErrorUnsupportedAuthorityHelp,
        ),
        linksErrorUnsupportedVersionTitle: f(
          messages.scan.linksErrorUnsupportedVersionTitle,
        ),
        linksErrorUnsupportedVersionHelp: f(
          messages.scan.linksErrorUnsupportedVersionHelp,
        ),
        linksErrorSchemeNotImplementedTitle: f(
          messages.scan.linksErrorSchemeNotImplementedTitle,
        ),
        linksErrorSchemeNotImplementedHelp: f(
          messages.scan.linksErrorSchemeNotImplementedHelp,
        ),
        continue: f(messages.scan.continue),
        openAppSettings: f(messages.scan.openAppSettings),
      },

      // Receive strings
      receive: {
        amountToReceive: f(messages.receive.amountToReceive),
        receiveTitle: f(messages.receive.receiveTitle),
        addresscardTitle: f(messages.receive.addresscardTitle),
        shareLabel: f(messages.receive.shareLabel),
        walletAddress: f(messages.receive.walletAddress),
        spendingKeyHash: f(messages.receive.spendingKeyHash),
        stakingKeyHash: f(messages.receive.stakingKeyHash),
        address: f(messages.receive.address),
        specificAmount: f(messages.receive.specificAmount),
        requestSpecificAmountButton: f(
          messages.receive.requestSpecificAmountButton,
        ),
        copyAddressButton: f(messages.receive.copyAddressButton),
        specificAmountDescription: f(
          messages.receive.specificAmountDescription,
        ),
        ADALabel: f(messages.receive.ADALabel),
        generateLink: f(messages.receive.generateLink),
        multipleAddress: f(messages.receive.multipleAddress),
        singleAddress: f(globalMessages.singleAddress),
        copyLinkBtn: f(messages.receive.copyLinkBtn),
        copyLinkMsg: f(messages.receive.copyLinkMsg),
        addressCopiedMsg: f(messages.receive.addressCopiedMsg),
        lastUsed: f(messages.receive.lastUsed),
        unusedAddress: f(messages.receive.unusedAddress),
        usedAddress: f(messages.receive.usedAddress),
        generateButton: f(messages.receive.generateButton),
        infoAddressLimit: f(messages.receive.infoAddressLimit),
        singleOrMultiple: f(messages.receive.singleOrMultiple),
        singleOrMultipleDetails: f(messages.receive.singleOrMultipleDetails),
        selectMultiple: f(messages.receive.selectMultiple),
        singleAddressWallet: f(messages.receive.singleAddressWallet),
        singleAddressWarning: f(messages.receive.singleAddressWarning),
        yoroiZendesk: f(globalMessages.yoroiZendesk),
        ok: f(globalMessages.ok),
      },

      // Send strings
      send: {
        addressInputLabel: f(messages.send.addressInputLabel),
        addressReaderQrText: f(messages.send.addressReaderQrText),
        all: f(globalMessages.all),
        amount: f(txLabels.amount),
        apply: f(globalMessages.apply),
        asset: f(messages.send.asset),
        assets: (qty: number) => f(globalMessages.assets, {qty}),
        assetsLabel: f(globalMessages.assetsLabel),
        availableFunds: f(globalMessages.availableFunds),
        availableFundsBannerIsFetching: f(
          messages.send.availableFundsBannerIsFetching,
        ),
        availableFundsBannerNotAvailable: f(
          messages.send.availableFundsBannerNotAvailable,
        ),
        backButton: f(confirmationMessages.commonButtons.backButton),
        balanceAfterLabel: f(messages.send.balanceAfterLabel),
        balanceAfterNotAvailable: f(messages.send.balanceAfterNotAvailable),
        checkboxSendAll: (options: {assetId: string}) =>
          f(messages.send.checkboxSendAll, options),
        checkboxSendAllAssets: f(messages.send.checkboxSendAllAssets),
        continueButton: f(messages.send.continueButton),
        domainNotRegisteredError: f(messages.send.domainNotRegisteredError),
        domainRecordNotFoundError: f(messages.send.domainRecordNotFoundError),
        domainUnsupportedError: f(messages.send.domainUnsupportedError),
        errorBannerNetworkError: f(messages.send.errorBannerNetworkError),
        errorBannerPendingOutgoingTransaction: f(
          messages.send.errorBannerPendingOutgoingTransaction,
        ),
        failedTxButton: f(messages.send.failedTxButton),
        failedTxText: f(messages.send.failedTxText),
        failedTxTitle: f(messages.send.failedTxTitle),
        feeLabel: f(messages.send.feeLabel),
        feeNotAvailable: f(messages.send.feeNotAvailable),
        found: f(messages.send.found),
        helperAddressErrorInvalid: f(messages.send.helperAddressErrorInvalid),
        helperAddressErrorWrongBlockchain: f(
          messages.send.helperAddressErrorWrongBlockchain,
        ),
        helperAddressErrorWrongNetwork: f(
          messages.send.helperAddressErrorWrongNetwork,
        ),
        helperMemoErrorTooLong: f(messages.send.helperMemoErrorTooLong),
        helperMemoInstructions: f(messages.send.helperMemoInstructions),
        helperResolverErrorDomainNotFound: f(
          messages.send.helperResolverErrorDomainNotFound,
        ),
        manyNameServersWarning: (options: {
          b: (content: ReactNode[]) => ReactNode
        }) => f(messages.send.manyNameServersWarning, options),
        max: f(globalMessages.max),
        memoLabel: f(messages.send.memoLabel),
        minPrimaryBalanceForTokens: f(
          amountInputErrorMessages.minPrimaryBalanceForTokens,
        ),
        next: f(globalMessages.next),
        nfts: (qty: number) => f(globalMessages.nfts, {qty}),
        noAssets: f(messages.send.noAssets),
        noAssetsAddedYet: (fungible: string) =>
          f(messages.send.noAssetsAddedYet, {fungible}),
        noBalance: f(amountInputErrorMessages.insufficientBalance),
        ok: f(globalMessages.ok),
        pleaseWait: f(globalMessages.pleaseWait),
        pools: f(globalMessages.pools),
        receiver: f(messages.send.receiver),
        resolvedAddress: f(messages.send.resolvedAddress),
        resolverNoticeTitle: f(messages.send.resolverNoticeTitle),
        resolverNoticeText: f(messages.send.resolverNoticeText),
        searchTokens: f(messages.send.searchTokens),
        selecteAssetTitle: f(messages.send.selectAssetTitle),
        sendAllContinueButton: f(
          confirmationMessages.commonButtons.continueButton,
        ),
        sendAllWarningAlert1: (options: {assetNameOrId: string}) =>
          f(messages.send.sendAllWarningAlert1, options),
        sendAllWarningAlert2: f(messages.send.sendAllWarningAlert2),
        sendAllWarningAlert3: f(messages.send.sendAllWarningAlert3),
        sendAllWarningText: f(messages.send.sendAllWarningText),
        sendAllWarningTitle: f(messages.send.sendAllWarningTitle),
        submittedTxButton: f(messages.send.submittedTxButton),
        submittedTxText: f(messages.send.submittedTxText),
        submittedTxTitle: f(messages.send.submittedTxTitle),
        tokens: (qty: number) => f(globalMessages.tokens, {qty}),
        unknownAsset: f(messages.send.unknownAsset),
        walletAddress: f(messages.send.walletAddress),
        youHave: f(messages.send.youHave),
      },

      // Global strings
      global: {
        error: f(globalMessages.error),
        cancel: f(globalMessages.cancel),
        ok: f(globalMessages.ok),
        close: f(globalMessages.close),
        walletSelectionScreenHeader: f(
          messages.global.walletSelectionScreenHeader,
        ),
        disclaimer: f(messages.global.disclaimer),
        accept: f(messages.global.accept),
        proceed: f(messages.global.proceed),
        insufficientBalance: (params: {
          requiredBalance: string
          currentBalance: string
        }) => f(globalMessages.insufficientBalance, params),
        votingTitle: f(globalMessages.votingTitle),
      },

      // Discover strings
      discover: {
        confirmTx: f(messages.discover.confirmTx),
        discoverTitle: f(messages.discover.discoverTitle),
        searchDApps: f(messages.discover.searchDApps),
        welcomeToYoroiDAppExplorer: f(
          messages.discover.welcomeToYoroiDAppExplorer,
        ),
        welcomeToYoroiDAppExplorerDescription: f(
          messages.discover.welcomeToYoroiDAppExplorerDescription,
        ),
        next: f(messages.discover.next),
        totalDAppAvailable: (count: number) =>
          f(messages.discover.totalDAppAvailable, {count}),
        totalDAppConnected: (count: number) =>
          f(messages.discover.dAppConnected, {count}),
        connected: f(messages.discover.connected),
        recommended: f(messages.discover.recommended),
        done: f(messages.discover.done),
        openDApp: f(messages.discover.openDApp),
        disconnectWalletFromDApp: f(messages.discover.disconnectWalletFromDApp),
        dAppActions: f(messages.discover.dAppActions),
        confirmConnectionModalTitle: f(
          messages.discover.confirmConnectionModalTitle,
        ),
        confirmConnectionModalConnectTo: f(
          messages.discover.confirmConnectionModalConnectTo,
        ),
        confirmConnectionModalConnect: f(
          messages.discover.confirmConnectionModalConnect,
        ),
        confirmConnectionModalAllowThisDAppTo: f(
          messages.discover.confirmConnectionModalAllowThisDAppTo,
        ),
        confirmConnectionModalPermission1: f(
          messages.discover.confirmConnectionModalPermission1,
        ),
        singleAddressWarning: f(messages.discover.singleAddressWarning),
        confirmConnectionModalPermission2: f(
          messages.discover.confirmConnectionModalPermission2,
        ),
        understand: f(messages.discover.understand),
        disclaimerModalText: f(messages.discover.disclaimerModalText),
        disclaimerModalTitle: f(messages.discover.disclaimerModalTitle),
        disconnectDApp: f(messages.discover.disconnectDApp),
        confirmDisconnectDAppDescription: f(
          messages.discover.confirmDisconnectDAppDescription,
        ),
        cancel: f(messages.discover.cancel),
        confirm: f(messages.discover.confirm),
        signDataNotSupported: f(messages.discover.signDataNotSupported),
        transactionReview: f(messages.discover.transactionReview),
        inputs: f(messages.discover.inputs),
        outputs: f(messages.discover.outputs),
        transactionIdCopied: f(messages.discover.transactionIdCopied),
        addressCopied: f(messages.discover.addressCopied),
        yourAddress: f(messages.discover.yourAddress),
        externalAddress: f(messages.discover.externalAddress),
        fee: f(messages.discover.fee),
        signData: f(messages.discover.signData),
        signMessage: f(messages.discover.signMessage),
        testnetWarningTitle: f(messages.discover.testnetWarningTitle),
        testnetWarningDescription: f(
          messages.discover.testnetWarningDescription,
        ),
        filterChildOptionsNews: f(messages.discover.filterChildOptionsNews),
        filterChildOptionsEntertainment: f(
          messages.discover.filterChildOptionsEntertainment,
        ),
        filterChildOptionsDeFi: f(messages.discover.filterChildOptionsDeFi),
        filterChildOptionsDEX: f(messages.discover.filterChildOptionsDEX),
        filterChildOptionsNFTMarketplace: f(
          messages.discover.filterChildOptionsNFTMarketplace,
        ),
        filterChildOptionsStablecoin: f(
          messages.discover.filterChildOptionsStablecoin,
        ),
        filterChildOptionsTradingTools: f(
          messages.discover.filterChildOptionsTradingTools,
        ),
        filterChildOptionsDAO: f(messages.discover.filterChildOptionsDAO),
        filterChildOptionsDecentralisedStorage: f(
          messages.discover.filterChildOptionsDecentralisedStorage,
        ),
        filterParentOptionsMedia: f(messages.discover.filterParentOptionsMedia),
        filterParentOptionsInvestment: f(
          messages.discover.filterParentOptionsInvestment,
        ),
        filterParentOptionsNFT: f(messages.discover.filterParentOptionsNFT),
        filterParentOptionsTrading: f(
          messages.discover.filterParentOptionsTrading,
        ),
        filterParentOptionsCommunity: f(
          messages.discover.filterParentOptionsCommunity,
        ),
        disconnectWarning: f(messages.discover.disconnectWarning),
        collateralNotFoundText: f(messages.discover.collateralNotFoundText),
        collateralNotFoundTitle: f(messages.discover.collateralNotFoundTitle),
        collateralNotFoundActionText: f(
          messages.discover.collateralNotFoundActionText,
        ),
        collateralTxPendingTitle: f(messages.discover.collateralTxPendingTitle),
        collateralTxPendingText: f(messages.discover.collateralTxPendingText),
      },

      // Swap strings
      swap: {
        via: f(messages.swap.via),
        placeOrder: f(messages.swap.placeOrder),
        yourAssets: f(messages.swap.yourAssets),
        allAssets: f(messages.swap.allAssets),
        swapTitle: f(messages.swap.swapTitle),
        swapDetailsTitle: f(messages.swap.swapDetailsTitle),
        swapCancellationDetailsTitle: f(
          messages.swap.swapCancellationDetailsTitle,
        ),
        tokenSwap: f(messages.swap.tokenSwap),
        orderSwap: f(messages.swap.orderSwap),
        dex: f(messages.swap.dex),
        marketButton: f(messages.swap.marketButton),
        limitButton: f(messages.swap.limitButton),
        swapFrom: f(messages.swap.swapFrom),
        swapTo: f(messages.swap.swapTo),
        currentBalance: f(messages.swap.currentBalance),
        balance: f(messages.swap.balance),
        clear: f(messages.swap.clear),
        selectToken: f(messages.swap.selectToken),
        marketPrice: f(messages.swap.marketPrice),
        marketPriceInfo: f(messages.swap.marketPriceInfo),
        limitPriceInfo: f(messages.swap.limitPriceInfo),
        limitPrice: f(messages.swap.limitPrice),
        slippageTolerance: f(messages.swap.slippageTolerance),
        slippageToleranceInfo: f(messages.swap.slippageToleranceInfo),
        swapButton: f(messages.swap.swapButton),
        verifiedBy: (pool: string) => f(messages.swap.verifiedBy, {pool}),
        assetsIn: f(messages.swap.assetsIn),
        slippageInfo: f(messages.swap.slippageInfo),
        autoPool: f(messages.swap.autoPool),
        auto: f(messages.swap.auto),
        changePool: f(messages.swap.changePool),
        swapMinAda: f(messages.swap.swapMinAda),
        swapMinAdaTitle: f(messages.swap.swapMinAdaTitle),
        swapMinReceived: f(messages.swap.swapMinReceived),
        swapMinReceivedTitle: f(messages.swap.swapMinReceivedTitle),
        swapFeesTitle: f(messages.swap.swapFeesTitle),
        swapLiquidityFee: f(messages.swap.swapLiquidityFee),
        swapLiqProvFee: f(messages.swap.swapLiqProvFee),
        swapLiquidityFeeInfo: (
          fee: string,
          options: {b: (content: React.ReactNode[]) => React.ReactNode},
        ) => f(messages.swap.swapLiquidityFeeInfo, {fee, ...options}),
        poolVerification: (pool: string) =>
          f(messages.swap.poolVerification, {pool}),
        poolVerificationInfo: (pool: string) =>
          f(messages.swap.poolVerificationInfo, {pool}),
        eachVerifiedToken: f(messages.swap.eachVerifiedToken),
        verifiedBadge: f(messages.swap.verifiedBadge),
        enterSlippage: f(messages.swap.enterSlippage),
        slippageToleranceError: f(messages.swap.slippageToleranceError),
        pools: (qty: number) => f(globalMessages.pools, {qty}),
        openOrders: f(messages.swap.openOrders),
        noAssetsFound: f(messages.swap.noAssetsFound),
        noAssetsFoundFor: (search: string) =>
          f(messages.swap.noAssetsFoundFor, {search}),
        completedOrders: f(messages.swap.completedOrders),
        signTransaction: f(messages.swap.signTransaction),
        enterSpendingPassword: f(messages.swap.enterSpendingPassword),
        spendingPassword: f(messages.swap.spendingPassword),
        sign: f(messages.swap.sign),
        searchTokens: f(messages.swap.searchTokens),
        next: f(messages.swap.next),
        chooseConnectionMethod: f(messages.swap.chooseConnectionMethod),
        selecteAssetTitle: f(messages.swap.selecteAssetTitle),
        tokens: (qty: number) => f(globalMessages.tokens, {qty}),
        apply: f(globalMessages.apply),
        found: f(messages.swap.found),
        youHave: f(messages.swap.youHave),
        price: f(messages.swap.price),
        priceImpact: f(messages.swap.priceImpact),
        priceImpactRiskHigh: ({riskValue}: {riskValue: number}) =>
          f(messages.swap.priceImpactRiskHigh, {riskValue}),
        priceImpactDescription: (risk: 'moderate' | 'high') =>
          f(
            risk === 'moderate'
              ? messages.swap.priceImpactModerateDescription
              : messages.swap.priceImpactHighDescription,
          ),
        priceImpactInfo: f(messages.swap.priceImpactInfo),
        tvl: f(messages.swap.tvl),
        poolFee: f(messages.swap.poolFee),
        batcherFee: f(messages.swap.batcherFee),
        assets: (qty: number) => f(globalMessages.assets, {qty}),
        available: f(globalMessages.available),
        asset: f(messages.swap.asset),
        volume: f(messages.swap.volume),
        total: f(globalMessages.total),
        listCompletedOrders: f(messages.swap.listCompletedOrders),
        listOpenOrders: f(messages.swap.listOpenOrders),
        listOrdersSheetTitle: f(messages.swap.listOrdersSheetTitle),
        listOrdersSheetButtonText: f(messages.swap.listOrdersSheetButtonText),
        listOrdersSheetContentTitle: f(
          messages.swap.listOrdersSheetContentTitle,
        ),
        listOrdersSheetLink: f(messages.swap.listOrdersSheetLink),
        listOrdersSheetAssetPrice: f(messages.swap.listOrdersSheetAssetPrice),
        listOrdersSheetAssetAmount: f(messages.swap.listOrdersSheetAssetAmount),
        listOrdersSheetTotalReturned: f(
          messages.swap.listOrdersSheetTotalReturned,
        ),
        listOrdersSheetCancellationFee: f(
          messages.swap.listOrdersSheetCancellationFee,
        ),
        listOrdersSheetConfirm: f(messages.swap.listOrdersSheetConfirm),
        listOrdersSheetBack: f(messages.swap.listOrdersSheetBack),
        listOrdersTimeCreated: f(messages.swap.listOrdersTimeCreated),
        listOrdersTimeCompleted: f(messages.swap.listOrdersTimeCompleted),
        listOrdersLiquidityPool: f(messages.swap.listOrdersLiquidityPool),
        listOrdersTotal: f(messages.swap.listOrdersTotal),
        listOrdersTxId: f(messages.swap.listOrdersTxId),
        limitPriceWarningTitle: f(messages.swap.limitPriceWarningTitle),
        limitPriceWarningDescription: f(
          messages.swap.limitPriceWarningDescription,
        ),
        limitPriceWarningYourPrice: f(messages.swap.limitPriceWarningYourPrice),
        limitPriceWarningMarketPrice: f(
          messages.swap.limitPriceWarningMarketPrice,
        ),
        limitPriceWarningBack: f(messages.swap.limitPriceWarningBack),
        limitPriceWarningConfirm: f(messages.swap.limitPriceWarningConfirm),
        error: f(globalMessages.error),
        rejectedByUser: f(ledgerMessages.rejectedByUserError),
        routingPreferences: f(messages.swap.routingPreferences),
        route: f(messages.swap.route),
        routeDescription: f(messages.swap.routeDescription),
        usbExplanation: f(messages.swap.usbExplanation),
        usbButton: f(messages.swap.usbButton),
        usbConnectionIsBlocked: f(messages.swap.usbConnectionIsBlocked),
        bluetoothExplanation: f(messages.swap.bluetoothExplanation),
        bluetoothButton: f(messages.swap.bluetoothButton),
        bluetoothError: f(messages.swap.bluetoothError),
        transactionSigned: f(messages.swap.transactionSigned),
        transactionDisplay: f(messages.swap.transactionDisplay),
        seeOnExplorer: f(messages.swap.seeOnExplorer),
        goToTransactions: f(messages.swap.goToTransactions),
        wrongPasswordMessage: f(messages.swap.wrongPasswordMessage),
        assignCollateral: f(messages.swap.assignCollateral),
        collateralNotFound: f(messages.swap.collateralNotFound),
        noActiveCollateral: f(messages.swap.noActiveCollateral),
        collateralTxPending: f(messages.swap.collateralTxPending),
        collateralTxPendingTitle: f(messages.swap.collateralTxPendingTitle),
        failedTxTitle: f(messages.swap.failedTxTitle),
        failedTxText: f(messages.swap.failedTxText),
        failedTxButton: f(messages.swap.failedTxButton),
        generalTxErrorMessage: f(errorMessages.generalTxError.message),
        incorrectPasswordTitle: f(errorMessages.incorrectPassword.title),
        incorrectPasswordMessage: f(errorMessages.incorrectPassword.message),
        notEnoughBalance: f(messages.swap.notEnoughBalance),
        notEnoughSupply: f(messages.swap.notEnoughSupply),
        notEnoughFeeBalance: f(messages.swap.notEnoughFeeBalance),
        noPool: f(messages.swap.noPool),
        generalErrorTitle: f(errorMessages.generalError.title),
        generalErrorMessage: (e: string) =>
          f(errorMessages.generalError.message, {message: e}),
        continueOnLedger: f(ledgerMessages.continueOnLedger),
        continue: f(messages.swap.continue),
        cancel: f(globalMessages.cancel),
        tryAgain: f(globalMessages.tryAgain),
        bluetoothDisabledError: f(ledgerMessages.bluetoothDisabledError),
        ledgerBluetoothDisabledError: f(ledgerMessages.bluetoothDisabledError),
        ledgerGeneralConnectionError: f(ledgerMessages.connectionError),
        ledgerUserError: f(ledgerMessages.connectionError),
        ledgerAdaAppNeedsToBeOpenError: f(ledgerMessages.appOpened),
        slippageWarningTitle: f(messages.swap.slippageWarningTitle),
        slippageWarningText: f(messages.swap.slippageWarningText),
        slippageWarningYourSlippage: f(
          messages.swap.slippageWarningYourSlippage,
        ),
        slippageWarningChangeAmount: f(
          messages.swap.slippageWarningChangeAmount,
        ),
        serviceUnavailable: f(messages.swap.serviceUnavailable),
        serviceUnavailableInfo: f(messages.swap.serviceUnavailableInfo),
        emptyOpenOrders: f(messages.swap.emptyOpenOrders),
        emptyOpenOrdersSub: f(messages.swap.emptyOpenOrdersSub),
        emptyCompletedOrders: f(messages.swap.emptyCompletedOrders),
        emptySearchCompletedOrders: f(messages.swap.emptySearchCompletedOrders),
        emptySearchOpenOrders: f(messages.swap.emptySearchOpenOrders),
        warning: f(messages.swap.warning),
        missingCollateral: f(errorMessages.missingCollateral.title),
        backToSwapOrders: f(messages.swap.backToSwapOrders),
        preprodNoticeTitle: f(messages.swap.preprodNoticeTitle),
        preprodNoticeText: f(messages.swap.preprodNoticeText),
        failedTxScreenTitle: f(messages.swap.failedTxScreenTitle),
        failedTxScreenText: f(messages.swap.failedTxScreenText),
        failedTxScreenButton: f(messages.swap.failedTxScreenButton),
        submittedTxScreenTitle: f(messages.swap.submittedTxScreenTitle),
        submittedTxScreenText: f(messages.swap.submittedTxScreenText),
        submittedTxScreenButton: f(messages.swap.submittedTxScreenButton),
        from: f(messages.swap.from),
        to: f(messages.swap.to),
        sell: f(actionMessages.sell),
        buy: f(actionMessages.buy),
        max: f(globalMessages.max),
      },

      // Staking/PoolTransition strings
      staking: {
        title: f(messages.staking.title),
        warning: f(messages.staking.warning),
        finalWarning: f(messages.staking.finalWarning),
        currentPool: f(messages.staking.currentPool),
        newPool: f(messages.staking.newPool),
        estimatedRoa: f(messages.staking.estimatedRoa),
        fee: f(messages.staking.fee),
        poolGeneratesRewards: f(messages.staking.poolGeneratesRewards),
        poolNoRewards: f(messages.staking.poolNoRewards),
        poolWillStopRewards: f(messages.staking.poolWillStopRewards),
        skipNoRewards: f(messages.staking.skipNoRewards),
        updateKeepEarning: f(messages.staking.updateKeepEarning),
        update: f(messages.staking.update),
        governanceCentreTitle: f(messages.staking.governanceCentreTitle),
        confirmTxTitle: f(messages.staking.confirmTxTitle),
        learnMoreAboutGovernance: f(messages.staking.learnMoreAboutGovernance),
        actionDelegateToADRepTitle: f(
          messages.staking.actionDelegateToADRepTitle,
        ),
        actionDelegateToADRepDescription: f(
          messages.staking.actionDelegateToADRepDescription,
        ),
        actionAbstainTitle: f(messages.staking.actionAbstainTitle),
        actionAbstainDescription: f(messages.staking.actionAbstainDescription),
        actionNoConfidenceTitle: f(messages.staking.actionNoConfidenceTitle),
        actionNoConfidenceDescription: f(
          messages.staking.actionNoConfidenceDescription,
        ),
        drepKey: f(messages.staking.drepKey),
        delegatingToADRep: f(messages.staking.delegatingToADRep),
        delegateToADRep: f(messages.staking.delegateToADRep),
        abstaining: f(messages.staking.abstaining),
        delegateVotingToDRep: f(messages.staking.delegateVotingToDRep),
        selectAbstain: f(messages.staking.selectAbstain),
        selectNoConfidence: f(messages.staking.selectNoConfidence),
        operations: f(messages.staking.operations),
        drepID: f(messages.staking.drepID),
        thankYouForParticipating: f(messages.staking.thankYouForParticipating),
        thisTransactionCanTakeAWhile: f(
          messages.staking.thisTransactionCanTakeAWhile,
        ),
        participationBenefits: f(messages.staking.participationBenefits),
        goToGovernance: f(messages.staking.goToGovernance),
        findDRepHere: f(messages.staking.findDRepHere),
        reviewActions: f(messages.staking.reviewActions),
        actionYouHaveSelectedTxPending: (
          action: string,
          formattingOptions: any,
        ) =>
          f(messages.staking.actionYouHaveSelectedTxPending, {
            ...formattingOptions,
            action,
          }),
        actionYouHaveSelected: (action: string, formattingOptions: any) =>
          f(messages.staking.actionYouHaveSelected, {
            ...formattingOptions,
            action,
          }),
        changeDRep: f(messages.staking.changeDRep),
        confirm: f(messages.staking.confirm),
        transactionDetails: f(messages.staking.transactionDetails),
        total: f(messages.staking.total),
        transactionFailed: f(messages.staking.transactionFailed),
        notSupportedVersionTitle: f(messages.staking.notSupportedVersionTitle),
        notSupportedVersionDescription: f(
          messages.staking.notSupportedVersionDescription,
        ),
        noFunds: f(messages.staking.noFunds),
        transactionFailedDescription: f(
          messages.staking.transactionFailedDescription,
        ),
        tryAgain: f(messages.staking.tryAgain),
        buyAda: f(messages.staking.buyAda),
        goToFaucet: f(messages.staking.goToFaucet),
        withdrawWarningTitle: f(messages.staking.withdrawWarningTitle),
        withdrawWarningDescription: f(
          messages.staking.withdrawWarningDescription,
        ),
        withdrawWarningButton: f(messages.staking.withdrawWarningButton),
        enterDRepID: f(messages.staking.enterDRepID),
        signTransaction: f(txLabels.signingTx),
        password: f(txLabels.password),
        sign: f(txLabels.sign),
        error: f(globalMessages.error),
        wrongPassword: f(errorMessages.incorrectPassword.title),
        enterPassword: f(messages.staking.enterPassword),
        continueOnLedger: f(ledgerMessages.continueOnLedger),
        fees: f(txLabels.fees),
        hardwareWalletSupportComingSoon: f(
          messages.staking.hardwareWalletSupportComingSoon,
        ),
        workingOnHardwareWalletSupport: f(
          messages.staking.workingOnHardwareWalletSupport,
        ),
        goToWallet: f(messages.staking.goToWallet),
        txFees: f(messages.staking.txFees),
        registerStakingKey: f(messages.staking.registerStakingKey),
        enterDrepIDInfo: f(messages.staking.enterDrepIDInfo),
        goToStaking: f(messages.staking.goToStaking),
        readyToCollectRewards: f(messages.staking.readyToCollectRewards),
        notSupportedVersionButton: f(
          messages.staking.notSupportedVersionButton,
        ),
        scriptNotSupported: f(messages.staking.scriptNotSupported),
        submittedTxButton: f(messages.staking.submittedTxButton),
        submittedTxText: f(messages.staking.submittedTxText),
        submittedTxTitle: f(messages.staking.submittedTxTitle),
        failedTxButton: f(messages.staking.failedTxButton),
        failedTxText: f(messages.staking.failedTxText),
        failedTxTitle: f(messages.staking.failedTxTitle),
        invalidDRepId: f(messages.staking.invalidDRepId),
        delegateToAYoroiDrep: f(messages.staking.delegateToAYoroiDrep),
        delegatingToYoroiDRep: f(messages.staking.delegatingToYoroiDRep),
        delegateToAYoroiDRepDescription: f(
          messages.staking.delegateToAYoroiDRepDescription,
        ),
        delegateVotingToDRepDeprecatedFormatNotice: f(
          messages.staking.delegateVotingToDRepDeprecatedFormatNotice,
        ),
        yoroiRecord: f(messages.staking.yoroiRecord),
        newToGovernanceTitle: f(messages.staking.newToGovernanceTitle),
        newToGovernanceText: f(messages.staking.newToGovernanceText),
        poolDetails: {
          poolHash: f(messages.staking.poolDetails.poolHash),
          delegate: f(messages.staking.poolDetails.delegate),
          poolID: f(messages.staking.poolDetails.poolID),
          invalidPoolID: f(messages.staking.poolDetails.invalidPoolID),
          next: f(messages.staking.poolDetails.next),
          disclaimerTitle: f(messages.staking.poolDetails.disclaimerTitle),
          disclaimerText: f(messages.staking.poolDetails.disclaimerText),
        },
      },

      // Transactions strings
      transactions: {
        title: f(messages.transactions.title),
        warningTitle: f(messages.transactions.warningTitle),
        warningMessage: f(messages.transactions.message),
        transactions: f(txLabels.transactions),
        assets: (qty: number) => f(globalMessages.assets, {qty}),
        sendLabel: f(actionMessages.send),
        receiveLabel: f(actionMessages.receive),
        buyLabel: f(actionMessages.buy),
        buyTitle: f(actionMessages.buyTitle),
        buyInfo: (options: any) => f(actionMessages.buyInfo, options),
        proceed: f(actionMessages.proceed),
        swapLabel: f(actionMessages.swap),
        messageBuy: f(actionMessages.soon),
        exchange: f(actionMessages.exchange),
        addressCopiedMsg: f(messages.receive.addressCopiedMsg),
        lockedDeposit: f(globalMessages.lockedDeposit),
        syncErrorBannerTextWithRefresh: f(
          globalMessages.syncErrorBannerTextWithRefresh,
        ),
        syncErrorBannerTextWithoutRefresh: f(
          globalMessages.syncErrorBannerTextWithoutRefresh,
        ),
        noTransactions: f(messages.transactions.noTransactions),
        direction: (direction: any) =>
          f(messages.transactions.directionMessages[direction]),
        unknownAssetName: f(messages.transactions.unknownAssetName),
        walletAddress: f(messages.transactions.walletAddress),
        BIP32path: f(messages.transactions.BIP32path),
        copyLabel: f(messages.transactions.copyLabel),
        spending: f(messages.transactions.spending),
        staking: f(messages.transactions.staking),
        addessModalTitle: f(messages.transactions.addessModalTitle),
        verifyLabel: f(messages.transactions.verifyLabel),
        txDetailsFee: f(messages.transactions.txDetailsFee),
        fromAddresses: f(messages.transactions.fromAddresses),
        toAddresses: f(messages.transactions.toAddresses),
        memo: f(messages.transactions.memo),
        transactionId: f(messages.transactions.transactionId),
        txAssuranceLevel: f(messages.transactions.txAssuranceLevel),
        confirmations: (cnt: number) =>
          f(messages.transactions.confirmations, {cnt}),
        omittedCount: (cnt: number) =>
          f(messages.transactions.omittedCount, {cnt}),
        openInExplorer: f(messages.transactions.openInExplorer),
        SENT: f(messages.transactions.txTypeMessages.SENT),
        RECEIVED: f(messages.transactions.txTypeMessages.RECEIVED),
        SELF: f(messages.transactions.txTypeMessages.SELF),
        MULTI: f(messages.transactions.txTypeMessages.MULTI),
        assetsLabel: f(globalMessages.assetsLabel),
        copiedLabel: f(messages.transactions.copiedLabel),
        collateral: f(globalMessages.collateral),
        organizeWallet: f(messages.transactions.organizeWallet),
        organizeWalletBanner: f(messages.transactions.organizeWalletBanner),
        organizeWalletDescription: f(
          messages.transactions.organizeWalletDescription,
        ),
        organizeWalletWarning: f(messages.transactions.organizeWalletWarning),
        organizeWalletButton: f(messages.transactions.organizeWalletButton),
        history: {
          historyTitle: f(messages.transactions.historyTitle),
          txDetailsTitle: f(messages.transactions.txDetailsTitle),
        },
        submitted: {
          submittedTxTitle: f(messages.transactions.submittedTxTitle),
          submittedTxText: f(messages.transactions.submittedTxText),
          submittedTxButton: f(messages.transactions.submittedTxButton),
        },
      },

      // Claim strings
      claim: {
        askConfirmationTitle: f(messages.claim.askConfirmationTitle),
        showSuccessTitle: f(messages.claim.showSuccessTitle),
        acceptedTitle: f(messages.claim.acceptedTitle),
        acceptedMesage: f(messages.claim.acceptedMessage),
        processingTitle: f(messages.claim.processingTitle),
        processingMessage: f(messages.claim.processingMessage),
        doneTitle: f(messages.claim.doneTitle),
        doneMessage: f(messages.claim.doneMessage),
        transactionId: f(txLabels.txId),
        addressSharingWarning: f(messages.claim.addressSharingWarning),
        domain: f(messages.claim.domain),
        code: f(messages.claim.code),
        apiErrorTitle: f(messages.claim.apiErrorTitle),
        apiErrorInvalidRequest: f(messages.claim.apiErrorInvalidRequest),
        apiErrorNotFound: f(messages.claim.apiErrorNotFound),
        apiErrorAlreadyClaimed: f(messages.claim.apiErrorAlreadyClaimed),
        apiErrorExpired: f(messages.claim.apiErrorExpired),
        apiErrorTooEarly: f(messages.claim.apiErrorTooEarly),
        apiErrorRateLimited: f(messages.claim.apiErrorRateLimited),
        ok: f(globalMessages.ok),
        cancel: f(globalMessages.cancel),
        continue: f(messages.claim.continue),
      },

      // Notifications strings
      notifications: {
        tapToView: f(messages.notifications.tapToView),
        stakingRewardsReceived: f(
          messages.notifications.stakingRewardsReceived,
        ),
        assetsReceived: f(messages.notifications.assetsReceived),
        intraWalletTransactionSent: f(
          messages.notifications.intraWalletTransactionSent,
        ),
        multipleAssetsReceived: f(
          messages.notifications.multipleAssetsReceived,
        ),
        received: f(messages.notifications.received),
        multipleAssetsSent: f(messages.notifications.multipleAssetsSent),
        sent: f(messages.notifications.sent),
        noNotifications: f(messages.notifications.noNotifications),
        markAllAsRead: f(messages.notifications.markAllAsRead),
        getImportantAlerts: f(messages.notifications.getImportantAlerts),
        turnOnAlerts: f(messages.notifications.turnOnAlerts),
        skip: f(messages.notifications.skip),
        turnOnNotifications: f(messages.notifications.turnOnNotifications),
      },

      // WalletManager strings
      walletManager: {
        addWalletButton: f(messages.walletManager.addWalletButton),
        supportTicketLink: f(messages.walletManager.supportTicketLink),
      },

      // ManageCollateral strings
      manageCollateral: {
        lockedAsCollateral: f(messages.manageCollateral.lockedAsCollateral),
        removeCollateral: f(messages.manageCollateral.removeCollateral),
        collateralSpent: f(messages.manageCollateral.collateralSpent),
        generateCollateral: f(messages.manageCollateral.generateCollateral),
        notEnoughFundsAlertTitle: f(
          messages.manageCollateral.notEnoughFundsAlertTitle,
        ),
        notEnoughFundsAlertMessage: f(
          messages.manageCollateral.notEnoughFundsAlertMessage,
        ),
        notEnoughFundsAlertOK: f(
          messages.manageCollateral.notEnoughFundsAlertOK,
        ),
        collateralInfoModalLabel: f(
          messages.manageCollateral.collateralInfoModalLabel,
        ),
        collateralInfoModalTitle: f(
          messages.manageCollateral.collateralInfoModalTitle,
        ),
        collateralInfoModalText: f(
          messages.manageCollateral.collateralInfoModalText,
        ),
        initialCollateralInfoModalTitle: f(
          messages.manageCollateral.initialCollateralInfoModalTitle,
        ),
        initialCollateralInfoModalText: f(
          messages.manageCollateral.initialCollateralInfoModalText,
        ),
        initialCollateralInfoModalButton: f(
          messages.manageCollateral.initialCollateralInfoModalButton,
        ),
        learnMore: f(globalMessages.learnMore),
        cancel: f(globalMessages.cancel),
      },

      // ManageNotifications strings
      manageNotifications: {
        manageDisplayDurationScreenTitle: f(
          messages.manageNotifications.displayDuration,
        ),
        inAppNotifications: f(messages.manageNotifications.inAppNotifications),
        displayDuration: f(messages.manageNotifications.displayDuration),
        pushNotifications: f(messages.manageNotifications.pushNotifications),
        goToSettings: f(messages.manageNotifications.goToSettings),
        enableNotificationsThroughSettings: f(
          messages.manageNotifications.enableNotificationsThroughSettings,
        ),
        notifications: f(messages.manageNotifications.notifications),
      },

      // ManageNotificationDisplayDuration strings
      manageNotificationDisplayDuration: {
        description: f(messages.manageNotificationDisplayDuration.description),
        apply: f(messages.manageNotificationDisplayDuration.apply),
        displayDuration: f(
          messages.manageNotificationDisplayDuration.displayDuration,
        ),
        manual: f(messages.manageNotificationDisplayDuration.manual),
        seconds: f(messages.manageNotificationDisplayDuration.seconds),
        twoSeconds: f(messages.manageNotificationDisplayDuration.twoSeconds),
        fourSeconds: f(messages.manageNotificationDisplayDuration.fourSeconds),
        sixSeconds: f(messages.manageNotificationDisplayDuration.sixSeconds),
        eightSeconds: f(
          messages.manageNotificationDisplayDuration.eightSeconds,
        ),
        tenSeconds: f(messages.manageNotificationDisplayDuration.tenSeconds),
        twelveSeconds: f(
          messages.manageNotificationDisplayDuration.twelveSeconds,
        ),
        inputError: f(messages.manageNotificationDisplayDuration.inputError),
      },

      // Initialization strings
      initialization: {
        title: f(messages.initialization.title),
        description: f(messages.initialization.description),
        selectLanguage: f(messages.initialization.selectLanguage),
        tosIAgreeWith: f(messages.initialization.tosIAgreeWith),
        tosAgreement: f(messages.initialization.tosAgreement),
        continue: f(messages.initialization.continue),
        acceptTermsTitle: f(messages.initialization.acceptTermsTitle),
        acceptPrivacyPolicyTitle: f(
          messages.initialization.acceptPrivacyPolicyTitle,
        ),
        languagePickerTitle: f(messages.initialization.languagePickerTitle),
        tosAnd: f(messages.initialization.tosAnd),
        privacyPolicy: f(messages.initialization.privacyPolicy),
        biometricDescription: f(messages.initialization.biometricDescription),
        ignoreButton: f(messages.initialization.ignoreButton),
        enableButton: f(messages.initialization.enableButton),
        darkThemeAnnouncement: {
          header: f(messages.initialization.darkThemeAnnouncement.header),
          description: f(
            messages.initialization.darkThemeAnnouncement.description,
          ),
          changeTheme: f(
            messages.initialization.darkThemeAnnouncement.changeTheme,
          ),
          continue: f(messages.initialization.darkThemeAnnouncement.continue),
        },
      },

      // Setup Wallet strings
      setupWallet: {
        notFound: f(messages.setupWallet.notFound),
        clearAll: f(messages.setupWallet.clearAll),
        passwordStrengthRequirement: f(
          messages.setupWallet.passwordStrengthRequirement,
        ),
        repeatPasswordInputLabel: f(
          messages.setupWallet.repeatPasswordInputLabel,
        ),
        repeatPasswordInputError: f(
          messages.setupWallet.repeatPasswordInputError,
        ),
        logoTitle: f(messages.setupWallet.logoTitle),
        logoSubtitle: f(messages.setupWallet.logoSubtitle),
        learnMore: f(messages.setupWallet.learnMore),
        continueButton: f(messages.setupWallet.continueButton),
        next: f(messages.setupWallet.next),
        createWalletButtonCard: f(messages.setupWallet.createWalletButtonCard),
        restoreWalletButtonCard: f(
          messages.setupWallet.restoreWalletButtonCard,
        ),
        connectWalletButtonCard: f(
          messages.setupWallet.connectWalletButtonCard,
        ),
        cardanoMainnet: f(messages.setupWallet.cardanoMainnet),
        cardanoTestnet: f(messages.setupWallet.cardanoTestnet),
        cardanoMainnetDescription: f(
          messages.setupWallet.cardanoMainnetDescription,
        ),
        cardanoTestnetDescription: f(
          messages.setupWallet.cardanoTestnetDescription,
        ),
        aboutRecoveryPhraseTitle: f(
          messages.setupWallet.aboutRecoveryPhraseTitle,
        ),
        stepAboutRecoveryPhrase: f(
          messages.setupWallet.stepAboutRecoveryPhrase,
        ),
        aboutRecoveryPhraseCardFirstItem: f(
          messages.setupWallet.aboutRecoveryPhraseCardFirstItem,
        ),
        aboutRecoveryPhraseCardSecondItem: f(
          messages.setupWallet.aboutRecoveryPhraseCardSecondItem,
        ),
        aboutRecoveryPhraseCardThirdItem: f(
          messages.setupWallet.aboutRecoveryPhraseCardThirdItem,
        ),
        navigator: {
          addNewWalletTitle: f(messages.setupWallet.addNewWalletTitle),
          createWalletTitle: f(messages.setupWallet.createWalletTitle),
          restoreWalletTitle: f(messages.setupWallet.restoreWalletTitle),
          importReadOnlyTitle: f(messages.setupWallet.importReadOnlyTitle),
          saveReadOnlyWalletTitle: f(
            messages.setupWallet.saveReadOnlyWalletTitle,
          ),
          mnemonicShowTitle: f(messages.setupWallet.mnemonicShowTitle),
          mnemonicCheckTitle: f(messages.setupWallet.mnemonicCheckTitle),
        },
        walletNameForm: {
          walletNameInputLabel: f(messages.setupWallet.walletNameInputLabel),
          save: f(messages.setupWallet.save),
          walletNameErrorTooLong: f(
            messages.setupWallet.walletNameErrorTooLong,
          ),
          walletNameErrorMustBeFilled: f(
            messages.setupWallet.walletNameErrorMustBeFilled,
          ),
        },
        saveReadOnlyWallet: {
          defaultWalletName: f(messages.setupWallet.defaultWalletName),
          checksumLabel: f(messages.setupWallet.checksumLabel),
          walletAddressLabel: f(messages.setupWallet.walletAddressLabel),
          key: f(messages.setupWallet.key),
          derivationPath: f(messages.setupWallet.derivationPath),
        },
        importReadOnlyWallet: {
          title: f(messages.setupWallet.importReadOnlyWalletTitle),
          description: f(messages.setupWallet.importReadOnlyWalletDescription),
          walletAddress: f(messages.setupWallet.importReadOnlyWalletAddress),
          walletAddressPlaceholder: f(
            messages.setupWallet.importReadOnlyWalletAddressPlaceholder,
          ),
          import: f(messages.setupWallet.importReadOnlyWalletImport),
        },
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

  setupWallet: defineMessages({
    notFound: {
      id: 'components.walletinit.createwallet.createwalletscreen.notFound',
      defaultMessage: '!!!Not found',
    },
    clearAll: {
      id: 'components.walletinit.createwallet.createwalletscreen.clearAll',
      defaultMessage: '!!!Clear all',
    },
    passwordStrengthRequirement: {
      id: 'components.walletinit.createwallet.createwalletscreen.passwordLengthRequirement',
      defaultMessage: '!!!Minimum characters',
    },
    repeatPasswordInputLabel: {
      id: 'components.walletinit.walletform.repeatPasswordInputLabel',
      defaultMessage: '!!!Repeat password',
    },
    repeatPasswordInputError: {
      id: 'components.walletinit.walletform.repeatPasswordInputError',
      defaultMessage: '!!!Passwords do not match',
    },
    logoTitle: {
      id: 'components.walletinit.walletinitmenu.logo.title',
      defaultMessage: '!!!Yoroi',
    },
    logoSubtitle: {
      id: 'components.walletinit.walletinitmenu.logo.subtitle',
      defaultMessage: '!!!Light wallet for Cardano assets',
    },
    learnMore: {
      id: 'components.walletinit.learnMoreInfo.button.title',
      defaultMessage: '!!!Learn more on Yoroi Zendesk',
    },
    continueButton: {
      id: 'components.walletinit.txnavigationbuttons.continueButton',
      defaultMessage: '!!!Continue',
    },
    next: {
      id: 'components.walletinit.txnavigationbuttons.nextButton',
      defaultMessage: '!!!Next',
    },
    createWalletButtonCard: {
      id: 'components.walletinit.walletinitmenu.createwalletbutton.title',
      defaultMessage: '!!!Create new wallet',
    },
    restoreWalletButtonCard: {
      id: 'components.walletinit.walletinitmenu.restorewalletbutton.title',
      defaultMessage: '!!!Restore Yoroi existing wallet',
    },
    connectWalletButtonCard: {
      id: 'components.walletinit.walletinitmenu.connectwalletbutton.title',
      defaultMessage: '!!!Connect hardware wallet device',
    },
    cardanoMainnet: {
      id: 'components.walletinit.walletinitmenu.cardanoMainnetbutton.title',
      defaultMessage: '!!!Cardano Mainnet',
    },
    cardanoTestnet: {
      id: 'components.walletinit.walletinitmenu.cardanoTestnetbutton.title',
      defaultMessage: '!!!Cardano Preprod Testnet',
    },
    cardanoMainnetDescription: {
      id: 'components.walletinit.walletinitmenu.cardanoMainnetbutton.description',
      defaultMessage: '!!!Works with real ADA',
    },
    cardanoTestnetDescription: {
      id: 'components.walletinit.walletinitmenu.cardanoTestnetbutton.description',
      defaultMessage: '!!!Works with test ADA (tADA)',
    },
    aboutRecoveryPhraseTitle: {
      id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryPhrase.title',
      defaultMessage:
        '!!!Read this information carefully before saving your recovery phrase:',
    },
    stepAboutRecoveryPhrase: {
      id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryStepper.title',
      defaultMessage: '!!!About recovery phrase',
    },
    aboutRecoveryPhraseCardFirstItem: {
      id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryPhraseCard.firstItem',
      defaultMessage:
        '!!!Recovery phrase is the only way to access your wallet',
    },
    aboutRecoveryPhraseCardSecondItem: {
      id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryPhraseCard.secondItem',
      defaultMessage:
        '!!!If you lose your Recovery phrase, it will not be possible to recover your wallet',
    },
    aboutRecoveryPhraseCardThirdItem: {
      id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryPhraseCard.thirdItem',
      defaultMessage:
        '!!!You are the only person who knows and stores your Recovery phrase',
    },
    aboutRecoveryPhraseCardFourthItem: {
      id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryPhraseCard.fourthItem',
      defaultMessage:
        '!!!You are the only person who knows and stores your Recovery phrase',
    },
    aboutRecoveryPhraseCardFifthItem: {
      id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryPhraseCard.fifthItem',
      defaultMessage:
        '!!!Yoroi NEVER asks for your Recovery phrase. Watch out for scammers and impersonators',
    },
    recoveryPhraseTitle: {
      id: 'components.walletinit.recoveryPhrase.title',
      defaultMessage:
        '!!!Click "Show recovery phrase" below to reveal and save it. ',
    },
    stepRecoveryPhrase: {
      id: 'components.walletinit.recoveryPhrase.recoveryStepper.title',
      defaultMessage: '!!!Recovery phrase',
    },
    hideRecoveryPhraseButton: {
      id: 'components.walletinit.recoveryPhrase.hideRecoveryPhraseButton',
      defaultMessage: '!!!Hide recovery phrase',
    },
    showRecoveryPhraseButton: {
      id: 'components.walletinit.recoveryPhrase.showRecoveryPhraseButton',
      defaultMessage: '!!!Show recovery phrase',
    },
    recoveryPhraseModalTitle: {
      id: 'components.walletinit.recoveryPhrase.recoveryPhraseModal.title',
      defaultMessage: '!!!Tips',
    },
    recoveryPhraseCardTitle: {
      id: 'components.walletinit.recoveryPhrase.recoveryPhraseCard.title',
      defaultMessage: '!!!How to save your recovery phrase?',
    },
    recoveryPhraseCardFirstItem: {
      id: 'components.walletinit.recoveryPhrase.recoveryPhraseCard.firstItem',
      defaultMessage: '!!!Make sure no one is looking at your screen.',
    },
    recoveryPhraseCardSecondItem: {
      id: 'components.walletinit.recoveryPhrase.recoveryPhraseCard.secondItem',
      defaultMessage: '!!!DO NOT take a screenshot.',
    },
    recoveryPhraseCardThirdItem: {
      id: 'components.walletinit.recoveryPhrase.recoveryPhraseCard.thirdItem',
      defaultMessage:
        '!!!Write the recovery phrase on a piece of paper and store in a secure location like a safety deposit box.',
    },
    recoveryPhraseCardFourthItem: {
      id: 'components.walletinit.recoveryPhrase.recoveryPhraseCard.fourthItem',
      defaultMessage:
        '!!!It is recommended to have 2 or 3 copies of the recovery phrase in different secure locations.',
    },
    recoveryPhraseCardFifthItem: {
      id: 'components.walletinit.recoveryPhrase.recoveryPhraseCard.fifthItem',
      defaultMessage:
        '!!!DO NOT share the recovery phrase as this will allow anyone to access your assets and wallet.',
    },
    verifyRecoveryPhraseTitle: {
      id: 'components.walletinit.verifyRecoveryPhrase.title',
      defaultMessage:
        '!!!Select each word in the correct order to confirm your recovery phrase.',
    },
    stepVerifyRecoveryPhrase: {
      id: 'components.walletinit.verifyRecoveryPhrase.verifyRecoveryStepper.title',
      defaultMessage: '!!!Verify recovery phrase',
    },
    verifyRecoveryPhraseErrorMessage: {
      id: 'components.walletinit.verifyRecoveryPhrase.errorMessage',
      defaultMessage: '!!!Incorrect order. Try again',
    },
    verifyRecoveryPhraseSuccessMessage: {
      id: 'components.walletinit.verifyRecoveryPhrase.successMessage',
      defaultMessage: '!!!The recovery phrase is verified',
    },
    walletDetailsModalTitle: {
      id: 'components.walletinit.walletDetails.walletDetailsModalTitle.title',
      defaultMessage: '!!!Tips',
    },
    walletNameModalCardTitle: {
      id: 'components.walletinit.walletDetails.walletNameModalCardTitle.title',
      defaultMessage: '!!!What is wallet name',
    },
    walletNameModalCardFirstItem: {
      id: 'components.walletinit.walletDetails.walletNameModalCardItem.first',
      defaultMessage:
        '!!!It is a wallet identifier that helps you to easier find the exact wallet in your app',
    },
    walletNameModalCardSecondItem: {
      id: 'components.walletinit.walletDetails.walletNameModalCardItem.second',
      defaultMessage:
        '!!!You can have different wallet names for the same wallet account connected to different devices',
    },
    walletPasswordModalCardTitle: {
      id: 'components.walletinit.walletDetails.walletPasswordModalCardTitle.title',
      defaultMessage: '!!!What is password',
    },
    walletPasswordModalCardFirstItem: {
      id: 'components.walletinit.walletDetails.walletPasswordModalCardItem.first',
      defaultMessage:
        '!!!Password is an additional security layer used to confirm transactions from this device',
    },
    walletPasswordModalCardSecondItem: {
      id: 'components.walletinit.walletDetails.walletPasswordModalCardItem.second',
      defaultMessage:
        '!!!Both wallet name and password are stored locally, so you are only person who can change or restore it.',
    },
    walletChecksumModalCardTitle: {
      id: 'components.walletinit.walletDetails.walletChecksumModalCardTitle.title',
      defaultMessage: '!!!What is wallet checksum and plate number?',
    },
    walletChecksumModalCardFirstItem: {
      id: 'components.walletinit.walletDetails.walletChecksumModalCardItem.first',
      defaultMessage:
        '!!!is a generic Blockie image that is generated to visually distinguish your wallet from others.',
    },
    walletChecksum: {
      id: 'components.walletinit.walletDetails.walletChecksumModalCardItem.walletchecksum',
      defaultMessage: '!!!Wallet checksum',
    },
    walletChecksumModalCardSecondItem: {
      id: 'components.walletinit.walletDetails.walletChecksumModalCardItem.second',
      defaultMessage:
        '!!!Plate number {checksum} is a auto-generated sign of four letters and four digits.',
    },
    walletChecksumModalCardThirdItem: {
      id: 'components.walletinit.walletDetails.walletChecksumModalCardItem.third',
      defaultMessage:
        '!!!Checksum and plate number are unique to your wallet and represent your public key.',
    },
    stepWalletDetails: {
      id: 'components.walletinit.walletDetails.stepWalletDetails',
      defaultMessage: '!!!Wallet details',
    },
    walletDetailsTitle: {
      id: 'components.walletinit.walletDetails.walletDetailsTitle',
      defaultMessage: '!!!Add your wallet name and password. ',
    },
    walletDetailsPasswordHelper: {
      id: 'components.walletinit.walletDetails.walletDetailsPasswordHelper',
      defaultMessage:
        '!!!Combine letters, numbers and symbols to make it stronger',
    },
    walletDetailsNameInput: {
      id: 'components.walletinit.walletDetails.walletDetailsNameInput',
      defaultMessage: '!!!Enter wallet name',
    },
    walletDetailsPasswordInput: {
      id: 'components.walletinit.walletDetails.walletDetailsPasswordInput',
      defaultMessage: '!!!Enter password',
    },
    walletDetailsConfirmPasswordInput: {
      id: 'components.walletinit.walletDetails.walletDetailsConfirmPasswordInput',
      defaultMessage: '!!!Confirm password',
    },
    invalidChecksum: {
      id: 'components.walletinit.restorewallet.restorewalletscreen.invalidchecksum',
      defaultMessage: '!!!Please enter valid mnemonic.',
    },
    validChecksum: {
      id: 'components.walletinit.restorewallet.restorewalletscreen.validchecksum',
      defaultMessage: '!!!The recovery phrase is verified',
    },
    stepRestoreWalletScreen: {
      id: 'components.walletinit.restorewallet.restorewalletscreen.stepRestoreWalletScreen',
      defaultMessage: '!!!Enter recovery phrase',
    },
    choose15WordsMnemonicTitle: {
      id: 'components.walletinit.restorewallet.choose15WordsMnemonicTitle',
      defaultMessage: '!!!15 word recovery phrase',
    },
    choose24WordsMnemonicTitle: {
      id: 'components.walletinit.restorewallet.choose24WordsMnemonicTitle',
      defaultMessage: '!!!24 word recovery phrase',
    },
    restoreWalletScreenTitle: {
      id: 'components.walletinit.restorewallet.restorewalletscreen.restoreWalletScreenTitle',
      defaultMessage:
        '!!!Add the recovery phrase you received upon your wallet creation process.',
    },
    restoreDuplicatedWalletModalTitle: {
      id: 'components.walletinit.restorewallet.restorewalletscreen.restoreDuplicatedWalletModalTitle',
      defaultMessage: '!!!This wallet is already added',
    },
    restoreDuplicatedWalletModalText: {
      id: 'components.walletinit.restorewallet.restorewalletscreen.restoreDuplicatedWalletModalText',
      defaultMessage:
        '!!!This wallet already exist on your device, You can open it or go back and restore another wallet.',
    },
    restoreDuplicatedWalletModalButton: {
      id: 'components.walletinit.restorewallet.restorewalletscreen.restoreDuplicatedWalletModalButton',
      defaultMessage: '!!!Open wallet',
    },
    preparingWallet: {
      id: 'components.walletinit.restorewallet.restorewalletscreen.preparingWallet',
      defaultMessage: '!!!Preparing your wallet...',
    },
    wordNotFound: {
      id: 'components.walletinit.restorewallet.restorewalletscreen.wordNotFound',
      defaultMessage: '!!!Word not found',
    },
    hwModalTitle: {
      id: 'components.ledger.ledgertransportswitchmodal.title',
      defaultMessage: '!!!Choose connection method',
    },
    hwModalText: {
      id: 'components.ledger.ledgertransportswitchmodal.text',
      defaultMessage:
        '!!!Select the option to connect Ledger Nano X or Ledger Nano S to Yoroi app',
    },
    hwModalUsbButton: {
      id: 'components.ledger.ledgertransportswitchmodal.usbButton',
      defaultMessage: '!!!Connect with USB',
    },
    hwModalBtButton: {
      id: 'components.ledger.ledgertransportswitchmodal.bluetoothButton',
      defaultMessage: '!!!Connect with Bluetooth',
    },
    hwModalIosWarning: {
      id: 'components.ledger.ledgertransportswitchmodal.iosWarning',
      defaultMessage:
        '!!!USB connection is NOT available on Apple iOS devices. You can always try this connection type on Android platform',
    },
    hwWalletDetailsTitle: {
      id: 'components.walletinit.restorewallet.hwWalletDetailsTitle',
      defaultMessage: '!!!<b>Add</b> your <b>wallet name</b>',
    },
    hwExportKey: {
      id: 'components.walletinit.connectnanox.connectnanoxscreen.exportKey',
      defaultMessage:
        '!!!Action needed: Please, export public key from your Ledger device.',
    },
    bluetoothError: {
      id: 'global.ledgerMessages.bluetoothDisabledError',
      defaultMessage: '!!!Connect with Bluetooth',
    },
    hwCheckIntroline: {
      id: 'components.walletinit.connectnanox.checknanoxscreen.introline',
      defaultMessage: '!!!Before continuing, please make sure that:',
    },
    hwCheckTitle: {
      id: 'components.walletinit.connectnanox.checknanoxscreen.steppertitle',
      defaultMessage: '!!!Intro',
    },
    ledgerSupportLink: {
      id: 'components.walletinit.restorewallet.ledgerSupportLink',
      defaultMessage: '!!!Learn more about using Yoroi with Ledger',
    },
    addNewWalletTitle: {
      id: 'components.walletinit.walletinitmenu.addNewWalletTitle',
      defaultMessage: '!!!Add new wallet',
    },
    createWalletTitle: {
      id: 'components.walletinit.walletinitmenu.createWalletTitle',
      defaultMessage: '!!!Create wallet',
    },
    restoreWalletTitle: {
      id: 'components.walletinit.walletinitmenu.restoreWalletTitle',
      defaultMessage: '!!!Restore wallet',
    },
    importReadOnlyTitle: {
      id: 'components.walletinit.walletinitmenu.importReadOnlyTitle',
      defaultMessage: '!!!Import read-only wallet',
    },
    saveReadOnlyWalletTitle: {
      id: 'components.walletinit.walletinitmenu.saveReadOnlyWalletTitle',
      defaultMessage: '!!!Save read-only wallet',
    },
    mnemonicShowTitle: {
      id: 'components.walletinit.walletinitmenu.mnemonicShowTitle',
      defaultMessage: '!!!Show mnemonic',
    },
    mnemonicCheckTitle: {
      id: 'components.walletinit.walletinitmenu.mnemonicCheckTitle',
      defaultMessage: '!!!Check mnemonic',
    },
    walletNameInputLabel: {
      id: 'components.walletinit.walletform.walletNameInputLabel',
      defaultMessage: '!!!Wallet name',
    },
    save: {
      id: 'components.walletinit.connectnanox.savenanoxscreen.save',
      defaultMessage: '!!!Save',
    },
    walletNameErrorTooLong: {
      id: 'components.walletinit.walletform.walletNameErrorTooLong',
      defaultMessage: '!!!Wallet name is too long',
    },
    walletNameErrorMustBeFilled: {
      id: 'components.walletinit.walletform.walletNameErrorMustBeFilled',
      defaultMessage: '!!!Wallet name must be filled',
    },
    defaultWalletName: {
      id: 'components.walletinit.savereadonlywalletscreen.defaultWalletName',
      defaultMessage: '!!!My read-only wallet',
    },
    checksumLabel: {
      id: 'components.walletinit.verifyrestoredwallet.checksumLabel',
      defaultMessage: '!!!Checksum label',
    },
    walletAddressLabel: {
      id: 'components.walletinit.verifyrestoredwallet.walletAddressLabel',
      defaultMessage: '!!!Wallet Address(es):',
    },
    key: {
      id: 'components.walletinit.savereadonlywalletscreen.key',
      defaultMessage: '!!!Key:',
    },
    derivationPath: {
      id: 'components.walletinit.savereadonlywalletscreen.derivationPath',
      defaultMessage: '!!!Derivation path:',
    },
    importReadOnlyWalletTitle: {
      id: 'components.walletinit.importreadonlywalletscreen.title',
      defaultMessage: '!!!Import read-only wallet',
    },
    importReadOnlyWalletDescription: {
      id: 'components.walletinit.importreadonlywalletscreen.description',
      defaultMessage: '!!!Import a read-only wallet from the Yoroi extension',
    },
    importReadOnlyWalletAddress: {
      id: 'components.walletinit.importreadonlywalletscreen.address',
      defaultMessage: '!!!Wallet address',
    },
    importReadOnlyWalletAddressPlaceholder: {
      id: 'components.walletinit.importreadonlywalletscreen.addressPlaceholder',
      defaultMessage: '!!!Enter wallet address',
    },
    importReadOnlyWalletImport: {
      id: 'components.walletinit.importreadonlywalletscreen.import',
      defaultMessage: '!!!Import',
    },
  }),

  staking: defineMessages({
    governanceCentreTitle: {
      id: 'components.governance.governanceCentreTitle',
      defaultMessage: '!!!Governance dashboard',
    },
    confirmTxTitle: {
      id: 'components.governance.confirmTxTitle',
      defaultMessage: '!!!Confirm transaction',
    },
    learnMoreAboutGovernance: {
      id: 'components.governance.learnMoreAboutGovernance',
      defaultMessage: '!!!Learn more About Governance',
    },
    actionDelegateToADRepTitle: {
      id: 'components.governance.actionDelegateToADRepTitle',
      defaultMessage: '!!!Delegate to a DRep',
    },
    actionDelegateToADRepDescription: {
      id: 'components.governance.actionDelegateToADRepDescription',
      defaultMessage:
        '!!!You are designating someone else to cast vote on your behalf for all proposals now and in the future.',
    },
    actionAbstainTitle: {
      id: 'components.governance.actionAbstainTitle',
      defaultMessage: '!!!Abstain',
    },
    actionAbstainDescription: {
      id: 'components.governance.actionAbstainDescription',
      defaultMessage:
        '!!!You are choosing not to cast a vote on all proposals now and in the future.',
    },
    actionNoConfidenceTitle: {
      id: 'components.governance.actionNoConfidenceTitle',
      defaultMessage: '!!!No confidence',
    },
    actionNoConfidenceDescription: {
      id: 'components.governance.actionNoConfidenceDescription',
      defaultMessage:
        '!!!You are expressing a lack of trust for all proposals now and in the future.',
    },
    drepKey: {
      id: 'components.governance.drepKey',
      defaultMessage: '!!!DRep Key',
    },
    delegatingToADRep: {
      id: 'components.governance.delegatingToADRep',
      defaultMessage: '!!!Delegating to a DRep',
    },
    delegateToADRep: {
      id: 'components.governance.delegateToADRep',
      defaultMessage: '!!!Delegate to a DRep',
    },
    abstaining: {
      id: 'components.governance.abstaining',
      defaultMessage: '!!!Abstaining',
    },
    delegateVotingToDRep: {
      id: 'components.governance.delegateVotingToDRep',
      defaultMessage: '!!!Delegate voting to',
    },
    delegateVotingToDRepDeprecatedFormatNotice: {
      id: 'components.governance.delegateVotingToDRepDeprecatedFormatNotice',
      defaultMessage:
        '!!!We automatically updated your DRep address to the latest format (CIP 129).',
    },
    selectAbstain: {
      id: 'components.governance.selectAbstain',
      defaultMessage: '!!!Select abstain',
    },
    selectNoConfidence: {
      id: 'components.governance.selectNoConfidence',
      defaultMessage: '!!!Select no confidence',
    },
    operations: {
      id: 'components.governance.operations',
      defaultMessage: '!!!Operations',
    },
    enterPassword: {
      id: 'components.governance.enterPassword',
      defaultMessage: '!!!Enter password to sign this transaction',
    },
    drepID: {
      id: 'components.governance.drepID',
      defaultMessage: '!!!Drep ID (fingerprint)',
    },
    thankYouForParticipating: {
      id: 'components.governance.thankYouForParticipating',
      defaultMessage: '!!!Thank you for participating in Governance',
    },
    thisTransactionCanTakeAWhile: {
      id: 'components.governance.thisTransactionCanTakeAWhile',
      defaultMessage: '!!!This transaction can take a while!',
    },
    participationBenefits: {
      id: 'components.governance.participationBenefits',
      defaultMessage:
        '!!!Participating in the Cardano Governance gives you the opportunity to participate in the voting as well as withdraw your staking rewards',
    },
    goToGovernance: {
      id: 'components.governance.goToGovernance',
      defaultMessage: '!!!Go to Governance',
    },
    findDRepHere: {
      id: 'components.governance.findDRepHere',
      defaultMessage: '!!!Find a DRep here',
    },
    reviewActions: {
      id: 'components.governance.reviewActions',
      defaultMessage:
        "!!!Your delegation helps shape Cardano's future. You may change your governance status at any time.",
    },
    actionYouHaveSelectedTxPending: {
      id: 'components.governance.actionYouHaveSelectedTxPending',
      defaultMessage:
        '!!!You have selected <b>{action}</b> as your governance status. It may take some time to process your delegation request.',
    },
    actionYouHaveSelected: {
      id: 'components.governance.actionYouHaveSelected',
      defaultMessage:
        '!!!You have selected <b>{action}</b> as your governance status. You can change it at any time by clicking in the card below.',
    },
    changeDRep: {
      id: 'components.governance.changeDRep',
      defaultMessage: '!!!Change DRep',
    },
    confirm: {
      id: 'components.governance.confirm',
      defaultMessage: '!!!Confirm',
    },
    transactionDetails: {
      id: 'components.governance.transactionDetails',
      defaultMessage: '!!!Transaction details',
    },
    total: {
      id: 'components.governance.total',
      defaultMessage: '!!!Total',
    },
    transactionFailed: {
      id: 'components.governance.transactionFailed',
      defaultMessage: '!!!Transaction failed',
    },
    noFunds: {
      id: 'components.governance.noFunds',
      defaultMessage:
        '!!!To participate in governance you need to have ADA in your wallet',
    },
    transactionFailedDescription: {
      id: 'components.governance.transactionFailedDescription',
      defaultMessage:
        '!!!Your transaction has not been processed properly due to technical issues.',
    },
    tryAgain: {
      id: 'components.governance.tryAgain',
      defaultMessage: '!!!Try again',
    },
    buyAda: {
      id: 'components.governance.buyAda',
      defaultMessage: '!!!Buy ada',
    },
    goToFaucet: {
      id: 'components.governance.goToFaucet',
      defaultMessage: '!!!Go to tada faucet',
    },
    withdrawWarningTitle: {
      id: 'components.governance.withdrawWarningTitle',
      defaultMessage: '!!!Withdraw warning',
    },
    withdrawWarningDescription: {
      id: 'components.governance.withdrawWarningDescription',
      defaultMessage:
        '!!!To withdraw your rewards, you need to participate in the Cardano Governance. Your rewards will continue to accumulate, but you are only able to withdraw it once you join the Governance process.',
    },
    withdrawWarningButton: {
      id: 'components.governance.withdrawWarningButton',
      defaultMessage: '!!!Participate on governance',
    },
    enterDRepID: {
      id: 'components.governance.enterDRepID',
      defaultMessage: '!!!Choose your Drep',
    },
    hardwareWalletSupportComingSoon: {
      id: 'components.governance.hardwareWalletSupportComingSoon',
      defaultMessage: '!!!Hardware wallet support coming soon',
    },
    workingOnHardwareWalletSupport: {
      id: 'components.governance.workingOnHardwareWalletSupport',
      defaultMessage:
        '!!!We are currently working on integrating hardware wallet support for Governance',
    },
    goToWallet: {
      id: 'components.governance.goToWallet',
      defaultMessage: '!!!Go to wallet',
    },
    txFees: {
      id: 'components.governance.txFees',
      defaultMessage: '!!!Transaction fee',
    },
    registerStakingKey: {
      id: 'components.governance.registerStakingKey',
      defaultMessage: '!!!Register staking key deposit',
    },
    enterDrepIDInfo: {
      id: 'components.governance.enterDrepIDInfo',
      defaultMessage:
        '!!!Identify your preferred DRep and enter their ID below to delegate your vote',
    },
    goToStaking: {
      id: 'components.governance.goToStaking',
      defaultMessage: '!!!Go to Staking',
    },
    readyToCollectRewards: {
      id: 'components.governance.readyToCollectRewards',
      defaultMessage: '!!!You are now ready to collect your rewards.',
    },
    notSupportedVersionTitle: {
      id: 'components.governance.notSupportedVersionTitle',
      defaultMessage: '!!!Error',
    },
    notSupportedVersionDescription: {
      id: 'components.governance.notSupportedVersionDescription',
      defaultMessage:
        '!!!To be able to vote you need to update your Cardano ADA app to 7.',
    },
    notSupportedVersionButton: {
      id: 'components.governance.notSupportedVersionButton',
      defaultMessage: '!!!Go to main wallet page',
    },
    scriptNotSupported: {
      id: 'components.governance.scriptNotSupported',
      defaultMessage: '!!!Script DReps ids will be supported soon.',
    },
    submittedTxTitle: {
      id: 'components.governance.submittedTxTitle',
      defaultMessage: '!!!Transaction signed',
    },
    submittedTxText: {
      id: 'components.governance.submittedTxText',
      defaultMessage: `!!!It will show up in the transaction list once it's confirmed by the network.`,
    },
    submittedTxButton: {
      id: 'components.governance.submittedTxButton',
      defaultMessage: '!!!Close',
    },
    failedTxTitle: {
      id: 'components.governance.failedTxTitle',
      defaultMessage: '!!!Transaction failed',
    },
    failedTxText: {
      id: 'components.governance.failedTxText',
      defaultMessage:
        '!!!Your transaction has not been processed properly due to technical issues.',
    },
    failedTxButton: {
      id: 'components.governance.failedTxButton',
      defaultMessage: '!!!Try again',
    },
    invalidDRepId: {
      id: 'components.governance.invalidDRepId',
      defaultMessage: '!!!Invalid DRep ID.',
    },
    delegateToAYoroiDrep: {
      id: 'components.governance.delegateToAYoroiDrep',
      defaultMessage: '!!!Delegate to Yoroi DRep',
    },
    delegatingToYoroiDRep: {
      id: 'components.governance.delegatingToYoroiDRep',
      defaultMessage: '!!!Delegating to Yoroi DRep',
    },
    delegateToAYoroiDRepDescription: {
      id: 'components.governance.delegateToAYoroiDRepDescription',
      defaultMessage:
        '!!!Support the Commercial and Technical adoption of the Cardano roadmap. Please note Yoroi is part of the EMURGO Group.',
    },
    yoroiRecord: {
      id: 'components.governance.yoroiRecord',
      defaultMessage: "!!!See Yoroi's voting record",
    },
    newToGovernanceTitle: {
      id: 'components.governance.newToGovernance.title',
      defaultMessage: '!!!New to governance? Start here',
    },
    newToGovernanceText: {
      id: 'components.governance.newToGovernance.text',
      defaultMessage:
        '!!!Your ADA can make a difference. Delegate to a DRep to represent your vote and participate in Cardano Governance',
    },
  }),

  transactions: defineMessages({
    addressPrefixReceive: {
      id: 'components.txhistory.txdetails.addressPrefixReceive',
      defaultMessage: '!!!/{idx}',
    },
    addressPrefixChange: {
      id: 'components.txhistory.txdetails.addressPrefixChange',
      defaultMessage: '!!!/change',
    },
    addressPrefixNotMine: {
      id: 'components.txhistory.txdetails.addressPrefixNotMine',
      defaultMessage: '!!!not mine',
    },
    txDetailsFee: {
      id: 'components.txhistory.txdetails.fee',
      defaultMessage: '!!!Fee: ',
    },
    fromAddresses: {
      id: 'components.txhistory.txdetails.fromAddresses',
      defaultMessage: '!!!From Addresses',
    },
    toAddresses: {
      id: 'components.txhistory.txdetails.toAddresses',
      defaultMessage: '!!!To Addresses',
    },
    memo: {
      id: 'components.txhistory.txdetails.memo',
      defaultMessage: '!!!Memo',
    },
    transactionId: {
      id: 'components.txhistory.txdetails.transactionId',
      defaultMessage: '!!!Transaction ID',
    },
    txAssuranceLevel: {
      id: 'components.txhistory.txdetails.txAssuranceLevel',
      defaultMessage: '!!!Transaction assurance level',
    },
    confirmations: {
      id: 'components.txhistory.txdetails.confirmations',
      defaultMessage:
        '!!!{cnt} {cnt, plural, one {CONFIRMATION} other {CONFIRMATIONS}}',
    },
    omittedCount: {
      id: 'components.txhistory.txdetails.omittedCount',
      defaultMessage:
        '!!!+ {cnt} omitted {cnt, plural, one {address} other {addresses}}',
    },
    openInExplorer: {
      id: 'global.openInExplorer',
      defaultMessage: '!!!Open in explorer',
    },
    title: {
      id: 'components.txhistory.txhistory.title',
      defaultMessage: '!!!Transactions',
    },
    warningTitle: {
      id: 'components.txhistory.txhistory.warningbanner.title',
      defaultMessage: '!!!Note:',
    },
    message: {
      id: 'components.txhistory.txhistory.warningbanner.message',
      defaultMessage:
        '!!!The Shelley protocol upgrade adds a new Shelley wallet type which supports delegation.',
    },
    noTransactions: {
      id: 'components.txhistory.txhistory.noTransactions',
      defaultMessage: '!!!No transactions to show yet',
    },
    fee: {
      id: 'components.txhistory.txhistorylistitem.fee',
      defaultMessage: '!!!Fee',
    },
    assets: {
      id: 'global.txLabels.assets',
      defaultMessage: '!!!{cnt} assets',
      description: 'The number of assets different assets, not the amount',
    },
    transactionTypeSent: {
      id: 'components.txhistory.txhistorylistitem.transactionTypeSent',
      defaultMessage: '!!!ADA sent',
    },
    transactionTypeReceived: {
      id: 'components.txhistory.txhistorylistitem.transactionTypeReceived',
      defaultMessage: '!!!ADA received',
    },
    transactionTypeSelf: {
      id: 'components.txhistory.txhistorylistitem.transactionTypeSelf',
      defaultMessage: '!!!Intrawallet',
    },
    transactionTypeMulti: {
      id: 'components.txhistory.txhistorylistitem.transactionTypeMulti',
      defaultMessage: '!!!Multiparty',
    },
    unknownAssetName: {
      id: 'utils.format.unknownAssetName',
      defaultMessage: '!!![Unknown asset name]',
    },
    walletAddress: {
      id: 'components.receive.addressmodal.walletAddress',
      defaultMessage: '!!!Your wallet address',
    },
    BIP32path: {
      id: 'components.receive.addressmodal.BIP32path',
      defaultMessage: '!!!BIP32 path:',
    },
    copyLabel: {
      id: 'components.receive.addressmodal.copyLabel',
      defaultMessage: '!!!Copy address',
    },
    copiedLabel: {
      id: 'components.receive.addressmodal.copiedLabel',
      defaultMessage: '!!!Address Copied',
    },
    spending: {
      id: 'components.receive.addressmodal.spendingKeyHash',
      defaultMessage: '!!!Spending',
    },
    staking: {
      id: 'components.receive.addressmodal.stakingKeyHash',
      defaultMessage: '!!!Staking',
    },
    addessModalTitle: {
      id: 'components.receive.addressmodal.title',
      defaultMessage: '!!!Title',
    },
    verifyLabel: {
      id: 'components.receive.addressverifymodal.title',
      defaultMessage: '!!!Verify Address on Ledger',
    },
    organizeWallet: {
      id: 'components.organizeWallet.title',
      defaultMessage: '!!!Organize Wallet',
    },
    organizeWalletDescription: {
      id: 'components.organizeWallet.description',
      defaultMessage:
        '!!!Your assets are spread accross multiple addresses which may interfere with Dapp connectivity. Merging your ADA and tokens into a single address keeps your wallet organized and more efficient while reducing network fees.',
    },
    organizeWalletWarning: {
      id: 'components.organizeWallet.warning',
      defaultMessage:
        '!!!Certain wallets will require more than 1 transaction to merge assets. You will receive a notification if an additional transaction is needed.',
    },
    organizeWalletButton: {
      id: 'components.organizeWallet.button',
      defaultMessage: '!!!Merge assets',
    },
    organizeWalletBanner: {
      id: 'components.organizeWallet.banner',
      defaultMessage: '!!!Assets are spread in multiple addresses',
    },
    txTypeMessages: {
      SENT: {
        id: 'components.txhistory.txdetails.txTypeSent',
        defaultMessage: '!!!Sent funds',
      },
      RECEIVED: {
        id: 'components.txhistory.txdetails.txTypeReceived',
        defaultMessage: '!!!Received funds',
      },
      SELF: {
        id: 'components.txhistory.txdetails.txTypeSelf',
        defaultMessage: '!!!Intrawallet transaction',
      },
      MULTI: {
        id: 'components.txhistory.txdetails.txTypeMulti',
        defaultMessage: '!!!Multi-party transaction',
      },
    },
    directionMessages: {
      SENT: {
        id: 'components.txhistory.txhistorylistitem.transactionTypeSent',
        defaultMessage: '!!!ADA sent',
      },
      RECEIVED: {
        id: 'components.txhistory.txhistorylistitem.transactionTypeReceived',
        defaultMessage: '!!!ADA received',
      },
      SELF: {
        id: 'components.txhistory.txhistorylistitem.transactionTypeSelf',
        defaultMessage: '!!!Intrawallet',
      },
      MULTI: {
        id: 'components.txhistory.txhistorylistitem.transactionTypeMulti',
        defaultMessage: '!!!Multiparty',
      },
    },
  }),

  claim: defineMessages({
    askConfirmationTitle: {
      id: 'claim.askConfirmation.title',
      defaultMessage: '!!!Confirm Claim',
    },
    showSuccessTitle: {
      id: 'claim.showSuccess.title',
      defaultMessage: '!!!Success',
    },
    doneTitle: {
      id: 'claim.done.title',
      defaultMessage: '!!!Done',
    },
    doneMessage: {
      id: 'claim.done.message',
      defaultMessage: '!!!Done',
    },
    acceptedTitle: {
      id: 'claim.accepted.title',
      defaultMessage: '!!!Accepted',
    },
    acceptedMessage: {
      id: 'claim.accepted.message',
      defaultMessage: '!!!Accepted',
    },
    processingTitle: {
      id: 'claim.processing.title',
      defaultMessage: '!!!Processing',
    },
    processingMessage: {
      id: 'claim.processing.message',
      defaultMessage: '!!!Processing',
    },
    addressSharingWarning: {
      id: 'claim.addressSharingWarning',
      defaultMessage: '!!!Address sharing warning',
    },
    domain: {
      id: 'claim.domain',
      defaultMessage: '!!!Domain',
    },
    code: {
      id: 'claim.code',
      defaultMessage: '!!!Code',
    },
    apiErrorTitle: {
      id: 'claim.apiError.title',
      defaultMessage: '!!!Error title',
    },
    apiErrorInvalidRequest: {
      id: 'claim.apiError.invalidRequest',
      defaultMessage: '!!!Invalid request',
    },
    apiErrorNotFound: {
      id: 'claim.apiError.notFound',
      defaultMessage: '!!!Not found',
    },
    apiErrorAlreadyClaimed: {
      id: 'claim.apiError.alreadyClaimed',
      defaultMessage: '!!!Already claimed',
    },
    apiErrorExpired: {
      id: 'claim.apiError.expired',
      defaultMessage: '!!!Expired',
    },
    apiErrorTooEarly: {
      id: 'claim.apiError.tooEarly',
      defaultMessage: '!!!Too early',
    },
    apiErrorRateLimited: {
      id: 'claim.apiError.rateLimited',
      defaultMessage: '!!!Rate limited',
    },
    continue: {
      id: 'global.actions.dialogs.commonbuttons.continueButton',
      defaultMessage: '!!!Continue',
    },
  }),

  notifications: defineMessages({
    tapToView: {
      id: 'notifications.tapToView',
      defaultMessage: '!!!Tap to view',
    },
    stakingRewardsReceived: {
      id: 'notifications.stakingRewardsReceived',
      defaultMessage: '!!!Staking rewards received',
    },
    assetsReceived: {
      id: 'notifications.assetsReceived',
      defaultMessage: '!!!Assets received',
    },
    intraWalletTransactionSent: {
      id: 'notifications.intraWalletTransactionSent',
      defaultMessage: '!!!Intrawallet transaction sent',
    },
    multipleAssetsReceived: {
      id: 'notifications.multipleAssetsReceived',
      defaultMessage: '!!!Multiple assets received',
    },
    received: {
      id: 'notifications.received',
      defaultMessage: '!!!received',
    },
    multipleAssetsSent: {
      id: 'notifications.multipleAssetsSent',
      defaultMessage: '!!!Multiple assets sent',
    },
    sent: {
      id: 'notifications.sent',
      defaultMessage: '!!!sent',
    },
    noNotifications: {
      id: 'notifications.noNotifications',
      defaultMessage: '!!!No notifications yet',
    },
    markAllAsRead: {
      id: 'notifications.markAllAsRead',
      defaultMessage: '!!!Mark all as read',
    },
    getImportantAlerts: {
      id: 'notifications.getImportantAlerts',
      defaultMessage: '!!!Get important alerts',
    },
    turnOnAlerts: {
      id: 'notifications.turnOnAlerts',
      defaultMessage:
        '!!!Turn on notifications to get alerts and updates about your wallet.',
    },
    skip: {
      id: 'notifications.skip',
      defaultMessage: '!!!Skip',
    },
    turnOnNotifications: {
      id: 'notifications.turnOnNotifications',
      defaultMessage: '!!!Turn on notifications',
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

  manageCollateral: defineMessages({
    lockedAsCollateral: {
      id: 'components.settings.collateral.lockedAsCollateral',
      defaultMessage: '!!!Locked as collateral',
    },
    removeCollateral: {
      id: 'components.settings.collateral.removeCollateral',
      defaultMessage:
        '!!!If you want to return the amount locked as collateral to your balance press the remove icon',
    },
    collateralSpent: {
      id: 'components.settings.collateral.collateralSpent',
      defaultMessage:
        '!!!Your collateral is gone, please generate new collateral',
    },
    generateCollateral: {
      id: 'components.settings.collateral.generateCollateral',
      defaultMessage: '!!!Generate collateral',
    },
    notEnoughFundsAlertTitle: {
      id: 'components.settings.collateral.notEnoughFundsAlertTitle',
      defaultMessage: '!!!Not enough funds',
    },
    notEnoughFundsAlertMessage: {
      id: 'components.settings.collateral.notEnoughFundsAlertMessage',
      defaultMessage:
        '!!!We could not find enough funds in this wallet to create collateral.',
    },
    notEnoughFundsAlertOK: {
      id: 'components.settings.collateral.notEnoughFundsAlertOK',
      defaultMessage: '!!!OK',
    },
    collateralInfoModalLabel: {
      id: 'components.settings.collateral.collateralInfoModalLabel',
      defaultMessage: '!!!Collateral creation',
    },
    collateralInfoModalTitle: {
      id: 'components.settings.collateral.collateralInfoModalTitle',
      defaultMessage: '!!!What is collateral?',
    },
    collateralInfoModalText: {
      id: 'components.settings.collateral.collateralInfoModalText',
      defaultMessage:
        '!!!The collateral mechanism is an important feature that has been designed to ensure successful smart contract execution. It is used to guarantee that Cardano nodes are compensated for their work in case phase-2 validation fails.',
    },
    initialCollateralInfoModalTitle: {
      id: 'components.settings.collateral.initialCollateralInfoModalTitle',
      defaultMessage: '!!!Collateral creation',
    },
    initialCollateralInfoModalText: {
      id: 'components.settings.collateral.initialCollateralInfoModalText',
      defaultMessage:
        '!!!Collateral is mandatory when interacting with certain smart contracts on Cardano, which requires to make a 0 ADA transaction. ADA will only be deduced from your collateral if transaction validation fails.',
    },
    initialCollateralInfoModalButton: {
      id: 'components.settings.collateral.initialCollateralInfoModalButton',
      defaultMessage: '!!!Add collateral',
    },
  }),

  manageNotifications: defineMessages({
    inAppNotifications: {
      id: 'components.settings.walletsettingscreen.inAppNotifications',
      defaultMessage: '!!!In-app notifications',
    },
    displayDuration: {
      id: 'components.settings.walletsettingscreen.displayDuration',
      defaultMessage: '!!!Display duration',
    },
    pushNotifications: {
      id: 'components.settings.walletsettingscreen.pushNotifications',
      defaultMessage: '!!!Push notifications',
    },
    goToSettings: {
      id: 'components.settings.walletsettingscreen.goToSettings',
      defaultMessage: '!!!Go to Settings',
    },
    enableNotificationsThroughSettings: {
      id: 'components.settings.walletsettingscreen.enableNotificationsThroughSettings',
      defaultMessage:
        '!!!Enable notifications to get updates about your transactions and assets.',
    },
    notifications: {
      id: 'components.settings.walletsettingscreen.notifications',
      defaultMessage: '!!!Notifications',
    },
  }),

  manageNotificationDisplayDuration: defineMessages({
    description: {
      id: 'components.settings.manageNotificationDisplayDuration.description',
      defaultMessage:
        '!!!Adjust the display duration of in-app notifications to suit your preferences.',
    },
    apply: {
      id: 'components.settings.manageNotificationDisplayDuration.apply',
      defaultMessage: '!!!Apply',
    },
    displayDuration: {
      id: 'components.settings.manageNotificationDisplayDuration.displayDuration',
      defaultMessage: '!!!Display duration',
    },
    manual: {
      id: 'components.settings.manageNotificationDisplayDuration.manual',
      defaultMessage: '!!!Manual',
    },
    seconds: {
      id: 'components.settings.manageNotificationDisplayDuration.seconds',
      defaultMessage: '!!!seconds',
    },
    twoSeconds: {
      id: 'components.settings.manageNotificationDisplayDuration.twoSeconds',
      defaultMessage: '!!!2s',
    },
    fourSeconds: {
      id: 'components.settings.manageNotificationDisplayDuration.fourSeconds',
      defaultMessage: '!!!4s',
    },
    sixSeconds: {
      id: 'components.settings.manageNotificationDisplayDuration.sixSeconds',
      defaultMessage: '!!!6s',
    },
    eightSeconds: {
      id: 'components.settings.manageNotificationDisplayDuration.eightSeconds',
      defaultMessage: '!!!8s',
    },
    tenSeconds: {
      id: 'components.settings.manageNotificationDisplayDuration.tenSeconds',
      defaultMessage: '!!!10s',
    },
    twelveSeconds: {
      id: 'components.settings.manageNotificationDisplayDuration.twelveSeconds',
      defaultMessage: '!!!12s',
    },
    inputError: {
      id: 'components.settings.manageNotificationDisplayDuration.inputError',
      defaultMessage: '!!!Enter a value from 1 to 60.',
    },
  }),

  initialization: defineMessages({
    selectLanguage: {
      id: 'analytics.selectLanguage',
      defaultMessage: '!!!Select Language',
    },
    tosIAgreeWith: {
      id: 'analytics.tosIAgreeWith',
      defaultMessage: '!!!I agree with',
    },
    tosAnd: {
      id: 'analytics.tosAnd',
      defaultMessage: '!!!and',
    },
    privacyPolicy: {
      id: 'analytics.privacyNotice',
      defaultMessage: '!!!Privacy Notice',
    },
    tosAgreement: {
      id: 'analytics.tosAgreement',
      defaultMessage: '!!!Terms Of Service Agreement',
    },
    continue: {
      id: 'global.continue',
      defaultMessage: '!!!Continue',
    },
    title: {
      id: 'termsOfService.agreementUpdateTitle',
      defaultMessage: '!!!Terms of Service Agreement update',
    },
    description: {
      id: 'termsOfService.agreementUpdateDescription',
      defaultMessage:
        '!!!We have updated our Terms of Service Agreement to enhance your experience. Please review and accept them to keep enjoying Yoroi.',
    },
    acceptTermsTitle: {
      id: 'components.initialization.acepttermsofservicescreen.title',
      defaultMessage: '!!!Terms of Service Agreement',
    },
    acceptPrivacyPolicyTitle: {
      id: 'termsOfService.privacyPolicyTitle',
      defaultMessage: '!!!Privacy Policy',
    },
    languagePickerTitle: {
      id: 'components.initialization.languagepicker.title',
      defaultMessage: '!!!Select language',
    },
    biometricDescription: {
      id: 'components.walletinit.biometricScreen.biometricDescription.description',
      defaultMessage:
        '!!!Use your device biometrics for a more convenient access to your Yoroi wallet',
    },
    ignoreButton: {
      id: 'components.walletinit.biometricScreen.ignoreButton.title',
      defaultMessage: '!!!Recovery phrase is a unique combination of words',
    },
    enableButton: {
      id: 'components.walletinit.biometricScreen.enableButton.title',
      defaultMessage: '!!!Enable biometrics',
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

  ui: defineMessages({
    yoroiLogo: {
      id: 'components.yoroiLogo',
      defaultMessage: '!!!Light wallet for Cardano assets',
    },
    tryAgain: {
      id: 'global.tryAgain',
      defaultMessage: '!!!Try Again',
    },
    addToken: {
      id: 'components.send.addToken',
      defaultMessage: '!!!Add token',
    },
    pairedBalanceError: {
      id: 'components.txhistory.balancebanner.pairedbalance.error',
      defaultMessage: '!!!Error obtaining {currency} pairing',
    },
    warning: {
      id: 'components.common.languagepicker.acknowledgement',
      defaultMessage:
        '!!!**The selected language translation is fully provided by the community**. ' +
        'EMURGO is grateful to all those who have contributed',
    },
    contributors: {
      id: 'components.common.languagepicker.contributors',
      defaultMessage: '_',
    },
    header: {
      id: 'analytics.header',
      defaultMessage: '!!!Join the journey to improve Yoroi',
    },
    description: {
      id: 'analytics.description',
      defaultMessage:
        '!!!Share user insights to help us fine tune Yoroi to better serve your needs.',
    },
    anonymous: {
      id: 'analytics.anonymous',
      defaultMessage: '!!!Anonymous analytics data',
    },
    optout: {
      id: 'analytics.optout',
      defaultMessage: '!!!You can always opt-out via Settings',
    },
    private: {
      id: 'analytics.private',
      defaultMessage: '!!!We <b>cannot</b> access private keys',
    },
    noip: {
      id: 'analytics.noip',
      defaultMessage: '!!!We <b>are not</b> recording IP addresses',
    },
    nosell: {
      id: 'analytics.nosell',
      defaultMessage: '!!!We <b>do not</b> sell data',
    },
    more: {
      id: 'analytics.more',
      defaultMessage: '!!!Learn more about user insights',
    },
    skip: {
      id: 'analytics.skip',
      defaultMessage: '!!!Skip',
    },
    accept: {
      id: 'analytics.accept',
      defaultMessage: '!!!Accept',
    },
    toggle: {
      id: 'analytics.toggle',
      defaultMessage: '!!!Allow Yoroi analytics',
    },
  }),

  global: defineMessages({
    walletSelectionScreenHeader: {
      id: 'global.walletSelectionScreenHeader',
      defaultMessage: '!!!Select Wallet',
    },
    disclaimer: {
      id: 'global.disclaimer',
      defaultMessage: '!!!Disclaimer',
    },
    accept: {
      id: 'global.accept',
      defaultMessage: '!!!Accept',
    },
    proceed: {
      id: 'global.proceed',
      defaultMessage: '!!!Proceed',
    },
  }),

  links: defineMessages({
    trustedPaymentRequestedTitle: {
      id: 'links.trusted.paymentRequested.title',
      defaultMessage: '!!!Payment requested',
    },
    trustedPaymentRequestedDescription: {
      id: 'links.trusted.paymentRequested.description',
      defaultMessage: '!!!A payment has been requested.',
    },
    untrustedPaymentRequestedTitle: {
      id: 'links.untrusted.paymentRequested.title',
      defaultMessage: '!!!Payment requested',
    },
    untrustedPaymentRequestedDescription: {
      id: 'links.untrusted.paymentRequested.description',
      defaultMessage: '!!!A payment has been requested.',
    },
    trustedBrowserLaunchDappUrlTitle: {
      id: 'links.trusted.browserLaunchDappUrl.title',
      defaultMessage: '!!!Launch dApp requested',
    },
    trustedBrowserLaunchDappUrlDescription: {
      id: 'links.trusted.browserLaunchDappUrl.description',
      defaultMessage: '!!!A payment has been requested.',
    },
    untrustedBrowserLaunchDappUrlTitle: {
      id: 'links.untrusted.browserLaunchDappUrl.title',
      defaultMessage: '!!!Lauch dApp requested',
    },
    untrustedBrowserLaunchDappUrlDescription: {
      id: 'links.untrusted.browserLaunchDappUrl.description',
      defaultMessage: '!!!A payment has been requested.',
    },
    askToOpenAWalletTitle: {
      id: 'links.askToOpenAWallet.title',
      defaultMessage: '!!!Open a wallet',
    },
    askToOpenAWalletDescription: {
      id: 'links.askToOpenAWallet.description',
      defaultMessage: '!!!To continue, open a wallet.',
    },
    askToRedirectTitle: {
      id: 'links.askToRedirect.title',
      defaultMessage: '!!!Redirect available',
    },
    askToRedirectDescription: {
      id: 'links.askToRedirect.description',
      defaultMessage:
        '!!!The caller that request this action has provided a way for Yoroi to return to their application, would you like to be redirected?',
    },
    requestedBrowserLaunchDappUrl: {
      id: 'links.requestedBrowserLaunchDappUrl.title',
      defaultMessage: '!!!Launch dApp requested',
    },
    trustedBrowserLaunchDappUrlDescription: {
      id: 'links.requestedBrowserLaunchDappUrl.trustedBrowserLaunchDappUrlDescription',
      defaultMessage: '!!!A payment has been requested.',
    },
    untrustedBrowserLaunchDappUrlDescription: {
      id: 'links.requestedBrowserLaunchDappUrl.untrustedBrowserLaunchDappUrlDescription',
      defaultMessage: '!!!A payment has been requested.',
    },
    cancel: {
      id: 'links.requestedBrowserLaunchDappUrl.cancel',
      defaultMessage: '!!!Cancel',
    },
    continue: {
      id: 'links.requestedBrowserLaunchDappUrl.continue',
      defaultMessage: '!!!Continue',
    },
  }),

  notifications: defineMessages({
    tapToView: {
      id: 'notifications.tapToView',
      defaultMessage: '!!!Tap to view',
    },
    stakingRewardsReceived: {
      id: 'notifications.stakingRewardsReceived',
      defaultMessage: '!!!Staking rewards received',
    },
    assetsReceived: {
      id: 'notifications.assetsReceived',
      defaultMessage: '!!!Assets received',
    },
    intraWalletTransactionSent: {
      id: 'notifications.intraWalletTransactionSent',
      defaultMessage: '!!!Intrawallet transaction sent',
    },
    multipleAssetsReceived: {
      id: 'notifications.multipleAssetsReceived',
      defaultMessage: '!!!Multiple assets received',
    },
    received: {
      id: 'notifications.received',
      defaultMessage: '!!!received',
    },
    multipleAssetsSent: {
      id: 'notifications.multipleAssetsSent',
      defaultMessage: '!!!Multiple assets sent',
    },
    sent: {
      id: 'notifications.sent',
      defaultMessage: '!!!sent',
    },
    noNotifications: {
      id: 'notifications.noNotifications',
      defaultMessage: '!!!No notifications yet',
    },
    markAllAsRead: {
      id: 'notifications.markAllAsRead',
      defaultMessage: '!!!Mark all as read',
    },
    getImportantAlerts: {
      id: 'notifications.getImportantAlerts',
      defaultMessage: '!!!Get important alerts',
    },
    turnOnAlerts: {
      id: 'notifications.turnOnAlerts',
      defaultMessage:
        '!!!Turn on notifications to get alerts and updates about your wallet.',
    },
    skip: {
      id: 'notifications.skip',
      defaultMessage: '!!!Skip',
    },
    turnOnNotifications: {
      id: 'notifications.turnOnNotifications',
      defaultMessage: '!!!Turn on notifications',
    },
  }),

  claim: defineMessages({
    askConfirmationTitle: {
      id: 'claim.askConfirmation.title',
      defaultMessage: '!!!Confirm Claim',
    },
    showSuccessTitle: {
      id: 'claim.showSuccess.title',
      defaultMessage: '!!!Success',
    },
    acceptedTitle: {
      id: 'claim.accepted.title',
      defaultMessage: '!!!Accepted',
    },
    acceptedMessage: {
      id: 'claim.accepted.message',
      defaultMessage: '!!!Accepted',
    },
    processingTitle: {
      id: 'claim.processing.title',
      defaultMessage: '!!!Processing',
    },
    processingMessage: {
      id: 'claim.processing.message',
      defaultMessage: '!!!Processing',
    },
    doneTitle: {
      id: 'claim.done.title',
      defaultMessage: '!!!Done',
    },
    doneMessage: {
      id: 'claim.done.message',
      defaultMessage: '!!!Done',
    },
    addressSharingWarning: {
      id: 'claim.addressSharingWarning',
      defaultMessage: '!!!Address sharing warning',
    },
    domain: {
      id: 'claim.domain',
      defaultMessage: '!!!Domain',
    },
    code: {
      id: 'claim.code',
      defaultMessage: '!!!Code',
    },
    apiErrorTitle: {
      id: 'claim.apiError.title',
      defaultMessage: '!!!Error title',
    },
    apiErrorInvalidRequest: {
      id: 'claim.apiError.invalidRequest',
      defaultMessage: '!!!Invalid request',
    },
    apiErrorNotFound: {
      id: 'claim.apiError.notFound',
      defaultMessage: '!!!Not found',
    },
    apiErrorAlreadyClaimed: {
      id: 'claim.apiError.alreadyClaimed',
      defaultMessage: '!!!Already claimed',
    },
    apiErrorExpired: {
      id: 'claim.apiError.expired',
      defaultMessage: '!!!Expired',
    },
    apiErrorTooEarly: {
      id: 'claim.apiError.tooEarly',
      defaultMessage: '!!!Too early',
    },
    apiErrorRateLimited: {
      id: 'claim.apiError.rateLimited',
      defaultMessage: '!!!Rate limited',
    },
    continue: {
      id: 'claim.continue',
      defaultMessage: '!!!Continue',
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
    nfts: (qty: number) => f(messages.portfolio.nfts, {countNfts: qty}),
    tokenList: f(messages.portfolio.tokenList),
    walletToken: f(messages.portfolio.walletToken),
    dappsToken: f(messages.portfolio.dappsToken),
    tokensAvailable: (qty: number) =>
      f(messages.portfolio.tokensAvailable, {countTokens: qty}),
    searchTokens: f(messages.portfolio.searchTokens),
    noTokensFound: f(messages.portfolio.noTokensFound),
    totalDAppValue: f(messages.portfolio.totalDAppValue),
    liquidityPool: f(messages.portfolio.liquidityPool),
    openOrders: f(messages.portfolio.openOrders),
    lendAndBorrow: f(messages.portfolio.lendAndBorrow),
    tokenDetail: f(messages.portfolio.tokenDetail),
    availableSoon: f(messages.portfolio.availableSoon),
    countLiquidityPoolsAvailable: (qty: number) =>
      f(messages.portfolio.countLiquidityPoolsAvailable, {
        countLiquidityPools: qty,
      }),
    countOpenOrders: (qty: number) =>
      f(messages.portfolio.countOpenOrders, {countOpenOrders: qty}),
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
    tokenPriceChangeTooltip: (timeInterval: string) =>
      f(messages.portfolio.tokenPriceChangeTooltip, {timeInterval}),
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
    totalPortfolioValueTooltip: f(
      messages.portfolio.totalPortfolioValueTooltip,
    ),
    totalWalletValueTooltip: f(messages.portfolio.totalWalletValueTooltip),
    totalDAppsValueTooltip: f(messages.portfolio.totalDAppsValueTooltip),
    portfolioSwapTokensTitle: f(messages.portfolio.portfolioSwapTokensTitle),
    portfolioSwapTokensDescription: f(
      messages.portfolio.portfolioSwapTokensDescription,
    ),
    startSwapping: f(messages.portfolio.startSwapping),
    titleMediaDetails: f(messages.portfolio.titleMediaDetails),
    title: f(messages.portfolio.title),
    search: f(messages.portfolio.search),
    nftCount: f(messages.portfolio.nftCount),
    errorTitle: f(messages.portfolio.errorTitle),
    errorDescription: f(messages.portfolio.errorDescription),
    reloadApp: f(messages.portfolio.reloadApp),
    noNftsFound: f(messages.portfolio.noNftsFound),
    noNftsInWallet: f(messages.portfolio.noNftsInWallet),
    nftDetail: {
      title: f(messages.nft.detail.title),
      overview: f(messages.nft.detail.overview),
      metadata: f(messages.nft.detail.metadata),
      nftName: f(messages.nft.detail.nftName),
      createdAt: f(messages.nft.detail.createdAt),
      description: f(messages.nft.detail.description),
      author: f(messages.nft.detail.author),
      fingerprint: f(messages.nft.detail.fingerprint),
      policyId: f(messages.nft.detail.policyId),
      detailsLinks: f(messages.nft.detail.detailsLinks),
      copyMetadata: f(messages.nft.detail.copyMetadata),
    },
  }),

  registerCatalyst: defineMessages({
    title: {
      id: 'components.catalyst.step1.title',
      defaultMessage: '!!!Intro',
    },
    subTitle: {
      id: 'components.catalyst.step1.subTitle',
      defaultMessage:
        '!!!Before you begin, make sure to\ndownload the Catalyst Voting App',
    },
    stakingKeyNotRegistered: {
      id: 'components.catalyst.step1.stakingKeyNotRegistered',
      defaultMessage:
        '!!!Catalyst voting rewards are sent to delegation accounts and your ' +
        'wallet does not seem to have a registered delegation certificate. If ' +
        'you want to receive voting rewards, you need to delegate your funds first.',
    },
    tip: {
      id: 'components.catalyst.step1.tip',
      defaultMessage:
        '!!!Make sure you know how to take a screenshot with your device, ' +
        'so that you can backup your catalyst QR code.',
    },
    registrationStart: {
      id: 'catalyst.registration.start',
      defaultMessage: '!!!Registration start',
    },
    snapshotStart: {
      id: 'catalyst.snapshot.start',
      defaultMessage: '!!!Snapshot start',
    },
    votingStart: {
      id: 'catalyst.voting.start',
      defaultMessage: '!!!Voting start',
    },
    votingEnd: {
      id: 'catalyst.voting.end',
      defaultMessage: '!!!Voting end',
    },
    votingResults: {
      id: 'catalyst.voting.results',
      defaultMessage: '!!!Results',
    },
    step2Title: {
      id: 'components.catalyst.step2.title',
      defaultMessage: '!!!Write down PIN',
    },
    step2Description: {
      id: 'components.catalyst.step2.description',
      defaultMessage:
        '!!!Please write down this PIN as you will need it every time you want to access the Catalyst Voting app',
    },
    checkbox: {
      id: 'components.catalyst.step2.checkbox',
      defaultMessage: '!!!I have written it down',
    },
    step3Title: {
      id: 'components.catalyst.step3.title',
      defaultMessage: '!!!Enter PIN',
    },
    step3Description: {
      id: 'components.catalyst.step3.description',
      defaultMessage:
        '!!!Please enter the PIN as you will need it every time you want to access the Catalyst Voting app',
    },
    confirmationTitle: {
      id: 'components.catalyst.confirmTx.title',
      defaultMessage: '!!!Confirm Registration',
    },
    passwordSignDescription: {
      id: 'components.catalyst.confirmTx.passwordSignDescription',
      defaultMessage:
        '!!!Confirm your voting registration and submit the certificate generated in previous step to the blockchain',
    },
    authOsInstructions: {
      id: 'components.catalyst.confirmTx.bioAuthInstructions',
      defaultMessage:
        '!!!Please authenticate so that Yoroi can generate the required certificate for voting',
    },
    confirm: {
      id: 'global.actions.dialogs.commonbuttons.confirmButton',
      defaultMessage: '!!!Confirm',
    },
    step4Description: {
      id: 'components.catalyst.step4.description',
      defaultMessage:
        '!!!Screenshot and send the QR code to another device, then scan it with the Catalyst app. Alternatively, copy and paste the hash code into the app. Ensure you save both codes securely as they cannot be retrieved later.',
    },
    step4Title: {
      id: 'components.catalyst.step4.title',
      defaultMessage: '!!!Catalyst Code',
    },
    step4QrTitle: {
      id: 'components.catalyst.step4.qrTitle',
      defaultMessage: '!!!Backup Catalyst Code',
    },
    step4QrShareLabel: {
      id: 'components.catalyst.step4.qrShareLabel',
      defaultMessage: '!!!Share Code',
    },
    step4QrCopiedText: {
      id: 'components.catalyst.step4.qrCopiedText',
      defaultMessage: '!!!Code Copied',
    },
    step4QrCheckbox: {
      id: 'components.catalyst.step4.qrCheckbox',
      defaultMessage:
        '!!!I confirm that I have saved the QR and hash codes and understand they are irretrievable.',
    },
  }),

  hw: defineMessages({
    title: {
      id: 'components.ledger.ledgertransportswitchmodal.title',
      defaultMessage: '!!!Choose Connection Method',
    },
    usbExplanation: {
      id: 'components.ledger.ledgertransportswitchmodal.usbExplanation',
      defaultMessage:
        '!!!Choose this option if you want to connect to a Ledger Nano model X ' +
        'or S using an on-the-go USB cable adaptor:',
    },
    usbButton: {
      id: 'components.ledger.ledgertransportswitchmodal.usbButton',
      defaultMessage: '!!!Connect with USB',
    },
    usbButtonNotSupported: {
      id: 'components.ledger.ledgertransportswitchmodal.usbButtonNotSupported',
      defaultMessage: '!!!Connect with USB\n(Not supported)',
    },
    usbButtonDisabled: {
      id: 'components.ledger.ledgertransportswitchmodal.usbButtonDisabled',
      defaultMessage: '!!!Connect with USB\n(Blocked by Apple for iOS)',
    },
    bluetoothExplanation: {
      id: 'components.ledger.ledgertransportswitchmodal.bluetoothExplanation',
      defaultMessage:
        '!!!Choose this option if you want to connect to a Ledger Nano model X through Bluetooth:',
    },
    bluetoothButton: {
      id: 'components.ledger.ledgertransportswitchmodal.bluetoothButton',
      defaultMessage: '!!!Connect with Bluetooth',
    },
    bluetoothError: {
      id: 'global.ledgerMessages.bluetoothDisabledError',
      defaultMessage: '!!!Connect with Bluetooth',
    },
    beforeConfirm: {
      id: 'components.send.confirmscreen.beforeConfirm',
      defaultMessage:
        '!!!Before tapping on confirm, please follow these instructions:',
    },
  }),

  menu: defineMessages({
    catalystVoting: {
      id: 'menu.catalystVoting',
      defaultMessage: '!!!Catalyst voting',
    },
    stakingCenter: {
      id: 'menu.stakingCenter',
      defaultMessage: '!!!Staking',
    },
    settings: {
      id: 'menu.settings',
      defaultMessage: '!!!Settings',
    },
    supportTitle: {
      id: 'menu.supportTitle',
      defaultMessage: '!!!Any questions',
    },
    supportLink: {
      id: 'menu.supportLink',
      defaultMessage: '!!!Ask our support team',
    },
    knowledgeBase: {
      id: 'menu.knowledgeBase',
      defaultMessage: '!!!Knowledge base',
    },
    menu: {
      id: 'menu',
      defaultMessage: '!!!Menu',
    },
    releases: {
      id: 'menu.releases',
      defaultMessage: '!!!Releases',
    },
    governanceCentre: {
      id: 'menu.governanceCentre',
      defaultMessage: '!!!Governance centre',
    },
  }),

  dashboard: defineMessages({
    title: {
      id: 'components.delegationsummary.delegatedStakepoolInfo.title',
      defaultMessage: '!!!Stake pool delegated',
    },
    warning: {
      id: 'components.delegationsummary.delegatedStakepoolInfo.warning',
      defaultMessage:
        '!!!If you just delegated to a new stake pool it may ' +
        ' take a couple of minutes for the network to process your request.',
    },
    goToWebsiteButtonLabel: {
      id: 'components.delegationsummary.delegatedStakepoolInfo.fullDescriptionButtonLabel',
      defaultMessage: '!!!Go to website',
    },
    copied: {
      id: 'components.delegationsummary.delegatedStakepoolInfo.copied',
      defaultMessage: '!!!Copied!',
    },
    unknownPool: {
      id: 'components.delegationsummary.delegatedStakepoolInfo.unknownPool',
      defaultMessage: '!!!Unknown pool',
    },
    undelegate: {
      id: 'components.delegationsummary.delegatedStakepoolInfo.undelegate',
      defaultMessage: '!!!Undelegate',
    },
    failedTxTitle: {
      id: 'components.delegation.failedTx.title',
      defaultMessage: '!!!Transaction error',
    },
    failedTxText: {
      id: 'components.delegation.failedTx.text',
      defaultMessage:
        '!!!Your transaction has not been processed properly due to technical issues.',
    },
    failedTxButton: {
      id: 'components.delegation.failedTx.button',
      defaultMessage: '!!!Try again',
    },
    stakingCenterTitle: {
      id: 'components.stakingcenter.title',
      defaultMessage: '!!!Staking Center',
    },
    firstLine: {
      id: 'components.delegationsummary.notDelegatedInfo.firstLine',
      defaultMessage: '!!!You have not delegated your ADA yet.',
    },
    secondLine: {
      id: 'components.delegationsummary.notDelegatedInfo.secondLine',
      defaultMessage:
        '!!!Go to Staking center to choose which stake pool you want to delegate in. Note, you may delegate only to one stake pool in this Tesnnet.',
    },
    rewardsLabel: {
      id: 'components.delegationsummary.userSummary.totalRewards',
      defaultMessage: '!!!Total Rewards',
    },
    delegatedLabel: {
      id: 'components.delegationsummary.userSummary.totalDelegated',
      defaultMessage: '!!!Total Delegated',
    },
    withdrawButtonTitle: {
      id: 'components.delegationsummary.userSummary.withdrawButtonTitle',
      defaultMessage: '!!!Withdraw',
    },
  }),

  settings: defineMessages({
    changeNetwork: defineMessages({
      networkNoticeTitle: {
        id: 'components.settings.applicationsettingsscreen.network.notice.title',
        defaultMessage: '!!!What are the test networks?',
      },
      networkNoticeMessage: {
        id: 'components.settings.applicationsettingsscreen.network.notice.message',
        defaultMessage:
          '!!!The test networks serve as a platform for the community and developers to test products and experiments without risking real funds on the mainnet.',
      },
      networkNoticeListTitle: {
        id: 'components.settings.applicationsettingsscreen.network.notice.listTitle',
        defaultMessage: '!!!Key features of testnet coins:',
      },
      networkNoticeList: {
        id: 'components.settings.applicationsettingsscreen.network.notice.list',
        defaultMessage:
          '!!!  •  Have no real value.\n  •  Are separate from the mainnet.\n  •  Cannot be sent to mainnet wallets.\n  •  Are easily obtainable from Cardano faucets.',
      },
      preparingNetwork: {
        id: 'components.settings.applicationsettingsscreen.network.preparingNetworks',
        defaultMessage: '!!!Preparing network...',
      },
      networkNoticeButton: {
        id: 'components.settings.applicationsettingsscreen.network.notice.button',
        defaultMessage: '!!!I understand',
      },
      networkTagModalTitle: {
        id: 'components.settings.applicationsettingsscreen.network.tag.modal.title',
        defaultMessage: '!!!Switch to Mainnet',
      },
      networkTagModalText: {
        id: 'components.settings.applicationsettingsscreen.network.tag.modal.text',
        defaultMessage:
          '!!!Are you sure you want to switch back to the main Cardano Network?',
      },
      appSettingsTitle: {
        id: 'components.settings.applicationsettingsscreen.appSettingsTitle',
        defaultMessage: '!!!App settings',
      },
      aboutTitle: {
        id: 'components.settings.applicationsettingsscreen.about',
        defaultMessage: '!!!About',
      },
      systemLogTitle: {
        id: 'global.log',
        defaultMessage: '!!!Log',
      },
      settingsTitle: {
        id: 'components.settings.applicationsettingsscreen.title',
        defaultMessage: '!!!Settings',
      },
      changeWalletNameTitle: {
        id: 'components.settings.changewalletname.title',
        defaultMessage: '!!!Change wallet name',
      },
      termsOfServiceTitle: {
        id: 'components.settings.termsofservicescreen.title',
        defaultMessage: '!!!Terms of Service Agreement',
      },
      privacyPolicyTitle: {
        id: 'components.settings.privacypolicyscreen.title',
        defaultMessage: '!!!Privacy Policy',
      },
      removeWalletTitle: {
        id: 'components.settings.removewalletscreen.title',
        defaultMessage: '!!!Remove wallet',
      },
      languageTitle: {
        id: 'components.settings.changelanguagescreen.title',
        defaultMessage: '!!!Language',
      },
      themeTitle: {
        id: 'components.settings.changeThemescreen.title',
        defaultMessage: '!!!Theming',
      },
      networkTitle: {
        id: 'components.settings.changeNetworkScreen.title',
        defaultMessage: '!!!Network',
      },
      enableEasyConfirmationTitle: {
        id: 'components.settings.enableeasyconfirmationscreen.title',
        defaultMessage: '!!!Easy confirmation',
      },
      disableEasyConfirmationTitle: {
        id: 'components.settings.disableeasyconfirmationscreen.title',
        defaultMessage: '!!!Easy confirmation',
      },
      changePasswordTitle: {
        id: 'components.settings.changepasswordscreen.title',
        defaultMessage: '!!!Change spending password',
      },
      changeCustomPinTitle: {
        id: 'components.settings.applicationsettingsscreen.changePin',
        defaultMessage: '!!!Change PIN',
      },
      collateral: {
        id: 'global.collateral',
        defaultMessage: '!!!Collateral',
      },
      customPinTitle: {
        id: 'components.initialization.custompinscreen.title',
        defaultMessage: '!!!Set PIN',
      },
      walletTabTitle: {
        id: 'components.settings.walletsettingscreen.tabTitle',
        defaultMessage: '!!!Wallet',
      },
      appTabTitle: {
        id: 'components.settings.applicationsettingsscreen.tabTitle',
        defaultMessage: '!!!Application',
      },
      notifications: {
        id: 'components.settings.notifications.title',
        defaultMessage: '!!!Notifications',
      },
      about: defineMessages({
        walletType: {
          id: 'components.settings.applicationsettingsscreen.walletType',
          defaultMessage: '!!!Wallet type',
        },
        byronWallet: {
          id: 'components.settings.walletsettingscreen.byronWallet',
          defaultMessage: '!!!Byron-era wallet',
        },
        shelleyWallet: {
          id: 'components.settings.walletsettingscreen.shelleyWallet',
          defaultMessage: '!!!Shelley-era wallet',
        },
        unknownWalletType: {
          id: 'components.settings.walletsettingscreen.unknownWalletType',
          defaultMessage: '!!!Unknown Wallet Type',
        },
        fcmToken: {
          id: 'components.settings.walletsettingscreen.fcmToken',
          defaultMessage: '!!!FCM Token',
        },
      }),
      enableLoginWithOs: defineMessages({
        notNowButton: {
          id: 'components.settings.biometricslinkscreen.notNowButton',
          defaultMessage: '!!!Not now',
        },
        linkButton: {
          id: 'components.settings.biometricslinkscreen.linkButton',
          defaultMessage: '!!!Link',
        },
        heading: {
          id: 'components.settings.biometricslinkscreen.heading',
          defaultMessage: '!!!Use your fingerprint',
        },
        subHeading1: {
          id: 'components.settings.biometricslinkscreen.subHeading1',
          defaultMessage: '!!!for faster, easier access',
        },
        subHeading2: {
          id: 'components.settings.biometricslinkscreen.subHeading2',
          defaultMessage: '!!!to your Yoroi wallet',
        },
      }),
      easyConfirmation: defineMessages({
        disableHeading: {
          id: 'components.settings.disableeasyconfirmationscreen.disableHeading',
          defaultMessage:
            '!!!By disabling this option you will be able to spend your assets only with your master password.',
        },
        disableButton: {
          id: 'components.settings.disableeasyconfirmationscreen.disableButton',
          defaultMessage: '!!!Disable',
        },
        enableHeading: {
          id: 'components.settings.enableeasyconfirmationscreen.enableHeading',
          defaultMessage:
            '!!!This option will allow you to send transactions ' +
            'from your wallet just by confirming with fingerprint or ' +
            'face recognition with standard system fallback option. ' +
            'This makes your wallet less secure. This is a compromise ' +
            'between UX and security!',
        },
        enableWarning: {
          id: 'components.settings.enableeasyconfirmationscreen.enableWarning',
          defaultMessage:
            '!!!Please remember your master password, as you may need it ' +
            'in case your biometrics data are removed from the device.',
        },
        enableRootPassword: {
          id: 'components.settings.enableeasyconfirmationscreen.enableMasterPassword',
          defaultMessage: '!!!Master password',
        },
        enableButton: {
          id: 'components.settings.enableeasyconfirmationscreen.enableButton',
          defaultMessage: '!!!Enable',
        },
      }),
      removeWallet: defineMessages({
        descriptionParagraph1: {
          id: 'components.settings.removewalletscreen.descriptionParagraph1',
          defaultMessage:
            '!!!If you wish to permanently delete the wallet make sure you have written down the mnemonic.',
        },
        descriptionParagraph2: {
          id: 'components.settings.removewalletscreen.descriptionParagraph2',
          defaultMessage:
            '!!!To confirm this operation type the wallet name below.',
        },
        walletName: {
          id: 'components.settings.removewalletscreen.walletName',
          defaultMessage: '!!!Wallet name',
        },
        walletNameInput: {
          id: 'components.settings.removewalletscreen.walletNameInput',
          defaultMessage: '!!!Wallet name',
        },
        walletNameMismatchError: {
          id: 'components.settings.removewalletscreen.walletNameMismatchError',
          defaultMessage: '!!!Wallet name does not match',
        },
        remove: {
          id: 'components.settings.removewalletscreen.remove',
          defaultMessage: '!!!Remove wallet',
        },
        hasWrittenDownMnemonic: {
          id: 'components.settings.removewalletscreen.hasWrittenDownMnemonic',
          defaultMessage:
            '!!!I have written down mnemonic of this wallet and understand that I cannot recover the wallet without it.',
        },
      }),
      renameWallet: defineMessages({
        changeButton: {
          id: 'components.settings.changewalletname.changeButton',
          defaultMessage: '!!!Change name',
        },
        walletNameInputLabel: {
          id: 'components.settings.changewalletname.walletNameInputLabel',
          defaultMessage: '!!!Wallet name',
        },
      }),
      changePassword: defineMessages({
        oldPasswordInputLabel: {
          id: 'components.settings.changepasswordscreen.oldPasswordInputLabel',
          defaultMessage: '!!!Current password',
        },
        newPasswordInputLabel: {
          id: 'components.settings.changepasswordscreen.newPasswordInputLabel',
          defaultMessage: '!!!New password',
        },
        passwordStrengthRequirement: {
          id: 'components.walletinit.createwallet.createwalletscreen.passwordLengthRequirement',
          defaultMessage: '!!!Minimum {requirePasswordLength} characters',
        },
        repeatPasswordInputLabel: {
          id: 'components.settings.changepasswordscreen.repeatPasswordInputLabel',
          defaultMessage: '!!!Repeat new password',
        },
        repeatPasswordInputNotMatchError: {
          id: 'components.settings.changepasswordscreen.repeatPasswordInputNotMatchError',
          defaultMessage: '!!!Passwords do not match',
        },
        continueButton: {
          id: 'components.settings.changepasswordscreen.continueButton',
          defaultMessage: '!!!Change password',
        },
      }),
      receive: defineMessages({
        amountToReceive: {
          id: 'components.receive.specificamountscreen.title',
          defaultMessage: '!!!Amount to receive',
        },
        receiveTitle: {
          id: 'components.receive.receivescreen.title',
          defaultMessage: '!!!Receive',
        },
        describeSelectedAddressTitle: {
          id: 'components.receive.describeselectedaddressscreen.title',
          defaultMessage: '!!!Address details',
        },
        addresscardTitle: {
          id: 'components.receive.addresscard.title',
          defaultMessage: '!!!Wallet address',
        },
        shareLabel: {
          id: 'components.receive.addresscard.shareLabel',
          defaultMessage: '!!!Share address',
        },
        walletAddress: {
          id: 'components.receive.addresscard.walletAddress',
          defaultMessage: '!!!Wallet address details',
        },
        spendingKeyHash: {
          id: 'components.receive.addresscard.spendingKeyHash',
          defaultMessage: '!!!Spending key hash',
        },
        stakingKeyHash: {
          id: 'components.receive.addresscard.stakingKeyHash',
          defaultMessage: '!!!Staking key hash',
        },
        address: {
          id: 'components.receive.addresscard.address',
          defaultMessage: '!!!Address',
        },
        copyAddressButton: {
          id: 'components.receive.receivescreen.copyButton',
          defaultMessage: '!!!Copy address',
        },
        requestSpecificAmountButton: {
          id: 'components.receive.receivescreen.requestSpecificAmountButton',
          defaultMessage: '!!!Request specific amount',
        },
        specificAmount: {
          id: 'components.receive.receivescreen.specificAmount',
          defaultMessage: '!!!Request specific amount',
        },
        specificAmountDescription: {
          id: 'components.receive.receivescreen.specificAmountDescription',
          defaultMessage:
            '!!!Generate a unique wallet address for requesting a specific amount of ADA from another wallet.',
        },
        ADALabel: {
          id: 'components.receive.receivescreen.ADALabel',
          defaultMessage: '!!!ADA Amount',
        },
        generateLink: {
          id: 'components.receive.receivescreen.generateLink',
          defaultMessage: '!!!Generate link',
        },
        multipleAddress: {
          id: 'components.receive.receivescreen.multipleAddress',
          defaultMessage: '!!!Multiple addresses',
        },
        copyLinkBtn: {
          id: 'components.receive.receivescreen.copyLinkBtn',
          defaultMessage: '!!!Copy link',
        },
        copyLinkMsg: {
          id: 'components.receive.receivescreen.copyLinkMsg',
          defaultMessage: '!!!Link copied',
        },
        addressCopiedMsg: {
          id: 'components.receive.receivescreen.addressCopiedMsg',
          defaultMessage: '!!!Address copied',
        },
        lastUsed: {
          id: 'components.receive.receivescreen.lastUsed',
          defaultMessage: '!!!Last used',
        },
        unusedAddress: {
          id: 'components.receive.receivescreen.unusedAddress',
          defaultMessage: '!!!Unused',
        },
        usedAddress: {
          id: 'components.receive.receivescreen.usedAddress',
          defaultMessage: '!!!Used',
        },
        generateButton: {
          id: 'components.receive.receivescreen.generateButton',
          defaultMessage: '!!!Generate new address',
        },
        infoAddressLimit: {
          id: 'components.receive.receivescreen.infoAddressLimit',
          defaultMessage:
            '!!!You have already reached your 20 addresses limit. If you need to operate with more than 20 addresses, reach out to us via Yoroi Zendesk',
        },
        singleOrMultiple: {
          id: 'components.receive.receivescreen.singleOrMultiple',
          defaultMessage: '!!!Single or multiple address?',
        },
        singleOrMultipleDetails: {
          id: 'components.receive.receivescreen.singleOrMultipleDetails',
          defaultMessage:
            '!!!Single keeps things simple and secure. For most users, single address is the way to go! You can always change it in settings.',
        },
        selectMultiple: {
          id: 'components.receive.receivescreen.selectMultiple',
          defaultMessage: '!!!Select multiple instead',
        },
        singleAddressWallet: {
          id: 'components.receive.receivescreen.singleAddressWallet',
          defaultMessage: '!!!Single address wallet',
        },
        singleAddressWarning: {
          id: 'components.receive.receivescreen.singleAddressWarning',
          defaultMessage:
            '!!!You have selected a preference for Single Address mode, but your UTxOs are spread among multiple addresses. This may affect some dapps that only support single address.',
        },
      }),
      send: defineMessages({
        walletAddress: {
          id: 'components.send.sendscreen.walletAddress',
          defaultMessage: '!!!Wallet Address',
        },
        receiver: {
          id: 'components.send.sendscreen.receiver',
          defaultMessage: '!!!Receiver',
        },
        feeLabel: {
          id: 'components.send.sendscreen.feeLabel',
          defaultMessage: '!!!Fee',
        },
        feeNotAvailable: {
          id: 'components.send.sendscreen.feeNotAvailable',
          defaultMessage: '!!!-',
        },
        balanceAfterLabel: {
          id: 'global.txLabels.balanceAfterTx',
          defaultMessage: '!!!Balance after',
        },
        balanceAfterNotAvailable: {
          id: 'components.send.sendscreen.balanceAfterNotAvailable',
          defaultMessage: '!!!-',
        },
        availableFundsBannerIsFetching: {
          id: 'components.send.sendscreen.availableFundsBannerIsFetching',
          defaultMessage: '!!!Checking balance...',
        },
        availableFundsBannerNotAvailable: {
          id: 'components.send.sendscreen.availableFundsBannerNotAvailable',
          defaultMessage: '!!!-',
        },
        addressInputLabel: {
          id: 'components.send.confirmscreen.receiver',
          defaultMessage: '!!!Receiver address, ADA Handle or domains',
        },
        checkboxSendAllAssets: {
          id: 'components.send.sendscreen.checkboxSendAllAssets',
          defaultMessage: '!!!Send all assets (including all tokens)',
        },
        checkboxSendAll: {
          id: 'components.send.sendscreen.checkboxSendAll',
          defaultMessage: '!!!Send all {assetId}',
        },
        domainNotRegisteredError: {
          id: 'components.send.sendscreen.domainNotRegisteredError',
          defaultMessage: '!!!Domain is not registered',
          description: 'some desc',
        },
        domainRecordNotFoundError: {
          id: 'components.send.sendscreen.domainRecordNotFoundError',
          defaultMessage: '!!!No Cardano record found for this domain',
          description: 'some desc',
        },
        domainUnsupportedError: {
          id: 'components.send.sendscreen.domainUnsupportedError',
          defaultMessage: '!!!Domain is not supported',
          description: 'some desc',
        },
        searchTokens: {
          id: 'components.send.sendscreen.searchTokens',
          defaultMessage: '!!!Search tokens',
        },
        selectAssetTitle: {
          id: 'components.send.selectasset.title',
          defaultMessage: '!!!Select asset',
        },
        unknownAsset: {
          id: 'components.send.assetselectorscreen.unknownAsset',
          defaultMessage: '!!!Unknown asset',
        },
        noAssets: {
          id: 'components.send.assetselectorscreen.noAssets',
          defaultMessage: '!!!No assets found',
        },
        found: {
          id: 'components.send.assetselectorscreen.found',
          defaultMessage: '!!!found',
        },
        youHave: {
          id: 'components.send.assetselectorscreen.youHave',
          defaultMessage: '!!!You have',
        },
        manyNameServersWarning: {
          id: 'send.warning.resolver.manyNameServers',
          defaultMessage:
            '!!!There are <b>two addresses</b> for this domain. Please SELECT the desired domain.',
        },
        noAssetsAddedYet: {
          id: 'components.send.assetselectorscreen.noAssetsAddedYet',
          defaultMessage: '!!!No {fungible} added yet',
        },
        sendAllWarningTitle: {
          id: 'components.send.sendscreen.sendAllWarningTitle',
          defaultMessage: '!!!Do you really want to send all?',
        },
        sendAllWarningText: {
          id: 'components.send.sendscreen.sendAllWarningText',
          defaultMessage:
            '!!!You have selected the send all option. Please confirm that you understand how this feature works.',
        },
        sendAllWarningAlert1: {
          id: 'components.send.sendscreen.sendAllWarningAlert1',
          defaultMessage:
            '!!!All you {assetNameOrId} balance will be transferred in this transaction.',
        },
        sendAllWarningAlert2: {
          id: 'components.send.sendscreen.sendAllWarningAlert2',
          defaultMessage:
            '!!!All your tokens, including NFTs and any other native ' +
            'assets in your wallet, will also be transferred in this transaction.',
        },
        sendAllWarningAlert3: {
          id: 'components.send.sendscreen.sendAllWarningAlert3',
          defaultMessage:
            '!!!After you confirm the transaction in the next screen, your wallet will be emptied.',
        },
        continueButton: {
          id: 'components.send.sendscreen.continueButton',
          defaultMessage: '!!!Continue',
        },
        errorBannerNetworkError: {
          id: 'components.send.sendscreen.errorBannerNetworkError',
          defaultMessage:
            '!!!We are experiencing issues with fetching your current balance. Click to retry.',
        },
        errorBannerPendingOutgoingTransaction: {
          id: 'components.send.sendscreen.errorBannerPendingOutgoingTransaction',
          defaultMessage:
            '!!!You cannot send a new transaction while an existing one is still pending',
        },
        submittedTxTitle: {
          id: 'components.send.sendscreen.submittedTxTitle',
          defaultMessage: '!!!Transaction signed',
        },
        submittedTxText: {
          id: 'components.send.sendscreen.submittedTxText',
          defaultMessage: `!!!It will show up in the transaction list once it's confirmed by the network.`,
        },
        submittedTxButton: {
          id: 'components.send.sendscreen.submittedTxButton',
          defaultMessage: '!!!Close',
        },
        failedTxTitle: {
          id: 'components.send.sendscreen.failedTxTitle',
          defaultMessage: '!!!Transaction failed',
        },
        failedTxText: {
          id: 'components.send.sendscreen.failedTxText',
          defaultMessage:
            '!!!Your transaction has not been processed properly due to technical issues',
        },
        failedTxButton: {
          id: 'components.send.sendscreen.failedTxButton',
          defaultMessage: '!!!Try again',
        },
        asset: {
          id: 'global.assets.assetLabel',
          defaultMessage: '!!!Asset',
        },
        addressReaderQrText: {
          id: 'components.send.addressreaderqr.text',
          defaultMessage: '!!!Scan recipients QR code to add a wallet address',
        },
        resolvedAddress: {
          id: 'components.send.sendscreen.resolvedAddress',
          defaultMessage: '!!!Related Address',
        },
        resolverNoticeTitle: {
          id: 'components.send.sendscreen.resolverNoticeTitle',
          defaultMessage: '!!!Yoroi supports more addresses',
        },
        resolverNoticeText: {
          id: 'components.send.sendscreen.resolverNoticeText',
          defaultMessage:
            '!!!Yoroi offers a unique chance to use custom and lightning-fast alternatives to the traditional wallet address, such as',
        },
        helperAddressErrorInvalid: {
          id: 'send.helper.addressError.invalid',
          defaultMessage:
            '!!!Please enter a valid receiver address, ADA Handle or domain',
        },
        helperAddressErrorWrongBlockchain: {
          id: 'send.helper.addressError.wrongBlockchain',
          defaultMessage:
            '!!!You are trying to resolve a domain on a different blockchain. Please double-check and try again',
        },
        helperAddressErrorWrongNetwork: {
          id: 'send.helper.addressError.wrongNetwork',
          defaultMessage: '!!!Please enter valid domain',
        },
        helperResolverErrorDomainNotFound: {
          id: 'send.helper.resolverError.domainNotFound',
          defaultMessage:
            "!!!Receiver address, ADA Handle or domain you entered doesn't exist. Please double-check it and try again",
        },
        memoLabel: {
          id: 'components.send.memofield.label',
          defaultMessage: '!!!Memo',
        },
        helperMemoInstructions: {
          id: 'components.send.memofield.message',
          defaultMessage: '!!!(Optional) Memo is stored locally',
        },
        helperMemoErrorTooLong: {
          id: 'components.send.memofield.error',
          defaultMessage: '!!!Memo is too long',
        },
      }),

      amountInputErrorMessages: defineMessages({
        INVALID_AMOUNT: {
          id: 'components.send.sendscreen.amountInput.error.INVALID_AMOUNT',
          defaultMessage: '!!!Please enter valid amount',
        },
        TOO_MANY_DECIMAL_PLACES: {
          id: 'components.send.sendscreen.amountInput.error.TOO_MANY_DECIMAL_PLACES',
          defaultMessage: '!!!Please enter valid amount',
        },
        TOO_LARGE: {
          id: 'components.send.sendscreen.amountInput.error.TOO_LARGE',
          defaultMessage: '!!!Amount too large',
        },
        TOO_LOW: {
          id: 'components.send.sendscreen.amountInput.error.TOO_LOW',
          defaultMessage: '!!!Amount is too low',
        },
        LT_MIN_UTXO: {
          id: 'components.send.sendscreen.amountInput.error.LT_MIN_UTXO',
          defaultMessage: '!!!Cannot send less than {minUtxo} {ticker}',
        },
        NEGATIVE: {
          id: 'components.send.sendscreen.amountInput.error.NEGATIVE',
          defaultMessage: '!!!Amount must be positive',
        },
        insufficientBalance: {
          id: 'components.send.sendscreen.amountInput.error.insufficientBalance',
          defaultMessage: '!!!Not enough money to make this transaction',
        },
        assetOverflow: {
          id: 'components.send.sendscreen.amountInput.error.assetOverflow',
          defaultMessage:
            '!!!!Maximum value of a token inside a UTXO exceeded (overflow).',
        },
        minPrimaryBalanceForTokens: {
          id: 'global.info.minPrimaryBalanceForTokens',
          defaultMessage: '!!!Keep some balance for tokens',
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

      discover: defineMessages({
        confirmTx: {
          id: 'global.confirmationTransaction',
          defaultMessage: '!!!Confirm transaction',
        },
        discoverTitle: {
          id: 'discover.discoverList.discoverTitle',
          defaultMessage: '!!!Discover Cardano',
        },
        searchDApps: {
          id: 'discover.discoverList.searchDApps',
          defaultMessage: '!!!Search DApps',
        },
        welcomeToYoroiDAppExplorer: {
          id: 'discover.discoverList.welcomeToYoroiDAppExplorer',
          defaultMessage: '!!!Welcome to Yoroi DApp Explorer',
        },
        welcomeToYoroiDAppExplorerDescription: {
          id: 'discover.discoverList.welcomeToYoroiDAppExplorerDescription',
          defaultMessage:
            '!!!Discover, inspect, and connect to Cardano decentralized applications (DApps) with ease. Our solution helps to interact with DApps and their smart contracts, seamlessly enhancing your Cardano experience',
        },
        next: {
          id: 'global.next',
          defaultMessage: '!!!Next',
        },
        totalDAppAvailable: {
          id: 'discover.discoverList.dAppAvailable',
          defaultMessage: '!!!{count} DApp(s) available',
        },
        dAppConnected: {
          id: 'discover.discoverList.dAppConnected',
          defaultMessage: '!!!{count} DApp(s) connected',
        },
        connected: {
          id: 'discover.discoverList.connected',
          defaultMessage: '!!!Authorized',
        },
        singleAddress: {
          id: 'discover.discoverList.singleAddress',
          defaultMessage: '!!!Single address',
        },
        recommended: {
          id: 'discover.discoverList.recommended',
          defaultMessage: '!!!Recommended',
        },
        done: {
          id: 'discover.discoverList.done',
          defaultMessage: '!!!DONE',
        },
        openDApp: {
          id: 'discover.discoverList.openDApp',
          defaultMessage: '!!!Open DApp',
        },
        disconnectWalletFromDApp: {
          id: 'discover.discoverList.disconnectWalletFromDApp',
          defaultMessage: '!!!Disconnect DApp',
        },
        dAppActions: {
          id: 'discover.discoverList.dAppActions',
          defaultMessage: '!!!DApp actions',
        },
        confirmConnectionModalTitle: {
          id: 'discover.confirmConnectionModal.title',
          defaultMessage: '!!!Confirm connection',
        },
        confirmConnectionModalConnectTo: {
          id: 'discover.confirmConnectionModal.connectTo',
          defaultMessage: '!!!Connect to',
        },
        confirmConnectionModalConnect: {
          id: 'discover.confirmConnectionModal.connect',
          defaultMessage: '!!!Connect',
        },
        confirmConnectionModalAllowThisDAppTo: {
          id: 'discover.confirmConnectionModal.allowThisDAppTo',
          defaultMessage: '!!!Allow this DApp to:',
        },
        confirmConnectionModalPermission1: {
          id: 'discover.confirmConnectionModal.permission1',
          defaultMessage: '!!!View addresses, account balance, activity',
        },
        singleAddressWarning: {
          id: 'discover.confirmConnectionModal.singleAddressWarning',
          defaultMessage:
            '!!!This DApp supports only single-address wallets. Your wallet balance might be displayed incorrectly.',
        },
        confirmConnectionModalPermission2: {
          id: 'discover.confirmConnectionModal.permission2',
          defaultMessage: '!!!Request approval for transactions',
        },
        understand: {
          id: 'discover.unverifiedDappModal.understand',
          defaultMessage: '!!!I understand',
        },
        disclaimerModalText: {
          id: 'discover.unverifiedDappModal.disclaimerModalText',
          defaultMessage:
            '!!!You are accessing a third-party Cardano application that is not verified by EMURGO, the developers of Yoroi Wallet, or any of its affiliated divisions. Make sure this DApp is reliable to stay safe from malicious apps in a sustainable way.',
        },
        disclaimerModalTitle: {
          id: 'discover.unverifiedDappModal.disclaimerModalTitle',
          defaultMessage: '!!!Disclaimer',
        },
        disconnectDApp: {
          id: 'discover.confirmDisconnectDApp.disconnectDApp',
          defaultMessage: '!!!Disconnect DApp',
        },
        confirmDisconnectDAppDescription: {
          id: 'discover.confirmDisconnectDApp.confirmDisconnectDAppDescription',
          defaultMessage: '!!!Are you sure you want to disconnect this DApp?',
        },
        cancel: {
          id: 'global.actions.dialogs.commonbuttons.cancelButton',
          defaultMessage: '!!!Cancel',
        },
        confirm: {
          id: 'global.actions.dialogs.commonbuttons.confirmButton',
          defaultMessage: '!!!Confirm',
        },
        signDataNotSupported: {
          id: 'discover.ledger.signDataNotSupported',
          defaultMessage:
            '!!!The Ledger Cardano app does not support data signing at this moment.',
        },
        transactionReview: {
          id: 'discover.reviewTransaction.transactionReview',
          defaultMessage: '!!!Transaction review',
        },
        inputs: {
          id: 'discover.reviewTransaction.inputs',
          defaultMessage: '!!!Inputs',
        },
        outputs: {
          id: 'discover.reviewTransaction.outputs',
          defaultMessage: '!!!Outputs',
        },
        transactionIdCopied: {
          id: 'discover.reviewTransaction.transactionIdCopied',
          defaultMessage: '!!!Transaction ID copied',
        },
        addressCopied: {
          id: 'discover.reviewTransaction.addressCopied',
          defaultMessage: '!!!Address copied',
        },
        yourAddress: {
          id: 'discover.reviewTransaction.yourAddress',
          defaultMessage: '!!!Your address',
        },
        externalAddress: {
          id: 'discover.reviewTransaction.externalAddress',
          defaultMessage: '!!!Foreign address',
        },
        fee: {
          id: 'discover.reviewTransaction.fee',
          defaultMessage: '!!!Transaction fee',
        },
        signData: {
          id: 'discover.reviewTransaction.signData',
          defaultMessage: '!!!Sign data',
        },
        signMessage: {
          id: 'discover.reviewTransaction.signMessage',
          defaultMessage: '!!!Sign message',
        },
        testnetWarningTitle: {
          id: 'discover.testnetWarning.title',
          defaultMessage: '!!!Testnet DApps 🚧',
        },
        testnetWarningDescription: {
          id: 'discover.testnetWarning.description',
          defaultMessage:
            '!!!This is a list of DApps designed for testnet use. Note that it may be limited, as not all DApps are deployed in the testnet environment.',
        },
        filterChildOptionsNews: {
          id: 'discover.filterOptions.child.news',
          defaultMessage: '!!!News',
        },
        filterChildOptionsEntertainment: {
          id: 'discover.filterOptions.child.entertainment',
          defaultMessage: '!!!Entertainment',
        },
        filterChildOptionsDeFi: {
          id: 'discover.filterOptions.child.defi',
          defaultMessage: '!!!DeFi',
        },
        filterChildOptionsDEX: {
          id: 'discover.filterOptions.child.dex',
          defaultMessage: '!!!DEX',
        },
        filterChildOptionsNFTMarketplace: {
          id: 'discover.filterOptions.child.nftmarketplace',
          defaultMessage: '!!!NFT Marketplace',
        },
        filterChildOptionsStablecoin: {
          id: 'discover.filterOptions.child.stablecoin',
          defaultMessage: '!!!Stablecoin',
        },
        filterChildOptionsTradingTools: {
          id: 'discover.filterOptions.child.tradingtools',
          defaultMessage: '!!!Trading Tools',
        },
        filterChildOptionsDAO: {
          id: 'discover.filterOptions.child.dao',
          defaultMessage: '!!!DAO',
        },
        filterChildOptionsDecentralisedStorage: {
          id: 'discover.filterOptions.child.decentralisedstorage',
          defaultMessage: '!!!Decentralised Storage',
        },
        filterParentOptionsMedia: {
          id: 'discover.filterOptions.parent.media',
          defaultMessage: '!!!Media',
        },
        filterParentOptionsInvestment: {
          id: 'discover.filterOptions.parent.investment',
          defaultMessage: '!!!Investment',
        },
        filterParentOptionsNFT: {
          id: 'discover.filterOptions.parent.nft',
          defaultMessage: '!!!NFT',
        },
        filterParentOptionsTrading: {
          id: 'discover.filterOptions.parent.trading',
          defaultMessage: '!!!Trading',
        },
        filterParentOptionsCommunity: {
          id: 'discover.filterOptions.parent.community',
          defaultMessage: '!!!Community',
        },
        disconnectWarning: {
          id: 'discover.modal.disconnectWarning',
          defaultMessage:
            '!!!Even if you disconnected Yoroi from the DApp, Yoroi is still authorized. If you want to remove such authorization, please click Disconnect DApp.',
        },
        collateralNotFoundText: {
          id: 'discover.modal.collateralNotFoundText',
          defaultMessage:
            '!!!To continue with this action, you need to generate a collateral',
        },
        collateralNotFoundTitle: {
          id: 'discover.modal.collateralNotFoundTitle',
          defaultMessage: '!!!Collateral not found',
        },
        collateralNotFoundActionText: {
          id: 'discover.modal.collateralNotFoundActionText',
          defaultMessage: '!!!Generate',
        },
        collateralTxPendingTitle: {
          id: 'discover.modal.collateralTxPendingTitle',
          defaultMessage: '!!!Pending Collateral Transaction',
        },
        collateralTxPendingText: {
          id: 'discover.modal.collateralTxPendingText',
          defaultMessage:
            "!!!The collateral transaction you've submitted is being processed and may take a few minutes to confirm.  Please wait for it to show in your transaction history and try again.",
        },
      }),

      swap: defineMessages({
        via: {
          id: 'swap.swapScreen.via',
          defaultMessage: '!!!via',
        },
        placeOrder: {
          id: 'swap.swapScreen.placeOrder',
          defaultMessage: '!!!Place order',
        },
        yourAssets: {
          id: 'swap.swapScreen.yourAssets',
          defaultMessage: '!!!Your assets',
        },
        allAssets: {
          id: 'swap.swapScreen.allAssets',
          defaultMessage: '!!!All assets',
        },
        swapTitle: {
          id: 'swap.swapScreen.swapTitle',
          defaultMessage: '!!!Swap',
        },
        swapDetailsTitle: {
          id: 'swap.swapScreen.swapDetailsTitle',
          defaultMessage: '!!!Swap details',
        },
        swapCancellationDetailsTitle: {
          id: 'swap.swapScreen.swapCancellationDetailsTitle',
          defaultMessage: '!!!Cancel swap order details',
        },
        tokenSwap: {
          id: 'swap.swapScreen.tokenSwapTab',
          defaultMessage: '!!!Token swap',
        },
        orderSwap: {
          id: 'swap.swapScreen.ordersSwapTab',
          defaultMessage: '!!!Orders',
        },
        dex: {
          id: 'swap.swapScreen.dex',
          defaultMessage: '!!! dex',
        },
        marketButton: {
          id: 'swap.swapScreen.marketButton',
          defaultMessage: '!!!Market Button',
        },
        limitButton: {
          id: 'swap.swapScreen.limitButton',
          defaultMessage: '!!!Limit',
        },
        swapFrom: {
          id: 'swap.swapScreen.swapFrom',
          defaultMessage: '!!!Swap from',
        },
        swapTo: {
          id: 'swap.swapScreen.swapTo',
          defaultMessage: '!!!Swap to',
        },
        currentBalance: {
          id: 'swap.swapScreen.currentBalance',
          defaultMessage: '!!!Current Balance',
        },
        balance: {
          id: 'swap.swapScreen.balance',
          defaultMessage: '!!!Balance',
        },
        clear: {
          id: 'global.clear',
          defaultMessage: '!!!Clear',
        },
        selectToken: {
          id: 'swap.swapScreen.selectToken',
          defaultMessage: '!!!Select Token',
        },
        marketPrice: {
          id: 'swap.swapScreen.marketPrice',
          defaultMessage: '!!!Market Price',
        },
        marketPriceInfo: {
          id: 'swap.swapScreen.marketPriceInfo',
          defaultMessage:
            '!!!Market price is the best price available on the market among several DEXes that lets you buy or sell an asset instantly.',
        },
        limitPriceInfo: {
          id: 'swap.swapScreen.limitPriceInfo',
          defaultMessage:
            "!!!Limit price in a DEX is a specific pre-set price at which you can trade an asset. Unlike market orders, which execute immediately at the current market price, limit orders are set to execute only when the market reaches the trader's specified price.",
        },
        limitPrice: {
          id: 'swap.swapScreen.limitPrice',
          defaultMessage: '!!!Limit Price',
        },
        slippageTolerance: {
          id: 'swap.swapScreen.slippageTolerance',
          defaultMessage: '!!!Slippage Tolerance',
        },
        slippageToleranceError: {
          id: 'swap.swapScreen.slippageToleranceError',
          defaultMessage:
            '!!!Slippage must be a number between 0 and 75 and have up to 1 decimal',
        },
        slippageToleranceInfo: {
          id: 'swap.swapScreen.slippageToleranceInfo',
          defaultMessage: '!!!Slippage Tolerance Info',
        },
        verifiedBy: {
          id: 'swap.swapScreen.verifiedBy',
          defaultMessage: '!!!Verified by {pool}',
        },
        assetsIn: {
          id: 'swap.swapScreen.assetsIn',
          defaultMessage: '!!!This asset is in my portfolio',
        },
        slippageInfo: {
          id: 'swap.swapScreen.slippageInfo',
          defaultMessage:
            '!!!Slippage tolerance is set as a percentage of the total swap value.',
        },
        autoPool: {
          id: 'swap.swapScreen.autoPool',
          defaultMessage: '!!!(auto)',
        },
        auto: {
          id: 'global.auto',
          defaultMessage: '!!!Auto',
        },
        routingPreferences: {
          id: 'swap.swapScreen.routingPreferences',
          defaultMessage: '!!!Routing preferences',
        },
        route: {
          id: 'swap.swapScreen.route',
          defaultMessage: '!!!Route',
        },
        routeDescription: {
          id: 'swap.swapScreen.routeDescription',
          defaultMessage:
            '!!!The route shows the path your swap takes to find the best price',
        },
        changePool: {
          id: 'swap.swapScreen.changePool',
          defaultMessage: '!!!change dex',
        },
        swapMinAda: {
          id: 'swap.swapScreen.swapMinAda',
          defaultMessage:
            '!!!Min-ADA is the minimum ADA amount required to be contained when holding or sending Cardano native assets.',
        },
        swapMinAdaTitle: {
          id: 'swap.swapScreen.swapMinAdaTitle',
          defaultMessage: '!!!Min ADA',
        },
        preprodNoticeTitle: {
          id: 'swap.swapScreen.preprodNoticeTitle',
          defaultMessage: '!!!Swap is not available on testnet',
        },
        preprodNoticeText: {
          id: 'swap.swapScreen.preprodNoticeText',
          defaultMessage:
            '!!!Switch to mainnet if you want to use the feature and swap real tokens',
        },
        swapFeesTitle: {
          id: 'swap.swapScreen.swapFeesTitle',
          defaultMessage: '!!!Fees',
        },
        swapLiquidityFee: {
          id: 'swap.swapScreen.swapLiquidityFee',
          defaultMessage: '!!!Liquidity provider fee',
        },
        swapLiqProvFee: {
          id: 'swap.swapScreen.swapLiqProvFee',
          defaultMessage: '!!!Liquidity provider fee',
        },
        swapLiquidityFeeInfo: {
          id: 'swap.swapScreen.swapLiquidityFeeInfo',
          defaultMessage:
            '!!!Liquidity provider fee is a fixed <b>{fee}%</b> operational fee from the whole transaction volume, that is taken to support DEX "liquidity" allowing traders to buy and sell assets on the decentralized Cardano network.',
        },
        swapMinReceived: {
          id: 'swap.swapScreen.swapMinReceived',
          defaultMessage:
            '!!!Minimum amount of assets you can get because of the slippage tolerance.',
        },
        swapMinReceivedTitle: {
          id: 'swap.swapScreen.swapMinReceivedTitle',
          defaultMessage: '!!!Min Received',
        },
        enterSlippage: {
          id: 'swap.swapScreen.enterSlippage',
          defaultMessage:
            '!!!Enter a value from 0% to 75%. You can also enter up to 1 decimal',
        },
        poolVerification: {
          id: 'swap.swapScreen.poolVerification',
          defaultMessage: '!!!{pool} verification',
        },
        volume: {
          id: 'swap.swapScreen.volume',
          defaultMessage: '!!!Volume, 24h',
        },
        poolVerificationInfo: {
          id: 'swap.swapScreen.poolVerificationInfo',
          defaultMessage:
            '!!!Cardano projects that list their own tokens can apply for an additional {pool} verification. This verification is a manual validation that {pool} team performs with the help of Cardano Foundation.',
        },
        price: {
          id: 'global.price',
          defaultMessage: '!!! Price',
        },
        noAssetsFound: {
          id: 'swap.swapScreen.noAssetsFound',
          defaultMessage: '!!!No assets found for this pair',
        },
        noAssetsFoundFor: {
          id: 'swap.swapScreen.noAssetsFoundFor',
          defaultMessage: '!!!No assets found for "{search}"',
        },
        eachVerifiedToken: {
          id: 'swap.swapScreen.eachVerifiedToken',
          defaultMessage: '!!!Each verified tokens gets',
        },
        verifiedBadge: {
          id: 'swap.swapScreen.verifiedBadge',
          defaultMessage: '!!!verified badge',
        },
        openOrders: {
          id: 'swap.swapScreen.openOrders',
          defaultMessage: '!!!Open orders',
        },
        completedOrders: {
          id: 'swap.swapScreen.completedOrders',
          defaultMessage: '!!!Completed orders',
        },
        tvl: {
          id: 'swap.swapScreen.tvl',
          defaultMessage: '!!!TVL',
        },
        poolFee: {
          id: 'swap.swapScreen.poolFee',
          defaultMessage: '!!! Dex Fee',
        },
        batcherFee: {
          id: 'swap.swapScreen.batcherFee',
          defaultMessage: '!!! Batcher Fee',
        },
        limitPriceWarningTitle: {
          id: 'swap.swapScreen.limitPriceWarningTitle',
          defaultMessage: '!!!Limit price',
        },
        limitPriceWarningDescription: {
          id: 'swap.swapScreen.limitPriceWarningDescription',
          defaultMessage:
            '!!!Are you sure you want to proceed this order with the limit price that is 10% or more higher than the\n' +
            'market price?',
        },
        limitPriceWarningYourPrice: {
          id: 'swap.swapScreen.limitPriceWarningYourPrice',
          defaultMessage: '!!!Your limit price',
        },
        limitPriceWarningMarketPrice: {
          id: 'swap.swapScreen.limitPriceWarningMarketPrice',
          defaultMessage: '!!!Market price',
        },
        limitPriceWarningBack: {
          id: 'swap.swapScreen.limitPriceWarningBack',
          defaultMessage: '!!!Back',
        },
        limitPriceWarningConfirm: {
          id: 'swap.swapScreen.limitPriceWarningConfirm',
          defaultMessage: '!!!Swap',
        },
        transactionSigned: {
          id: 'swap.swapScreen.transactionSigned',
          defaultMessage: '!!!Transaction submitted',
        },
        transactionDisplay: {
          id: 'swap.swapScreen.transactionDisplay',
          defaultMessage:
            '!!!Your transactions will be displayed both in the list of transaction and Open swap orders',
        },
        seeOnExplorer: {
          id: 'swap.swapScreen.seeOnExplorer',
          defaultMessage: '!!!see on explorer',
        },
        asset: {
          id: 'global.assets.assetLabel',
          defaultMessage: '!!!Asset',
        },
        signTransaction: {
          id: 'global.signTransaction',
          defaultMessage: '!!!Sign transaction',
        },
        spendingPassword: {
          id: 'global.spendingPassword',
          defaultMessage: '!!!Spending Password',
        },
        enterSpendingPassword: {
          id: 'global.enterSpendingPassword',
          defaultMessage: '!!!Enter spending password to sign this transaction',
        },
        sign: {
          id: 'global.sign',
          defaultMessage: '!!!Sign',
        },
        swapButton: {
          id: 'global.swap',
          defaultMessage: '!!!Swap',
        },
        listCompletedOrders: {
          id: 'swap.listOrders.completed',
          defaultMessage: '!!!completed orders',
        },
        listOpenOrders: {
          id: 'swap.listOrders.open',
          defaultMessage: '!!!open orders',
        },
        listOrdersSheetTitle: {
          id: 'swap.listOrders.sheet.title',
          defaultMessage: '!!!Confirm order cancellation',
        },
        listOrdersSheetButtonText: {
          id: 'swap.listOrders.card.buttonText',
          defaultMessage: '!!!Cancel order',
        },
        listOrdersSheetContentTitle: {
          id: 'swap.listOrders.sheet.contentTitle',
          defaultMessage: '!!!Are you sure you want to cancel this order?',
        },
        listOrdersSheetLink: {
          id: 'swap.listOrders.sheet.link',
          defaultMessage: '!!!Learn more about swap orders in Yoroi',
        },
        listOrdersSheetAssetPrice: {
          id: 'swap.listOrders.sheet.assetPrice',
          defaultMessage: '!!!Asset price',
        },
        listOrdersSheetAssetAmount: {
          id: 'swap.listOrders.sheet.assetAmount',
          defaultMessage: '!!!Asset amount',
        },
        listOrdersSheetTotalReturned: {
          id: 'swap.listOrders.sheet.totalReturned',
          defaultMessage: '!!!Total returned',
        },
        listOrdersSheetCancellationFee: {
          id: 'swap.listOrders.sheet.cancellationFee',
          defaultMessage: '!!!Cancellation Fee',
        },
        listOrdersSheetConfirm: {
          id: 'swap.listOrders.sheet.confirm',
          defaultMessage: '!!!Confirm',
        },
        listOrdersSheetBack: {
          id: 'swap.listOrders.sheet.back',
          defaultMessage: '!!!Back',
        },
        listOrdersTotal: {
          id: 'swap.listOrders.total',
          defaultMessage: '!!!Total',
        },
        listOrdersLiquidityPool: {
          id: 'swap.listOrders.liquidityPool',
          defaultMessage: '!!!Liquidity Pool',
        },
        listOrdersTimeCreated: {
          id: 'swap.listOrders.timeCreated',
          defaultMessage: '!!!Time Created',
        },
        listOrdersTimeCompleted: {
          id: 'swap.listOrders.timeCompleted',
          defaultMessage: '!!!Time Completed',
        },
        listOrdersTxId: {
          id: 'swap.listOrders.txId',
          defaultMessage: '!!!Transaction ID',
        },
        chooseConnectionMethod: {
          id: 'components.ledger.ledgertransportswitchmodal.title',
          defaultMessage: '!!!Choose Connection Method',
        },
        usbExplanation: {
          id: 'components.ledger.ledgertransportswitchmodal.usbExplanation',
          defaultMessage:
            '!!!Choose this option if you want to connect to a Ledger Nano model X ' +
            'or S using an on-the-go USB cable adaptor:',
        },
        usbButton: {
          id: 'components.ledger.ledgertransportswitchmodal.usbButton',
          defaultMessage: '!!!Connect with USB',
        },
        usbConnectionIsBlocked: {
          id: 'components.ledger.ledgertransportswitchmodal.usbConnectionIsBlocked',
          defaultMessage: '!!! USB connection is blocked by iOS devices',
        },
        bluetoothExplanation: {
          id: 'components.ledger.ledgertransportswitchmodal.bluetoothExplanation',
          defaultMessage:
            '!!!Choose this option if you want to connect to a Ledger Nano model X through Bluetooth:',
        },
        bluetoothButton: {
          id: 'components.ledger.ledgertransportswitchmodal.bluetoothButton',
          defaultMessage: '!!!Connect with Bluetooth',
        },
        bluetoothError: {
          id: 'global.ledgerMessages.bluetoothDisabledError',
          defaultMessage: '!!!Connect with Bluetooth',
        },
        serviceUnavailable: {
          id: 'global.error.serviceUnavailable',
          defaultMessage: '!!!Service unavailable',
        },
        serviceUnavailableInfo: {
          id: 'global.error.serviceUnavailableInfo',
          defaultMessage:
            '!!!The server is temporarily busy due to maintenance downtime or capacity problems',
        },
        goToTransactions: {
          id: 'components.send.sendscreen.submittedTxButton',
          defaultMessage: '!!!GO TO transactions',
        },
        youHave: {
          id: 'components.send.assetselectorscreen.youHave',
          defaultMessage: '!!!You have',
        },
        noAssets: {
          id: 'components.send.assetselectorscreen.noAssets',
          defaultMessage: '!!!No assets found',
        },
        found: {
          id: 'components.send.assetselectorscreen.found',
          defaultMessage: '!!!found',
        },
        searchTokens: {
          id: 'components.send.sendscreen.searchTokens',
          defaultMessage: '!!!Search tokens',
        },
        selecteAssetTitle: {
          id: 'components.send.selectasset.title',
          defaultMessage: '!!!Select asset',
        },
        next: {
          id: 'global.next',
          defaultMessage: '!!!Next',
        },
        assignCollateral: {
          id: 'components.send.confirmscreen.assignCollateral',
          defaultMessage: '!!!Generate',
        },
        collateralNotFound: {
          id: 'components.send.confirmscreen.collateralNotFound',
          defaultMessage: '!!!Collateral not found',
        },
        noActiveCollateral: {
          id: 'components.send.confirmscreen.noActiveCollateral',
          defaultMessage:
            '!!!To continue with this action, you need to generate a collateral',
        },
        collateralTxPendingTitle: {
          id: 'components.send.confirmscreen.collateralTxPendingTitle',
          defaultMessage: '!!!Pending Collateral UTxO',
        },
        collateralTxPending: {
          id: 'components.send.confirmscreen.collateralTxPending',
          defaultMessage:
            "!!!The collateral UTxO transaction you've submitted is currently in the processing stage, and it may require a few minutes to complete. Please refresh your interface and attempt the action again shortly",
        },
        failedTxTitle: {
          id: 'components.send.sendscreen.failedTxTitle',
          defaultMessage: '!!!Transaction failed',
        },
        failedTxText: {
          id: 'components.send.sendscreen.failedTxText',
          defaultMessage:
            '!!!Your transaction has not been processed properly due to technical issues.',
        },
        failedTxButton: {
          id: 'components.send.sendscreen.failedTxButton',
          defaultMessage: '!!!Try again',
        },
        notEnoughBalance: {
          id: 'swap.swapScreen.notEnoughBalance',
          defaultMessage: '!!!Not enough balance',
        },
        notEnoughSupply: {
          id: 'swap.swapScreen.notEnoughSupply',
          defaultMessage: '!!!Not enough supply in the pool',
        },
        notEnoughFeeBalance: {
          id: 'swap.swapScreen.notEnoughFeeBalance',
          defaultMessage: '!!!Not enough balance, please consider the fees',
        },
        noPool: {
          id: 'swap.swapScreen.noPool',
          defaultMessage:
            '!!! This pair is not available in any liquidity pool',
        },
        continue: {
          id: 'global.actions.dialogs.commonbuttons.continueButton',
          defaultMessage: '!!!Continue',
        },
        slippageWarningTitle: {
          id: 'swap.slippage.slippageWarningTitle',
          defaultMessage: '!!!Slippage Warning',
        },
        slippageWarningText: {
          id: 'swap.slippage.slippageWarningText',
          defaultMessage:
            '!!!Are you sure you want to proceed this order with the current slippage tolerance? It could result in receiving no assets.',
        },
        slippageWarningYourSlippage: {
          id: 'swap.slippage.yourSlippage',
          defaultMessage: '!!!Your slippage tolerance',
        },
        slippageWarningChangeAmount: {
          id: 'swap.slippage.changeAmount',
          defaultMessage:
            '!!!Increase the amount to proceed or change slippage tolerance to 0%',
        },
        emptyOpenOrders: {
          id: 'swap.listOrders.emptyOpenOrders',
          defaultMessage: '!!!No orders available yet',
        },
        emptyOpenOrdersSub: {
          id: 'swap.listOrders.emptyOpenOrdersSub',
          defaultMessage: '!!!Start doing SWAP to see your open orders here',
        },
        emptyCompletedOrders: {
          id: 'swap.listOrders.emptyCompletedOrders',
          defaultMessage: '!!!No orders completed yet',
        },
        emptySearchCompletedOrders: {
          id: 'swap.listOrders.emptySearchCompletedOrders',
          defaultMessage: '!!!No orders found for',
        },
        emptySearchOpenOrders: {
          id: 'swap.listOrders.emptySearchOpenOrders',
          defaultMessage: '!!!No orders found for',
        },
        priceImpact: {
          id: 'swap.swapScreen.priceImpact',
          defaultMessage: '!!!Price Impact',
        },
        priceImpactRiskHigh: {
          id: 'swap.swapScreen.priceImpactRiskHigh',
          defaultMessage: '!!!Price impact over {riskValue}%',
        },
        priceImpactHighDescription: {
          id: 'swap.swapScreen.priceImpactHighDescription',
          defaultMessage:
            '!!!may cause a significant loss of funds. Please bear this in mind and proceed with an extra caution.',
        },
        priceImpactModerateDescription: {
          id: 'swap.swapScreen.priceImpactModerateDescription',
          defaultMessage:
            '!!!may cause a difference in the amount you actually receive. Consider this at your own risk.',
        },
        priceImpactInfo: {
          id: 'swap.swapScreen.priceImpactInfo',
          defaultMessage:
            '!!!Price impact is a difference between the actual market price and your price due to trade size.',
        },
        warning: {
          id: 'components.txhistory.flawedwalletmodal.title',
          defaultMessage: '!!Warning',
        },
        backToSwapOrders: {
          id: 'swap.swapScreen.backToSwapOrders',
          defaultMessage: '!!!Back to swap orders',
        },
        failedTxScreenTitle: {
          id: 'swap.failedTxScreen.title',
          defaultMessage: '!!!Transaction failed',
        },
        failedTxScreenText: {
          id: 'swap.failedTxScreen.text',
          defaultMessage:
            '!!!Your transaction has not been processed properly due to technical issues.',
        },
        failedTxScreenButton: {
          id: 'swap.failedTxScreen.button',
          defaultMessage: '!!!Try again',
        },
        submittedTxScreenTitle: {
          id: 'swap.submittedTxScreen.title',
          defaultMessage: '!!!Transaction signed',
        },
        submittedTxScreenText: {
          id: 'swap.submittedTxScreen.text',
          defaultMessage: `!!!It will show up in the transaction list once it's confirmed by the network.`,
        },
        submittedTxScreenButton: {
          id: 'swap.submittedTxScreen.button',
          defaultMessage: '!!!Close',
        },
        from: {
          id: 'swap.swapScreen.from',
          defaultMessage: '!!!From',
        },
        to: {
          id: 'swap.swapScreen.to',
          defaultMessage: '!!!To',
        },
      }),

      staking: defineMessages({
        title: {
          id: 'components.pooltransition.title',
          defaultMessage: '!!!Upgrade your stake pool',
        },
        warning: {
          id: 'components.pooltransition.warning',
          defaultMessage:
            "!!!The current stake pool you're using will soon close. Migrate to the new EMURGO pool to sustain reward generation.",
        },
        finalWarning: {
          id: 'components.pooltransition.finalWarning',
          defaultMessage:
            "!!!The current stake pool you're using is decommissioned and NOT generating reward anymore. Update it to continue earning",
        },
        currentPool: {
          id: 'components.pooltransition.currentPool',
          defaultMessage: '!!!Current pool',
        },
        newPool: {
          id: 'components.pooltransition.newPool',
          defaultMessage: '!!!New pool',
        },
        estimatedRoa: {
          id: 'components.pooltransition.estimatedRoa',
          defaultMessage: '!!!Estimated ROA',
        },
        fee: {
          id: 'components.pooltransition.fee',
          defaultMessage: '!!!Fee',
        },
        poolGeneratesRewards: {
          id: 'components.pooltransition.poolGeneratesRewards',
          defaultMessage: '!!!This pool continues to generate staking rewards',
        },
        poolNoRewards: {
          id: 'components.pooltransition.poolNoRewards',
          defaultMessage:
            '!!!This pool is NOT generating staking rewards anymore',
        },
        poolWillStopRewards: {
          id: 'components.pooltransition.poolWillStopRewards',
          defaultMessage: '!!!This pool will stop generating rewards in',
        },
        skipNoRewards: {
          id: 'components.pooltransition.skipNoRewards',
          defaultMessage: '!!!Skip and stop receiving rewards',
        },
        updateKeepEarning: {
          id: 'components.pooltransition.updateKeepEarning',
          defaultMessage: '!!!Update now and keep earning',
        },
        update: {
          id: 'components.pooltransition.update',
          defaultMessage: '!!!Update pool',
        },
      }),

      reviewTx: defineMessages({
        adaDescription: {
          id: 'txReview.adaDescription',
          defaultMessage:
            "!!!ADA is Cardano's native cryptocurrency that can be used on the Cardano network to pay for transaction fees and earn rewards for helping to secure the blockchain network via staking.",
        },
        confirm: {
          id: 'txReview.confirm',
          defaultMessage: '!!!Confirm',
        },
        title: {
          id: 'txReview.title',
          defaultMessage: '!!!UTxOs',
        },
        utxosTab: {
          id: 'txReview.tabLabel.utxos',
          defaultMessage: '!!!UTxOs',
        },
        overviewTab: {
          id: 'txReview.tabLabel.overview',
          defaultMessage: '!!!Overview',
        },
        mintTab: {
          id: 'txReview.tabLabel.mint',
          defaultMessage: '!!!Mint',
        },
        referenceInputsTab: {
          id: 'txReview.tabLabel.referenceInputs',
          defaultMessage: '!!!Reference inputs',
        },
        metadataTab: {
          id: 'txReview.tabLabel.metadataTab',
          defaultMessage: '!!!Metadata',
        },
        metadataHash: {
          id: 'txReview.metadata.metadataHash',
          defaultMessage: '!!!Metadata hash',
        },
        metadataJsonLabel: {
          id: 'txReview.metadata.metadataJsonLabel',
          defaultMessage: '!!!Metadata',
        },
        walletLabel: {
          id: 'txReview.overview.wallet',
          defaultMessage: '!!!Wallet',
        },
        feeLabel: {
          id: 'txReview.fee',
          defaultMessage: '!!!Fee',
        },
        myWalletLabel: {
          id: 'txReview.overview.myWalletLabel',
          defaultMessage: '!!!Your Wallet',
        },
        sendLabel: {
          id: 'txReview.overview.sendLabel',
          defaultMessage: '!!!Send',
        },
        receiveToLabel: {
          id: 'txReview.overview.receiveToLabel',
          defaultMessage: '!!!To',
        },
        receiveToScriptLabel: {
          id: 'txReview.overview.receiveToScriptLabel',
          defaultMessage: '!!!To script',
        },
        utxosInputsLabel: {
          id: 'txReview.utxos.utxosInputsLabel',
          defaultMessage: '!!!Inputs',
        },
        utxosOutputsLabel: {
          id: 'txReview.utxos.utxosOutputsLabel',
          defaultMessage: '!!!Outputs',
        },
        utxosYourAddressLabel: {
          id: 'txReview.utxos.utxosYourAddressLabel',
          defaultMessage: '!!!Your address',
        },
        utxosForeignAddressLabel: {
          id: 'txReview.utxos.utxosForeignAddressLabel',
          defaultMessage: '!!!Foreign address',
        },
        overview: {
          id: 'txReview.tokenDetails.overViewTab.title',
          defaultMessage: '!!!Overview',
        },
        json: {
          id: 'txReview.tokenDetails.jsonTab.title',
          defaultMessage: '!!!JSON',
        },
        metadata: {
          id: 'txReview.tokenDetails.jsonTab.metadata',
          defaultMessage: '!!!Metadata',
        },
        policyId: {
          id: 'txReview.tokenDetails.policyId.label',
          defaultMessage: '!!!Policy ID',
        },
        poolId: {
          id: 'txReview.poolDetails.poolId.label',
          defaultMessage: '!!!Pool ID',
        },
        poolHash: {
          id: 'txReview.poolDetails.poolHash.label',
          defaultMessage: '!!!Hash',
        },
        poolSize: {
          id: 'txReview.poolDetails.poolSize.label',
          defaultMessage: '!!!Pool size',
        },
        poolRoa: {
          id: 'txReview.poolDetails.poolRoa.label',
          defaultMessage: '!!!ROA 30d',
        },
        poolShare: {
          id: 'txReview.poolDetails.poolShare.label',
          defaultMessage: '!!!Share',
        },
        poolSaturation: {
          id: 'txReview.poolDetails.poolSaturation.label',
          defaultMessage: '!!!Saturation',
        },
        poolTaxFix: {
          id: 'txReview.poolDetails.taxFix.label',
          defaultMessage: '!!!Tax fix',
        },
        poolTaxRatio: {
          id: 'txReview.poolDetails.taxRatio.label',
          defaultMessage: '!!!Tax ratio',
        },
        poolPledge: {
          id: 'txReview.poolDetails.pledge.label',
          defaultMessage: '!!!Pledge',
        },
        fingerprint: {
          id: 'txReview.tokenDetails.fingerprint.label',
          defaultMessage: '!!!Fingerprint',
        },
        name: {
          id: 'txReview.tokenDetails.overViewTab.name.label',
          defaultMessage: '!!!Name',
        },
        tokenSupply: {
          id: 'txReview.tokenDetails.overViewTab.tokenSupply.label',
          defaultMessage: '!!!Token Supply',
        },
        symbol: {
          id: 'txReview.tokenDetails.overViewTab.symbol.label',
          defaultMessage: '!!!Symbol',
        },
        description: {
          id: 'txReview.tokenDetails.overViewTab.description.label',
          defaultMessage: '!!!Description',
        },
        details: {
          id: 'txReview.tokenDetails.overViewTab.details.label',
          defaultMessage: '!!!Details on',
        },
        tokenDetailsTitle: {
          id: 'txReview.tokenDetails.title',
          defaultMessage: '!!!Asset Details',
        },
        walletBalanceTitle: {
          id: 'txReview.walletBalance.title',
          defaultMessage: '!!!Wallet balance',
        },
        walletBalanceTokensTitle: {
          id: 'txReview.walletBalanceTokens.title',
          defaultMessage: '!!!Tokens',
        },
        walletBalanceNFTsTitle: {
          id: 'txReview.walletBalanceNFTs.title',
          defaultMessage: '!!!NFTs',
        },
        poolDetailsTitle: {
          id: 'txReview.poolDetails.title',
          defaultMessage: '!!!Pool Details',
        },
        registerStakingKey: {
          id: 'txReview.operations.registerStakingKey',
          defaultMessage: '!!!Register staking key deposit',
        },
        drepRegistration: {
          id: 'txReview.operations.drepRegistration',
          defaultMessage: '!!!Register as a DRep deposit',
        },
        poolRegistration: {
          id: 'txReview.operations.poolRegistration',
          defaultMessage: '!!!Pool registration deposit',
        },
        poolRetirement: {
          id: 'txReview.operations.poolRetirement',
          defaultMessage: '!!!Pool retirement',
        },
        drepUpdate: {
          id: 'txReview.operations.drepUpdate',
          defaultMessage: '!!!Drep update',
        },
        drepDeregistration: {
          id: 'txReview.operations.drepDeregistration',
          defaultMessage: '!!!Deregister as a DRep',
        },
        deregisterStakingKey: {
          id: 'txReview.operations.deregisterStakingKey',
          defaultMessage: '!!!Deregister staking key',
        },
        moveInstantaneousRewards: {
          id: 'txReview.operations.moveInstantaneousRewards',
          defaultMessage: '!!!Move instantaneus rewards',
        },
        committeeHotAuthorization: {
          id: 'txReview.operations.committeeHotAuthorization',
          defaultMessage: '!!!Committee hot authorization',
        },
        committeeColdResign: {
          id: 'txReview.operations.committeeColdResign',
          defaultMessage: '!!!Committee cold resign',
        },
        rewardsWithdrawalLabel: {
          id: 'txReview.operations.rewardsWithdrawal.label',
          defaultMessage: '!!!Staking',
        },
        rewardsWithdrawalText: {
          id: 'txReview.operations.rewardsWithdrawal.text',
          defaultMessage: '!!!Rewards withdrawal',
        },
        selectAbstain: {
          id: 'txReview.operations.selectAbstain',
          defaultMessage: '!!!Select abstain',
        },
        operationsLogTitle: {
          id: 'txReview.operations.log.title',
          defaultMessage: '!!!Operations log',
        },
        operationsLogWarningTitle: {
          id: 'txReview.operations.warning.title',
          defaultMessage: '!!!Unusual operations detected',
        },
        operationsLogWarningText: {
          id: 'txReview.operations.warning.text',
          defaultMessage:
            '!!!Please check the operations log before confirming this transaction.',
        },
        selectNoConfidence: {
          id: 'txReview.operations.selectNoConfidence',
          defaultMessage: '!!!Select no confidence',
        },
        delegateVotingToDRep: {
          id: 'txReview.operations.delegateVotingToDRep',
          defaultMessage: '!!!Delegate voting to',
        },
        delegateVotingToDRepSpecified: {
          id: 'txReview.operations.delegateVotingToDRepSpecified',
          defaultMessage: '!!!Specified as',
        },
        delegateStake: {
          id: 'txReview.operations.delegateStake',
          defaultMessage: '!!!Stake entire wallet balance to',
        },
        submittedTxTitle: {
          id: 'txReview.submittedTxTitle',
          defaultMessage: '!!!Transaction submitted',
        },
        submittedTxText: {
          id: 'txReview.submittedTxText',
          defaultMessage:
            '!!!Check this transaction in the list of wallet transactions',
        },
        submittedTxButton: {
          id: 'txReview.submittedTxButton',
          defaultMessage: '!!!Go to transactions',
        },
        failedTxTitle: {
          id: 'txReview.failedTxTitle',
          defaultMessage: '!!!Transaction failed',
        },
        failedTxText: {
          id: 'txReview.failedTxText',
          defaultMessage:
            '!!!Your transaction has not been processed properly due to technical issues.',
        },
        failedTxButton: {
          id: 'txReview.failedTxButton',
          defaultMessage: '!!!Go to transactions',
        },
        infraestructureIssueTitle: {
          id: 'txReview.infraestructureIssueTitle',
          defaultMessage: '!!!Something unexpected happened',
        },
        infraestructureIssueText: {
          id: 'txReview.infraestructureIssueText',
          defaultMessage:
            '!!!Please go back and try again. If this keep happening, contact our support team.',
        },
        infraestructureIssueButton: {
          id: 'txReview.infraestructureIssueButton',
          defaultMessage: '!!!Go to transactions',
        },
        multiExternalPartiesSectionLabel: {
          id: 'txReview.overview.multiExternalPartiesSectionLabel',
          defaultMessage: '!!!Other parties',
        },
        multiExternalPartiesSectionNotice: {
          id: 'txReview.overview.multiExternalPartiesSectionNotice',
          defaultMessage:
            "!!!Here are displayed other parties that are involved into this transaction. They don't affect your wallet balance",
        },
        receiveLabel: {
          id: 'txReview.receiveLabel',
          defaultMessage: '!!!Receive',
        },
        operationsLabel: {
          id: 'txReview.operationsLabel',
          defaultMessage: '!!!Operations',
        },
        policyIdLabel: {
          id: 'txReview.policyIdLabel',
          defaultMessage: '!!!Policy ID',
        },
        createdBy: {
          id: 'txReview.createdBy',
          defaultMessage: '!!!Created by',
        },
        operationsNoticeText: {
          id: 'txReview.overview.operationsNoticeText',
          defaultMessage:
            '!!!You are about to interact with operations, which are key components used in governance and various blockchain activities. These include Cardano Governance Certificates, as outlined in CIP-0095, which facilitate governance transactions.',
        },
        operationsNoticeButton: {
          id: 'txReview.overview.operationsNoticeButton',
          defaultMessage: '!!!Ok',
        },
        operationsNoticeTitle: {
          id: 'txReview.overview.operationsNoticeTitle',
          defaultMessage: '!!!What are operations?',
        },
      }),

      portfolio: defineMessages({
        portfolio: {
          id: 'global.portfolio',
          defaultMessage: '!!!Portfolio',
        },
        totalWalletValue: {
          id: 'portfolio.portfolioDashboardScreen.totalWalletValue',
          defaultMessage: '!!!Total wallet value',
        },
        tokens: {
          id: 'portfolio.portfolioDashboardScreen.tokens',
          defaultMessage: '!!!Tokens ({countTokens})',
        },
        buyADATitle: {
          id: 'portfolio.portfolioDashboardScreen.buyADATitle',
          defaultMessage: '!!!Start your crypto journey',
        },
        buyADADescription: {
          id: 'portfolio.portfolioDashboardScreen.buyADADescription',
          defaultMessage:
            "!!!Get started with Cardano's native currency, ADA. It's your key to unlocking a world of possibilities",
        },
        buyCrypto: {
          id: 'rampOnOff.createRampOnOff.buyCrypto',
          defaultMessage: '!!!Buy ADA',
        },
        tradeTokens: {
          id: 'portfolio.portfolioDashboardScreen.tradeTokens',
          defaultMessage: '!!!Trade Tokens',
        },
        swap: {
          id: 'global.swap',
          defaultMessage: '!!!Swap',
        },
        nfts: {
          id: 'portfolio.portfolioDashboardScreen.nfts',
          defaultMessage: '!!!NFTs ({countNfts})',
        },
        totalPortfolioValue: {
          id: 'portfolio.portfolioDashboardScreen.totalPortfolioValue',
          defaultMessage: '!!!Total portfolio value',
        },
        totalPortfolioValueTooltip: {
          id: 'portfolio.portfolioDashboardScreen.totalPortfolioValueTooltip',
          defaultMessage: '!!!Funds in the wallet \nand associated DApps.',
        },
        tokenList: {
          id: 'portfolio.portfolioTokensListScreen.tokenList',
          defaultMessage: '!!!Token list',
        },
        walletToken: {
          id: 'portfolio.portfolioTokensListScreen.walletToken',
          defaultMessage: '!!!Wallet token',
        },
        dappsToken: {
          id: 'portfolio.portfolioTokensListScreen.dappsToken',
          defaultMessage: '!!!DApps token',
        },
        tokensAvailable: {
          id: 'portfolio.portfolioTokensListScreen.tokensAvailable',
          defaultMessage: '!!!{countTokens} token(s) available',
        },
        searchTokens: {
          id: 'portfolio.portfolioTokensListScreen.searchTokens',
          defaultMessage: '!!!Search tokens',
        },
        noTokensFound: {
          id: 'portfolio.portfolioTokensListScreen.noTokensFound',
          defaultMessage: '!!!No tokens found',
        },
        totalDAppValue: {
          id: 'portfolio.portfolioTokensListScreen.totalDAppsValue',
          defaultMessage: '!!!Total dapps value',
        },
        liquidityPool: {
          id: 'portfolio.portfolioTokensListScreen.liquidityPool',
          defaultMessage: '!!!Liquidity pool',
        },
        openOrders: {
          id: 'portfolio.portfolioTokensListScreen.openOrders',
          defaultMessage: '!!!Open orders',
        },
        lendAndBorrow: {
          id: 'portfolio.portfolioTokensListScreen.lendAndBorrow',
          defaultMessage: '!!!Lend & borrow',
        },
        tokenDetail: {
          id: 'portfolio.portfolioTokensDetailScreen.tokenDetail',
          defaultMessage: '!!!Token details',
        },
        availableSoon: {
          id: 'portfolio.portfolioTokensDetailScreen.availableSoon',
          defaultMessage: '!!!Available soon',
        },
        countLiquidityPoolsAvailable: {
          id: 'portfolio.portfolioTokensDetailScreen.countLiquidityPoolsAvailable',
          defaultMessage:
            '!!!{countLiquidityPools} liquidity pool(s) available',
        },
        countOpenOrders: {
          id: 'portfolio.portfolioTokensDetailScreen.countOpenOrders',
          defaultMessage: '!!!{countOpenOrders} open order(s)',
        },
        noDataFound: {
          id: 'portfolio.portfolioTokensListScreen.noDataFound',
          defaultMessage: '!!!No Data Found',
        },
        value: {
          id: 'portfolio.portfolioTokensListScreen.value',
          defaultMessage: '!!!Value',
        },
        dex: {
          id: 'portfolio.portfolioTokensListScreen.dex',
          defaultMessage: '!!!DEX',
        },
        lp: {
          id: 'portfolio.portfolioTokensListScreen.lp',
          defaultMessage: '!!!LP',
        },
        totalWalletValueTooltip: {
          id: 'portfolio.portfolioTokensListScreen.totalWalletValueTooltip',
          defaultMessage:
            '!!!% Balance performance \n+/- Balance change \nin 24 hours',
        },
        totalDAppsValueTooltip: {
          id: 'portfolio.portfolioTokensListScreen.totalDAppsValueTooltip',
          defaultMessage:
            '!!!% Performance \n+/- Balance change \nin 24 hours (DApps)',
        },
        total: {
          id: 'components.governance.total',
          defaultMessage: '!!!Total',
        },
        assetPrice: {
          id: 'swap.listOrders.sheet.assetPrice',
          defaultMessage: '!!!Asset price',
        },
        assetAmount: {
          id: 'swap.listOrders.sheet.assetAmount',
          defaultMessage: '!!!Asset amount',
        },
        txId: {
          id: 'swap.listOrders.txId',
          defaultMessage: '!!!Transaction ID',
        },
        performance: {
          id: 'portfolio.portfolioTokensDetailScreen.performance',
          defaultMessage: '!!!Performance',
        },
        overview: {
          id: 'portfolio.portfolioTokensDetailScreen.overview',
          defaultMessage: '!!!Overview',
        },
        transactions: {
          id: 'portfolio.portfolioTokensDetailScreen.transactions',
          defaultMessage: '!!!Transactions',
        },
        tokenPriceChangeTooltip: {
          id: 'portfolio.portfolioTokensDetailScreen.tokenPriceChangeTooltip',
          defaultMessage: '!!!Token price change \nin {timeInterval}',
        },
        _24_hours: {
          id: 'portfolio.portfolioTokensDetailScreen.24_hours',
          defaultMessage: '!!!24 hours',
        },
        _1_week: {
          id: 'portfolio.portfolioTokensDetailScreen.1_week',
          defaultMessage: '!!!1 week',
        },
        _1_month: {
          id: 'portfolio.portfolioTokensDetailScreen.1_month',
          defaultMessage: '!!!1 month',
        },
        _6_months: {
          id: 'portfolio.portfolioTokensDetailScreen.6_months',
          defaultMessage: '!!!6 months',
        },
        _1_year: {
          id: 'portfolio.portfolioTokensDetailScreen.1_year',
          defaultMessage: '!!!1 year',
        },
        all_time: {
          id: 'portfolio.portfolioTokensDetailScreen.all_time',
          defaultMessage: '!!!all time',
        },
        netInvested: {
          id: 'portfolio.portfolioTokensDetailScreen.netInvested',
          defaultMessage: '!!!Net Invested',
        },
        bought: {
          id: 'portfolio.portfolioTokensDetailScreen.bought',
          defaultMessage: '!!!Bought',
        },
        received: {
          id: 'portfolio.portfolioTokensDetailScreen.received',
          defaultMessage: '!!!Received',
        },
        sent: {
          id: 'portfolio.portfolioTokensDetailScreen.sent',
          defaultMessage: '!!!Sent',
        },
        send: {
          id: 'portfolio.portfolioTokensDetailScreen.send',
          defaultMessage: '!!!Send',
        },
        sold: {
          id: 'portfolio.portfolioTokensDetailScreen.sold',
          defaultMessage: '!!!Sold',
        },
        failed: {
          id: 'portfolio.portfolioTokensDetailScreen.failed',
          defaultMessage: '!!!Failed',
        },
        stakeDelegated: {
          id: 'portfolio.portfolioTokensDetailScreen.stakeDelegated',
          defaultMessage: '!!!Stake Delegated',
        },
        stakingReward: {
          id: 'portfolio.portfolioTokensDetailScreen.stakingReward',
          defaultMessage: '!!!Staking Reward',
        },
        unknown: {
          id: 'portfolio.portfolioTokensDetailScreen.unknown',
          defaultMessage: '!!!Unknown',
        },
        assets: {
          id: 'portfolio.portfolioTokensDetailScreen.assets',
          defaultMessage: '!!!assets',
        },
        marketData: {
          id: 'portfolio.portfolioTokensDetailScreen.marketData',
          defaultMessage: '!!!Market data',
        },
        tokenPriceChange: {
          id: 'portfolio.portfolioTokensDetailScreen.tokenPriceChange',
          defaultMessage: '!!!Token price change',
        },
        tokenPrice: {
          id: 'portfolio.portfolioTokensDetailScreen.tokenPrice',
          defaultMessage: '!!!Token price ',
        },
        marketCap: {
          id: 'portfolio.portfolioTokensDetailScreen.marketCap',
          defaultMessage: '!!!Market cap ',
        },
        _24hVolume: {
          id: 'portfolio.portfolioTokensDetailScreen._24hVolume',
          defaultMessage: '!!!24h volume',
        },
        rank: {
          id: 'portfolio.portfolioTokensDetailScreen.rank',
          defaultMessage: '!!!Rank',
        },
        circulating: {
          id: 'portfolio.portfolioTokensDetailScreen.circulating',
          defaultMessage: '!!!Circulating',
        },
        totalSupply: {
          id: 'portfolio.portfolioTokensDetailScreen.totalSupply',
          defaultMessage: '!!!Total supply',
        },
        maxSupply: {
          id: 'portfolio.portfolioTokensDetailScreen.maxSupply',
          defaultMessage: '!!!Max supply',
        },
        allTimeHigh: {
          id: 'portfolio.portfolioTokensDetailScreen.allTimeHigh',
          defaultMessage: '!!!All time high',
        },
        allTimeLow: {
          id: 'portfolio.portfolioTokensDetailScreen.allTimeLow',
          defaultMessage: '!!!All time low',
        },
        info: {
          id: 'portfolio.portfolioTokensDetailScreen.info',
          defaultMessage: '!!!Info',
        },
        website: {
          id: 'portfolio.portfolioTokensDetailScreen.website',
          defaultMessage: '!!!Website',
        },
        policyID: {
          id: 'portfolio.portfolioTokensDetailScreen.policyID',
          defaultMessage: '!!!Policy ID',
        },
        fingerprint: {
          id: 'portfolio.portfolioTokensDetailScreen.fingerprint',
          defaultMessage: '!!!Fingerprint',
        },
        news: {
          id: 'portfolio.portfolioTokensDetailScreen.news',
          defaultMessage: '!!!News',
        },
        detailsOn: {
          id: 'portfolio.portfolioTokensDetailScreen.detailsOn',
          defaultMessage: '!!!Details on',
        },
        portfolioSwapTokensTitle: {
          id: 'portfolio.portfolioDashboardScreen.portfolioSwapTokensTitle',
          defaultMessage: '!!!Trade Tokens. Explore Possibilities',
        },
        portfolioSwapTokensDescription: {
          id: 'portfolio.portfolioDashboardScreen.portfolioSwapTokensDescription',
          defaultMessage:
            '!!!Swap tokens seamlessly within Yoroi. Access new investment opportunities and explore DeFi',
        },
        startSwapping: {
          id: 'portfolio.portfolioDashboardScreen.startSwapping',
          defaultMessage: '!!!Start Swapping',
        },
        titleMediaDetails: {
          id: 'nft.detail.title',
          defaultMessage: '!!!NFT Details',
        },
        nftCount: {
          id: 'nft.gallery.nftCount',
          defaultMessage: '!!!NFT count',
        },
        errorTitle: {
          id: 'nft.gallery.errorTitle',
          defaultMessage: '!!!Oops!',
        },
        errorDescription: {
          id: 'nft.gallery.errorDescription',
          defaultMessage: '!!!Something went wrong.',
        },
        reloadApp: {
          id: 'nft.gallery.reloadApp',
          defaultMessage: '!!!Try to restart the app.',
        },
        noNftsFound: {
          id: 'nft.gallery.noNftsFound',
          defaultMessage: '!!!No NFTs found',
        },
        noNftsInWallet: {
          id: 'nft.gallery.noNftsInWallet',
          defaultMessage: '!!!No NFTs added to your wallet yet',
        },
        detail: {
          title: {
            id: 'nft.detail.title',
            defaultMessage: '!!!NFT Details',
          },
          overview: {
            id: 'nft.detail.overview',
            defaultMessage: '!!!Overview',
          },
          metadata: {
            id: 'nft.detail.metadata',
            defaultMessage: '!!!Metadata',
          },
          nftName: {
            id: 'nft.detail.nftName',
            defaultMessage: '!!!NFT Name',
          },
          createdAt: {
            id: 'nft.detail.createdAt',
            defaultMessage: '!!!Created',
          },
          description: {
            id: 'nft.detail.description',
            defaultMessage: '!!!Description',
          },
          author: {
            id: 'nft.detail.author',
            defaultMessage: '!!!Author',
          },
          fingerprint: {
            id: 'nft.detail.fingerprint',
            defaultMessage: '!!!Fingerprint',
          },
          policyId: {
            id: 'nft.detail.policyId',
            defaultMessage: '!!!Policy id',
          },
          detailsLinks: {
            id: 'nft.detail.detailsLinks',
            defaultMessage: '!!!Details on',
          },
          copyMetadata: {
            id: 'nft.detail.copyMetadata',
            defaultMessage: '!!!Copy metadata',
          },
        },
        title: {
          id: 'nft.navigation.title',
          defaultMessage: '!!!NFT Gallery',
        },
        search: {
          id: 'nft.navigation.search',
          defaultMessage: '!!!Search NFT',
        },
      }),

      discover: defineMessages({
        confirmTx: {
          id: 'global.confirmationTransaction',
          defaultMessage: '!!!Confirm transaction',
        },
        discoverTitle: {
          id: 'discover.discoverList.discoverTitle',
          defaultMessage: '!!!Discover Cardano',
        },
        searchDApps: {
          id: 'discover.discoverList.searchDApps',
          defaultMessage: '!!!Search DApps',
        },
        welcomeToYoroiDAppExplorer: {
          id: 'discover.discoverList.welcomeToYoroiDAppExplorer',
          defaultMessage: '!!!Welcome to Yoroi DApp Explorer',
        },
        welcomeToYoroiDAppExplorerDescription: {
          id: 'discover.discoverList.welcomeToYoroiDAppExplorerDescription',
          defaultMessage:
            '!!!Discover, inspect, and connect to Cardano decentralized applications (DApps) with ease. Our solution helps to interact with DApps and their smart contracts, seamlessly enhancing your Cardano experience',
        },
        next: {
          id: 'global.next',
          defaultMessage: '!!!Next',
        },
        totalDAppAvailable: {
          id: 'discover.discoverList.dAppAvailable',
          defaultMessage: '!!!{count} DApp(s) available',
        },
        dAppConnected: {
          id: 'discover.discoverList.dAppConnected',
          defaultMessage: '!!!{count} DApp(s) connected',
        },
        connected: {
          id: 'discover.discoverList.connected',
          defaultMessage: '!!!Authorized',
        },
        singleAddress: {
          id: 'discover.discoverList.singleAddress',
          defaultMessage: '!!!Single address',
        },
        recommended: {
          id: 'discover.discoverList.recommended',
          defaultMessage: '!!!Recommended',
        },
        done: {
          id: 'discover.discoverList.done',
          defaultMessage: '!!!DONE',
        },
        openDApp: {
          id: 'discover.discoverList.openDApp',
          defaultMessage: '!!!Open DApp',
        },
        disconnectWalletFromDApp: {
          id: 'discover.discoverList.disconnectWalletFromDApp',
          defaultMessage: '!!!Disconnect DApp',
        },
        dAppActions: {
          id: 'discover.discoverList.dAppActions',
          defaultMessage: '!!!DApp actions',
        },
        confirmConnectionModalTitle: {
          id: 'discover.confirmConnectionModal.title',
          defaultMessage: '!!!Confirm connection',
        },
        confirmConnectionModalConnectTo: {
          id: 'discover.confirmConnectionModal.connectTo',
          defaultMessage: '!!!Connect to',
        },
        confirmConnectionModalConnect: {
          id: 'discover.confirmConnectionModal.connect',
          defaultMessage: '!!!Connect',
        },
        confirmConnectionModalAllowThisDAppTo: {
          id: 'discover.confirmConnectionModal.allowThisDAppTo',
          defaultMessage: '!!!Allow this DApp to:',
        },
        confirmConnectionModalPermission1: {
          id: 'discover.confirmConnectionModal.permission1',
          defaultMessage: '!!!View addresses, account balance, activity',
        },
        singleAddressWarning: {
          id: 'discover.confirmConnectionModal.singleAddressWarning',
          defaultMessage:
            '!!!This DApp supports only single-address wallets. Your wallet balance might be displayed incorrectly.',
        },
        confirmConnectionModalPermission2: {
          id: 'discover.confirmConnectionModal.permission2',
          defaultMessage: '!!!Request approval for transactions',
        },
        understand: {
          id: 'discover.unverifiedDappModal.understand',
          defaultMessage: '!!!I understand',
        },
        disclaimerModalText: {
          id: 'discover.unverifiedDappModal.disclaimerModalText',
          defaultMessage:
            '!!!You are accessing a third-party Cardano application that is not verified by EMURGO, the developers of Yoroi Wallet, or any of its affiliated divisions. Make sure this DApp is reliable to stay safe from malicious apps in a sustainable way.',
        },
        disclaimerModalTitle: {
          id: 'discover.unverifiedDappModal.disclaimerModalTitle',
          defaultMessage: '!!!Disclaimer',
        },
        disconnectDApp: {
          id: 'discover.confirmDisconnectDApp.disconnectDApp',
          defaultMessage: '!!!Disconnect DApp',
        },
        confirmDisconnectDAppDescription: {
          id: 'discover.confirmDisconnectDApp.confirmDisconnectDAppDescription',
          defaultMessage: '!!!Are you sure you want to disconnect this DApp?',
        },
        cancel: {
          id: 'global.actions.dialogs.commonbuttons.cancelButton',
          defaultMessage: '!!!Cancel',
        },
        confirm: {
          id: 'global.actions.dialogs.commonbuttons.confirmButton',
          defaultMessage: '!!!Confirm',
        },
        signDataNotSupported: {
          id: 'discover.ledger.signDataNotSupported',
          defaultMessage:
            '!!!The Ledger Cardano app does not support data signing at this moment.',
        },
        transactionReview: {
          id: 'discover.reviewTransaction.transactionReview',
          defaultMessage: '!!!Transaction review',
        },
        inputs: {
          id: 'discover.reviewTransaction.inputs',
          defaultMessage: '!!!Inputs',
        },
        outputs: {
          id: 'discover.reviewTransaction.outputs',
          defaultMessage: '!!!Outputs',
        },
        transactionIdCopied: {
          id: 'discover.reviewTransaction.transactionIdCopied',
          defaultMessage: '!!!Transaction ID copied',
        },
        addressCopied: {
          id: 'discover.reviewTransaction.addressCopied',
          defaultMessage: '!!!Address copied',
        },
        yourAddress: {
          id: 'discover.reviewTransaction.yourAddress',
          defaultMessage: '!!!Your address',
        },
        externalAddress: {
          id: 'discover.reviewTransaction.externalAddress',
          defaultMessage: '!!!Foreign address',
        },
        fee: {
          id: 'discover.reviewTransaction.fee',
          defaultMessage: '!!!Transaction fee',
        },
        signData: {
          id: 'discover.reviewTransaction.signData',
          defaultMessage: '!!!Sign data',
        },
        signMessage: {
          id: 'discover.reviewTransaction.signMessage',
          defaultMessage: '!!!Sign message',
        },
        testnetWarningTitle: {
          id: 'discover.testnetWarning.title',
          defaultMessage: '!!!Testnet DApps 🚧',
        },
        testnetWarningDescription: {
          id: 'discover.testnetWarning.description',
          defaultMessage:
            '!!!This is a list of DApps designed for testnet use. Note that it may be limited, as not all DApps are deployed in the testnet environment.',
        },
        filterChildOptionsNews: {
          id: 'discover.filterOptions.child.news',
          defaultMessage: '!!!News',
        },
        filterChildOptionsEntertainment: {
          id: 'discover.filterOptions.child.entertainment',
          defaultMessage: '!!!Entertainment',
        },
        filterChildOptionsDeFi: {
          id: 'discover.filterOptions.child.defi',
          defaultMessage: '!!!DeFi',
        },
        filterChildOptionsDEX: {
          id: 'discover.filterOptions.child.dex',
          defaultMessage: '!!!DEX',
        },
        filterChildOptionsNFTMarketplace: {
          id: 'discover.filterOptions.child.nftmarketplace',
          defaultMessage: '!!!NFT Marketplace',
        },
        filterChildOptionsStablecoin: {
          id: 'discover.filterOptions.child.stablecoin',
          defaultMessage: '!!!Stablecoin',
        },
        filterChildOptionsTradingTools: {
          id: 'discover.filterOptions.child.tradingtools',
          defaultMessage: '!!!Trading Tools',
        },
        filterChildOptionsDAO: {
          id: 'discover.filterOptions.child.dao',
          defaultMessage: '!!!DAO',
        },
        filterChildOptionsDecentralisedStorage: {
          id: 'discover.filterOptions.child.decentralisedstorage',
          defaultMessage: '!!!Decentralised Storage',
        },
        filterParentOptionsMedia: {
          id: 'discover.filterOptions.parent.media',
          defaultMessage: '!!!Media',
        },
        filterParentOptionsInvestment: {
          id: 'discover.filterOptions.parent.investment',
          defaultMessage: '!!!Investment',
        },
        filterParentOptionsNFT: {
          id: 'discover.filterOptions.parent.nft',
          defaultMessage: '!!!NFT',
        },
        filterParentOptionsTrading: {
          id: 'discover.filterOptions.parent.trading',
          defaultMessage: '!!!Trading',
        },
        filterParentOptionsCommunity: {
          id: 'discover.filterOptions.parent.community',
          defaultMessage: '!!!Community',
        },
        disconnectWarning: {
          id: 'discover.modal.disconnectWarning',
          defaultMessage:
            '!!!Even if you disconnected Yoroi from the DApp, Yoroi is still authorized. If you want to remove such authorization, please click Disconnect DApp.',
        },
        collateralNotFoundText: {
          id: 'discover.modal.collateralNotFoundText',
          defaultMessage:
            '!!!To continue with this action, you need to generate a collateral',
        },
        collateralNotFoundTitle: {
          id: 'discover.modal.collateralNotFoundTitle',
          defaultMessage: '!!!Collateral not found',
        },
        collateralNotFoundActionText: {
          id: 'discover.modal.collateralNotFoundActionText',
          defaultMessage: '!!!Generate',
        },
        collateralTxPendingTitle: {
          id: 'discover.modal.collateralTxPendingTitle',
          defaultMessage: '!!!Pending Collateral Transaction',
        },
        collateralTxPendingText: {
          id: 'discover.modal.collateralTxPendingText',
          defaultMessage:
            "!!!The collateral transaction you've submitted is being processed and may take a few minutes to confirm.  Please wait for it to show in your transaction history and try again.",
        },
      }),
    }),
  }),
}
