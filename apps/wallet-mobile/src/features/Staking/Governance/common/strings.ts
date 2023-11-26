import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const intl = useIntl()
  return {
    governanceCentreTitle: intl.formatMessage(messages.governanceCentreTitle),
    confirmTxTitle: intl.formatMessage(messages.confirmTxTitle),
  }
}

const messages = defineMessages({
  governanceCentreTitle: {
    id: 'components.governance.governanceCentreTitle',
    defaultMessage: '!!!Governance centre',
  },
  confirmTxTitle: {
    id: 'components.governance.confirmTxTitle',
    defaultMessage: '!!!Confirm transaction',
  },
})
