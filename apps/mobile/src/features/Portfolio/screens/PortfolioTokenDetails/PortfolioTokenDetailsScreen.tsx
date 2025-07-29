import {usePortfolioTokenInfo} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {App} from '@yoroi/types'
import * as React from 'react'
import {Animated, NativeScrollEvent, NativeSyntheticEvent} from 'react-native'

import {usePortfolioTokenDetailParams} from '~/features/Portfolio/common/hooks/useNavigateTo'
import {useStrings} from '~/features/ReviewTx/common/hooks/useStrings'
import {
  PortfolioDetailsTab,
  usePortfolio,
} from '~/features/Portfolio/context/PortfolioProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {features} from '~/kernel/features'
import {throwLoggedError} from '~/kernel/logger/helpers/throw-logged-error'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {Tab, Tabs} from '~/ui/Tabs/Tabs'
import {TxFilter} from '../Transactions/useCases/TxList/TxFilterProvider'
import {TxList} from '../Transactions/useCases/TxList/TxList'
import {Actions} from './Actions'
import {PortfolioTokenBalance} from './PortfolioTokenBalance/PortfolioTokenBalance'
import {PortfolioTokenChart} from './PortfolioTokenChart/PortfolioTokenChart'
import {PortfolioTokenInfo} from './PortfolioTokenInfo/PortfolioTokenInfo'

export const PortfolioTokenDetailsScreen = () => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()
  const {detailsTab, setDetailsTab} = usePortfolio()
  const {track} = useMetrics()
  const [isStickyTab, setIsStickyTab] = React.useState(false)
  const {id: tokenId} = usePortfolioTokenDetailParams()
  const {wallet} = useSelectedWallet()
  const {tokenInfo} = usePortfolioTokenInfo(
    {
      getTokenInfo: wallet.networkManager.tokenManager.api.tokenInfo,
      id: tokenId,
      network: wallet.networkManager.network,
      primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
    },
    {suspense: true},
  )

  const HEADER_HEIGHT = 304

  if (!tokenInfo)
    throwLoggedError(
      new App.Errors.InvalidState('Token info not found, invalid state'),
    )

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y
    setIsStickyTab(offsetY > HEADER_HEIGHT)
  }

  React.useEffect(() => {
    track.portfolioTokenDetails({token_details_tab: detailsTab})
  }, [detailsTab, track])

  const renderTabs = React.useMemo(() => {
    return (
      <Tabs
        style={[
          a.justify_between,
          a.px_lg,
          a.gap_lg,
          {backgroundColor: p.bg_color_max},
        ]}
      >
        {features.portfolioPerformance && (
          <Tab
            style={[{flex: 1}]}
            active={detailsTab === PortfolioDetailsTab.Performance}
            onPress={() => setDetailsTab(PortfolioDetailsTab.Performance)}
            label={strings.performance}
          />
        )}

        <Tab
          style={[{flex: 1}]}
          active={detailsTab === PortfolioDetailsTab.Overview}
          onPress={() => setDetailsTab(PortfolioDetailsTab.Overview)}
          label={strings.overview}
        />

        <Tab
          style={[{flex: 1}]}
          active={detailsTab === PortfolioDetailsTab.Transactions}
          onPress={() => setDetailsTab(PortfolioDetailsTab.Transactions)}
          label={strings.transactions}
        />
      </Tabs>
    )
  }, [
    detailsTab,
    setDetailsTab,
    strings.overview,
    strings.performance,
    strings.transactions,
  ])

  return (
    <SafeArea>
      <TxFilter tokenId={tokenId}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              width: '100%',
              zIndex: 10,
            },
            isStickyTab
              ? {opacity: 1, display: 'flex'}
              : {opacity: 0, display: 'none'},
          ]}
        >
          {renderTabs}
        </Animated.View>

        <TxList
          onScroll={onScroll}
          ListHeaderComponent={
            <>
              <Animated.View
                style={[{overflow: 'hidden', height: HEADER_HEIGHT}]}
              >
                <Space.Height.md />

                <PortfolioTokenBalance />

                <Space.Height.md />

                <PortfolioTokenChart />

                <Space.Height.md />
              </Animated.View>

              <Animated.View>{renderTabs}</Animated.View>

              <PortfolioTokenInfo />
            </>
          }
          {...(detailsTab !== PortfolioDetailsTab.Transactions && {data: []})}
        />

        <Actions tokenInfo={tokenInfo} />
      </TxFilter>
    </SafeArea>
  )
}
