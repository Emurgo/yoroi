import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {ledgerMessages, txLabels} from '../../../kernel/i18n/global-messages'

export const useStrings = () => {
  const intl = useIntl()

  return React.useRef({
    discoverTitle: intl.formatMessage(messages.discoverTitle),
    searchDApps: intl.formatMessage(messages.searchDApps),
    welcomeToYoroiDAppExplorer: intl.formatMessage(messages.welcomeToYoroiDAppExplorer),
    welcomeToYoroiDAppExplorerDescription: intl.formatMessage(messages.welcomeToYoroiDAppExplorerDescription),
    next: intl.formatMessage(messages.next),
    totalDAppAvailable: (count: number) => intl.formatMessage(messages.totalDAppAvailable, {count}),
    totalDAppConnected: (count: number) => intl.formatMessage(messages.dAppConnected, {count}),
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
    disconnectDApp: intl.formatMessage(messages.disconnectDApp),
    confirmDisconnectDAppDescription: intl.formatMessage(messages.confirmDisconnectDAppDescription),
    cancel: intl.formatMessage(messages.cancel),
    confirm: intl.formatMessage(messages.confirm),
    signTransaction: intl.formatMessage(txLabels.signTransaction),
    signDataNotSupported: intl.formatMessage(messages.signDataNotSupported),
    continueOnLedger: intl.formatMessage(ledgerMessages.continueOnLedger),
    transactionReview: intl.formatMessage(messages.transactionReview),
    inputs: intl.formatMessage(messages.inputs),
    outputs: intl.formatMessage(messages.outputs),
    transactionIdCopied: intl.formatMessage(messages.transactionIdCopied),
    addressCopied: intl.formatMessage(messages.addressCopied),
    yourAddress: intl.formatMessage(messages.yourAddress),
    externalAddress: intl.formatMessage(messages.externalAddress),
    fee: intl.formatMessage(messages.fee),
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
      defaultMessage: '!!!{count} DApp(s) available',
    },
    dAppConnected: {
      id: 'discover.discoverList.dAppConnected',
      defaultMessage: '!!!{count} DApp(s) connected',
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
    disconnectDApp: {
      id: 'discover.confirmDisconnectDApp.disconnectDApp',
      defaultMessage: '!!!Disconnect DApp',
    },
    confirmDisconnectDAppDescription: {
      id: 'discover.confirmDisconnectDApp.confirmDisconnectDAppDescription',
      defaultMessage: '!!!Are you sure you want to disconnect this DApp?',
    },
    cancel: {
      id: 'global.actions.dialogs.commonbuttons.cancelButton',
      defaultMessage: '!!!Cancel',
    },
    confirm: {
      id: 'global.actions.dialogs.commonbuttons.confirmButton',
      defaultMessage: '!!!Confirm',
    },
    signDataNotSupported: {
      id: 'discover.ledger.signDataNotSupported',
      defaultMessage: '!!!The Ledger Cardano app does not support data signing at this moment.',
    },
    transactionReview: {
      id: 'discover.reviewTransaction.transactionReview',
      defaultMessage: '!!!Transaction review',
    },
    inputs: {
      id: 'discover.reviewTransaction.inputs',
      defaultMessage: '!!!Inputs',
    },
    outputs: {
      id: 'discover.reviewTransaction.outputs',
      defaultMessage: '!!!Outputs',
    },
    transactionIdCopied: {
      id: 'discover.reviewTransaction.transactionIdCopied',
      defaultMessage: '!!!Transaction ID copied',
    },
    addressCopied: {
      id: 'discover.reviewTransaction.addressCopied',
      defaultMessage: '!!!Address copied',
    },
    yourAddress: {
      id: 'discover.reviewTransaction.yourAddress',
      defaultMessage: '!!!Your address',
    },
    externalAddress: {
      id: 'discover.reviewTransaction.externalAddress',
      defaultMessage: '!!!Foreign address',
    },
    fee: {
      id: 'discover.reviewTransaction.fee',
      defaultMessage: '!!!Transaction fee',
    },
  }),
)
