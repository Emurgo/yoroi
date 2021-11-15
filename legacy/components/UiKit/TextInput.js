// @flow

import type {Element, Node} from 'react'
import React from 'react'
import {Image, TextInput as RNTextInput, TouchableOpacity, View} from 'react-native'
import type {Props as TextInputProps} from 'react-native/Libraries/Components/TextInput/TextInput'
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'
import {HelperText, TextInput as RNPTextInput} from 'react-native-paper'

// $FlowExpectedError
import * as Icon from '../../../src/components/Icon'
import closedEyeIcon from '../../assets/img/icon/visibility-closed.png'
import openedEyeIcon from '../../assets/img/icon/visibility-opened.png'
import {COLORS} from '../../styles/config'
import styles from './styles/TextInput.style'

type Props = {|
  ...TextInputProps,
  containerStyle?: ViewStyleProp,
  label?: string,
  helperText?: string,
  errorText?: string,
  disabled?: boolean,
  errorOnMount?: boolean,
  errorDelay?: number,
  right?: Element<any>,
  noErrors?: boolean,
  dense?: boolean,
  textAlign?: 'left' | 'center' | 'right',
  render?: (props: TextInputProps) => Element<any>,
|}

const useDebounced = (callback, value, delay = 1000) => {
  const first = React.useRef(true)
  React.useEffect(() => {
    if (first.current) {
      first.current = false
      return () => {
        return
      }
    }

    const handler = setTimeout(() => callback(), delay)

    return () => clearTimeout(handler)
  }, [callback, delay, value])
}

const TextInputWithRef = (
  {
    value,
    containerStyle,
    secureTextEntry,
    helperText,
    errorText,
    errorOnMount,
    errorDelay,
    right,
    noErrors,
    textAlign,
    ...restProps
  }: Props,
  ref,
) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [errorTextEnabled, setErrorTextEnabled] = React.useState(errorOnMount)
  useDebounced(
    React.useCallback(() => setErrorTextEnabled(true), []),
    value,
    errorDelay,
  )

  return (
    <View style={containerStyle}>
      <RNPTextInput
        ref={ref}
        style={{textAlign}}
        value={value}
        onChange={() => setErrorTextEnabled(false)}
        autoCorrect={false}
        autoCompleteType={'off'}
        autoCapitalize={'none'}
        theme={{
          roundness: 8,
          colors: {
            background: COLORS.BACKGROUND,
            placeholder: COLORS.TEXT_INPUT,
            primary: COLORS.BLACK,
            error: COLORS.ERROR_TEXT_COLOR,
          },
        }}
        secureTextEntry={secureTextEntry && !showPassword}
        mode={'outlined'}
        error={errorTextEnabled && !!errorText}
        render={({style, ...inputProps}) => (
          <InputContainer>
            <RNTextInput {...inputProps} style={[style, {color: COLORS.BLACK}]} />
            {right ? <AdornmentContainer style={styles.checkmarkContainer}>{right}</AdornmentContainer> : null}

            {secureTextEntry ? (
              <SecureTextEntryToggle showPassword={showPassword} onPress={() => setShowPassword(!showPassword)} />
            ) : null}
          </InputContainer>
        )}
        {...restProps}
      />

      {!noErrors && (
        <HelperText type={errorTextEnabled && !!errorText ? 'error' : 'info'} visible>
          {errorTextEnabled && !!errorText ? errorText : helperText}
        </HelperText>
      )}
    </View>
  )
}

const TextInput = React.forwardRef<Props, {focus: () => void}>(TextInputWithRef)

export const Checkmark = () => <Icon.Check height={24} width={24} color={COLORS.LIGHT_POSITIVE_GREEN} />

const SecureTextEntryToggle = ({showPassword, onPress}: {showPassword: boolean, onPress: () => any}) => (
  <AdornmentContainer style={styles.secureTextEntryToggleContainer}>
    <TouchableOpacity onPress={onPress}>
      {showPassword ? <Image source={closedEyeIcon} /> : <Image source={openedEyeIcon} />}
    </TouchableOpacity>
  </AdornmentContainer>
)

const InputContainer = ({children}: {children: Node}) => <View style={styles.inputContainer}>{children}</View>

const AdornmentContainer = ({style, children}: {style: ViewStyleProp, children: Node}) => (
  <View style={[styles.adornmentContainer, style]}>{children}</View>
)

export default TextInput
