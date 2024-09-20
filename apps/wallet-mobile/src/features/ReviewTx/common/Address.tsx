import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TextStyle, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../components/Icon'
import {useCopy} from '../../../hooks/useCopy'

export const Address = ({address, textStyle}: {address: string; textStyle?: TextStyle}) => {
  const {styles, colors} = useStyles()
  const [, copy] = useCopy()

  return (
    <View style={styles.address}>
      <Text style={[styles.addressText, textStyle]} numberOfLines={1} ellipsizeMode="middle">
        {address}
      </Text>

      <TouchableOpacity onPress={() => copy(address)} activeOpacity={0.5}>
        <Icon.Copy size={24} color={colors.copy} />
      </TouchableOpacity>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    address: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    addressText: {
      ...atoms.flex_1,
      ...atoms.body_2_md_regular,
      color: color.gray_900,
    },
  })

  const colors = {
    copy: color.gray_900,
  }

  return {styles, colors} as const
}
