import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

type ContentResultProps = {
  title: string
  children: React.ReactNode
}

export const ContentResult = ({title, children}: ContentResultProps) => {
  const styles = useStyles()

  return (
    <View style={styles.root}>
      <Text style={styles.contentLabel}>{title}</Text>

      <View>{children}</View>
    </View>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    contentLabel: {
      fontSize: 16,
      color: color.gray_c600,
    },
  })
  return styles
}
