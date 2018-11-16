// @flow

import React from 'react'
import AppNavigator from './AppNavigator'
import NavigationService from './NavigationService'
import {onDidMount} from './utils/renderUtils'
import {compose} from 'recompose'
import {connect} from 'react-redux'
import {initApp} from './actions'

const App = () => <AppNavigator ref={NavigationService.setTopLevelNavigator} />

export default compose(
  connect(
    (state) => ({}),
    {
      initApp,
    },
  ),
  onDidMount(({initApp}) => initApp()),
)(App)
