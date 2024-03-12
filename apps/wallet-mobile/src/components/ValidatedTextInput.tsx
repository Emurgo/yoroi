import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Platform, StyleSheet, TextInput, TextInputProps, TouchableOpacity, View, ViewStyle} from 'react-native'

import {isEmptyString} from '../utils/utils'
import {Icon} from './Icon'
import {Text} from './Text'

type Props = TextInputProps & {
  label?: string
  onChangeText: (text: string) => void
  value: string
  secureTextEntry?: boolean
  error?: null | false | string
  keyboardType?: 'default' | 'numeric' | 'visible-password'
  style?: ViewStyle
  returnKeyType?: 'none' | 'done'
}

export const ValidatedTextInput = ({label, error, style, secureTextEntry, keyboardType, ...restProps}: Props) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const toggleShowPassword = () => setShowPassword(!showPassword)
  const {styles, colors} = useStyles()

  return (
    <View style={styles.container}>
      <TextInput
        {...restProps}
        style={[styles.input, error != null && error !== false && styles.inputError, style]}
        secureTextEntry={secureTextEntry === true && !showPassword}
        autoCorrect={!secureTextEntry}
        keyboardType={
          !isEmptyString(keyboardType)
            ? keyboardType !== 'visible-password'
              ? keyboardType
              : Platform.OS === 'android'
              ? 'visible-password'
              : 'default' // visible-password is Android-only
            : 'default'
        }
      />

      {label != null && (
        <View style={styles.labelWrap}>
          <Text style={[styles.label, error != null && error !== false && styles.labelError]}>{label}</Text>
        </View>
      )}

      {secureTextEntry === true && (
        <TouchableOpacity style={styles.showPasswordContainer} onPress={toggleShowPassword}>
          {showPassword ? (
            <Icon.EyeOn size={40} color={colors.iconColor} />
          ) : (
            <Icon.EyeOff size={40} color={colors.iconColor} />
          )}
        </TouchableOpacity>
      )}

      {error != null && error !== false && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography, padding} = theme
  const styles = StyleSheet.create({
    container: {
      paddingTop: 16,
      marginBottom: 8,
    },
    input: {
      borderColor: color.gray[500],
      backgroundColor: color.gray.min,
      borderRadius: 8,
      borderWidth: 1,
      ...typography['body-1-l-regular'],
      ...padding['l-l'],
      ...padding['y-m'],
      paddingRight: 50,
    },
    inputError: {
      borderColor: color.magenta[500],
    },
    labelWrap: {
      backgroundColor: color.gray.min,
      marginLeft: 12,
      top: 8,
      ...padding['x-xs'],
      position: 'absolute',
    },
    label: {
      color: color.gray[900],
    },
    labelError: {
      color: color.magenta[500],
    },
    error: {
      color: color.magenta[500],
      ...padding['x-l'],
      lineHeight: 24,
    },
    showPasswordContainer: {
      height: 40,
      position: 'absolute',
      top: 20,
      right: 10,
      justifyContent: 'center',
    },
  })

  const colors = {
    iconColor: color.gray[800],
  }

  return {styles, colors}
}
