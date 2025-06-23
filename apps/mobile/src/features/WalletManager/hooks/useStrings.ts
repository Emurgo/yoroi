import {freeze} from 'immer'
import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const {formatMessage: f} = useIntl()

  return {
    addWalletButton: f(messages.addWalletButton),
    supportTicketLink: f(messages.supportTicketLink),
  }
}

const messages = freeze(
  defineMessages({
    addWalletButton: {
      id: 'components.walletselection.walletselectionscreen.addWalletButton',
      defaultMessage: '!!!Add wallet',
    },
    supportTicketLink: {
      id: 'components.walletselection.walletselectionscreen.supportTicketLink',
      defaultMessage: '!!!Ask our support team',
    },
  }),
)
