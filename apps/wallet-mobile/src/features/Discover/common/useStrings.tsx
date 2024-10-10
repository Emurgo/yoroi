import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import globalMessages, {ledgerMessages, txLabels} from '../../../kernel/i18n/global-messages'

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
    signData: intl.formatMessage(messages.signData),
    signMessage: intl.formatMessage(messages.signMessage),
    testnetWarningTitle: intl.formatMessage(messages.testnetWarningTitle),
    testnetWarningDescription: intl.formatMessage(messages.testnetWarningDescription),
    singleAddress: intl.formatMessage(messages.singleAddress),
    singleAddressWarning: intl.formatMessage(messages.singleAddressWarning),
    filterChildOptionsDAO: intl.formatMessage(messages.filterChildOptionsDAO),
    filterChildOptionsDEX: intl.formatMessage(messages.filterChildOptionsDEX),
    filterChildOptionsDeFi: intl.formatMessage(messages.filterChildOptionsDeFi),
    filterChildOptionsDecentralisedStorage: intl.formatMessage(messages.filterChildOptionsDecentralisedStorage),
    filterChildOptionsEntertainment: intl.formatMessage(messages.filterChildOptionsEntertainment),
    filterChildOptionsNFTMarketplace: intl.formatMessage(messages.filterChildOptionsNFTMarketplace),
    filterChildOptionsNews: intl.formatMessage(messages.filterChildOptionsNews),
    filterChildOptionsStablecoin: intl.formatMessage(messages.filterChildOptionsStablecoin),
    filterChildOptionsTradingTools: intl.formatMessage(messages.filterChildOptionsTradingTools),
    filterParentOptionsCommunity: intl.formatMessage(messages.filterParentOptionsCommunity),
    filterParentOptionsInvestment: intl.formatMessage(messages.filterParentOptionsInvestment),
    filterParentOptionsMedia: intl.formatMessage(messages.filterParentOptionsMedia),
    filterParentOptionsNFT: intl.formatMessage(messages.filterParentOptionsNFT),
    filterParentOptionsTrading: intl.formatMessage(messages.filterParentOptionsTrading),
    learnMore: intl.formatMessage(globalMessages.learnMore),
    disconnectWarning: intl.formatMessage(messages.disconnectWarning),
  }).current
}

const messages = Object.freeze(
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
      defaultMessage: '!!!Authorized',
    },
    singleAddress: {
      id: 'discover.discoverList.singleAddress',
      defaultMessage: '!!!Single address',
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
      defaultMessage: '!!!Disconnect DApp',
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
    singleAddressWarning: {
      id: 'discover.confirmConnectionModal.singleAddressWarning',
      defaultMessage:
        '!!!This DApp supports only single-address wallets. Your wallet balance might be displayed incorrectly.',
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
    signData: {
      id: 'discover.reviewTransaction.signData',
      defaultMessage: '!!!Sign data',
    },
    signMessage: {
      id: 'discover.reviewTransaction.signMessage',
      defaultMessage: '!!!Sign message',
    },
    testnetWarningTitle: {
      id: 'discover.testnetWarning.title',
      defaultMessage: '!!!Testnet DApps 🚧',
    },
    testnetWarningDescription: {
      id: 'discover.testnetWarning.description',
      defaultMessage:
        '!!!This is a list of DApps designed for testnet use. Note that it may be limited, as not all DApps are deployed in the testnet environment.',
    },
    filterChildOptionsNews: {
      id: 'discover.filterOptions.child.news',
      defaultMessage: '!!!News',
    },
    filterChildOptionsEntertainment: {
      id: 'discover.filterOptions.child.entertainment',
      defaultMessage: '!!!Entertainment',
    },
    filterChildOptionsDeFi: {
      id: 'discover.filterOptions.child.defi',
      defaultMessage: '!!!DeFi',
    },
    filterChildOptionsDEX: {
      id: 'discover.filterOptions.child.dex',
      defaultMessage: '!!!DEX',
    },
    filterChildOptionsNFTMarketplace: {
      id: 'discover.filterOptions.child.nftmarketplace',
      defaultMessage: '!!!NFT Marketplace',
    },
    filterChildOptionsStablecoin: {
      id: 'discover.filterOptions.child.stablecoin',
      defaultMessage: '!!!Stablecoin',
    },
    filterChildOptionsTradingTools: {
      id: 'discover.filterOptions.child.tradingtools',
      defaultMessage: '!!!Trading Tools',
    },
    filterChildOptionsDAO: {
      id: 'discover.filterOptions.child.dao',
      defaultMessage: '!!!DAO',
    },
    filterChildOptionsDecentralisedStorage: {
      id: 'discover.filterOptions.child.decentralisedstorage',
      defaultMessage: '!!!Decentralised Storage',
    },
    filterParentOptionsMedia: {
      id: 'discover.filterOptions.parent.media',
      defaultMessage: '!!!Media',
    },
    filterParentOptionsInvestment: {
      id: 'discover.filterOptions.parent.investment',
      defaultMessage: '!!!Investment',
    },
    filterParentOptionsNFT: {
      id: 'discover.filterOptions.parent.nft',
      defaultMessage: '!!!NFT',
    },
    filterParentOptionsTrading: {
      id: 'discover.filterOptions.parent.trading',
      defaultMessage: '!!!Trading',
    },
    filterParentOptionsCommunity: {
      id: 'discover.filterOptions.parent.community',
      defaultMessage: '!!!Community',
    },
    disconnectWarning: {
      id: 'discover.modal.disconnectWarning',
      defaultMessage:
        '!!!Even if you disconnected Yoroi from the DApp, Yoroi is still authorized. If you want to remove such authorization, please click Disconnect DApp.',
    },
  }),
)

export const useMappedStrings = () => {
  const strings = useStrings()

  return (option: string) => {
    switch (option) {
      case 'Media':
        return strings.filterParentOptionsMedia

      case 'Investment':
        return strings.filterParentOptionsInvestment

      case 'NFT':
        return strings.filterParentOptionsNFT

      case 'Trading':
        return strings.filterParentOptionsTrading

      case 'Community':
        return strings.filterParentOptionsCommunity

      case 'News':
        return strings.filterChildOptionsNews

      case 'Entertainment':
        return strings.filterChildOptionsEntertainment

      case 'DeFi':
        return strings.filterChildOptionsDeFi

      case 'DEX':
        return strings.filterChildOptionsDEX

      case 'NFT Marketplace':
        return strings.filterChildOptionsNFTMarketplace

      case 'Stablecoin':
        return strings.filterChildOptionsStablecoin

      case 'Trading Tools':
        return strings.filterChildOptionsTradingTools

      case 'DAO':
        return strings.filterChildOptionsDAO

      case 'Decentralised Storage':
        return strings.filterChildOptionsDecentralisedStorage

      default:
        return null
    }
  }
}
