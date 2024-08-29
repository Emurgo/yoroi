import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Text} from './Text'

type ExternalProps = {
  title?: string
  children: React.ReactNode
  variant?: string
  testID?: string
}

export const TitledCard = ({title, children, variant, testID}: ExternalProps) => {
  const styles = useStyles()
  return (
    <View testID={testID}>
      {title !== undefined && <Text style={styles.title}>{title}</Text>}

      <View style={[styles.content, variant === 'poolInfo' ? styles.poolInfoContent : undefined]}>{children}</View>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    title: {
      ...atoms.body_1_lg_regular,
      color: color.gray_900,
      justifyContent: 'center',
    },
    content: {
      ...atoms.p_md,
      flexDirection: 'row',
      borderRadius: 8,
      elevation: 2,
      shadowOpacity: 1,
      shadowRadius: 12,
      shadowOffset: {width: 0, height: 2},
      shadowColor: 'rgba(0, 0, 0, 0.06)',
      backgroundColor: color.bg_color_max,
    },
    poolInfoContent: {
      ...atoms.p_0,
      flexDirection: 'column',
    },
  })
  return styles
}
