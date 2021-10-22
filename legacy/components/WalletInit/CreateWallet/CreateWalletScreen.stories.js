// @flow

import {storiesOf} from '@storybook/react-native'
import React from 'react'

import CreateWalletScreen from './CreateWalletScreen'

storiesOf('CreateWalletScreen', module).add('Default', ({navigation, route}) => (
  <CreateWalletScreen route={route} navigation={navigation} />
))
