import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const intl = useIntl()

  return React.useRef({
    discoverTitle: intl.formatMessage(messages.discoverTitle),
    searchDApps: intl.formatMessage(messages.searchDApps),
  }).current
}

export const messages = Object.freeze(
  defineMessages({
    discoverTitle: {
      id: 'discover.discoverList.discoverTitle',
      defaultMessage: '!!!Discover Cardano',
    },
    searchDApps: {
      id: 'discover.discoverList.searchDApps',
      defaultMessage: '!!!Search DApps',
    },
  }),
)
