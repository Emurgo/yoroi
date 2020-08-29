// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import StakingByIdScreen from './StakeByIdScreen'

storiesOf('StakingByIdScreen', module).add(
  'with 100 ADA to delegate',
  ({navigation}) => {
    navigation.getParam = (param) => {
      switch (param) {
        case 'approxAdaToDelegate':
          return '100'
        case 'pools':
          return [
            'bd885c7fa6bcceaa6e530fe4f285daa4c631fab6ff31544dfc37b88eade9763e',
          ]
        default:
          return ''
      }
    }
    return <StakingByIdScreen navigation={navigation} />
  },
)
