import {isString} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'

import * as React from 'react'
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  ViewStyle,
} from 'react-native'
import {HelperText as HelperTextRNP} from 'react-native-paper'

import {isEmptyString} from '~/wallets/utils/string'

type TextInputProps = RNTextInputProps & {
  containerStyle?: ViewStyle
  renderComponentStyle?: ViewStyle
  helper?: React.ReactNode
  errorText?: string
  errorOnMount?: boolean
  errorDelay?: number
  noHelper?: boolean
  faded?: boolean
  showErrorOnBlur?: boolean
  selectTextOnAutoFocus?: boolean
  isValidPhrase?: boolean
  cursorColor?: string
  selectionColor?: string
  spellCheck?: boolean
  enablesReturnKeyAutomatically?: boolean
  blurOnSubmit?: boolean
  onSubmitEditing?: () => void
  onKeyPress?: (event: any) => void
  keyboardType?: string
  dense?: boolean
}

const useDebounced = (cb: VoidFunction, v: unknown, d = 1_000) => {
  const first = React.useRef(true)
  React.useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const t = setTimeout(cb, d)
    return () => clearTimeout(t)
  }, [cb, d, v])
}

export const TextInput = React.forwardRef(
  (props: TextInputProps, ref: React.ForwardedRef<RNTextInput>) => {
    const {
      value,
      containerStyle,
      renderComponentStyle,
      helper,
      errorText,
      errorOnMount,
      errorDelay,
      noHelper,
      textAlign,
      faded,
      showErrorOnBlur,
      autoComplete = 'off',
      onFocus,
      onBlur,
      onChangeText,
      onChange,
      autoFocus,
      selectTextOnAutoFocus,
      isValidPhrase = false,
      placeholder,
      ...rest
    } = props

    const {palette: p, isDark} = useTheme()

    const [errorTextEnabled, setErrorTextEnabled] = React.useState(errorOnMount)
    const [isValidWord, setIsValidWord] = React.useState(false)

    useDebounced(() => setErrorTextEnabled(true), value, errorDelay)

    const showError = errorTextEnabled && !isEmptyString(errorText)
    const showHelperComponent = helper != null && !isString(helper)

    const helperNode = showError ? (
      <HelperTextRNP
        theme={{
          roundness: 8,
          colors: {
            background: p.gray_min,
            placeholder: p.primary_300,
            primary: p.primary_300,
            error: p.text_error,
            text: p.text_error,
          },
        }}
        type="error"
        visible
      >
        {errorText}
      </HelperTextRNP>
    ) : showHelperComponent ? (
      helper
    ) : (
      <HelperTextRNP
        theme={{
          roundness: 8,
          colors: {
            background: p.gray_min,
            placeholder: faded
              ? isDark
                ? p.primary_700
                : p.primary_500
              : p.primary_300,
            primary: faded
              ? isDark
                ? p.primary_700
                : p.primary_500
              : p.gray_max,
            error: p.text_error,
            text: p.gray_700,
          },
        }}
        type="info"
        visible
      >
        {helper}
      </HelperTextRNP>
    )

    React.useEffect(() => {
      if (value === '') setIsValidWord(false)
    }, [value])

    return (
      <View style={containerStyle}>
        <View
          style={[
            {
              borderWidth: 1,
              borderColor: showError
                ? p.text_error
                : faded
                  ? p.primary_300
                  : p.gray_max,
              borderRadius: 8,
              backgroundColor: isValidPhrase
                ? p.el_secondary
                : isValidWord && isEmptyString(errorText)
                  ? p.primary_100
                  : 'transparent',
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
            },
          ]}
        >
          <RNTextInput
            ref={ref}
            style={[
              {
                flex: 1,
                color: isValidPhrase
                  ? p.black_static
                  : showError
                    ? p.text_error
                    : p.text_primary_medium,
                fontSize: 16,
                textAlign,
              },
              renderComponentStyle,
            ]}
            value={value}
            onChangeText={(text) => {
              setErrorTextEnabled(false)
              setIsValidWord(false)
              onChangeText?.(text)
            }}
            onChange={(event) => {
              onChange?.(event)
            }}
            autoCorrect={false}
            autoComplete={autoComplete}
            autoCapitalize="none"
            keyboardAppearance={isDark ? 'dark' : 'light'}
            autoFocus={selectTextOnAutoFocus || autoFocus}
            onFocus={(event) => {
              if (selectTextOnAutoFocus && value) {
                event.currentTarget.setNativeProps({
                  selection: {start: 0, end: value.length},
                })
              }
              onFocus?.(event)
            }}
            onBlur={(event) => {
              if (!isEmptyString(errorText)) {
                if (showErrorOnBlur && !errorTextEnabled)
                  setErrorTextEnabled(true)
                setIsValidWord(false)
              } else if (value === '') {
                setIsValidWord(false)
                setErrorTextEnabled(false)
              } else {
                setIsValidWord(true)
              }
              onBlur?.(event)
            }}
            placeholder={placeholder}
            placeholderTextColor={
              faded
                ? isDark
                  ? p.primary_700
                  : p.primary_500
                : isValidWord && isEmptyString(errorText)
                  ? 'transparent'
                  : p.primary_300
            }
            {...rest}
          />
        </View>
        {!noHelper && helperNode}
      </View>
    )
  },
)
