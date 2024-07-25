import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Animated, NativeScrollEvent, NativeSyntheticEvent, StyleSheet} from 'react-native'

import {Spacer} from '../../../../components'
import {SafeArea} from '../../../../components/SafeArea'
import {Tab, Tabs} from '../../../../components/Tabs'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {features} from '../../..'
import {TxFilter} from '../../../Transactions/useCases/TxList/TxFilterProvider'
import {TxList} from '../../../Transactions/useCases/TxList/TxList'
import {usePortfolioTokenDetailContext} from '../../common/PortfolioTokenDetailContext'
import {usePortfolioTokenDetailParams} from '../../common/useNavigateTo'
import {useStrings} from '../../common/useStrings'
import {BuyADABanner} from '../PortfolioDashboard/DashboardTokensList/BuyADABanner/BuyADABanner'
import {PortfolioTokenAction} from './PortfolioTokenAction'
import {PortfolioTokenBalance} from './PortfolioTokenBalance/PortfolioTokenBalance'
import {PortfolioTokenChart} from './PortfolioTokenChart/PortfolioTokenChart'
import {PortfolioTokenInfo} from './PortfolioTokenInfo/PortfolioTokenInfo'

const HEADER_HEIGHT = features.portfolioGraph ? 304 : 85

export type ActiveTab = 'performance' | 'overview' | 'transactions'

type Tabs = 'Performance' | 'Overview' | 'Transactions'
const tabs: Record<ActiveTab, Tabs> = {
  performance: 'Performance',
  overview: 'Overview',
  transactions: 'Transactions',
}
export const PortfolioTokenDetailsScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {activeTab, setActiveTab} = usePortfolioTokenDetailContext()
  const {track} = useMetrics()
  const [isStickyTab, setIsStickyTab] = React.useState(false)
  const {id: tokenId} = usePortfolioTokenDetailParams()

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y
    setIsStickyTab(offsetY > HEADER_HEIGHT)
  }

  React.useEffect(() => {
    track.portfolioTokenDetails({token_details_tab: tabs[activeTab]})
  }, [activeTab, track])

  const renderTabs = React.useMemo(() => {
    return (
      <Tabs style={styles.tabs}>
        {features.portfolioPerformance && (
          <Tab
            style={styles.tab}
            active={activeTab === 'performance'}
            onPress={() => setActiveTab('performance')}
            label={strings.performance}
          />
        )}

        <Tab
          style={styles.tab}
          active={activeTab === 'overview'}
          onPress={() => setActiveTab('overview')}
          label={strings.overview}
        />

        <Tab
          style={styles.tab}
          active={activeTab === 'transactions'}
          onPress={() => setActiveTab('transactions')}
          label={strings.transactions}
        />
      </Tabs>
    )
  }, [activeTab, setActiveTab, strings.overview, strings.performance, strings.transactions, styles.tab, styles.tabs])

  return (
    <SafeArea>
      <TxFilter tokenId={tokenId}>
        <Animated.View style={[styles.tabsSticky, isStickyTab ? styles.tabsStickyActive : styles.tabsStickyInactive]}>
          {renderTabs}
        </Animated.View>

        <TxList
          onScroll={onScroll}
          ListHeaderComponent={
            <>
              <Animated.View style={styles.header}>
                <Spacer height={16} />

                <PortfolioTokenBalance />

                <Spacer height={16} />

                {features.portfolioGraph && (
                  <>
                    <PortfolioTokenChart />

                    <Spacer height={16} />
                  </>
                )}
              </Animated.View>

              <Animated.View>{renderTabs}</Animated.View>

              <PortfolioTokenInfo />
            </>
          }
          {...(activeTab !== 'transactions' && {data: []})}
          {...(activeTab === 'transactions' && {ListEmptyComponent: <BuyADABanner />})}
        />

        <PortfolioTokenAction />
      </TxFilter>
    </SafeArea>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    header: {
      overflow: 'hidden',
      height: HEADER_HEIGHT,
    },
    tabsSticky: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      zIndex: 10,
    },
    tabsStickyActive: {
      opacity: 1,
      display: 'flex',
    },
    tabsStickyInactive: {
      opacity: 0,
      display: 'none',
    },
    tabs: {
      ...atoms.justify_between,
      ...atoms.px_lg,
      ...atoms.gap_lg,
      backgroundColor: color.bg_color_high,
    },
    tab: {
      flex: 1,
    },
  })

  return {styles} as const
}
