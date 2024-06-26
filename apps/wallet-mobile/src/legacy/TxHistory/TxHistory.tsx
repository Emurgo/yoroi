import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {LayoutAnimation, StyleSheet, View} from 'react-native'

import infoIcon from '../../assets/img/icon/info-light-green.png'
import {Boundary, Spacer} from '../../components'
import {Tab, TabPanel, TabPanels, Tabs} from '../../components/Tabs'
import {useSelectedWallet} from '../../features/WalletManager/common/hooks/useSelectedWallet'
import {assetMessages, txLabels} from '../../kernel/i18n/global-messages'
import {useSync} from '../../yoroi-wallets/hooks'
import {usePoolTransitionModal} from '../Staking/PoolTransition/usePoolTransitionModal'
import {ActionsBanner} from './ActionsBanner'
import {ListBalances} from './AssetList/ListBalances'
import {BalanceBanner} from './BalanceBanner'
import {CollapsibleHeader} from './CollapsibleHeader'
import {LockedDeposit} from './LockedDeposit'
import {TxHistoryList} from './TxHistoryList'
import {useOnScroll} from './useOnScroll'
import {WarningBanner} from './WarningBanner'

type Tab = 'transactions' | 'assets'

export const TxHistory = () => {
  const strings = useStrings()
  const styles = useStyles()
  const {wallet, meta} = useSelectedWallet()
  const [showWarning, setShowWarning] = React.useState(meta.implementation === 'cardano-bip44')

  const [activeTab, setActiveTab] = React.useState<Tab>('transactions')

  const onSelectTab = (tab: Tab) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setActiveTab(tab)
  }

  const {sync, isLoading: isLoadingWallet} = useSync(wallet)
  const {isLoading: isLoadingPoolTransition} = usePoolTransitionModal()
  const isLoading = isLoadingWallet || isLoadingPoolTransition

  const [expanded, setExpanded] = React.useState(true)
  const onScroll = useOnScroll({
    onScrollUp: () => setExpanded(true),
    onScrollDown: () => setExpanded(false),
  })

  const handleOnRefresh = () => sync()

  return (
    <View style={styles.scrollView}>
      <CollapsibleHeader expanded={expanded}>
        <BalanceBanner />

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
          {meta.implementation === 'cardano-bip44' && showWarning && (
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

          <TxHistoryList onScroll={onScroll} refreshing={isLoading} onRefresh={handleOnRefresh} />
        </TabPanel>

        <TabPanel active={activeTab === 'assets'}>
          <Boundary loading={{size: 'full'}}>
            <ListBalances onScroll={onScroll} refreshing={isLoading} onRefresh={handleOnRefresh} />
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
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: color.primary_c100,
    },
    warningNoteStyles: {
      position: 'absolute',
      zIndex: 2,
      bottom: 0,
    },
    tabs: {
      flexDirection: 'row',
      backgroundColor: color.gray_cmin,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    tab: {
      alignItems: 'center',
      justifyContent: 'center',
      ...atoms.p_lg,
      flex: 1,
    },
  })

  return styles
}
