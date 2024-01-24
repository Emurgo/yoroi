import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {View} from 'react-native'

import {MaxAmountsPerTx} from './MaxAmountsPerTx'

storiesOf('Max Amounts Per Tx', module).add('initial', () => (
  <View style={{justifyContent: 'center', padding: 16}}>
    <MaxAmountsPerTx />
  </View>
))
