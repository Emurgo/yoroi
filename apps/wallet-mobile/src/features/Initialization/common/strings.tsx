import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
    description: intl.formatMessage(messages.description),
    selectLanguage: intl.formatMessage(messages.selectLanguage),
    tosIAgreeWith: intl.formatMessage(messages.tosIAgreeWith),
    tosAgreement: intl.formatMessage(messages.tosAgreement),
    continue: intl.formatMessage(messages.continue),
    acceptTermsTitle: intl.formatMessage(messages.acceptTermsTitle),
    languagePickerTitle: intl.formatMessage(messages.languagePickerTitle),
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
  continue: {
    id: 'global.continue',
    defaultMessage: '!!!Continue',
  },
  title: {
    id: 'termsOfService.agreementUpdateTitle',
    defaultMessage: '!!!Terms of Service Agreement update',
  },
  description: {
    id: 'termsOfService.agreementUpdateDescription',
    defaultMessage:
      '!!!We have updated our Terms of Service Agreement to enhance your experience. Please review and accept them to keep enjoying Yoroi.',
  },
  acceptTermsTitle: {
    id: 'components.initialization.acepttermsofservicescreen.title',
    defaultMessage: '!!!Terms of Service Agreement',
  },
  languagePickerTitle: {
    id: 'components.initialization.languagepicker.title',
    defaultMessage: '!!!Select Language',
  },
})
