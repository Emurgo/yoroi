// @flow

import React from 'react'
import 'intl';

import {injectIntl, addLocaleData, IntlProvider } from 'react-intl';
import en from 'react-intl/locale-data/en';

import translations from './i18n/translations';
import AppNavigator from './AppNavigator'
import NavigationService from './NavigationService'
import {onDidMount} from './utils/renderUtils'
import {compose} from 'recompose'
import {connect} from 'react-redux'
import {initApp} from './actions'

const App = (props, context) => {
  return <AppNavigator ref={NavigationService.setTopLevelNavigator} />
}

export default injectIntl(compose(
  connect(
    (state) => ({}),
    {
      initApp,
    },
  ),
  onDidMount(({initApp}) => initApp()),
)(App))
