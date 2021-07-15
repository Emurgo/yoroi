// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import AcceptTermsOfServiceScreen from './AcceptTermsOfServiceScreen'

storiesOf('AcceptTermsOfServiceScreen', module).add('Default', ({navigation}) => (
  <AcceptTermsOfServiceScreen navigation={navigation} />
))
