// @flow

import React, {useState, useEffect} from 'react'
import {AppState, Platform} from 'react-native'
import 'intl'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {enableScreens} from 'react-native-screens'
import RNBootSplash from 'react-native-bootsplash'
import {injectIntl} from 'react-intl'

import AppNavigator from './AppNavigator'
import {onDidMount} from './utils/renderUtils'
import {compose} from 'recompose'
import {connect} from 'react-redux'
import {initApp} from './actions'

enableScreens()

const App = (_props, _context) => {
  const [appState, setAppState] = useState<?string>(AppState.currentState)

  // note: previously this was hanlded in the applicationDidEnterBackground
  // event in AppDelegate.m, but after moving to a .storyboard launch screen
  // that solution didn't seem feasible anymore.
  useEffect(() => {
    const handleAppStateChange = (nextAppState: ?string): void => {
      if (Platform.OS === 'ios') {
        const previousAppState = appState

        setAppState(nextAppState)
        if (previousAppState != null && nextAppState === 'active') {
          RNBootSplash.hide()
        } else if (
          previousAppState === 'active' &&
          nextAppState != null &&
          nextAppState.match(/inactive|background/)
        ) {
          RNBootSplash.show()
        }
      }
    }

    AppState.addEventListener('change', handleAppStateChange)

    return () => {
      AppState.removeEventListener('change', handleAppStateChange)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  )
}

export default injectIntl(
  compose(
    connect(() => ({}), {
      initApp,
    }),
    onDidMount(({initApp}) => initApp()),
  )(App),
)
