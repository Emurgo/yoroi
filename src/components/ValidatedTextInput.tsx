import React from 'react'
import {Image, Platform, StyleSheet, TextInput, TextInputProps, TouchableOpacity, View, ViewStyle} from 'react-native'

import closedEyeIcon from '../assets/img/icon/visibility-closed.png'
import openedEyeIcon from '../assets/img/icon/visibility-opened.png'
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

  return (
    <View style={styles.container}>
      <TextInput
        {...restProps}
        style={[styles.input, error != null && error !== false && styles.inputError, style]}
        secureTextEntry={secureTextEntry === true && !showPassword}
        autoCorrect={!secureTextEntry}
        keyboardType={
          keyboardType
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
          <Image style={styles.showPassword} source={showPassword ? openedEyeIcon : closedEyeIcon} />
        </TouchableOpacity>
      )}

      {error != null && error !== false && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    marginBottom: 8,
  },
  input: {
    borderColor: '#4A4A4A',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    fontSize: 16,
    paddingLeft: 16,
    paddingRight: 50,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: '#FF1351',
  },
  labelWrap: {
    backgroundColor: '#fff',
    marginLeft: 12,
    top: 8,
    paddingHorizontal: 4,
    position: 'absolute',
  },
  label: {
    color: '#4A4A4A',
  },
  labelError: {
    color: '#FF1351',
  },
  error: {
    color: '#FF1351',
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  showPasswordContainer: {
    height: 40,
    position: 'absolute',
    top: 20,
    right: 10,
    justifyContent: 'center',
  },
  showPassword: {
    height: 32,
    width: 32,
  },
})
