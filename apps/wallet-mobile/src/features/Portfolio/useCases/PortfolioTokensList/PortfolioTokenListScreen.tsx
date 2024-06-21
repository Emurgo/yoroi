import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Tab, TabPanel, Tabs} from '../../../../components/Tabs'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useSearchOnNavBar} from '../../../Search/SearchContext'
import {useSelectedWallet} from '../../../WalletManager/context/SelectedWalletContext'
import {usePortfolioPrimaryBalance} from '../../common/hooks/usePortfolioPrimaryBalance'
import {PortfolioProvider} from '../../common/PortfolioProvider'
import {useGetDAppsPortfolioBalance} from '../../common/useGetDAppsPortfolioBalance'
import {useStrings} from '../../common/useStrings'
import {PortfolioDAppsTokenList} from './PortfolioDAppsTokenList/PortfolioDAppsTokenList'
import {PortfolioWalletTokenList} from './PortfolioWalletTokenList/PortfolioWalletTokenList'

type ActiveTab = 'wallet' | 'dapps'
type Tabs = 'Wallet Token' | 'Dapps Token'
const tabs: Record<ActiveTab, Tabs> = {
  wallet: 'Wallet Token',
  dapps: 'Dapps Token',
}
export const PortfolioTokenListScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {track} = useMetrics()
  const primaryBalance = usePortfolioPrimaryBalance({wallet})
  const dAppsBalance = useGetDAppsPortfolioBalance(primaryBalance.quantity)
  const hasDApps = dAppsBalance !== undefined && Number(dAppsBalance.quantity) > 0

  const [activeTab, setActiveTab] = React.useState<'wallet' | 'dapps'>('wallet')

  React.useEffect(() => {
    track.portfolioTokensListPageViewed({tokens_tab: tabs[activeTab]})
  }, [activeTab, track])

  useSearchOnNavBar({
    title: strings.tokenList,
    placeholder: strings.searchTokens,
  })

  return (
    <PortfolioProvider>
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.root}>
        {hasDApps ? (
          <Tabs>
            <Tab onPress={() => setActiveTab('wallet')} label={strings.walletToken} active={activeTab === 'wallet'} />

            <Tab onPress={() => setActiveTab('dapps')} label={strings.dappsToken} active={activeTab === 'dapps'} />
          </Tabs>
        ) : null}

        <TabPanel active={activeTab === 'wallet'}>
          <PortfolioWalletTokenList />
        </TabPanel>

        <TabPanel active={activeTab === 'dapps'}>
          <PortfolioDAppsTokenList />
        </TabPanel>
      </SafeAreaView>
    </PortfolioProvider>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      backgroundColor: color.gray_cmin,
    },
  })

  return {styles, atoms, color} as const
}
