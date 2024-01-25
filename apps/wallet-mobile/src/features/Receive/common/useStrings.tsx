import { defineMessages, useIntl } from "react-intl"

export const useStrings = () => {
    const intl = useIntl()

    return {
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
        multipleAdress: intl.formatMessage(messages.multipleAdress),
        copyLinkBtn: intl.formatMessage(messages.copyLinkBtn),
        copyLinkMsg: intl.formatMessage(messages.copyLinkMsg),
        addressCopiedMsg: intl.formatMessage(messages.addressCopiedMsg),
    }
}

export const messages = defineMessages({
    receiveTitle: {
        id: 'components.receive.receivescreen.title',
        defaultMessage: '!!!Receive',
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
    multipleAdress: {
        id: 'components.receive.receivescreen.multipleAdress',
        defaultMessage: '!!!Multiple address',
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
})