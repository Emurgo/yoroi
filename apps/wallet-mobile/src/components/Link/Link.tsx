import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Linking, StyleSheet, Text, TextStyle, TouchableOpacity} from 'react-native'

type Props = {
  url: string
  text?: string
  style?: TextStyle
  children?: React.ReactNode
}

export const Link = ({url, text, style, children}: Props) => {
  const styles = useStyles()

  return (
    <TouchableOpacity onPress={() => Linking.openURL(url)}>
      {children === undefined ? <Text style={[styles.text, style]}>{text}</Text> : children}
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    text: {
      color: color.primary_c600,
      textDecorationLine: 'underline',
    },
  })
  return styles
}
