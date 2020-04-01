// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import DelegationSummary from './DelegationSummary'

storiesOf('DelegationSummary', module)
  .add('Default', ({navigation}) => (
    <DelegationSummary navigation={navigation} />
  ))
