import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {LayoutAnimation, StyleSheet, View} from 'react-native'

import infoIcon from '../assets/img/icon/info-light-green.png'
import {Boundary, ResetErrorRef, Spacer} from '../components'
import {Tab, TabPanel, TabPanels, Tabs} from '../components/Tabs'
import {useSelectedWallet} from '../features/Wallet/common/Context'
import {assetMessages, txLabels} from '../i18n/global-messages'
import {isByron} from '../yoroi-wallets/cardano/utils'
import {useSync} from '../yoroi-wallets/hooks'
import {ActionsBanner} from './ActionsBanner'
import {AssetList} from './AssetList'
import {BalanceBanner} from './BalanceBanner'
import {CollapsibleHeader} from './CollapsibleHeader'
import {LockedDeposit} from './LockedDeposit'
import {TxHistoryList} from './TxHistoryList'
import {useOnScroll} from './useOnScroll'
import {WarningBanner} from './WarningBanner'

type Tab = 'transactions' | 'assets'

export const TxHistory = () => {
  const resetErrorRef = React.useRef<null | ResetErrorRef>(null)
  const strings = useStrings()
  const styles = useStyles()
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
    resetErrorRef.current?.reset()
    sync()
  }

  return (
    <View style={styles.scrollView}>
      <CollapsibleHeader expanded={expanded}>
        <BalanceBanner ref={resetErrorRef} />

        <ActionsBanner disabled={isLoading} />
      </CollapsibleHeader>

      <Tabs style={styles.tabs}>
        <Tab
          onPress={() => {
            setExpanded(true)
            onSelectTab('transactions')
          }}
          label={strings.transactions}
          active={activeTab === 'transactions'}
          testID="transactionsTabButton"
          style={styles.tab}
        />

        <Tab //
          onPress={() => {
            setExpanded(true)
            onSelectTab('assets')
          }}
          label={strings.assets}
          active={activeTab === 'assets'}
          testID="assetsTabButton"
          style={styles.tab}
        />
      </Tabs>

      <TabPanels>
        <Spacer height={2} />

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
  )
}

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

const useStyles = () => {
  const {theme} = useTheme()
  const {color, padding} = theme

  const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: color.primary[100],
    },
    warningNoteStyles: {
      position: 'absolute',
      zIndex: 2,
      bottom: 0,
    },
    tabs: {
      flexDirection: 'row',
      backgroundColor: color.gray.min,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    tab: {
      alignItems: 'center',
      justifyContent: 'center',
      ...padding['l'],
      flex: 1,
    },
  })

  return styles
}
