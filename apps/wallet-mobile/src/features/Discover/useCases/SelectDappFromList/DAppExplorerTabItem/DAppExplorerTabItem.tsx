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
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    container: {
      ...atoms.p_sm,
      borderRadius: 8,
    },
    text: {
      ...atoms.body_1_lg_medium,
      color: color.gray_max,
    },
    containerActive: {
      backgroundColor: color.gray_200,
    },
  })

  return {styles}
}
