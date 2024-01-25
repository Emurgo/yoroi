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
    }
}

const messages = defineMessages({
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
})