// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import CreateWalletScreen from './CreateWalletScreen'

storiesOf('CreateWalletScreen', module).add(
  'Default',
  ({navigation, route}) => (
    <CreateWalletScreen route={route} navigation={navigation} />
  ),
)
