import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const intl = useIntl()

  return React.useRef({
    amountTitle: intl.formatMessage(messages.amountTitle),
  }).current
}

export const messages = Object.freeze(
  defineMessages({
    amountTitle: {
      id: 'rampOnOff.createRampOnOff.amountTitle',
      defaultMessage: '!!!ADA amount',
    },
  }),
)
