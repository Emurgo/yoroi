import React, {ForwardedRef} from 'react'
import {
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native'
import {HelperText as HelperTextRNP, TextInput as RNPTextInput} from 'react-native-paper'

import {COLORS} from '../../theme'
import {isEmptyString} from '../../utils/utils'
import {Icon} from '../Icon'

type Props = TextInputProps &
  Omit<React.ComponentProps<typeof RNPTextInput>, 'theme'> & {
    containerStyle?: ViewStyle
    renderComponentStyle?: ViewStyle
    helperText?: string
    errorText?: string
    disabled?: boolean
    errorOnMount?: boolean
    errorDelay?: number
    noHelper?: boolean
    dense?: boolean
    faded?: boolean
    showErrorOnBlur?: boolean
  }

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

export const TextInput = React.forwardRef((props: Props, ref: ForwardedRef<RNTextInput>) => {
  const {
    value,
    containerStyle,
    renderComponentStyle,
    secureTextEntry,
    helperText,
    errorText,
    errorOnMount,
    errorDelay,
    right,
    noHelper,
    textAlign,
    faded,
    showErrorOnBlur,
    ...restProps
  } = props

  const [showPassword, setShowPassword] = React.useState(false)
  const [errorTextEnabled, setErrorTextEnabled] = React.useState(errorOnMount)
  useDebounced(
    React.useCallback(() => setErrorTextEnabled(true), []),
    value,
    errorDelay,
  )

  return (
    <View style={containerStyle} testID={restProps.testID}>
      <RNPTextInput
        ref={ref}
        style={{textAlign}}
        value={value}
        onChange={() => setErrorTextEnabled(false)}
        autoCorrect={false}
        autoCompleteType="off"
        autoCapitalize="none"
        onBlur={() => {
          if (showErrorOnBlur && !errorTextEnabled && !isEmptyString(errorText)) {
            setErrorTextEnabled(true)
          }
        }}
        theme={{
          roundness: 8,
          colors: {
            background: COLORS.BACKGROUND,
            placeholder: faded ? COLORS.GREY_6 : COLORS.TEXT_INPUT,
            primary: faded ? COLORS.GREY_6 : COLORS.BLACK,
            error: COLORS.ERROR_TEXT_COLOR,
          },
        }}
        secureTextEntry={secureTextEntry && !showPassword}
        mode="outlined"
        error={errorTextEnabled && !isEmptyString(errorText)}
        render={({style, ...inputProps}) => (
          <InputContainer>
            <RNTextInput
              {...inputProps}
              style={[style, renderComponentStyle, {color: faded ? COLORS.GREY_6 : COLORS.BLACK, flex: 1}]}
            />

            {right != null ? <AdornmentContainer style={styles.checkmarkContainer}>{right}</AdornmentContainer> : null}

            {secureTextEntry ? (
              <SecureTextEntryToggle showPassword={showPassword} onPress={() => setShowPassword(!showPassword)} />
            ) : null}
          </InputContainer>
        )}
        {...restProps}
      />

      {!noHelper && (
        <HelperText type={errorTextEnabled && !isEmptyString(errorText) ? 'error' : 'info'} visible>
          {errorTextEnabled && !isEmptyString(errorText) ? errorText : helperText}
        </HelperText>
      )}
    </View>
  )
})

export const HelperText = ({
  children,
  type = 'info',
  faded = false,
  visible = true,
  ...props
}: {
  children: React.ReactNode
  type?: 'info' | 'error'
  faded?: boolean
  visible?: boolean
}) => (
  <HelperTextRNP
    theme={{
      roundness: 8,
      colors: {
        background: COLORS.BACKGROUND,
        placeholder: faded ? COLORS.GREY_6 : COLORS.TEXT_INPUT,
        primary: faded ? COLORS.GREY_6 : COLORS.BLACK,
        error: COLORS.ERROR_TEXT_COLOR,
      },
    }}
    type={type}
    visible={visible}
    {...props}
  >
    {children}
  </HelperTextRNP>
)

export const Checkmark = () => <Icon.Check size={24} color={COLORS.LIGHT_POSITIVE_GREEN} />

const SecureTextEntryToggle = ({showPassword, onPress}: {showPassword: boolean; onPress: () => void}) => (
  <AdornmentContainer style={styles.secureTextEntryToggleContainer}>
    <TouchableOpacity onPress={onPress}>
      {showPassword ? (
        <Icon.EyeOff color={COLORS.ACTION_GRAY} size={30} />
      ) : (
        <Icon.EyeOn color={COLORS.ACTION_GRAY} size={30} />
      )}
    </TouchableOpacity>
  </AdornmentContainer>
)

const InputContainer = ({children}: {children: React.ReactNode}) => (
  <View style={styles.inputContainer}>{children}</View>
)

const AdornmentContainer = ({style, children}: ViewProps) => (
  <View style={[styles.adornmentContainer, style]}>{children}</View>
)

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  checkmarkContainer: {
    paddingRight: 16,
  },
  secureTextEntryToggleContainer: {
    paddingRight: 16,
  },
  adornmentContainer: {
    justifyContent: 'center',
  },
})
