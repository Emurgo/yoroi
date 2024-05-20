import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const intl = useIntl()

  return {
    portfolio: intl.formatMessage(messages.portfolio),
  }
}

export const messages = defineMessages({
  portfolio: {
    id: 'global.portfolio',
    defaultMessage: '!!!Portfolio',
  },
})
