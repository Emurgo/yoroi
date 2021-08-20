// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import BiometricsLinkScreen from './BiometricsLinkScreen'

storiesOf('BiometricsLinkScreen', module).add('Default', ({navigation, route}) => (
  <BiometricsLinkScreen navigation={navigation} route={route} />
))
