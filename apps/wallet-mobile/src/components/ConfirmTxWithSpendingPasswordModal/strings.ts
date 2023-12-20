import {useIntl} from 'react-intl'

import globalMessages, {txLabels} from '../../i18n/global-messages'

export const useStrings = () => {
  const intl = useIntl()
  return {
    enterSpendingPassword: intl.formatMessage(txLabels.enterSpendingPassword),
    spendingPassword: intl.formatMessage(txLabels.spendingPassword),
    sign: intl.formatMessage(txLabels.sign),
    error: intl.formatMessage(globalMessages.error),
    wrongPasswordMessage: intl.formatMessage(txLabels.incorrectSpendingPassword),
  }
}
