// @flow

import React from 'react'
import 'intl'
import {SafeAreaProvider} from 'react-native-safe-area-context'


import {injectIntl} from 'react-intl'

import AppNavigator from './AppNavigator'
import {onDidMount} from './utils/renderUtils'
import {compose} from 'recompose'
import {connect} from 'react-redux'
import {initApp} from './actions'

const App = (_props, _context) => {
  console.log(_props);
  console.log(_context);
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  )
}

export default injectIntl(
  compose(
    connect(
      () => ({}),
      {
        initApp,
      },
    ),
    onDidMount(({initApp}) => initApp()),
  )(App),
)
