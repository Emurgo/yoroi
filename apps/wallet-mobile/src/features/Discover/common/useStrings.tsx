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
    done: intl.formatMessage(messages.done),
    openDApp: intl.formatMessage(messages.openDApp),
    disconnectWalletFromDApp: intl.formatMessage(messages.disconnectWalletFromDApp),
    dAppActions: intl.formatMessage(messages.dAppActions),
    confirmConnectionModalTitle: intl.formatMessage(messages.confirmConnectionModalTitle),
    confirmConnectionModalConnectTo: intl.formatMessage(messages.confirmConnectionModalConnectTo),
    confirmConnectionModalConnect: intl.formatMessage(messages.confirmConnectionModalConnect),
    confirmConnectionModalAllowThisDAppTo: intl.formatMessage(messages.confirmConnectionModalAllowThisDAppTo),
    confirmConnectionModalPermission1: intl.formatMessage(messages.confirmConnectionModalPermission1),
    confirmConnectionModalPermission2: intl.formatMessage(messages.confirmConnectionModalPermission2),
    confirmTx: intl.formatMessage(messages.confirmTx),
    understand: intl.formatMessage(messages.understand),
    disclaimerModalText: intl.formatMessage(messages.disclaimerModalText),
    disclaimerModalTitle: intl.formatMessage(messages.disclaimerModalTitle),
  }).current
}

export const messages = Object.freeze(
  defineMessages({
    confirmTx: {
      id: 'global.confirmationTransaction',
      defaultMessage: '!!!Confirm transaction',
    },
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
    done: {
      id: 'discover.discoverList.done',
      defaultMessage: '!!!DONE',
    },
    openDApp: {
      id: 'discover.discoverList.openDApp',
      defaultMessage: '!!!Open DApp',
    },
    disconnectWalletFromDApp: {
      id: 'discover.discoverList.disconnectWalletFromDApp',
      defaultMessage: '!!!Disconnect wallet from DApp',
    },
    dAppActions: {
      id: 'discover.discoverList.dAppActions',
      defaultMessage: '!!!DApp actions',
    },
    confirmConnectionModalTitle: {
      id: 'discover.confirmConnectionModal.title',
      defaultMessage: '!!!Confirm connection',
    },
    confirmConnectionModalConnectTo: {
      id: 'discover.confirmConnectionModal.connectTo',
      defaultMessage: '!!!Connect to',
    },
    confirmConnectionModalConnect: {
      id: 'discover.confirmConnectionModal.connect',
      defaultMessage: '!!!Connect',
    },
    confirmConnectionModalAllowThisDAppTo: {
      id: 'discover.confirmConnectionModal.allowThisDAppTo',
      defaultMessage: '!!!Allow this DApp to:',
    },
    confirmConnectionModalPermission1: {
      id: 'discover.confirmConnectionModal.permission1',
      defaultMessage: '!!!View addresses, account balance, activity',
    },
    confirmConnectionModalPermission2: {
      id: 'discover.confirmConnectionModal.permission2',
      defaultMessage: '!!!Request approval for transactions',
    },
    understand: {
      id: 'discover.unverifiedDappModal.understand',
      defaultMessage: '!!!I understand',
    },
    disclaimerModalText: {
      id: 'discover.unverifiedDappModal.disclaimerModalText',
      defaultMessage:
        '!!!You are accessing a third-party Cardano application that is not verified by EMURGO, the developers of Yoroi Wallet, or any of its affiliated divisions. Make sure this DApp is reliable to stay safe from malicious apps in a sustainable way.',
    },
    disclaimerModalTitle: {
      id: 'discover.unverifiedDappModal.disclaimerModalTitle',
      defaultMessage: '!!!Disclaimer',
    },
  }),
)
