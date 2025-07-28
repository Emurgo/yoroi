import {isString} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  ViewStyle,
} from 'react-native'
import {
  HelperText as HelperTextRNP,
  TextInput as RNPTextInput,
} from 'react-native-paper'
import {isEmptyString} from '../../../../../../wallets/utils/string'

type TextInputProps = RNTextInputProps &
  Omit<React.ComponentProps<typeof RNPTextInput>, 'theme'> & {
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
    isValidPhrase: boolean
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
      cursorColor,
      selectionColor,
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
        <RNPTextInput
          ref={ref}
          value={value}
          style={{textAlign}}
          autoCorrect={false}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoFocus={selectTextOnAutoFocus || autoFocus}
          mode="outlined"
          error={showError}
          theme={{
            roundness: 8,
            colors: {
              background: isValidPhrase
                ? p.el_secondary
                : isValidWord && isEmptyString(errorText)
                  ? p.primary_100
                  : 'transparent',
              placeholder: faded
                ? isDark
                  ? p.primary_700
                  : p.primary_500
                : isValidWord && isEmptyString(errorText)
                  ? 'transparent'
                  : p.primary_300,
              primary: faded
                ? p.primary_300
                : isDark
                  ? p.primary_700
                  : p.primary_500,
              error: p.text_error,
            },
          }}
          onChange={(e) => {
            setErrorTextEnabled(false)
            setIsValidWord(false)
            onChange?.(e)
          }}
          onChangeText={(txt) => {
            setErrorTextEnabled(false)
            setIsValidWord(false)
            onChangeText?.(txt)
          }}
          onFocus={(event) => {
            if (selectTextOnAutoFocus)
              event.currentTarget.setSelection(0, value?.length)
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
          render={({style, ...inputProps}) => (
            <View style={{flexDirection: 'row', flex: 1, overflow: 'hidden'}}>
              <RNTextInput
                {...inputProps}
                cursorColor={cursorColor}
                selectionColor={selectionColor}
                keyboardAppearance={isDark ? 'dark' : 'light'}
                style={[
                  style,
                  renderComponentStyle,
                  {
                    flex: 1,
                    color: isValidPhrase
                      ? p.black_static
                      : showError
                        ? p.text_error
                        : p.text_primary_medium,
                  },
                ]}
              />
            </View>
          )}
          {...rest}
        />
        {!noHelper && helperNode}
      </View>
    )
  },
)
