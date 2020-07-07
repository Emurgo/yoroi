// @flow
import React from 'react'

import {storiesOf} from '@storybook/react-native'

import VerifyRestoredWallet from './VerifyRestoredWallet'

storiesOf('VefifyRestoredWallet', module).add('Default', ({navigation}) => {
  return <VerifyRestoredWallet navigation={navigation} />
})
