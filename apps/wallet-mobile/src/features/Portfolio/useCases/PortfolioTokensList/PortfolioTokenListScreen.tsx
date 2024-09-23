import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Tab, TabPanel, Tabs} from '../../../../components/Tabs/Tabs'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useSearchOnNavBar} from '../../../Search/SearchContext'
import {NetworkTag} from '../../../Settings/ChangeNetwork/NetworkTag'
import {useGetDAppsPortfolioBalance} from '../../common/hooks/useGetDAppsPortfolioBalance'
import {useStrings} from '../../common/hooks/useStrings'
import {PortfolioListTab, usePortfolio} from '../../common/PortfolioProvider'
import {PortfolioDAppsTokenList} from './PortfolioDAppsTokenList/PortfolioDAppsTokenList'
import {PortfolioWalletTokenList} from './PortfolioWalletTokenList/PortfolioWalletTokenList'

const tabs = {
  [PortfolioListTab.Wallet]: 'Wallet Token',
  [PortfolioListTab.Dapps]: 'Dapps Token',
} as const

export const PortfolioTokenListScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {track} = useMetrics()
  const {listTab, setListTab} = usePortfolio()
  // TODO: missing dAppsBalance
  const dAppsBalance = useGetDAppsPortfolioBalance(0n)
  const hasDApps = dAppsBalance !== undefined && Number(dAppsBalance.quantity) > 0

  React.useEffect(() => {
    track.portfolioTokensListPageViewed({tokens_tab: tabs[listTab]})
  }, [listTab, track])

  useSearchOnNavBar({
    title: strings.tokenList,
    placeholder: strings.searchTokens,
    extraNavigationOptions: {headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>},
  })

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.root}>
      {hasDApps && (
        <Tabs>
          <Tab
            onPress={() => setListTab(PortfolioListTab.Wallet)}
            label={strings.walletToken}
            active={listTab === PortfolioListTab.Wallet}
          />

          <Tab
            onPress={() => setListTab(PortfolioListTab.Dapps)}
            label={strings.dappsToken}
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

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      backgroundColor: color.bg_color_max,
    },
  })

  return {styles, atoms, color} as const
}
