import {isString} from '@yoroi/common'
import React, {ForwardedRef} from 'react'
import {
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native'
import {HelperText as HelperTextRNP, TextInput as RNPTextInput} from 'react-native-paper'

import {COLORS} from '../../theme'
import {isEmptyString} from '../../utils/utils'
import {Icon} from '../Icon'

export type TextInputProps = RNTextInputProps &
  Omit<React.ComponentProps<typeof RNPTextInput>, 'theme'> & {
    containerStyle?: ViewStyle
    renderComponentStyle?: ViewStyle
    helper?: React.ReactNode
    errorText?: string
    disabled?: boolean
    errorOnMount?: boolean
    errorDelay?: number
    noHelper?: boolean
    dense?: boolean
    faded?: boolean
    showErrorOnBlur?: boolean
    selectTextOnAutoFocus?: boolean
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

export const TextInput = React.forwardRef((props: TextInputProps, ref: ForwardedRef<RNTextInput>) => {
  const {
    value,
    containerStyle,
    renderComponentStyle,
    secureTextEntry,
    helper,
    errorText,
    errorOnMount,
    errorDelay,
    right,
    noHelper,
    textAlign,
    faded,
    showErrorOnBlur,
    autoComplete = 'off',
    onFocus,
    autoFocus,
    selectTextOnAutoFocus,
    ...restProps
  } = props

  const [showPassword, setShowPassword] = React.useState(false)
  const [errorTextEnabled, setErrorTextEnabled] = React.useState(errorOnMount)
  useDebounced(
    React.useCallback(() => setErrorTextEnabled(true), []),
    value,
    errorDelay,
  )
  const showError = errorTextEnabled && !isEmptyString(errorText)
  const showHelperComponent = helper != null && !isString(helper)

  const helperToShow = showError ? (
    <HelperText type="error" visible>
      {errorText}
    </HelperText>
  ) : showHelperComponent ? (
    helper
  ) : (
    <HelperText type="info" visible>
      {helper}
    </HelperText>
  )

  return (
    <View style={containerStyle}>
      <RNPTextInput
        ref={ref}
        style={{textAlign}}
        value={value}
        onChange={() => setErrorTextEnabled(false)}
        autoCorrect={false}
        autoComplete={autoComplete}
        autoCapitalize="none"
        autoFocus={selectTextOnAutoFocus || autoFocus}
        onFocus={(event) => {
          // selectTextOnFocus + autoFocus doesn't work as expected
          // also there is a bug on ios for selectTextOnFocus: https://github.com/facebook/react-native/issues/30585
          // note: selectTextOnFocus is not equal to selectTextOnAutoFocus
          if (selectTextOnAutoFocus) event.currentTarget.setSelection(0, value?.length)

          if (onFocus) onFocus(event)
        }}
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

      {!noHelper && helperToShow}
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
    style={{paddingHorizontal: 0}}
    theme={{
      roundness: 8,
      colors: {
        background: COLORS.BACKGROUND,
        placeholder: faded ? COLORS.GREY_6 : COLORS.TEXT_INPUT,
        primary: faded ? COLORS.GREY_6 : COLORS.BLACK,
        error: COLORS.ERROR_TEXT_COLOR,
        text: COLORS.INFO_GRAY,
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
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'column',
    paddingBottom: 16,
  },
  secureTextEntryToggleContainer: {
    paddingRight: 16,
  },
  adornmentContainer: {
    justifyContent: 'center',
  },
})
