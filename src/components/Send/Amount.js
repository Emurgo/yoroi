// @flow

import React from 'react'
import {View} from 'react-native'

import {Text} from '../UiKit'
import AdaIcon from '../../assets/AdaIcon'
import {COLORS} from '../../styles/config'

type AmountProps = {
  value: string,
  style?: Object,
}

const styles = {
  amount: {
    color: COLORS.BLACK,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
}

const Amount = ({value, style}: AmountProps) => (
  <View style={[styles.amount, style]}>
    <Text>{value}</Text>
    <AdaIcon height={14} width={14} />
  </View>
)

export default Amount
