import {defineMessages, useIntl} from 'react-intl'

import globalMessages, {confirmationMessages} from '../../i18n/global-messages'

export const useStrings = () => {
  const intl = useIntl()

  return {
    balanceAfterNotAvailable: intl.formatMessage(messages.balanceAfterNotAvailable),
    balanceAfterLabel: intl.formatMessage(messages.balanceAfterLabel),
    feeNotAvailable: intl.formatMessage(messages.feeNotAvailable),
    feeLabel: intl.formatMessage(messages.feeLabel),
    addressInputLabel: intl.formatMessage(messages.addressInputLabel),
    asset: intl.formatMessage(messages.asset),
    checkboxSendAllAssets: intl.formatMessage(messages.checkboxSendAllAssets),
    checkboxSendAll: (options) => intl.formatMessage(messages.checkboxSendAll, options),
    continueButton: intl.formatMessage(messages.continueButton),
    errorBannerNetworkError: intl.formatMessage(messages.errorBannerNetworkError),
    errorBannerPendingOutgoingTransaction: intl.formatMessage(messages.errorBannerPendingOutgoingTransaction),
    availableFunds: intl.formatMessage(globalMessages.availableFunds),
    availableFundsBannerIsFetching: intl.formatMessage(messages.availableFundsBannerIsFetching),
    availableFundsBannerNotAvailable: intl.formatMessage(messages.availableFundsBannerNotAvailable),
    sendAllWarningAlert1: (options) => intl.formatMessage(messages.sendAllWarningAlert1, options),
    sendAllWarningAlert2: intl.formatMessage(messages.sendAllWarningAlert2),
    sendAllWarningAlert3: intl.formatMessage(messages.sendAllWarningAlert3),
    sendAllWarningTitle: intl.formatMessage(messages.sendAllWarningTitle),
    backButton: intl.formatMessage(confirmationMessages.commonButtons.backButton),
    sendAllContinueButton: intl.formatMessage(confirmationMessages.commonButtons.continueButton),
    sendAllWarningText: intl.formatMessage(messages.sendAllWarningText),
  }
}

export const amountInputErrorMessages = defineMessages({
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
    defaultMessage: '!!!!Maximum value of a token inside a UTXO exceeded (overflow).',
  },
})

export const messages = defineMessages({
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
  addressInputErrorInvalidAddress: {
    id: 'components.send.sendscreen.addressInputErrorInvalidAddress',
    defaultMessage: '!!!Please enter valid address',
  },
  addressInputLabel: {
    id: 'components.send.confirmscreen.receiver',
    defaultMessage: '!!!Address',
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
    defaultMessage: '!!!All you {assetNameOrId} balance will be transferred in this transaction.',
  },
  sendAllWarningAlert2: {
    id: 'components.send.sendscreen.sendAllWarningAlert2',
    defaultMessage:
      '!!!All your tokens, including NFTs and any other native ' +
      'assets in your wallet, will also be transferred in this transaction.',
  },
  sendAllWarningAlert3: {
    id: 'components.send.sendscreen.sendAllWarningAlert3',
    defaultMessage: '!!!After you confirm the transaction in the next screen, your wallet will be emptied.',
  },
  continueButton: {
    id: 'components.send.sendscreen.continueButton',
    defaultMessage: '!!!Continue',
  },
  errorBannerNetworkError: {
    id: 'components.send.sendscreen.errorBannerNetworkError',
    defaultMessage: '!!!We are experiencing issues with fetching your current balance. Click to retry.',
  },
  errorBannerPendingOutgoingTransaction: {
    id: 'components.send.sendscreen.errorBannerPendingOutgoingTransaction',
    defaultMessage: '!!!You cannot send a new transaction while an existing one is still pending',
  },
  asset: {
    id: 'global.assets.assetLabel',
    defaultMessage: '!!!Asset',
  },
})
