import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import {useDispatch, useSelector} from 'react-redux'

import {checkForFlawedWallets} from '../../legacy/actions'
import {fetchAccountState} from '../../legacy/actions/account'
import {updateHistory} from '../../legacy/actions/history'
import infoIcon from '../../legacy/assets/img/icon/info-light-green.png'
import {OfflineBanner, StatusBar, Text, WarningBanner} from '../../legacy/components/UiKit'
import {isByron} from '../../legacy/config/config'
import {
  hasAnyTransaction,
  isOnlineSelector,
  isSynchronizingHistorySelector,
  lastHistorySyncErrorSelector,
  walletIsInitializedSelector,
  walletMetaSelector,
} from '../../legacy/selectors'
import {AssetList} from './AssetList'
import {EmptyHistory} from './EmptyHistory'
import {SyncErrorBanner} from './SyncErrorBanner'
import {TxHistoryList} from './TxHistoryList'
import {WalletHero} from './WalletHero'

export const TxHistory = () => {
  const strings = useStrings()
  const dispatch = useDispatch()
  const hasTransaction = useSelector(hasAnyTransaction)
  const isSyncing = useSelector(isSynchronizingHistorySelector)
  const lastSyncError = useSelector(lastHistorySyncErrorSelector)
  const isOnline = useSelector(isOnlineSelector)
  const walletMeta = useSelector(walletMetaSelector)
  const walletIsInitialized = useSelector(walletIsInitializedSelector)

  const [showWarning, setShowWarning] = useState<boolean>(isByron(walletMeta.walletImplementationId))

  useEffect(() => {
    dispatch(checkForFlawedWallets())
    dispatch(updateHistory())
    dispatch(fetchAccountState())
  }, [dispatch])

  if (!walletIsInitialized) {
    return <Text>l10n Please wait while wallet is initialized...</Text>
  }

  return (
    <SafeAreaView style={styles.scrollView}>
      <StatusBar type="light" />

      <View style={styles.container}>
        <OfflineBanner />
        <SyncErrorBanner showRefresh={!isSyncing} isOpen={isOnline && lastSyncError} />

        <WalletHero
          render={(active) => {
            if (active === 0) {
              return (
                <View style={styles.tabNavigatorRoot}>
                  {isByron(walletMeta.walletImplementationId) && showWarning && (
                    <WarningBanner
                      title={strings.warningTitle.toUpperCase()}
                      icon={infoIcon}
                      message={strings.warningMessage}
                      showCloseIcon
                      onRequestClose={() => setShowWarning(false)}
                      style={styles.warningNoteStyles}
                    />
                  )}

                  {!hasTransaction ? (
                    <ScrollView
                      refreshControl={
                        <RefreshControl onRefresh={() => dispatch(updateHistory())} refreshing={isSyncing} />
                      }
                    >
                      <EmptyHistory />
                    </ScrollView>
                  ) : (
                    <TxHistoryList refreshing={isSyncing} onRefresh={() => dispatch(updateHistory())} />
                  )}
                </View>
              )
            } else if (active === 1) {
              return (
                <View style={styles.tabNavigatorRoot}>
                  <AssetList refreshing={isSyncing} onRefresh={() => dispatch(updateHistory())} />
                </View>
              )
            }
          }}
        />
      </View>
    </SafeAreaView>
  )
}

const warningBannerMessages = defineMessages({
  title: {
    id: 'components.txhistory.txhistory.warningbanner.title',
    defaultMessage: '!!!Note:',
  },
  message: {
    id: 'components.txhistory.txhistory.warningbanner.message',
    defaultMessage: '!!!The Shelley protocol upgrade adds a new Shelley wallet type which supports delegation.',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    warningTitle: intl.formatMessage(warningBannerMessages.title),
    warningMessage: intl.formatMessage(warningBannerMessages.message),
  }
}

const styles = StyleSheet.create({
  tabNavigatorRoot: {
    flex: 1,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexDirection: 'column',
    flex: 1,
  },
  warningNoteStyles: {
    position: 'absolute',
    zIndex: 2,
    bottom: 0,
  },
})
