import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import globalMessages from '../../../i18n/global-messages'

export const useStrings = () => {
  const intl = useIntl()

  return React.useRef({
    trustedPaymentRequestedTitle: intl.formatMessage(messages.trustedPaymentRequestedTitle),
    trustedPaymentRequestedDescription: intl.formatMessage(messages.trustedPaymentRequestedDescription),
    untrustedPaymentRequestedTitle: intl.formatMessage(messages.untrustedPaymentRequestedTitle),
    untrustedPaymentRequestedDescription: intl.formatMessage(messages.untrustedPaymentRequestedDescription),

    askToOpenAWalletTitle: intl.formatMessage(messages.askToOpenAWalletTitle),
    askToOpenAWalletDescription: intl.formatMessage(messages.askToOpenAWalletDescription),
    askToRedirectTitle: intl.formatMessage(messages.askToRedirectTitle),
    askToRedirectDescription: intl.formatMessage(messages.askToRedirectDescription),

    unknown: intl.formatMessage(globalMessages.unknown),
    disclaimer: intl.formatMessage(globalMessages.disclaimer),

    ok: intl.formatMessage(globalMessages.ok),
    cancel: intl.formatMessage(globalMessages.cancel),
    continue: intl.formatMessage(globalMessages.continue),
  } as const).current
}

export const messages = Object.freeze(
  defineMessages({
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
  }),
)
