import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const intl = useIntl()

  return React.useRef({
    description: intl.formatMessage(messages.description),
    title: intl.formatMessage(messages.title),
    cta: intl.formatMessage(messages.cta),
  } as const).current
}

const messages = defineMessages({
  description: {
    id: 'components.considerDelegatingToYoroiBanner.description',
    defaultMessage: '!!!Delegate to our DRep and help Cardano evolve in a way that benefits your wallet experience.',
  },
  title: {
    id: 'components.considerDelegatingToYoroiBanner.title',
    defaultMessage: '!!!Consider delegating to Yoroi DRep',
  },
  cta: {
    id: 'components.considerDelegatingToYoroiBanner.cta',
    defaultMessage: '!!!Delegate Now',
  },
})
