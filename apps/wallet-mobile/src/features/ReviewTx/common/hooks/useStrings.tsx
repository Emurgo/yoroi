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
    mintTab: intl.formatMessage(messages.mintTab),
    referenceInputsTab: intl.formatMessage(messages.referenceInputsTab),
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
    poolId: intl.formatMessage(messages.poolId),
    poolHash: intl.formatMessage(messages.poolHash),
    poolSize: intl.formatMessage(messages.poolSize),
    poolTaxFix: intl.formatMessage(messages.poolTaxFix),
    poolTaxRatio: intl.formatMessage(messages.poolTaxRatio),
    poolPledge: intl.formatMessage(messages.poolPledge),
    poolRoa: intl.formatMessage(messages.poolRoa),
    poolShare: intl.formatMessage(messages.poolShare),
    poolSaturation: intl.formatMessage(messages.poolSaturation),
    fingerprint: intl.formatMessage(messages.fingerprint),
    name: intl.formatMessage(messages.name),
    tokenSupply: intl.formatMessage(messages.tokenSupply),
    symbol: intl.formatMessage(messages.symbol),
    description: intl.formatMessage(messages.description),
    details: intl.formatMessage(messages.details),
    tokenDetailsTitle: intl.formatMessage(messages.tokenDetailsTitle),
    walletBalanceTitle: intl.formatMessage(messages.walletBalanceTitle),
    walletBalanceTokensTitle: intl.formatMessage(messages.walletBalanceTokensTitle),
    walletBalanceNFTsTitle: intl.formatMessage(messages.walletBalanceNFTsTitle),
    poolDetailsTitle: intl.formatMessage(messages.poolDetailsTitle),
    registerStakingKey: intl.formatMessage(messages.registerStakingKey),
    poolRegistration: intl.formatMessage(messages.poolRegistration),
    poolRetirement: intl.formatMessage(messages.poolRetirement),
    moveInstantaneousRewards: intl.formatMessage(messages.moveInstantaneousRewards),
    committeeHotAuthorization: intl.formatMessage(messages.committeeHotAuthorization),
    committeeColdResign: intl.formatMessage(messages.committeeColdResign),
    drepUpdate: intl.formatMessage(messages.drepUpdate),
    drepRegistration: intl.formatMessage(messages.drepRegistration),
    drepDeregistration: intl.formatMessage(messages.drepDeregistration),
    selectAbstain: intl.formatMessage(messages.selectAbstain),
    selectNoConfidence: intl.formatMessage(messages.selectNoConfidence),
    delegateVotingToDRep: intl.formatMessage(messages.delegateVotingToDRep),
    delegateVotingToDRepSpecified: intl.formatMessage(messages.delegateVotingToDRepSpecified),
    delegateStake: intl.formatMessage(messages.delegateStake),
    deregisterStakingKey: intl.formatMessage(messages.deregisterStakingKey),
    rewardsWithdrawalLabel: intl.formatMessage(messages.rewardsWithdrawalLabel),
    rewardsWithdrawalText: intl.formatMessage(messages.rewardsWithdrawalText),
    submittedTxTitle: intl.formatMessage(messages.submittedTxTitle),
    submittedTxText: intl.formatMessage(messages.submittedTxText),
    submittedTxButton: intl.formatMessage(messages.submittedTxButton),
    failedTxTitle: intl.formatMessage(messages.failedTxTitle),
    infraestructureIssueTitle: intl.formatMessage(messages.infraestructureIssueTitle),
    infraestructureIssueText: intl.formatMessage(messages.infraestructureIssueText),
    infraestructureIssueButton: intl.formatMessage(messages.infraestructureIssueButton),
    failedTxText: intl.formatMessage(messages.failedTxText),
    failedTxButton: intl.formatMessage(messages.failedTxButton),
    multiExternalPartiesSectionLabel: intl.formatMessage(messages.multiExternalPartiesSectionLabel),
    multiExternalPartiesSectionNotice: intl.formatMessage(messages.multiExternalPartiesSectionNotice),
    receiveLabel: intl.formatMessage(messages.receiveLabel),
    operationsLabel: intl.formatMessage(messages.operationsLabel),
    policyIdLabel: intl.formatMessage(messages.policyIdLabel),
    createdBy: intl.formatMessage(messages.createdBy),
    operationsLogTitle: intl.formatMessage(messages.operationsLogTitle),
    operationsLogWarningText: intl.formatMessage(messages.operationsLogWarningText),
    operationsLogWarningTitle: intl.formatMessage(messages.operationsLogWarningTitle),
    operationsNoticeText: intl.formatMessage(messages.operationsNoticeText),
    operationsNoticeButton: intl.formatMessage(messages.operationsNoticeButton),
    operationsNoticeTitle: intl.formatMessage(messages.operationsNoticeTitle),
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
    defaultMessage: '!!!Please check the operations log before confirming this transaction.',
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
    defaultMessage: '!!!Check this transaction in the list of wallet transactions',
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
    defaultMessage: '!!!Your transaction has not been processed properly due to technical issues.',
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
    defaultMessage: '!!!Please go back and try again. If this keep happening, contact our support team.',
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
})
