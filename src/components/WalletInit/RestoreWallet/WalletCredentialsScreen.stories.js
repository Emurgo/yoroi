// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import WalletCredentialsScreen from './WalletCredentialsScreen'

storiesOf('WalletCredentialsScreen', module).add('Default', ({navigation, route}) => {
  return <WalletCredentialsScreen navigation={navigation} route={route} />
})
