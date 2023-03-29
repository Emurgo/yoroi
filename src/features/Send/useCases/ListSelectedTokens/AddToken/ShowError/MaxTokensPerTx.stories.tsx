import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {View} from 'react-native'

import {MaxTokensPerTx} from './MaxTokensPerTx'

storiesOf('Send/ListSelectedTokens/MaxTokensPerTx', module).add('Default', () => (
  <View style={{justifyContent: 'center', padding: 16}}>
    <MaxTokensPerTx />
  </View>
))
