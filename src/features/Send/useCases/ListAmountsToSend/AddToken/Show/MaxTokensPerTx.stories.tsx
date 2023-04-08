import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {View} from 'react-native'

import {MaxTokensPerTx} from './MaxTokensPerTx'

storiesOf('Max Tokens Per Tx', module).add('initial', () => (
  <View style={{justifyContent: 'center', padding: 16}}>
    <MaxTokensPerTx />
  </View>
))
