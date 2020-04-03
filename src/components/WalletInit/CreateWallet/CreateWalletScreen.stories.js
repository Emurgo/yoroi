// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import CreateWalletScreen from './CreateWalletScreen'

storiesOf('CreateWalletScreen', module).add('Default', ({navigation}) => (
  <CreateWalletScreen navigation={navigation} />
))
