import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import globalMessages, {txLabels} from '../../../i18n/global-messages'

export const useStrings = () => {
  const intl = useIntl()

  return React.useRef({
    askConfirmationTitle: intl.formatMessage(messages.askConfirmationTitle),
    showSuccessTitle: intl.formatMessage(messages.showSuccessTitle),

    acceptedTitle: intl.formatMessage(messages.acceptedTitle),
    acceptedMesage: intl.formatMessage(messages.acceptedMessage),
    processingTitle: intl.formatMessage(messages.processingTitle),
    processingMessage: intl.formatMessage(messages.processingMessage),
    doneTitle: intl.formatMessage(messages.doneTitle),
    doneMessage: intl.formatMessage(messages.doneMessage),
    transactionId: intl.formatMessage(txLabels.txId),

    addressSharingWarning: intl.formatMessage(messages.addressSharingWarning),
    domain: intl.formatMessage(messages.domain),
    code: intl.formatMessage(messages.code),

    apiErrorTitle: intl.formatMessage(messages.apiErrorTitle),
    apiErrorInvalidRequest: intl.formatMessage(messages.apiErrorInvalidRequest),
    apiErrorNotFound: intl.formatMessage(messages.apiErrorNotFound),
    apiErrorAlreadyClaimed: intl.formatMessage(messages.apiErrorAlreadyClaimed),
    apiErrorExpired: intl.formatMessage(messages.apiErrorExpired),
    apiErrorTooEarly: intl.formatMessage(messages.apiErrorTooEarly),
    apiErrorRateLimited: intl.formatMessage(messages.apiErrorRateLimited),

    ok: intl.formatMessage(globalMessages.ok),
    cancel: intl.formatMessage(globalMessages.cancel),
    continue: intl.formatMessage(messages.continue),
  } as const).current
}

export const messages = Object.freeze(
  defineMessages({
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
)
