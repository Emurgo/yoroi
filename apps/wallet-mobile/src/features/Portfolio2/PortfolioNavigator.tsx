import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'

import {defaultStackNavigationOptions, Portfolio2Routes} from '../../navigation'
import {useStrings} from './common/useStrings'
import {PortfolioDashboardScreen} from './useCases/PortfolioDashboard/PortfolioDashboardScreen'
import {PortfolioTokenDetailsScreen} from './useCases/PortfolioTokenDetails/PortfolioTokenDetailsScreen'
import {PortfolioTokenListScreen} from './useCases/PortfolioTokensList/PortfolioTokenListScreen'

const Stack = createStackNavigator<Portfolio2Routes>()

export const PortfolioNavigator = () => {
  const {atoms, color} = useTheme()
  const strings = useStrings()

  return (
    <Stack.Navigator screenOptions={defaultStackNavigationOptions(atoms, color)}>
      <Stack.Screen
        name="dashboard-portfolio"
        component={PortfolioDashboardScreen}
        options={{title: strings.portfolio}}
      />

      <Stack.Screen
        name="portfolio-tokens-list"
        options={{title: strings.tokenList}}
        component={PortfolioTokenListScreen}
      />

      <Stack.Screen
        name="portfolio-token-details"
        options={{title: strings.tokenDetail}}
        component={PortfolioTokenDetailsScreen}
      />
    </Stack.Navigator>
  )
}
