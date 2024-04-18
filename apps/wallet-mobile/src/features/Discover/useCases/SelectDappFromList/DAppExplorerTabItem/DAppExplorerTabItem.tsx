import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity} from 'react-native'

type Props = {
  name: string
  isActive: boolean
  onPress: () => void
}

export const DAppExplorerTabItem = ({name, onPress, isActive}: Props) => {
  const {styles} = useStyles()
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, isActive && styles.containerActive]}>
      <Text style={styles.text}>{name}</Text>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {padding, typography, color} = theme

  const styles = StyleSheet.create({
    container: {
      ...atoms.p_sm,
      borderRadius: 8,
    },
    text: {
      ...(atoms.body - 1 - lg - medium),
    },
    containerActive: {
      backgroundColor: color.gray['200'],
    },
  })

  return {styles}
}
