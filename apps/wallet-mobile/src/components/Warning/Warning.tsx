import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Icon} from '../Icon'
import {Spacer} from '../Spacer'

type Props = {content: string}

export const Warning = ({content}: Props) => {
  const {styles, colors} = useStyles()

  return (
    <View style={styles.notice}>
      <Icon.Info size={30} color={colors.yellow} />

      <Spacer height={8} />

      <Text style={styles.text}>{content}</Text>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    notice: {
      backgroundColor: color.sys_orange_c100,
      padding: 12,
      borderRadius: 8,
    },
    text: {
      ...atoms.body_2_md_regular,
      color: color.gray_cmax,
    },
  })

  const colors = {
    yellow: color.sys_orange_c500,
  }

  return {colors, styles}
}
