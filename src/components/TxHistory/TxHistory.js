// @flow

import React from 'react'
import type {ComponentType} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withStateHandlers} from 'recompose'
import {View, RefreshControl, ScrollView, Image} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import _ from 'lodash'
import {injectIntl, defineMessages} from 'react-intl'
import {fetchUTXOs} from '../../actions/utxo'

import {Text, Banner, OfflineBanner, StatusBar, WarningBanner} from '../UiKit'
import infoIcon from '../../assets/img/icon/info-light-green.png'
import {
  transactionsInfoSelector,
  isSynchronizingHistorySelector,
  lastHistorySyncErrorSelector,
  isOnlineSelector,
  availableAmountSelector,
  utxoBalanceSelector,
  walletMetaSelector,
  languageSelector,
  isFlawedWalletSelector,
} from '../../selectors'
import TxHistoryList from './TxHistoryList'
import {updateHistory} from '../../actions/history'
import {checkForFlawedWallets} from '../../actions'
import {
  onDidMount,
  onDidUpdate,
  requireInitializedWallet,
  withNavigationTitle,
} from '../../utils/renderUtils'
import FlawedWalletModal from './FlawedWalletModal'
import {WALLET_ROOT_ROUTES} from '../../RoutesList'
import {isByron} from '../../config/config'

import {formatAdaWithText} from '../../utils/format'
import image from '../../assets/img/no_transactions.png'

import styles from './styles/TxHistory.style'

import type {Navigation} from '../../types/navigation'
import type {State} from '../../state'
import globalMessages from '../../i18n/global-messages'

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

const AvailableAmountBanner = injectIntl(({intl, amount}) => (
  <Banner
    label={intl.formatMessage(globalMessages.availableFunds)}
    text={amount != null ? formatAdaWithText(amount) : '-'}
    boldText
  />
))

const TxHistory = ({
  transactionsInfo,
  navigation,
  isSyncing,
  isOnline,
  updateHistory,
  lastSyncError,
  utxoBalance,
  isFlawedWallet,
  showWarning,
  setShowWarning,
  walletMeta,
  intl,
}) => (
  <SafeAreaView style={styles.scrollView}>
    <StatusBar type="dark" />
    <View style={styles.container}>
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

      {
        // TODO(v-almonacid): prefer computing balance from tx cache
        // instead of utxo set
      }
      <AvailableAmountBanner amount={utxoBalance} />

      {_.isEmpty(transactionsInfo) ? (
        <ScrollView
          refreshControl={
            <RefreshControl onRefresh={updateHistory} refreshing={isSyncing} />
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
        availableAmount: availableAmountSelector(state),
        utxoBalance: utxoBalanceSelector(state),
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
      fetchUTXOs()
      updateHistory()
    }),
    onDidUpdate(({fetchUTXOs, availableAmount, utxoBalance}, prevProps) => {
      // note(v-almonacid): currently the availableAmount selector is not
      // accurate, so instead we rely on the utxo balance.
      if (
        utxoBalance == null ||
        !availableAmount.eq(prevProps.availableAmount)
      ) {
        fetchUTXOs()
      }
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
