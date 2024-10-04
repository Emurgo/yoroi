import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TextProps, TextStyle, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../components/Icon'
import {Space} from '../../../components/Space/Space'
import {useCopy} from '../../../hooks/useCopy'

export const CopiableText = ({
  text,
  index,
  textStyle,
  multiline = false,
  addressProps,
}: {
  text: string
  index?: number
  textStyle?: TextStyle
  multiline?: boolean
  addressProps?: TextProps
}) => {
  const {styles, colors} = useStyles()
  const [, copy] = useCopy()

  return (
    <View style={styles.text}>
      <Text
        style={[styles.addressText, textStyle]}
        numberOfLines={!multiline ? 1 : undefined}
        ellipsizeMode={!multiline ? 'middle' : undefined}
        {...addressProps}
      >
        {text}
      </Text>

      {index !== undefined ? (
        <>
          <Space width="sm" />

          <Text style={styles.index}>{`#${index}`}</Text>

          <Space width="sm" />
        </>
      ) : (
        <Space width="xs" />
      )}

      <TouchableOpacity onPress={() => copy(text)} activeOpacity={0.5}>
        <Icon.Copy size={24} color={colors.copy} />
      </TouchableOpacity>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    text: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    addressText: {
      ...atoms.flex_1,
      ...atoms.body_2_md_regular,
      color: color.text_gray_medium,
    },
    index: {
      ...atoms.body_2_md_medium,
      color: color.text_gray_medium,
    },
  })

  const colors = {
    copy: color.gray_900,
  }

  return {styles, colors} as const
}
