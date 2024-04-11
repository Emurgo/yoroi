import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, TextInput, TouchableOpacity, TouchableOpacityProps, View} from 'react-native'

import {Icon} from '../../../../components'

type Props = {
  searchValue: string
  onBack: () => void
  onSearchChange: (value: string) => void
  onSearchSubmit: () => void
}
export const BrowserSearchToolbar = ({onBack, onSearchChange, onSearchSubmit, searchValue}: Props) => {
  const {styles} = useStyles()

  return (
    <View style={styles.root}>
      <View style={styles.boxURI}>
        <BackButton onPress={onBack} />

        <TextInput
          autoFocus
          selectTextOnFocus
          value={searchValue}
          placeholder=""
          onChangeText={(search) => onSearchChange(search)}
          autoCapitalize="none"
          style={styles.searchInputStyle}
          onSubmitEditing={onSearchSubmit}
          enablesReturnKeyAutomatically={searchValue.length === 0}
        />
      </View>
    </View>
  )
}

const BackButton = (props: TouchableOpacityProps) => {
  const {theme} = useTheme()

  return (
    <TouchableOpacity testID="buttonBack" {...props}>
      <Icon.Chevron direction="left" size={24} color={theme.color.gray.max} />
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme

  const styles = StyleSheet.create({
    root: {
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    boxURI: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: color.gray['50'],
      height: 50,
    },
    searchInputStyle: {flex: 1, color: color['black-static']},
  })

  return {styles} as const
}
