import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React, {useEffect, useRef} from 'react'
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
  const inputRef = useRef<TextInput>(null)
  const navigation = useNavigation()

  useEffect(() => {
    navigation.addListener('focus', () => {
      inputRef.current?.focus()
    })
  }, [navigation])

  return (
    <View style={styles.root}>
      <View style={styles.boxURI}>
        <BackButton onPress={onBack} />

        <TextInput
          ref={inputRef}
          autoFocus
          selectTextOnFocus
          value={searchValue}
          placeholder=""
          onChangeText={(search) => onSearchChange(search)}
          autoCapitalize="none"
          style={{flex: 1, color: '#000000'}}
          testID="inputSearch"
          onSubmitEditing={onSearchSubmit}
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
      backgroundColor: color['white-static'],
      paddingVertical: 10,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    boxURI: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: color.gray['50'],
      height: 50,
    },
  })

  return {styles} as const
}
