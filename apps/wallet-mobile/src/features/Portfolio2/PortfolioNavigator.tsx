import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'

import {defaultStackNavigationOptions, Portfolio2Routes} from '../../navigation'
import {useStrings} from './common/useStrings'
import {PortfolioDashboardScreen} from './useCases/PortfolioDashboard/PortfolioDashboardScreen'
import {PortfolioTokenDetailsScreen} from './useCases/PortfolioTokenDetails/PortfolioTokenDetailsScreen'
import {PortfolioTokensListScreen} from './useCases/PortfolioTokensList/PortfolioTokensListScreen'

const Stack = createStackNavigator<Portfolio2Routes>()

export const PortfolioNavigator = () => {
  const {atoms, color} = useTheme()
  const strings = useStrings()

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackNavigationOptions(atoms, color),
        headerLeft: () => null,
        detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
        gestureEnabled: true,
      }}
      initialRouteName="portfolio-dashboard"
    >
      <Stack.Screen
        name="portfolio-dashboard"
        component={PortfolioDashboardScreen}
        options={{title: strings.portfolio}}
      />

      <Stack.Screen name="portfolio-tokens-list" component={PortfolioTokensListScreen} />

      <Stack.Screen name="portfolio-token-details" component={PortfolioTokenDetailsScreen} />
    </Stack.Navigator>
  )
}
