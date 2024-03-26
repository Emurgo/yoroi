import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const intl = useIntl()

  return React.useRef({
    discoverTitle: intl.formatMessage(messages.discoverTitle),
    searchDApps: intl.formatMessage(messages.searchDApps),
    welcomeToYoroiDAppExplorer: intl.formatMessage(messages.welcomeToYoroiDAppExplorer),
    welcomeToYoroiDAppExplorerDescription: intl.formatMessage(messages.welcomeToYoroiDAppExplorerDescription),
    next: intl.formatMessage(messages.next),
    totalDAppAvailable: intl.formatMessage(messages.totalDAppAvailable),
    connected: intl.formatMessage(messages.connected),
    recommended: intl.formatMessage(messages.recommended),
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
    welcomeToYoroiDAppExplorer: {
      id: 'discover.discoverList.welcomeToYoroiDAppExplorer',
      defaultMessage: '!!!Welcome to Yoroi DApp Explorer',
    },
    welcomeToYoroiDAppExplorerDescription: {
      id: 'discover.discoverList.welcomeToYoroiDAppExplorerDescription',
      defaultMessage:
        '!!!Discover, inspect, and connect to Cardano decentralized applications (DApps) with ease. Our solution helps to interact with DApps and their smart contracts, seamlessly enhancing your Cardano experience',
    },
    next: {
      id: 'global.next',
      defaultMessage: '!!!Next',
    },
    totalDAppAvailable: {
      id: 'discover.discoverList.dAppAvailable',
      defaultMessage: '!!!DApp(s) available',
    },
    connected: {
      id: 'discover.discoverList.connected',
      defaultMessage: '!!!Connected',
    },
    recommended: {
      id: 'discover.discoverList.recommended',
      defaultMessage: '!!!Recommended',
    },
  }),
)
