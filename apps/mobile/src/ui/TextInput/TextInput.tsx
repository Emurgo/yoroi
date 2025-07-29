import {isString} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'
import React, {ForwardedRef} from 'react'
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native'
import {
  HelperText as HelperTextRNP,
  TextInput as RNPTextInput,
} from 'react-native-paper'

import {Icon} from '~/ui/Icon'
import {isEmptyString} from '~/wallets/utils/string'

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

const useDebounced = (callback: VoidFunction, value: unknown, delay = 1000) => {
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

export const TextInput = React.forwardRef(
  (props: TextInputProps, ref: ForwardedRef<RNTextInput>) => {
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
      editable,
      faded = editable === false,
      showErrorOnBlur,
      autoComplete = 'off',
      onFocus,
      autoFocus,
      selectTextOnAutoFocus,
      ...restProps
    } = props

    const [showPassword, setShowPassword] = React.useState(false)
    const [errorTextEnabled, setErrorTextEnabled] = React.useState(errorOnMount)
    const {palette: p, isDark} = useTheme()
    useDebounced(
      React.useCallback(() => setErrorTextEnabled(true), []),
      value,
      errorDelay,
    )
    const showError = errorTextEnabled && !isEmptyString(errorText)
    const showHelperComponent = helper != null && !isString(helper)

    const helperToShow = showError ? (
      <HelperText type="error" visible p={p}>
        {errorText}
      </HelperText>
    ) : showHelperComponent ? (
      helper
    ) : (
      <HelperText type="info" visible p={p}>
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
          keyboardAppearance={isDark ? 'dark' : 'light'} // ios feature
          autoFocus={selectTextOnAutoFocus || autoFocus}
          onFocus={(event) => {
            // selectTextOnFocus + autoFocus doesn't work as expected
            // also there is a bug on ios for selectTextOnFocus: https://github.com/facebook/react-native/issues/30585
            // note: selectTextOnFocus is not equal to selectTextOnAutoFocus
            if (selectTextOnAutoFocus)
              event.currentTarget.setSelection(0, value?.length)

            if (onFocus) onFocus(event)
          }}
          onBlur={() => {
            if (
              showErrorOnBlur &&
              !errorTextEnabled &&
              !isEmptyString(errorText)
            ) {
              setErrorTextEnabled(true)
            }
          }}
          theme={{
            roundness: 8,
            colors: {
              background: faded ? p.gray_100 : p.bg_color_max,
              placeholder: faded ? p.gray_400 : p.gray_600,
              primary: faded ? p.gray_400 : p.gray_max,
              error: p.sys_magenta_500,
            },
          }}
          secureTextEntry={secureTextEntry && !showPassword}
          mode="outlined"
          error={errorTextEnabled && !isEmptyString(errorText)}
          render={({style, ...inputProps}) => (
            <InputContainer p={p}>
              <RNTextInput
                {...inputProps}
                style={[
                  style,
                  renderComponentStyle,
                  {color: faded ? p.gray_900 : p.gray_900, flex: 1},
                ]}
                editable={editable}
              />

              {right != null ? (
                <AdornmentContainer
                  style={[
                    a.pr_lg,
                    a.pb_lg,
                    a.align_center,
                    a.justify_end,
                    a.flex_col,
                  ]}
                  p={p}
                >
                  {right}
                </AdornmentContainer>
              ) : null}

              {secureTextEntry ? (
                <SecureTextEntryToggle
                  showPassword={showPassword}
                  onPress={() => setShowPassword(!showPassword)}
                  p={p}
                />
              ) : null}
            </InputContainer>
          )}
          {...restProps}
        />

        {!noHelper && helperToShow}
      </View>
    )
  },
)

export const HelperText = ({
  children,
  type = 'info',
  faded = false,
  visible = true,
  p,
  ...props
}: {
  children: React.ReactNode
  type?: 'info' | 'error'
  faded?: boolean
  visible?: boolean
  p: any
}) => {
  return (
    <HelperTextRNP
      style={{paddingHorizontal: 0}}
      theme={{
        roundness: 8,
        colors: {
          background: p.bg_color_max,
          placeholder: faded ? p.gray_400 : p.gray_600,
          primary: faded ? p.gray_400 : p.gray_max,
          error: p.sys_magenta_500,
          text: p.gray_700,
        },
      }}
      type={type}
      visible={visible}
      {...props}
    >
      {children}
    </HelperTextRNP>
  )
}

export const Checkmark = ({p}: {p: any}) => {
  return <Icon.Check size={24} color={p.secondary_500} />
}

const SecureTextEntryToggle = ({
  showPassword,
  onPress,
  p,
}: {
  showPassword: boolean
  onPress: () => void
  p: any
}) => {
  return (
    <AdornmentContainer style={{paddingRight: 16}} p={p}>
      <TouchableOpacity onPress={onPress}>
        {showPassword ? (
          <Icon.EyeOff color={p.el_gray_medium} size={30} />
        ) : (
          <Icon.EyeOn color={p.el_gray_medium} size={30} />
        )}
      </TouchableOpacity>
    </AdornmentContainer>
  )
}

const InputContainer = ({children, p}: {children: React.ReactNode; p: any}) => {
  return <View style={{flexDirection: 'row', flex: 1}}>{children}</View>
}

const AdornmentContainer = ({style, children, p}: ViewProps & {p: any}) => {
  return <View style={[{justifyContent: 'center'}, style]}>{children}</View>
}
