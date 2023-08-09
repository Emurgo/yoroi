import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const intl = useIntl()

  return {
    selectLanguage: intl.formatMessage(messages.selectLanguage),
    tosIAgreeWith: intl.formatMessage(messages.tosIAgreeWith),
    tosAgreement: intl.formatMessage(messages.tosAgreement),
  }
}

const messages = defineMessages({
  selectLanguage: {
    id: 'analytics.selectLanguage',
    defaultMessage: '!!!Select Language',
  },
  tosIAgreeWith: {
    id: 'analytics.tosIAgreeWith',
    defaultMessage: '!!!I agree with',
  },
  tosAgreement: {
    id: 'analytics.tosAgreement',
    defaultMessage: '!!!Terms Of Service Agreement',
  },
})
