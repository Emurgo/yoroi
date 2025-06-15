import * as React from 'react'
import {useIntl} from 'react-intl'

import globalMessages from '../../kernel/i18n/global-messages'

export const useStrings = () => {
  const {formatMessage: fm} = useIntl()
  return React.useRef({
    tryAgain: fm(globalMessages.tryAgain),
  }).current
}
