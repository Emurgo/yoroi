import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

type Props = {backgroundColor?: string}

export const Line = ({backgroundColor}: Props) => {
  const {color} = useTheme()

  return (
    <View
      style={{
        ...styles.container,
        backgroundColor:
          backgroundColor != null ? backgroundColor : color.gray_700,
      }}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    height: 1,
    opacity: 0.3,
  },
})
