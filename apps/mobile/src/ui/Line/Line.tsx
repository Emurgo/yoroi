import {useTheme} from '@yoroi/theme'
import React from 'react'
import {View} from 'react-native'

type Props = {backgroundColor?: string}

export const Line = ({backgroundColor}: Props) => {
  const {palette: p} = useTheme()

  return (
    <View
      style={{
        height: 1,
        opacity: 0.3,
        backgroundColor: backgroundColor != null ? backgroundColor : p.gray_700,
      }}
    />
  )
}
