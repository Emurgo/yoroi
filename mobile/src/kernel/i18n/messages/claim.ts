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
    id: 'components.initialization.acepttermsofservicescreen.continueButton',
    defaultMessage: '!!!Claim Accepted',
  },
  acceptedMessage: {
    id: 'components.initialization.acepttermsofservicescreen.continueButton',
    defaultMessage: '!!!Your claim has been accepted',
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
    id: 'global.actions.dialogs.commonbuttons.completeButton',
    defaultMessage: '!!!Your claim has been completed',
  },
  addressSharingWarning: {
    id: 'components.send.sendscreen.addressInputLabel',
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
    id: 'global.actions.dialogs.apiError.title',
    defaultMessage: '!!!API Error',
  },
  apiErrorInvalidRequest: {
    id: 'claim.apiError.invalidRequest',
    defaultMessage: '!!!Invalid request',
  },
  apiErrorNotFound: {
    id: 'components.walletinit.createwallet.createwalletscreen.notFound',
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
    id: 'txReview.overview.receiveToLabel',
    defaultMessage: '!!!Too early',
  },
  apiErrorRateLimited: {
    id: 'swap.swapScreen.limitButton',
    defaultMessage: '!!!Rate limited',
  },
  continue: {
    id: 'global.continue',
    defaultMessage: '!!!Continue',
  },
})
