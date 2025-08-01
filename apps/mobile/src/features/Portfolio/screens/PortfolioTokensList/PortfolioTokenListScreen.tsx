import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useGetDAppsPortfolioBalance} from '~/features/Portfolio/common/hooks/useGetDAppsPortfolioBalance'
import {useStrings} from '~/kernel/i18n/useStrings'
import {
  PortfolioListTab,
  usePortfolio,
} from '~/features/Portfolio/context/PortfolioProvider'
import {useSearchOnNavBar} from '~/features/Search/SearchContext'
import {NetworkTag} from '~/features/Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Tab, TabPanel, Tabs} from '~/ui/Tabs'
import {PortfolioDAppsTokenList} from './PortfolioDAppsTokenList/PortfolioDAppsTokenList'
import {PortfolioWalletTokenList} from './PortfolioWalletTokenList/PortfolioWalletTokenList'

const tabs = {
  [PortfolioListTab.Wallet]: 'Wallet Token',
  [PortfolioListTab.Dapps]: 'Dapps Token',
} as const

export const PortfolioTokenListScreen = () => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()
  const {track} = useMetrics()
  const {listTab, setListTab} = usePortfolio()
  // TODO: missing dAppsBalance
  const dAppsBalance = useGetDAppsPortfolioBalance(0n)
  const hasDApps =
    dAppsBalance !== undefined && Number(dAppsBalance.quantity) > 0

  React.useEffect(() => {
    track.portfolioTokensListPageViewed({tokens_tab: tabs[listTab]})
  }, [listTab, track])

  useSearchOnNavBar({
    title: strings.portfolio.tokenList,
    placeholder: strings.portfolio.searchTokens,
    extraNavigationOptions: {
      headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
    },
  })

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[a.flex_1, {backgroundColor: p.bg_color_max}]}
    >
      {hasDApps && (
        <Tabs>
          <Tab
            onPress={() => setListTab(PortfolioListTab.Wallet)}
            label={strings.portfolio.walletToken}
            active={listTab === PortfolioListTab.Wallet}
          />

          <Tab
            onPress={() => setListTab(PortfolioListTab.Dapps)}
            label={strings.portfolio.dappsToken}
            active={listTab === PortfolioListTab.Dapps}
          />
        </Tabs>
      )}

      <TabPanel active={listTab === PortfolioListTab.Wallet}>
        <PortfolioWalletTokenList />
      </TabPanel>

      <TabPanel active={listTab === PortfolioListTab.Dapps}>
        <PortfolioDAppsTokenList />
      </TabPanel>
    </SafeAreaView>
  )
}
