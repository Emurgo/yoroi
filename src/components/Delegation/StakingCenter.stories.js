// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import StakingCenter from './StakingCenter'

storiesOf('StakingCenter', module).add(
  'with 100 ADA to delegate',
  ({navigation}) => {
    navigation.getParam = (param) => {
      switch (param) {
        case 'approxAdaToDelegate':
          return '100'
        case 'pools':
          return ['af22f95915a19cd57adb14c558dcc4a175f60c6193dc23b8bd2d8beb']
        default:
          return ''
      }
    }
    return <StakingCenter navigation={navigation} />
  },
)
