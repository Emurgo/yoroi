import {defineMessages} from 'react-intl'

export const claimMessages = defineMessages({
  askConfirmationTitle: {
    id: 'claim.askConfirmation.title',
    defaultMessage: '!!!Confirm Claim',
  },
  showSuccessTitle: {
    id: 'claim.showSuccess.title',
    defaultMessage: '!!!Claim Successful',
  },
  acceptedTitle: {
    id: 'claim.accepted.title',
    defaultMessage: '!!!Claim accepted 👍',
  },
  acceptedMessage: {
    id: 'claim.accepted.message',
    defaultMessage:
      '!!!Claim has been accepted, you will receive your asset(s) soon, please scan the code again to check the status',
  },
  processingTitle: {
    id: 'claim.processing.title',
    defaultMessage: '!!!Processing Claim',
  },
  processingMessage: {
    id: 'claim.processing.message',
    defaultMessage: '!!!Your claim is being processed',
  },
  doneTitle: {
    id: 'claim.done.title',
    defaultMessage: '!!!Claim Complete',
  },
  doneMessage: {
    id: 'claim.done.message',
    defaultMessage:
      '!!!Claim was completed, you should have received your asset(s), you can verify the transaction on the chain explorer',
  },
  addressSharingWarning: {
    id: 'claim.addressSharingWarning',
    defaultMessage:
      '!!!You will be sharing with the domain listed here your address',
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
    defaultMessage: '!!!The claim failed',
  },
  apiErrorInvalidRequest: {
    id: 'claim.apiError.invalidRequest',
    defaultMessage: '!!!Invalid request',
  },
  apiErrorNotFound: {
    id: 'claim.apiError.notFound',
    defaultMessage: '!!!The claim could not be found',
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
    defaultMessage: "!!!This claim hasn't started yet, please try again later",
  },
  apiErrorRateLimited: {
    id: 'claim.apiError.rateLimited',
    defaultMessage: '!!!Too many claims happening, wait a bit and try again',
  },
  continue: {
    id: 'global.continue',
    defaultMessage: '!!!Continue',
  },
})
