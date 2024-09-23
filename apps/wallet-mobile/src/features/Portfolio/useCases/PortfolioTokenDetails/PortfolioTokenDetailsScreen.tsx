import {useTheme} from '@yoroi/theme'
import {App} from '@yoroi/types'
import * as React from 'react'
import {Animated, NativeScrollEvent, NativeSyntheticEvent, StyleSheet} from 'react-native'

import {SafeArea} from '../../../../components/SafeArea'
import {Spacer} from '../../../../components/Spacer/Spacer'
import {Tab, Tabs} from '../../../../components/Tabs/Tabs'
import {features} from '../../../../kernel/features'
import {throwLoggedError} from '../../../../kernel/logger/helpers/throw-logged-error'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {TxFilter} from '../../../Transactions/useCases/TxList/TxFilterProvider'
import {TxList} from '../../../Transactions/useCases/TxList/TxList'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {usePortfolioTokenDetailParams} from '../../common/hooks/useNavigateTo'
import {useStrings} from '../../common/hooks/useStrings'
import {PortfolioDetailsTab, usePortfolio} from '../../common/PortfolioProvider'
import {BuyADABanner} from '../PortfolioDashboard/DashboardTokensList/BuyADABanner/BuyADABanner'
import {Actions} from './Actions'
import {PortfolioTokenBalance} from './PortfolioTokenBalance/PortfolioTokenBalance'
import {PortfolioTokenChart} from './PortfolioTokenChart/PortfolioTokenChart'
import {PortfolioTokenInfo} from './PortfolioTokenInfo/PortfolioTokenInfo'

const HEADER_HEIGHT = 304

export const PortfolioTokenDetailsScreen = () => {
  const strings = useStrings()
  const {detailsTab, setDetailsTab} = usePortfolio()
  const {track} = useMetrics()
  const [isStickyTab, setIsStickyTab] = React.useState(false)
  const {id: tokenId} = usePortfolioTokenDetailParams()
  const {wallet} = useSelectedWallet()
  const tokenInfo = wallet.balances.records.get(tokenId)?.info
  const {styles} = useStyles(HEADER_HEIGHT)

  if (!tokenInfo) throwLoggedError(new App.Errors.InvalidState('Token info not found, invalid state'))

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y
    setIsStickyTab(offsetY > HEADER_HEIGHT)
  }

  React.useEffect(() => {
    track.portfolioTokenDetails({token_details_tab: detailsTab})
  }, [detailsTab, track])

  const renderTabs = React.useMemo(() => {
    return (
      <Tabs style={styles.tabs}>
        {features.portfolioPerformance && (
          <Tab
            style={styles.tab}
            active={detailsTab === PortfolioDetailsTab.Performance}
            onPress={() => setDetailsTab(PortfolioDetailsTab.Performance)}
            label={strings.performance}
          />
        )}

        <Tab
          style={styles.tab}
          active={detailsTab === PortfolioDetailsTab.Overview}
          onPress={() => setDetailsTab(PortfolioDetailsTab.Overview)}
          label={strings.overview}
        />

        <Tab
          style={styles.tab}
          active={detailsTab === PortfolioDetailsTab.Transactions}
          onPress={() => setDetailsTab(PortfolioDetailsTab.Transactions)}
          label={strings.transactions}
        />
      </Tabs>
    )
  }, [detailsTab, setDetailsTab, strings.overview, strings.performance, strings.transactions, styles.tab, styles.tabs])

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

                <PortfolioTokenChart />

                <Spacer height={16} />
              </Animated.View>

              <Animated.View>{renderTabs}</Animated.View>

              <PortfolioTokenInfo />
            </>
          }
          {...(detailsTab !== PortfolioDetailsTab.Transactions && {data: []})}
          {...(detailsTab === PortfolioDetailsTab.Transactions && {ListEmptyComponent: <BuyADABanner />})}
        />

        <Actions tokenInfo={tokenInfo} />
      </TxFilter>
    </SafeArea>
  )
}

const useStyles = (height: number) => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    header: {
      overflow: 'hidden',
      height,
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
      backgroundColor: color.bg_color_max,
    },
    tab: {
      flex: 1,
    },
  })

  return {styles} as const
}
