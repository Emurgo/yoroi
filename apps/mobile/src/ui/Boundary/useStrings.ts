import {useIntl} from 'react-intl'

import globalMessages from '~/kernel/i18n/global-messages'

export const useStrings = () => {
  const {formatMessage: f} = useIntl()
  return {
    tryAgain: f(globalMessages.tryAgain),
  }
}
