// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import WalletInitScreen from './WalletInitScreen'

storiesOf('WalletInitScreen', module)
  .add('Shelley', ({navigation}) => {
    navigation.getParam = (param) => {
      if (param === 'isShelleyWallet') return true
      return ''
    }
    return <WalletInitScreen navigation={navigation} />
  })
  .add('Byron', ({navigation}) => {
    navigation.getParam = (param) => {
      if (param === 'isShelleyWallet') return false
      return ''
    }
    return <WalletInitScreen navigation={navigation} />
  })
