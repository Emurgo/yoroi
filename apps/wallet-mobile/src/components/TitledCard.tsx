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
  const {theme} = useTheme()
  const {color, typography, padding} = theme
  const styles = StyleSheet.create({
    title: {
      ...typography['body-1-l-regular'],
      color: color.gray[900],
      justifyContent: 'center',
    },
    content: {
      ...padding['m'],
      flexDirection: 'row',
      borderRadius: 8,
      elevation: 2,
      shadowOpacity: 1,
      shadowRadius: 12,
      shadowOffset: {width: 0, height: 2},
      shadowColor: 'rgba(0, 0, 0, 0.06)',
      backgroundColor: color.gray.min,
    },
    poolInfoContent: {
      ...padding['none'],
      flexDirection: 'column',
    },
  })
  return styles
}
