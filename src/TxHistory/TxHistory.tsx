import {useFocusEffect} from '@react-navigation/native'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {LayoutAnimation, StyleSheet, TouchableOpacity, View} from 'react-native'

import infoIcon from '../assets/img/icon/info-light-green.png'
import {Boundary, Spacer, StatusBar, Text} from '../components'
import {useSync} from '../hooks'
import {assetMessages, txLabels} from '../i18n/global-messages'
import {isByron} from '../legacy/config'
import {useSelectedWallet} from '../SelectedWallet'
import {COLORS} from '../theme'
import {ActionsBanner} from './ActionsBanner'
import {AssetList} from './AssetList'
import {BalanceBanner, PairedBalanceErrorRef} from './BalanceBanner'
import {CollapsibleHeader} from './CollapsibleHeader'
import {LockedDeposit} from './LockedDeposit'
import {TxHistoryList} from './TxHistoryList'
import {useOnScroll} from './useOnScroll'
import {WarningBanner} from './WarningBanner'

type Tab = 'transactions' | 'assets'

export const TxHistory = () => {
  const pairedBalanceErrorRef = React.useRef<null | PairedBalanceErrorRef>(null)
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const [showWarning, setShowWarning] = useState(isByron(wallet.walletImplementationId))

  const [activeTab, setActiveTab] = useState<Tab>('transactions')
  const onSelectTab = (tab: Tab) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setActiveTab(tab)
  }

  const {sync, isLoading} = useSync(wallet)
  useFocusEffect(React.useCallback(() => sync(), [sync]))

  const [expanded, setExpanded] = useState(true)
  const onScroll = useOnScroll({
    onScrollUp: () => setExpanded(true),
    onScrollDown: () => setExpanded(false),
  })

  const onRefresh = () => {
    pairedBalanceErrorRef.current?.refetchExchangeRate()
    sync()
  }

  return (
    <View style={styles.scrollView}>
      <StatusBar type="light" />

      <View style={styles.container}>
        <CollapsibleHeader expanded={expanded}>
          <BalanceBanner ref={pairedBalanceErrorRef} />
          <ActionsBanner disabled={isLoading} />
        </CollapsibleHeader>

        <Tabs>
          <Tab
            onPress={() => {
              setExpanded(true)
              onSelectTab('transactions')
            }}
            label={strings.transactions}
            active={activeTab === 'transactions'}
            testID="transactionsTabButton"
          />
          <Tab //
            onPress={() => {
              setExpanded(true)
              onSelectTab('assets')
            }}
            label={strings.assets}
            active={activeTab === 'assets'}
            testID="assetsTabButton"
          />
        </Tabs>

        <TabPanels>
          <Spacer height={4} />
          <LockedDeposit />
          <Spacer height={8} />

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
            <TxHistoryList onScroll={onScroll} refreshing={isLoading} onRefresh={onRefresh} />
          </TabPanel>

          <TabPanel active={activeTab === 'assets'}>
            <Boundary loading={{size: 'full'}}>
              <AssetList onScroll={onScroll} refreshing={isLoading} onRefresh={onRefresh} />
            </Boundary>
          </TabPanel>
        </TabPanels>
      </View>
    </View>
  )
}

const Tabs = ({children}: {children: React.ReactNode}) => <View style={styles.tabs}>{children}</View>
const Tab = ({
  onPress,
  active,
  label,
  testID,
}: {
  onPress: () => void
  active: boolean
  label: string
  testID: string
}) => (
  <TouchableOpacity style={styles.tab} onPress={onPress} testID={testID}>
    <View style={styles.centered}>
      <Text style={[styles.tabText, active ? styles.tabTextActive : styles.tabTextInactive]}>{label}</Text>
    </View>

    {active && <View style={styles.indicator} />}
  </TouchableOpacity>
)
const TabPanels = ({children}: {children: React.ReactNode}) => <View style={styles.tabNavigatorRoot}>{children}</View>
const TabPanel = ({active, children}: {active: boolean; children: React.ReactNode}) => <>{active ? children : null}</>

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
