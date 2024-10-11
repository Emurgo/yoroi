import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {useCopy} from '../../../components/Clipboard/ClipboardProvider'
import {Icon} from '../../../components/Icon'

export const CopiableText = ({children, textToCopy}: {children: React.ReactNode; textToCopy: string}) => {
  const {styles, colors} = useStyles()
  const {copy} = useCopy()

  return (
    <View style={styles.text}>
      {children}

      <TouchableOpacity onPress={() => copy({text: textToCopy})} activeOpacity={0.5}>
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
