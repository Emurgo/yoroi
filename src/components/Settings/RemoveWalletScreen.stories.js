// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import RemoveWalletScreen from './RemoveWalletScreen'

storiesOf('RemoveWalletScreen', module).add('Default', ({navigation}) => (
  <RemoveWalletScreen navigation={navigation} />
))
