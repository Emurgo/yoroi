// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import StakingCenter from './StakingCenter'

storiesOf('StakingCenter', module).add('with 100 ADA to delegate', ({route, navigation}) => {
  route.params = {
    poolList: ['af22f95915a19cd57adb14c558dcc4a175f60c6193dc23b8bd2d8beb'],
  }
  return <StakingCenter navigation={navigation} route={route} />
})
