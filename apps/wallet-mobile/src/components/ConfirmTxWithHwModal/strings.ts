import {useIntl} from 'react-intl'

import {ledgerMessages} from '../../kernel/i18n/global-messages'

export const useStrings = () => {
  const intl = useIntl()
  return {continueOnLedger: intl.formatMessage(ledgerMessages.continueOnLedger)}
}
