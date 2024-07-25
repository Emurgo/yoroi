import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Image, StyleSheet, Text, View} from 'react-native'

import image from '../../../../assets/img/no_transactions.png'
import {Space} from '../../../../components/Space/Space'
import {useStrings} from '../../common/strings'

export const TxListEmpty = () => {
  const strings = useStrings()
  const styles = useStyles()

  return (
    <View style={styles.empty} testID="emptyHistoryComponent">
      <Space height="lg" />

      <Image style={styles.image} source={image} />

      <Space height="lg" />

      <Text style={styles.emptyText}>{strings.noTransactions}</Text>

      <Space height="lg" />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    empty: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      ...atoms.body_1_lg_medium,
      color: color.gray_c900,
      width: '55%',
      textAlign: 'center',
    },
    image: {
      height: 100,
      width: 131,
    },
  })
  return styles
}
