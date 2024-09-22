import {defineMessages, useIntl} from 'react-intl'

import {txLabels} from '../../../../kernel/i18n/global-messages'

export const useStrings = () => {
  const intl = useIntl()

  return {
    signTransaction: intl.formatMessage(txLabels.signingTx),
    confirm: intl.formatMessage(messages.confirm),
    title: intl.formatMessage(messages.title),
    utxosTab: intl.formatMessage(messages.utxosTab),
    overviewTab: intl.formatMessage(messages.overviewTab),
    walletLabel: intl.formatMessage(messages.walletLabel),
    feeLabel: intl.formatMessage(messages.feeLabel),
    myWalletLabel: intl.formatMessage(messages.myWalletLabel),
    sendLabel: intl.formatMessage(messages.sendLabel),
    receiveToLabel: intl.formatMessage(messages.receiveToLabel),
    receiveToScriptLabel: intl.formatMessage(messages.receiveToScriptLabel),
    utxosInputsLabel: intl.formatMessage(messages.utxosInputsLabel),
    utxosOutputsLabel: intl.formatMessage(messages.utxosOutputsLabel),
    utxosYourAddressLabel: intl.formatMessage(messages.utxosYourAddressLabel),
    utxosForeignAddressLabel: intl.formatMessage(messages.utxosForeignAddressLabel),
  }
}

const messages = defineMessages({
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
    defaultMessage: '!!!receiveToLabel',
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
})
