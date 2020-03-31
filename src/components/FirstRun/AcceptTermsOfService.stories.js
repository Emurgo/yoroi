// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'
import {action} from '@storybook/addon-actions'

import AcceptTermsOfServiceScreen from './AcceptTermsOfServiceScreen'

// mockup navigation
const navigation = {
  navigate: (route, params) => {
    action('navigated!')
  },
  setParams: (params) => {
    action(params)
  },
  getParam: (param) => ({param: true}),
}


storiesOf('AcceptTermsOfServiceScreen', module)
  .add('Default', () => (
    <AcceptTermsOfServiceScreen
      navigation={navigation}
    />
  ))
