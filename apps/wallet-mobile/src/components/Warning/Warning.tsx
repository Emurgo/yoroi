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
  const {theme} = useTheme()
  const {color, typography} = theme
  const styles = StyleSheet.create({
    notice: {
      backgroundColor: color.yellow[100],
      padding: 12,
    },
    text: {
      ...typography['body-2-m-regular'],
    },
  })

  const colors = {
    yellow: color.yellow[500],
  }

  return {colors, styles}
}
