import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../components/Icon'

export const CollapsibleSection = ({label, children}: {label: string; children: React.ReactNode}) => {
  const {styles, colors} = useStyles()
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{label}</Text>

        <TouchableOpacity activeOpacity={0.5} onPress={() => setIsOpen((isOpen) => !isOpen)}>
          <Icon.Chevron direction={isOpen ? 'up' : 'down'} size={28} color={colors.chevron} />
        </TouchableOpacity>
      </View>

      {isOpen && children}
    </>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    sectionHeader: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    sectionHeaderText: {
      ...atoms.body_1_lg_medium,
      color: color.gray_900,
    },
  })

  const colors = {
    chevron: color.gray_900,
  }

  return {styles, colors} as const
}
