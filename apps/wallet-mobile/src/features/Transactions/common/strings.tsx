import {ReactNode} from 'react'
import {defineMessages, MessageDescriptor, useIntl} from 'react-intl'

import globalMessages, {actionMessages, txLabels} from '../../../kernel/i18n/global-messages'
import {TransactionDirection} from '../../../yoroi-wallets/types'
import {messages as receiveMessages} from '../../Receive/common/useStrings'

export const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
    warningTitle: intl.formatMessage(messages.warningTitle),
    warningMessage: intl.formatMessage(messages.message),
    transactions: intl.formatMessage(txLabels.transactions),
    assets: (qty: number) => intl.formatMessage(globalMessages.assets, {qty}),
    sendLabel: intl.formatMessage(actionMessages.send),
    receiveLabel: intl.formatMessage(actionMessages.receive),
    buyLabel: intl.formatMessage(actionMessages.buy),
    buyTitle: intl.formatMessage(actionMessages.buyTitle),
    buyInfo: (options: BuyInfoFormattingOptions) => intl.formatMessage(actionMessages.buyInfo, options),
    proceed: intl.formatMessage(actionMessages.proceed),
    swapLabel: intl.formatMessage(actionMessages.swap),
    messageBuy: intl.formatMessage(actionMessages.soon),
    exchange: intl.formatMessage(actionMessages.exchange),
    addressCopiedMsg: intl.formatMessage(receiveMessages.addressCopiedMsg),
    lockedDeposit: intl.formatMessage(globalMessages.lockedDeposit),
    syncErrorBannerTextWithRefresh: intl.formatMessage(globalMessages.syncErrorBannerTextWithRefresh),
    syncErrorBannerTextWithoutRefresh: intl.formatMessage(globalMessages.syncErrorBannerTextWithoutRefresh),
    noTransactions: intl.formatMessage(messages.noTransactions),
    direction: (direction: TransactionDirection) => intl.formatMessage(directionMessages[direction]),
    unknownAssetName: intl.formatMessage(messages.unknownAssetName),
    walletAddress: intl.formatMessage(messages.walletAddress),
    BIP32path: intl.formatMessage(messages.BIP32path),
    copyLabel: intl.formatMessage(messages.copyLabel),
    spending: intl.formatMessage(messages.spending),
    staking: intl.formatMessage(messages.staking),
    addessModalTitle: intl.formatMessage(messages.addessModalTitle),
    verifyLabel: intl.formatMessage(messages.verifyLabel),
    txDetailsFee: intl.formatMessage(messages.txDetailsFee),
    fromAddresses: intl.formatMessage(messages.fromAddresses),
    toAddresses: intl.formatMessage(messages.toAddresses),
    memo: intl.formatMessage(messages.memo),
    transactionId: intl.formatMessage(messages.transactionId),
    txAssuranceLevel: intl.formatMessage(messages.txAssuranceLevel),
    confirmations: (cnt: number) => intl.formatMessage(messages.confirmations, {cnt}),
    omittedCount: (cnt: number) => intl.formatMessage(messages.omittedCount, {cnt}),
    openInExplorer: intl.formatMessage(messages.openInExplorer),
    SENT: intl.formatMessage(txTypeMessages.SENT),
    RECEIVED: intl.formatMessage(txTypeMessages.RECEIVED),
    SELF: intl.formatMessage(txTypeMessages.SELF),
    MULTI: intl.formatMessage(txTypeMessages.MULTI),
    assetsLabel: intl.formatMessage(globalMessages.assetsLabel),
  }
}

export const txTypeMessages = defineMessages({
  SENT: {
    id: 'components.txhistory.txdetails.txTypeSent',
    defaultMessage: '!!!Sent funds',
  },
  RECEIVED: {
    id: 'components.txhistory.txdetails.txTypeReceived',
    defaultMessage: '!!!Received funds',
  },
  SELF: {
    id: 'components.txhistory.txdetails.txTypeSelf',
    defaultMessage: '!!!Intrawallet transaction',
  },
  MULTI: {
    id: 'components.txhistory.txdetails.txTypeMulti',
    defaultMessage: '!!!Multi-party transaction',
  },
})

