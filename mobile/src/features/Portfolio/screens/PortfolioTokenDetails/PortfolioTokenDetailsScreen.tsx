import {usePortfolioTokenInfo} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {App} from '@yoroi/types'

import * as React from 'react'
import {Animated, NativeScrollEvent, NativeSyntheticEvent} from 'react-native'

import {usePortfolioTokenDetailParams} from '~/features/Portfolio/common/hooks/useNavigateTo'
import {
  PortfolioDetailsTab,
  usePortfolio,
} from '~/features/Portfolio/context/PortfolioProvider'
import {TxFilter} from '~/features/Transactions/useCases/TxList/TxFilterProvider'
import {TxList} from '~/features/Transactions/useCases/TxList/TxList'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {throwLoggedError} from '~/kernel/logger/helpers/throw-logged-error'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {Tab, Tabs} from '~/ui/Tabs/Tabs'

import {Actions} from './Actions'
import {PortfolioTokenBalance} from './PortfolioTokenBalance/PortfolioTokenBalance'
import {PortfolioTokenChart} from './PortfolioTokenChart/PortfolioTokenChart'
import {PortfolioTokenInfo} from './PortfolioTokenInfo/PortfolioTokenInfo'

export const PortfolioTokenDetailsScreen = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()
  const {detailsTab, setDetailsTab} = usePortfolio()
  const [isStickyTab, setIsStickyTab] = React.useState(false)
  const {id: tokenId} = usePortfolioTokenDetailParams()
  const {wallet} = useSelectedWallet()
  const {tokenInfo} = usePortfolioTokenInfo({
    getTokenInfo: wallet.networkManager.tokenManager.api.tokenInfo,
    id: tokenId,
    network: wallet.networkManager.network,
    primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
  })

  const HEADER_HEIGHT = 304

  if (!tokenInfo)
    throwLoggedError(
      new App.Errors.InvalidState('Token info not found, invalid state'),
    )

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y
    setIsStickyTab(offsetY > HEADER_HEIGHT)
  }

  const renderTabs = React.useMemo(() => {
    return (
      <Tabs style={[a.justify_between, a.px_lg, a.gap_lg, ta.bg_color_max]}>
        <Tab
          style={[a.flex_1]}
          active={detailsTab === PortfolioDetailsTab.Overview}
          onPress={() => setDetailsTab(PortfolioDetailsTab.Overview)}
          label={strings.portfolio.overview}
        />

        <Tab
          style={[a.flex_1]}
          active={detailsTab === PortfolioDetailsTab.Transactions}
          onPress={() => setDetailsTab(PortfolioDetailsTab.Transactions)}
          label={strings.portfolio.transactions}
        />
      </Tabs>
    )
  }, [ta, strings, detailsTab, setDetailsTab])

  return (
    <SafeArea>
      <TxFilter tokenId={tokenId}>
        <Animated.View
          style={[
            a.absolute,
            a.inset_0,
            a.w_full,
            a.z_10,
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
                style={[a.overflow_hidden, {height: HEADER_HEIGHT}]}
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
