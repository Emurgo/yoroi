import {defineMessages} from 'react-intl'

export const transactionsMessages = defineMessages({
  title: {
    id: 'components.txhistory.txhistory.title',
    defaultMessage: '!!!Transactions',
  },
  history: {
    id: 'txReview.overview.receiveToLabel',
    defaultMessage: '!!!History',
  },
  details: {
    id: 'nft.detail.title',
    defaultMessage: '!!!Details',
  },
  sent: {
    id: 'portfolio.portfolioTokensDetailScreen.sent',
    defaultMessage: '!!!Sent',
  },
  received: {
    id: 'portfolio.portfolioTokensDetailScreen.received',
    defaultMessage: '!!!Received',
  },
  pending: {
    id: 'components.txhistory.txhistorylistitem.assuranceLevelPending',
    defaultMessage: '!!!Pending',
  },
  confirmed: {
    id: 'swap.submittedTxScreen.text',
    defaultMessage: '!!!Confirmed',
  },
  failed: {
    id: 'portfolio.portfolioTokensDetailScreen.failed',
    defaultMessage: '!!!Failed',
  },
  amount: {
    id: 'global.txLabels.amount',
    defaultMessage: '!!!Amount',
  },
  fee: {
    id: 'txReview.fee',
    defaultMessage: '!!!Fee',
  },
  total: {
    id: 'swap.listOrders.total',
    defaultMessage: '!!!Total',
  },
  date: {
    id: 'swap.listOrders.timeCreated',
    defaultMessage: '!!!Date',
  },
  time: {
    id: 'components.catalyst.step2.description',
    defaultMessage: '!!!Time',
  },
  status: {
    id: 'claim.accepted.message',
    defaultMessage: '!!!Status',
  },
  txId: {
    id: 'swap.listOrders.txId',
    defaultMessage: '!!!Transaction ID',
  },
  from: {
    id: 'swap.swapScreen.from',
    defaultMessage: '!!!From',
  },
  to: {
    id: 'txReview.overview.receiveToLabel',
    defaultMessage: '!!!To',
  },
  memo: {
    id: 'components.txhistory.txdetails.memo',
    defaultMessage: '!!!Memo',
  },
  block: {
    id: 'components.catalyst.confirmTx.passwordSignDescription',
    defaultMessage: '!!!Block',
  },
  epoch: {
    id: 'global.staking.epochLabel',
    defaultMessage: '!!!Epoch',
  },
  slot: {
    id: 'components.stakingcenter.poolwarningmodal.multiBlock',
    defaultMessage: '!!!Slot',
  },
  confirmations: {
    id: 'txReview.confirm',
    defaultMessage: '!!!Confirmations',
  },
  copyTxId: {
    id: 'swap.listOrders.txId',
    defaultMessage: '!!!Copy Transaction ID',
  },
  viewOnExplorer: {
    id: 'components.transactions.viewOnExplorer',
    defaultMessage: '!!!View on Explorer',
  },
  utxoListTitle: {
    id: 'components.utxoList',
    defaultMessage: '!!!UTxO List',
  },
  utxoConsolidationTitle: {
    id: 'components.utxoConsolidation',
    defaultMessage: '!!!UTxO Consolidation',
  },
  utxoConsolidationWarning: {
    id: 'components.utxoConsolidationWarning',
    defaultMessage: '!!!Consolidate your UTxOs to improve wallet performance',
  },
  messageSigningTitle: {
    id: 'components.messageSigning.title',
    defaultMessage: '!!!Message Signing',
  },
  messageSigningInputLabel: {
    id: 'components.messageSigning.inputLabel',
    defaultMessage: '!!!Message',
  },
  messageSigningPlaceholder: {
    id: 'components.messageSigning.placeholder',
    defaultMessage: '!!!Paste or type your message here...',
  },
  messageSigningSignButton: {
    id: 'components.messageSigning.signButton',
    defaultMessage: '!!!Sign',
  },
  messageSigningMaxLengthError: {
    id: 'components.messageSigning.maxLengthError',
    defaultMessage: '!!!Message exceeds maximum length (64 bytes)',
  },
  messageSigningLengthInfo: {
    id: 'components.messageSigning.lengthInfo',
    defaultMessage: '!!!Current: {current} bytes / Max: {max} bytes',
  },
  messageSigningResultTitle: {
    id: 'components.messageSigning.resultTitle',
    defaultMessage: '!!!Signed Message',
  },
  messageSigningSignatureLabel: {
    id: 'components.messageSigning.signatureLabel',
    defaultMessage: '!!!Signature',
  },
  messageSigningKeyLabel: {
    id: 'components.messageSigning.keyLabel',
    defaultMessage: '!!!Key',
  },
  messageSigningCopied: {
    id: 'components.messageSigning.copied',
    defaultMessage: '!!!Copied',
  },
  messageSigningError: {
    id: 'components.messageSigning.error',
    defaultMessage: '!!!An error occurred while signing the message',
  },
  messageSigningSignatureDescription: {
    id: 'components.messageSigning.signatureDescription',
    defaultMessage:
      '!!!The cryptographic signature (COSE_Sign1) proving the message was signed by your wallet. This can be verified using the public key.',
  },
  messageSigningKeyDescription: {
    id: 'components.messageSigning.keyDescription',
    defaultMessage:
      '!!!The public key (COSE key format) used to verify the signature. Together with the signature, this proves ownership of the wallet address.',
  },
  noTransactions: {
    id: 'components.txhistory.txhistory.noTransactions',
    defaultMessage: '!!!No transactions',
  },
  loading: {
    id: 'components.transactions.loading',
    defaultMessage: '!!!Loading...',
  },
  error: {
    id: 'global.error',
    defaultMessage: '!!!Error',
  },
  retry: {
    id: 'components.send.sendscreen.errorBannerNetworkError',
    defaultMessage: '!!!Retry',
  },
  warningTitle: {
    id: 'components.txhistory.txhistory.warningbanner.title',
    defaultMessage: '!!!Warning Title',
  },
  message: {
    id: 'components.txhistory.txhistory.warningbanner.message',
    defaultMessage: '!!!Message',
  },
  unknownAssetName: {
    id: 'components.txhistory.txhistory.title',
    defaultMessage: '!!!Unknown Asset Name',
  },
  walletAddress: {
    id: 'components.txhistory.txdetails.transactionId',
    defaultMessage: '!!!Wallet Address',
  },
  BIP32path: {
    id: 'components.receive.addressmodal.BIP32path',
    defaultMessage: '!!!BIP32 Path',
  },
  copyLabel: {
    id: 'components.receive.addressmodal.copyLabel',
    defaultMessage: '!!!Copy Label',
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
    defaultMessage: '!!!Address Modal Title',
  },
  verifyLabel: {
    id: 'components.receive.addressview.verifyAddressLabel',
    defaultMessage: '!!!Verify Label',
  },
  txDetailsFee: {
    id: 'components.txhistory.txdetails.fee',
    defaultMessage: '!!!Transaction Details Fee',
  },
  fromAddresses: {
    id: 'components.txhistory.txdetails.fromAddresses',
    defaultMessage: '!!!From Addresses',
  },
  toAddresses: {
    id: 'components.txhistory.txdetails.toAddresses',
    defaultMessage: '!!!To Addresses',
  },
  transactionId: {
    id: 'components.txhistory.txdetails.transactionId',
    defaultMessage: '!!!Transaction ID',
  },
  txAssuranceLevel: {
    id: 'components.txhistory.txdetails.txAssuranceLevel',
    defaultMessage: '!!!Transaction Assurance Level',
  },
  omittedCount: {
    id: 'components.txhistory.txdetails.omittedCount',
    defaultMessage: '!!!Omitted Count',
  },
  openInExplorer: {
    id: 'global.openInExplorer',
    defaultMessage: '!!!Open In Explorer',
  },
  copiedLabel: {
    id: 'components.receive.addressmodal.copiedLabel',
    defaultMessage: '!!!Copied Label',
  },
  organizeWallet: {
    id: 'components.organizeWallet.title',
    defaultMessage: '!!!Organize Wallet',
  },
  organizeWalletBanner: {
    id: 'components.organizeWallet.banner',
    defaultMessage: '!!!Assets are spread in multiple addresses',
  },
  organizeWalletDescription: {
    id: 'components.organizeWallet.description',
    defaultMessage:
      '!!!Your assets are spread across multiple addresses which may interfere with Dapp connectivity. Merging your ADA and tokens into a single address keeps your wallet organized and ready for Dapp interactions.',
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
  historyTitle: {
    id: 'components.common.navigation.walletButton',
    defaultMessage: '!!!Wallet Title',
  },
  txDetailsTitle: {
    id: 'components.txhistory.txdetails.txDetails',
    defaultMessage: '!!!Transaction Details Title',
  },
  submittedTxTitle: {
    id: 'components.txhistory.txhistory.title',
    defaultMessage: '!!!Submitted Transaction Title',
  },
  submittedTxText: {
    id: 'components.txhistory.txhistory.title',
    defaultMessage: '!!!Submitted Transaction Text',
  },
  submittedTxButton: {
    id: 'components.txhistory.txhistory.title',
    defaultMessage: '!!!Submitted Transaction Button',
  },
  txTypeMessagesSENT: {
    id: 'components.txhistory.txdetails.txTypeSent',
    defaultMessage: '!!!Sent',
  },
  txTypeMessagesRECEIVED: {
    id: 'components.txhistory.txdetails.txTypeReceived',
    defaultMessage: '!!!Received',
  },
  txTypeMessagesSELF: {
    id: 'components.txhistory.txdetails.txTypeSelf',
    defaultMessage: '!!!Self',
  },
  txTypeMessagesMULTI: {
    id: 'components.txhistory.txdetails.txTypeMulti',
    defaultMessage: '!!!Multi',
  },
  directionMessagesSENT: {
    id: 'components.txhistory.txhistorylistitem.transactionTypeSent',
    defaultMessage: '!!!Sent',
  },
  directionMessagesRECEIVED: {
    id: 'components.txhistory.txhistorylistitem.transactionTypeReceived',
    defaultMessage: '!!!Received',
  },
  directionMessagesSELF: {
    id: 'components.txhistory.txhistorylistitem.transactionTypeSelf',
    defaultMessage: '!!!Self',
  },
  directionMessagesMULTI: {
    id: 'components.txhistory.txhistorylistitem.transactionTypeMulti',
    defaultMessage: '!!!Multi',
  },
  addressPrefixReceive: {
    id: 'components.send.sendscreen.addressInputLabel',
    defaultMessage: '!!!Receive Address {idx}',
  },
  addressPrefixChange: {
    id: 'components.send.sendscreen.addressInputLabel',
    defaultMessage: '!!!Change Address {idx}',
  },
  addressPrefixNotMine: {
    id: 'components.txhistory.txdetails.addressPrefixNotMine',
    defaultMessage: '!!!External Address',
  },
  addressDetailsTitle: {
    id: 'components.transactions.addressDetailsTitle',
    defaultMessage: '!!!Address Details',
  },
  blockDetailsTitle: {
    id: 'components.transactions.blockDetailsTitle',
    defaultMessage: '!!!Block Details',
  },
  address: {
    id: 'components.transactions.address',
    defaultMessage: '!!!Address',
  },
  operationStakeRegistration: {
    id: 'components.transactions.operation.stakeRegistration',
    defaultMessage: '!!!Stake Registration',
  },
  operationStakeDeregistration: {
    id: 'components.transactions.operation.stakeDeregistration',
    defaultMessage: '!!!Stake Deregistration',
  },
  operationStakeDelegation: {
    id: 'components.transactions.operation.stakeDelegation',
    defaultMessage: '!!!Stake Delegation',
  },
  operationStakingDelegated: {
    id: 'components.transactions.operation.stakingDelegated',
    defaultMessage: '!!!Staking Delegated',
  },
  operationStakeUndelegation: {
    id: 'components.transactions.operation.stakeUndelegation',
    defaultMessage: '!!!Stake Undelegation',
  },
  operationPoolRegistration: {
    id: 'components.transactions.operation.poolRegistration',
    defaultMessage: '!!!Pool Registration',
  },
  operationPoolRetirement: {
    id: 'components.transactions.operation.poolRetirement',
    defaultMessage: '!!!Pool Retirement',
  },
  operationGenesisKeyDelegation: {
    id: 'components.transactions.operation.genesisKeyDelegation',
    defaultMessage: '!!!Genesis Key Delegation',
  },
  operationMoveInstantaneousRewards: {
    id: 'components.transactions.operation.moveInstantaneousRewards',
    defaultMessage: '!!!Move Instantaneous Rewards',
  },
  operationCommitteeHotAuth: {
    id: 'components.transactions.operation.committeeHotAuth',
    defaultMessage: '!!!Committee Hot Auth',
  },
  operationCommitteeColdResign: {
    id: 'components.transactions.operation.committeeColdResign',
    defaultMessage: '!!!Committee Cold Resign',
  },
  operationDrepDeregistration: {
    id: 'components.transactions.operation.drepDeregistration',
    defaultMessage: '!!!DRep Deregistration',
  },
  operationDrepRegistration: {
    id: 'components.transactions.operation.drepRegistration',
    defaultMessage: '!!!DRep Registration',
  },
  operationDrepUpdate: {
    id: 'components.transactions.operation.drepUpdate',
    defaultMessage: '!!!DRep Update',
  },
  operationStakeAndVoteDelegation: {
    id: 'components.transactions.operation.stakeAndVoteDelegation',
    defaultMessage: '!!!Stake And Vote Delegation',
  },
  operationStakeRegistrationAndDelegation: {
    id: 'components.transactions.operation.stakeRegistrationAndDelegation',
    defaultMessage: '!!!Stake Registration And Delegation',
  },
  operationStakeVoteRegistrationAndDelegation: {
    id: 'components.transactions.operation.stakeVoteRegistrationAndDelegation',
    defaultMessage: '!!!Stake Vote Registration And Delegation',
  },
  operationVoteDelegation: {
    id: 'components.transactions.operation.voteDelegation',
    defaultMessage: '!!!Vote Delegation',
  },
  operationVoteRegistrationAndDelegation: {
    id: 'components.transactions.operation.voteRegistrationAndDelegation',
    defaultMessage: '!!!Vote Registration And Delegation',
  },
  operationWithdrawal: {
    id: 'components.transactions.operation.withdrawal',
    defaultMessage: '!!!Withdrawal',
  },
  operationSwap: {
    id: 'components.transactions.operation.swap',
    defaultMessage: '!!!Swap',
  },
  operationSwapCreated: {
    id: 'components.transactions.operation.swapCreated',
    defaultMessage: '!!!Swap Created',
  },
  operationSwapResolved: {
    id: 'components.transactions.operation.swapResolved',
    defaultMessage: '!!!Swap Resolved',
  },
  operationSwapCancel: {
    id: 'components.transactions.operation.swapCancel',
    defaultMessage: '!!!Swap Cancel',
  },
  operationSmartContract: {
    id: 'components.transactions.operation.smartContract',
    defaultMessage: '!!!Smart Contract',
  },
  operationCollateralCreation: {
    id: 'components.transactions.operation.collateralCreation',
    defaultMessage: '!!!Collateral Creation',
  },
})
