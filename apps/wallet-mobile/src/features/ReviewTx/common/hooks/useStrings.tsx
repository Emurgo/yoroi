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
    metadataTab: intl.formatMessage(messages.metadataTab),
    metadataHash: intl.formatMessage(messages.metadataHash),
    metadataJsonLabel: intl.formatMessage(messages.metadataJsonLabel),
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
    overview: intl.formatMessage(messages.overview),
    json: intl.formatMessage(messages.json),
    metadata: intl.formatMessage(messages.metadata),
    policyId: intl.formatMessage(messages.policyId),
    fingerprint: intl.formatMessage(messages.fingerprint),
    name: intl.formatMessage(messages.name),
    tokenSupply: intl.formatMessage(messages.tokenSupply),
    symbol: intl.formatMessage(messages.symbol),
    description: intl.formatMessage(messages.description),
    details: intl.formatMessage(messages.details),
    tokenDetailsTitle: intl.formatMessage(messages.tokenDetailsTitle),
    registerStakingKey: intl.formatMessage(messages.registerStakingKey),
    selectAbstain: intl.formatMessage(messages.selectAbstain),
    selectNoConfidence: intl.formatMessage(messages.selectNoConfidence),
    delegateVotingToDRep: intl.formatMessage(messages.delegateVotingToDRep),
    delegateStake: intl.formatMessage(messages.delegateStake),
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
  registerStakingKey: {
    id: 'txReview.operations.registerStakingKey',
    defaultMessage: '!!!Register staking key deposit',
  },
  selectAbstain: {
    id: 'txReview.operations.selectAbstain',
    defaultMessage: '!!!Select abstain',
  },
  selectNoConfidence: {
    id: 'txReview.operations.selectNoConfidence',
    defaultMessage: '!!!Select no confidence',
  },
  delegateVotingToDRep: {
    id: 'txReview.operations.delegateVotingToDRep',
    defaultMessage: '!!!Delegate voting to',
  },
  delegateStake: {
    id: 'txReview.operations.delegateStake',
    defaultMessage: '!!!Stake entire wallet balance to',
  },
})