export const messages = defineMessages({
  addressPrefixReceive: {
    id: 'components.txhistory.txdetails.addressPrefixReceive',
    defaultMessage: '!!!/{idx}',
  },
  addressPrefixChange: {
    id: 'components.txhistory.txdetails.addressPrefixChange',
    defaultMessage: '!!!/change',
  },
  addressPrefixNotMine: {
    id: 'components.txhistory.txdetails.addressPrefixNotMine',
    defaultMessage: '!!!not mine',
  },
  txDetailsFee: {
    id: 'components.txhistory.txdetails.fee',
    defaultMessage: '!!!Fee: ',
  },
  fromAddresses: {
    id: 'components.txhistory.txdetails.fromAddresses',
    defaultMessage: '!!!From Addresses',
  },
  toAddresses: {
    id: 'components.txhistory.txdetails.toAddresses',
    defaultMessage: '!!!To Addresses',
  },
  memo: {
    id: 'components.txhistory.txdetails.memo',
    defaultMessage: '!!!Memo',
  },
  transactionId: {
    id: 'components.txhistory.txdetails.transactionId',
    defaultMessage: '!!!Transaction ID',
  },
  txAssuranceLevel: {
    id: 'components.txhistory.txdetails.txAssuranceLevel',
    defaultMessage: '!!!Transaction assurance level',
  },
  confirmations: {
    id: 'components.txhistory.txdetails.confirmations',
    defaultMessage: '!!!{cnt} {cnt, plural, one {CONFIRMATION} other {CONFIRMATIONS}}',
  },
  omittedCount: {
    id: 'components.txhistory.txdetails.omittedCount',
    defaultMessage: '!!!+ {cnt} omitted {cnt, plural, one {address} other {addresses}}',
  },
  openInExplorer: {
    id: 'global.openInExplorer',
    defaultMessage: '!!!Open in explorer',
  },
  title: {
    id: 'components.txhistory.txhistory.title',
    defaultMessage: '!!!Transactions',
  },
  warningTitle: {
    id: 'components.txhistory.txhistory.warningbanner.title',
    defaultMessage: '!!!Note:',
  },
  message: {
    id: 'components.txhistory.txhistory.warningbanner.message',
    defaultMessage: '!!!The Shelley protocol upgrade adds a new Shelley wallet type which supports delegation.',
  },
  noTransactions: {
    id: 'components.txhistory.txhistory.noTransactions',
    defaultMessage: '!!!No transactions to show yet',
  },
  fee: {
    id: 'components.txhistory.txhistorylistitem.fee',
    defaultMessage: '!!!Fee',
  },
  assets: {
    id: 'global.txLabels.assets',
    defaultMessage: '!!!{cnt} assets',
    description: 'The number of assets different assets, not the amount',
  },
  transactionTypeSent: {
    id: 'components.txhistory.txhistorylistitem.transactionTypeSent',
    defaultMessage: '!!!ADA sent',
  },
  transactionTypeReceived: {
    id: 'components.txhistory.txhistorylistitem.transactionTypeReceived',
    defaultMessage: '!!!ADA received',
  },
  transactionTypeSelf: {
    id: 'components.txhistory.txhistorylistitem.transactionTypeSelf',
    defaultMessage: '!!!Intrawallet',
  },
  transactionTypeMulti: {
    id: 'components.txhistory.txhistorylistitem.transactionTypeMulti',
    defaultMessage: '!!!Multiparty',
  },
  unknownAssetName: {
    id: 'utils.format.unknownAssetName',
    defaultMessage: '!!![Unknown asset name]',
  },
  walletAddress: {
    id: 'components.receive.addressmodal.walletAddress',
    defaultMessage: '!!!Your wallet address',
  },
  BIP32path: {
    id: 'components.receive.addressmodal.BIP32path',
    defaultMessage: '!!!BIP32 path:',
  },
  copyLabel: {
    id: 'components.receive.addressmodal.copyLabel',
    defaultMessage: '!!!Copy address',
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
    defaultMessage: '!!!Title',
  },
  verifyLabel: {
    id: 'components.receive.addressverifymodal.title',
    defaultMessage: '!!!Verify Address on Ledger',
  },
})

const directionMessages: Record<TransactionDirection, MessageDescriptor> = Object.freeze({
  SENT: messages.transactionTypeSent,
  RECEIVED: messages.transactionTypeReceived,
  SELF: messages.transactionTypeSelf,
  MULTI: messages.transactionTypeMulti,
})

type BuyInfoFormattingOptions = Record<'b' | 'textComponent', (text: ReactNode[]) => ReactNode>
