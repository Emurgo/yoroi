// @flow

import React from 'react'
import 'intl'

import {injectIntl} from 'react-intl'

import AppNavigator from './AppNavigator'
import NavigationService from './NavigationService'
import {onDidMount} from './utils/renderUtils'
import {compose} from 'recompose'
import {connect} from 'react-redux'
import {initApp} from './actions'

const App = (_props, _context) => {
  return <AppNavigator ref={NavigationService.setTopLevelNavigator} />
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
