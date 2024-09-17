import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const intl = useIntl()

  return React.useRef({
    addWalletButton: intl.formatMessage(messages.addWalletButton),
    supportTicketLink: intl.formatMessage(messages.supportTicketLink),
  } as const).current
}

const messages = Object.freeze(
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
