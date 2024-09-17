import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'

import {Boundary} from '../../components/Boundary/Boundary'
import {defaultStackNavigationOptions, Portfolio2Routes} from '../../kernel/navigation'
import {SearchProvider} from '../Search/SearchContext'
import {NetworkTag} from '../Settings/ChangeNetwork/NetworkTag'
import {TxDetails} from '../Transactions/useCases/TxDetails/TxDetails'
import {useStrings} from './common/hooks/useStrings'
import {PortfolioTokenDetailProvider} from './common/PortfolioTokenDetailContext'
import {NftsNavigator} from './NftsNavigator'
import {PortfolioDashboardScreen} from './useCases/PortfolioDashboard/PortfolioDashboardScreen'
import ExportTokenTransactions from './useCases/PortfolioTokenDetails/ExportTokenTransactions'
import {PortfolioTokenDetailsScreen} from './useCases/PortfolioTokenDetails/PortfolioTokenDetailsScreen'
import {PortfolioTokenListScreen} from './useCases/PortfolioTokensList/PortfolioTokenListScreen'

const Stack = createStackNavigator<Portfolio2Routes>()

export const PortfolioNavigator = () => {
  const {atoms, color} = useTheme()
  const strings = useStrings()

  return (
    <PortfolioTokenDetailProvider>
      <Stack.Navigator
        screenOptions={{
          ...defaultStackNavigationOptions(atoms, color),
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
          options={{title: strings.tokenDetail, headerRight: () => <ExportTokenTransactions />}}
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
    </PortfolioTokenDetailProvider>
  )
}
