// @flow

import React from 'react'
import AppNavigator from './AppNavigator'
import NavigationService from './NavigationService'

const App = () => (
  <AppNavigator
    ref={(navigatorRef) => {
      NavigationService.setTopLevelNavigator(navigatorRef)
    }}
  />
)

export default App
