import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'

import {SearchProvider} from '~/features/Search/SearchContext'
import {NetworkTag} from '~/features/Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {TxDetails} from '~/features/Transactions/useCases/TxDetails/TxDetails'
import {
  defaultStackNavigationOptions,
  PortfolioRoutes,
} from '~/kernel/navigation/navigation'
import {Boundary} from '~/ui/Boundary/Boundary'
import {useStrings} from './common/hooks/useStrings'
import {PortfolioProvider} from './context/PortfolioProvider'
import {NftsNavigator} from './NftsNavigator'
import {PortfolioDashboardScreen} from './screens/PortfolioDashboard/PortfolioDashboardScreen'
import ExportTokenTransactions from './screens/PortfolioTokenDetails/ExportTokenTransactions'
import {PortfolioTokenDetailsScreen} from './screens/PortfolioTokenDetails/PortfolioTokenDetailsScreen'
import {PortfolioTokenListScreen} from './screens/PortfolioTokensList/PortfolioTokenListScreen'

const Stack = createStackNavigator<PortfolioRoutes>()

export const PortfolioNavigator = () => {
  const {atoms, palette} = useTheme()
  const strings = useStrings()

  return (
    <PortfolioProvider>
      <Stack.Navigator
        screenOptions={{
          ...defaultStackNavigationOptions(atoms, palette),
          headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
        }}
      >
        <Stack.Screen
          name="dashboard-portfolio"
          getComponent={() => PortfolioDashboardScreen}
          options={{title: strings.portfolio, headerLeft: () => null}}
        />

        <Stack.Screen
          name="portfolio-tokens-list"
          getComponent={() => PortfolioTokenListScreen}
          options={{
            title: strings.tokenList,
          }}
        />

        <Stack.Screen
          name="portfolio-token-details"
          options={{
            title: strings.tokenDetail,
            headerRight: () => <ExportTokenTransactions />,
          }}
          getComponent={() => PortfolioTokenDetailsScreen}
        />

        <Stack.Screen name="portfolio-nfts" options={{headerShown: false}}>
          {() => (
            <SearchProvider>
              <NftsNavigator />
            </SearchProvider>
          )}
        </Stack.Screen>

        <Stack.Screen name="tx-details">
          {() => (
            <Boundary loading={{size: 'full'}}>
              <TxDetails />
            </Boundary>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </PortfolioProvider>
  )
}
