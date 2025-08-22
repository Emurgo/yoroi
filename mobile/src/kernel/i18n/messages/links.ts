import {defineMessages} from 'react-intl'

export const linksMessages = defineMessages({
  trustedPaymentRequestedTitle: {
    id: 'links.untrusted.paymentRequested.title',
    defaultMessage: '!!!Trusted Payment Requested',
  },
  trustedPaymentRequestedDescription: {
    id: 'links.trusted.paymentRequested.description',
    defaultMessage: '!!!A trusted dApp is requesting a payment',
  },
  untrustedPaymentRequestedTitle: {
    id: 'links.untrusted.paymentRequested.title',
    defaultMessage: '!!!Untrusted Payment Requested',
  },
  untrustedPaymentRequestedDescription: {
    id: 'links.untrusted.paymentRequested.description',
    defaultMessage: '!!!An untrusted dApp is requesting a payment',
  },
  trustedBrowserLaunchDappUrlTitle: {
    id: 'links.trusted.browserLaunchDappUrl.title',
    defaultMessage: '!!!Trusted Browser Launch',
  },
  trustedBrowserLaunchDappUrlDescription: {
    id: 'txReview.overview.receiveToLabel',
    defaultMessage: '!!!A trusted dApp wants to open a URL',
  },
  untrustedBrowserLaunchDappUrlTitle: {
    id: 'links.untrusted.browserLaunchDappUrl.title',
    defaultMessage: '!!!Untrusted Browser Launch',
  },
  untrustedBrowserLaunchDappUrlDescription: {
    id: 'txReview.overview.receiveToLabel',
    defaultMessage: '!!!An untrusted dApp wants to open a URL',
  },
  askToOpenAWalletTitle: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.restoreDuplicatedWalletModalButton',
    defaultMessage: '!!!Open Wallet',
  },
  askToOpenAWalletDescription: {
    id: 'txReview.overview.wallet',
    defaultMessage: '!!!A dApp wants to open a wallet',
  },
  askToRedirectTitle: {
    id: 'global.buyInfo',
    defaultMessage: '!!!Redirect',
  },
  askToRedirectDescription: {
    id: 'txReview.overview.receiveToLabel',
    defaultMessage: '!!!A dApp wants to redirect',
  },
})
