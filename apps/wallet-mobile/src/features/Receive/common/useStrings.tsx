import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const intl = useIntl()

  return {
    amountToReceive: intl.formatMessage(messages.amountToReceive),
    receiveTitle: intl.formatMessage(messages.receiveTitle),
    addresscardTitle: intl.formatMessage(messages.addresscardTitle),
    shareLabel: intl.formatMessage(messages.shareLabel),
    walletAddress: intl.formatMessage(messages.walletAddress),
    spendingKeyHash: intl.formatMessage(messages.spendingKeyHash),
    stakingKeyHash: intl.formatMessage(messages.stakingKeyHash),
    address: intl.formatMessage(messages.address),
    specificAmount: intl.formatMessage(messages.specificAmount),
    requestSpecificAmountButton: intl.formatMessage(messages.requestSpecificAmountButton),
    copyAddressButton: intl.formatMessage(messages.copyAddressButton),
    specificAmountDescription: intl.formatMessage(messages.specificAmountDescription),
    ADALabel: intl.formatMessage(messages.ADALabel),
    generateLink: intl.formatMessage(messages.generateLink),
    multipleAddress: intl.formatMessage(messages.multipleAddress),
    singleAddress: intl.formatMessage(messages.singleAddress),
    copyLinkBtn: intl.formatMessage(messages.copyLinkBtn),
    copyLinkMsg: intl.formatMessage(messages.copyLinkMsg),
    addressCopiedMsg: intl.formatMessage(messages.addressCopiedMsg),
    lastUsed: intl.formatMessage(messages.lastUsed),
    unusedAddress: intl.formatMessage(messages.unusedAddress),
    usedAddress: intl.formatMessage(messages.usedAddress),
    generateButton: intl.formatMessage(messages.generateButton),
    infoAddressLimit: intl.formatMessage(messages.infoAddressLimit),
    multiplePresentation: intl.formatMessage(messages.multiplePresentation),
    multiplePresentationDetails: intl.formatMessage(messages.multiplePresentationDetails),
    singleOrMultiple: intl.formatMessage(messages.singleOrMultiple),
    singleOrMultipleDetails: intl.formatMessage(messages.singleOrMultipleDetails),
    selectMultiple: intl.formatMessage(messages.selectMultiple),
    singleAddressWallet: intl.formatMessage(messages.singleAddressWallet),
    yoroiZendesk: intl.formatMessage(messages.yoroiZendesk),
    ok: intl.formatMessage(messages.ok),
  }
}

export const messages = defineMessages({
  amountToReceive: {
    id: 'components.receive.specificamountscreen.title',
    defaultMessage: '!!!Amount to receive',
  },
  receiveTitle: {
    id: 'components.receive.receivescreen.title',
    defaultMessage: '!!!Receive',
  },
  describeSelectedAddressTitle: {
    id: 'components.receive.describeselectedaddressscreen.title',
    defaultMessage: '!!!Address details',
  },
  addresscardTitle: {
    id: 'components.receive.addresscard.title',
    defaultMessage: '!!!Wallet address',
  },
  shareLabel: {
    id: 'components.receive.addresscard.shareLabel',
    defaultMessage: '!!!Share address',
  },
  walletAddress: {
    id: 'components.receive.addresscard.walletAddress',
    defaultMessage: '!!!Wallet address details',
  },
  spendingKeyHash: {
    id: 'components.receive.addresscard.spendingKeyHash',
    defaultMessage: '!!!Spending key hash',
  },
  stakingKeyHash: {
    id: 'components.receive.addresscard.stakingKeyHash',
    defaultMessage: '!!!Staking key hash',
  },
  address: {
    id: 'components.receive.addresscard.address',
    defaultMessage: '!!!Address',
  },
  copyAddressButton: {
    id: 'components.receive.receivescreen.copyButton',
    defaultMessage: '!!!Copy address',
  },
  requestSpecificAmountButton: {
    id: 'components.receive.receivescreen.requestSpecificAmountButton',
    defaultMessage: '!!!Request specific amount',
  },
  specificAmount: {
    id: 'components.receive.receivescreen.specificAmount',
    defaultMessage: '!!!Request specific amount',
  },
  specificAmountDescription: {
    id: 'components.receive.receivescreen.specificAmountDescription',
    defaultMessage: '!!!Generate a unique wallet address for requesting a specific amount of ADA from another wallet.',
  },
  ADALabel: {
    id: 'components.receive.receivescreen.ADALabel',
    defaultMessage: '!!!ADA Amount',
  },
  generateLink: {
    id: 'components.receive.receivescreen.generateLink',
    defaultMessage: '!!!Generate link',
  },
  multipleAddress: {
    id: 'components.receive.receivescreen.multipleAddress',
    defaultMessage: '!!!Multiple addresses',
  },
  singleAddress: {
    id: 'global.singleAddress',
    defaultMessage: '!!!Single address',
  },
  copyLinkBtn: {
    id: 'components.receive.receivescreen.copyLinkBtn',
    defaultMessage: '!!!Copy link',
  },
  copyLinkMsg: {
    id: 'components.receive.receivescreen.copyLinkMsg',
    defaultMessage: '!!!Link copied',
  },
  addressCopiedMsg: {
    id: 'components.receive.receivescreen.addressCopiedMsg',
    defaultMessage: '!!!Address copied',
  },
  lastUsed: {
    id: 'components.receive.receivescreen.lastUsed',
    defaultMessage: '!!!Last used',
  },
  unusedAddress: {
    id: 'components.receive.receivescreen.unusedAddress',
    defaultMessage: '!!!Unused',
  },
  usedAddress: {
    id: 'components.receive.receivescreen.usedAddress',
    defaultMessage: '!!!Used',
  },
  generateButton: {
    id: 'components.receive.receivescreen.generateButton',
    defaultMessage: '!!!Generate new address',
  },
  infoAddressLimit: {
    id: 'components.receive.receivescreen.infoAddressLimit',
    defaultMessage:
      '!!!You have already reached your 20 addresses limit. If you need to operate with more than 20 addresses, reach out to us via Yoroi Zendesk',
  },
  multiplePresentation: {
    id: 'components.receive.receivescreen.multiplePresentation',
    defaultMessage: '!!!Meet multiple addresses in Yoroi',
  },
  multiplePresentationDetails: {
    id: 'components.receive.receivescreen.multiplePresentationDetails',
    defaultMessage:
      '!!!Enables Yoroi to manage various addresses in one place, enhancing privacy and providing organisational benefits.',
  },
  singleOrMultiple: {
    id: 'components.receive.receivescreen.singleOrMultiple',
    defaultMessage: '!!!Single or multiple address?',
  },
  singleOrMultipleDetails: {
    id: 'components.receive.receivescreen.singleOrMultipleDetails',
    defaultMessage:
      '!!!Single keeps things simple and secure. Multiple may offer some extra privacy. For most users, single address is the way to go! You can always change it in settings.',
  },
  selectMultiple: {
    id: 'components.receive.receivescreen.selectMultiple',
    defaultMessage: '!!!Select multiple instead',
  },
  singleAddressWallet: {
    id: 'components.receive.receivescreen.singleAddressWallet',
    defaultMessage: '!!!Single address wallet',
  },
  ok: {
    id: 'global.ok',
    defaultMessage: '!!!OK',
  },
  yoroiZendesk: {
    id: 'global.yoroiZendesk',
    defaultMessage: '!!!Yoroi Zendesk',
  },
})
