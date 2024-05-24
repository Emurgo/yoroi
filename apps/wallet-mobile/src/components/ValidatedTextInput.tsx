import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Platform, StyleSheet, TextInput, TextInputProps, TouchableOpacity, View, ViewStyle} from 'react-native'

import {isEmptyString} from '../kernel/utils'
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
          {showPassword ? <Icon.EyeOn size={40} color={colors.icon} /> : <Icon.EyeOff size={40} color={colors.icon} />}
        </TouchableOpacity>
      )}

      {error != null && error !== false && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      paddingTop: 16,
      marginBottom: 8,
    },
    input: {
      borderColor: color.gray_c500,
      backgroundColor: color.gray_cmin,
      borderRadius: 8,
      borderWidth: 1,
      ...atoms.body_1_lg_regular,
      ...atoms.pl_lg,
      ...atoms.py_md,
      paddingRight: 50,
    },
    inputError: {
      borderColor: color.sys_magenta_c500,
    },
    labelWrap: {
      backgroundColor: color.gray_cmin,
      marginLeft: 12,
      top: 8,
      ...atoms.py_xs,
      position: 'absolute',
    },
    label: {
      color: color.gray_c900,
    },
    labelError: {
      color: color.sys_magenta_c500,
    },
    error: {
      color: color.sys_magenta_c500,
      ...atoms.px_lg,
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
    icon: color.gray_c800,
  }

  return {styles, colors}
}
