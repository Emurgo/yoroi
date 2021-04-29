// @flow

import React, {useEffect} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withStateHandlers} from 'recompose'
import {useNavigationState} from '@react-navigation/native'
import {View, RefreshControl, ScrollView, Image} from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import _ from 'lodash'
import {BigNumber} from 'bignumber.js'

import {injectIntl, defineMessages} from 'react-intl'
import {fetchUTXOs} from '../../actions/utxo'
import VotingBanner from '../Catalyst/VotingBanner'
import {Text, Banner, OfflineBanner, StatusBar, WarningBanner} from '../UiKit'
import infoIcon from '../../assets/img/icon/info-light-green.png'
import {
  transactionsInfoSelector,
  isSynchronizingHistorySelector,
  lastHistorySyncErrorSelector,
  isOnlineSelector,
  tokenBalanceSelector,
  availableAssetsSelector,
  walletMetaSelector,
  languageSelector,
  isFlawedWalletSelector,
} from '../../selectors'
import TxHistoryList from './TxHistoryList'
import walletManager from '../../crypto/walletManager'
import {updateHistory} from '../../actions/history'
import {checkForFlawedWallets} from '../../actions'
import {
  onDidMount,
  requireInitializedWallet,
  withNavigationTitle,
} from '../../utils/renderUtils'
import FlawedWalletModal from './FlawedWalletModal'
import {WALLET_ROOT_ROUTES, CATALYST_ROUTES} from '../../RoutesList'
import {isByron} from '../../config/config'

import {formatTokenWithText} from '../../utils/format'
import image from '../../assets/img/no_transactions.png'
import globalMessages from '../../i18n/global-messages'

import styles from './styles/TxHistory.style'

import type {ComponentType} from 'react'
import type {Navigation} from '../../types/navigation'
import type {State} from '../../state'
import type {Token} from '../../types/HistoryTransaction'

const messages = defineMessages({
  noTransactions: {
    id: 'components.txhistory.txhistory.noTransactions',
    defaultMessage: '!!!No transactions to show yet',
  },
})

const warningBannerMessages = defineMessages({
  title: {
    id: 'components.txhistory.txhistory.warningbanner.title',
    defaultMessage: '!!!Note:',
  },
  message: {
    id: 'components.txhistory.txhistory.warningbanner.message',
    defaultMessage:
      '!!!The Shelley protocol upgrade adds a new Shelley wallet type which supports delegation.',
  },
})

const NoTxHistory = injectIntl(({intl}) => (
  <View style={styles.empty}>
    <Image source={image} />
    <Text style={styles.emptyText}>
      {intl.formatMessage(messages.noTransactions)}
    </Text>
  </View>
))

const SyncErrorBanner = injectIntl(({intl, showRefresh}) => (
  <Banner
    error
    text={
      showRefresh
        ? intl.formatMessage(globalMessages.syncErrorBannerTextWithRefresh)
        : intl.formatMessage(globalMessages.syncErrorBannerTextWithoutRefresh)
    }
  />
))

type AvailableAmountProps = {|
  intl: any,
  amount: BigNumber,
  amountAssetMetaData: Token,
|}
const AvailableAmountBanner = injectIntl(
  ({intl, amount, amountAssetMetaData}: AvailableAmountProps) => (
    <Banner
      label={intl.formatMessage(globalMessages.availableFunds)}
      text={
        amount != null ? formatTokenWithText(amount, amountAssetMetaData) : '-'
      }
      boldText
    />
  ),
)

const TxHistory = ({
  transactionsInfo,
  navigation,
  isSyncing,
  isOnline,
  updateHistory,
  lastSyncError,
  tokenBalance,
  availableAssets,
  isFlawedWallet,
  showWarning,
  setShowWarning,
  walletMeta,
  intl,
}) => {
  const routes = useNavigationState((state) => state.routes)

  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        navigation.dispatch(e.data.action)
        if (routes.length === 1) {
          // this is the last and only route in the stack, wallet should close
          walletManager.closeWallet()
        }
      }),
    [navigation],
  )
  return (
    <SafeAreaView style={styles.scrollView}>
      <StatusBar type="dark" />
      <View style={styles.container}>
        {!walletMeta.isHW && (
          <VotingBanner
            onPress={() => navigation.navigate(CATALYST_ROUTES.ROOT)}
          />
        )}
        {isFlawedWallet === true && (
          <FlawedWalletModal
            visible={isFlawedWallet === true}
            disableButtons={false}
            onPress={() =>
              navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)
            }
            onRequestClose={() =>
              navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)
            }
          />
        )}

        <OfflineBanner />
        {isOnline &&
          lastSyncError && <SyncErrorBanner showRefresh={!isSyncing} />}

        <AvailableAmountBanner
          amount={tokenBalance.getDefault()}
          amountAssetMetaData={availableAssets[tokenBalance.getDefaultId()]}
        />

        {_.isEmpty(transactionsInfo) ? (
          <ScrollView
            refreshControl={
              <RefreshControl
                onRefresh={updateHistory}
                refreshing={isSyncing}
              />
            }
          >
            <NoTxHistory />
          </ScrollView>
        ) : (
          <TxHistoryList
            refreshing={isSyncing}
            onRefresh={updateHistory}
            navigation={navigation}
            transactions={transactionsInfo}
          />
        )}

        {/* eslint-disable indent */
        isByron(walletMeta.walletImplementationId) &&
          showWarning && (
            <WarningBanner
              title={intl
                .formatMessage(warningBannerMessages.title)
                .toUpperCase()}
              icon={infoIcon}
              message={intl.formatMessage(warningBannerMessages.message)}
              showCloseIcon
              onRequestClose={() => setShowWarning(false)}
              style={styles.warningNoteStyles}
            />
          )
        /* eslint-enable indent */
        }
      </View>
    </SafeAreaView>
  )
}

type ExternalProps = {|
  navigation: Navigation,
|}

export default injectIntl(
  (compose(
    requireInitializedWallet,
    connect(
      (state: State) => ({
        transactionsInfo: transactionsInfoSelector(state),
        isSyncing: isSynchronizingHistorySelector(state),
        lastSyncError: lastHistorySyncErrorSelector(state),
        isOnline: isOnlineSelector(state),
        tokenBalance: tokenBalanceSelector(state),
        availableAssets: availableAssetsSelector(state),
        key: languageSelector(state),
        isFlawedWallet: isFlawedWalletSelector(state),
        walletMeta: walletMetaSelector(state),
      }),
      {
        updateHistory,
        checkForFlawedWallets,
        fetchUTXOs,
      },
    ),
    onDidMount(({updateHistory, checkForFlawedWallets}) => {
      checkForFlawedWallets()
      updateHistory()
    }),
    withStateHandlers(
      {
        showWarning: true,
      },
      {
        setShowWarning: () => (showWarning: boolean) => ({showWarning}),
      },
    ),
    withNavigationTitle(({walletMeta}) => walletMeta.name),
  )(TxHistory): ComponentType<ExternalProps>),
)
