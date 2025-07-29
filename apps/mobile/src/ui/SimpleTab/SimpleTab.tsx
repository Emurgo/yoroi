import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, TouchableOpacity} from 'react-native'

type Props = {
  name: string
  isActive: boolean
  onPress: () => void
}

export const SimpleTab = ({name, onPress, isActive}: Props) => {
  const {palette: p} = useTheme()
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        a.p_sm,
        {borderRadius: 8},
        isActive && {backgroundColor: p.gray_200},
      ]}
    >
      <Text style={[a.body_1_lg_medium, {color: p.gray_max}]}>{name}</Text>
    </TouchableOpacity>
  )
}
