import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'

import {defaultStackNavigationOptions, Portfolio2Routes} from '../../navigation'
import {useStrings} from './common/useStrings'
import {PortfolioTokenListNavigator} from './PortfolioTokenListNavigator'
import {PortfolioDashboardScreen} from './useCases/PortfolioDashboard/PortfolioDashboardScreen'
import {PortfolioTokenDetailsScreen} from './useCases/PortfolioTokenDetails/PortfolioTokenDetailsScreen'

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
        component={PortfolioTokenListNavigator}
      />

      <Stack.Screen name="portfolio-token-details" component={PortfolioTokenDetailsScreen} />
    </Stack.Navigator>
  )
}
