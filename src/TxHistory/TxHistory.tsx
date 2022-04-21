import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {LayoutAnimation, StyleSheet, TouchableOpacity, View} from 'react-native'
import {useDispatch, useSelector} from 'react-redux'

import infoIcon from '../assets/img/icon/info-light-green.png'
import {OfflineBanner, StatusBar, Text} from '../components'
import {assetMessages, txLabels} from '../i18n/global-messages'
import {fetchAccountState} from '../legacy/account'
import {checkForFlawedWallets} from '../legacy/actions'
import {UI_V2} from '../legacy/config'
import {isByron} from '../legacy/config'
import {updateHistory} from '../legacy/history'
import {
  isOnlineSelector,
  isSynchronizingHistorySelector,
  lastHistorySyncErrorSelector,
  walletIsInitializedSelector,
} from '../legacy/selectors'
import {useSelectedWallet} from '../SelectedWallet'
import {COLORS} from '../theme'
import {ActionsBanner} from './ActionsBanner'
import {AssetList} from './AssetList'
import {BalanceBanner} from './BalanceBanner'
import {CollapsibleHeader} from './CollapsibleHeader'
import {SyncErrorBanner} from './SyncErrorBanner'
import {TxHistoryList} from './TxHistoryList'
import {WarningBanner} from './WarningBanner'

type Tab = 'transactions' | 'assets'

export const TxHistory = () => {
  const strings = useStrings()
  const dispatch = useDispatch()
  const isSyncing = useSelector(isSynchronizingHistorySelector)
  const lastSyncError = useSelector(lastHistorySyncErrorSelector)
  const isOnline = useSelector(isOnlineSelector)
  const wallet = useSelectedWallet()
  const walletIsInitialized = useSelector(walletIsInitializedSelector)

  const [showWarning, setShowWarning] = useState(isByron(wallet.walletImplementationId))

  useEffect(() => {
    dispatch(checkForFlawedWallets())
    dispatch(updateHistory())
    dispatch(fetchAccountState())
  }, [dispatch])

  const [expanded, setExpanded] = useState(true)

  const [activeTab, setActiveTab] = useState<Tab>('transactions')
  const onSelectTab = (tab: Tab) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setActiveTab(tab)
  }

  if (!walletIsInitialized) {
    return <Text>l10n Please wait while wallet is initialized...</Text>
  }

  return (
    <View style={styles.scrollView}>
      <StatusBar type={UI_V2 ? 'light' : 'dark'} />

      <View style={styles.container}>
        <OfflineBanner />
        <SyncErrorBanner showRefresh={!isSyncing} isOpen={isOnline && lastSyncError} />

        <CollapsibleHeader expanded={expanded}>
          <BalanceBanner />
          {UI_V2 && <ActionsBanner />}
        </CollapsibleHeader>

        <Tabs>
          <Tab
            onPress={() => {
              setExpanded(true)
              onSelectTab('transactions')
            }}
            label={strings.transactions}
            active={activeTab === 'transactions'}
          />
          <Tab //
            onPress={() => {
              setExpanded(true)
              onSelectTab('assets')
            }}
            label={strings.assets}
            active={activeTab === 'assets'}
          />
        </Tabs>

        <TabPanels>
          <TabPanel active={activeTab === 'transactions'}>
            {isByron(wallet.walletImplementationId) && showWarning && (
              <WarningBanner
                title={strings.warningTitle.toUpperCase()}
                icon={infoIcon}
                message={strings.warningMessage}
                showCloseIcon
                onRequestClose={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
                  setShowWarning(false)
                }}
                style={styles.warningNoteStyles}
              />
            )}
            <TxHistoryList
              onScrollUp={() => setExpanded(true)}
              onScrollDown={() => setExpanded(false)}
              refreshing={isSyncing}
              onRefresh={() => dispatch(updateHistory())}
            />
          </TabPanel>

          <TabPanel active={activeTab === 'assets'}>
            <AssetList
              onScrollUp={() => setExpanded(true)}
              onScrollDown={() => setExpanded(false)}
              refreshing={isSyncing}
              onRefresh={() => dispatch(updateHistory())}
            />
          </TabPanel>
        </TabPanels>
      </View>
    </View>
  )
}

const Tabs: React.FC = ({children}) => <View style={styles.tabs}>{children}</View>
const Tab = ({onPress, active, label}: {onPress: () => void; active: boolean; label: string}) => (
  <TouchableOpacity style={styles.tab} onPress={onPress}>
    <View style={styles.centered}>
      <Text style={[styles.tabText, active ? styles.tabTextActive : styles.tabTextInactive]}>{label}</Text>
    </View>

    {active && <View style={styles.indicator} />}
  </TouchableOpacity>
)
const TabPanels: React.FC = ({children}) => <View style={styles.tabNavigatorRoot}>{children}</View>
const TabPanel: React.FC<{active: boolean}> = ({active, children}) => <>{active ? children : null}</>

const useStrings = () => {
  const intl = useIntl()

  return {
    warningTitle: intl.formatMessage(warningBannerMessages.title),
    warningMessage: intl.formatMessage(warningBannerMessages.message),
    transactions: intl.formatMessage(txLabels.transactions),
    assets: intl.formatMessage(assetMessages.assets),
  }
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

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_GRAY,
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
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    flex: 1,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Rubik-Medium',
  },
  tabTextActive: {
    color: COLORS.LIGHT_POSITIVE_GREEN,
  },
  tabTextInactive: {
    color: COLORS.TEXT_INPUT,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '100%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: COLORS.LIGHT_POSITIVE_GREEN,
  },

  tabNavigatorRoot: {
    flex: 1,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
})
