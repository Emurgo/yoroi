import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Image, StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../../components/Spacer'
import {useStrings} from '../../../common/strings'
import image from '../../assets/img/no_transactions.png'

export const EmptyHistory = () => {
  const strings = useStrings()
  const styles = useStyles()

  return (
    <View style={styles.empty} testID="emptyHistoryComponent">
      <Spacer height={20} />

      <Image style={styles.image} source={image} />

      <Spacer height={20} />

      <Text style={styles.emptyText}>{strings.noTransactions}</Text>

      <Spacer height={20} />
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
