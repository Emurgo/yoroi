import {useIntl} from 'react-intl'

import {txLabels} from '../../../../kernel/i18n/global-messages'

export const useStrings = () => {
  const intl = useIntl()

  return {
    signTransaction: intl.formatMessage(txLabels.signingTx),
  }
}
