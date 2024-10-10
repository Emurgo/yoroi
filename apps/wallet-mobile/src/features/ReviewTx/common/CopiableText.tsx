import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../components/Icon'
import {useCopy} from '../../../hooks/useCopy'

export const CopiableText = ({children, textToCopy}: {children: React.ReactNode; textToCopy: string}) => {
  const {styles, colors} = useStyles()
  const [, copy] = useCopy()

  return (
    <View style={styles.text}>
      {children}

      <TouchableOpacity onPress={() => copy(textToCopy)} activeOpacity={0.5}>
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
  })

  const colors = {
    copy: color.gray_900,
  }

  return {styles, colors} as const
}
