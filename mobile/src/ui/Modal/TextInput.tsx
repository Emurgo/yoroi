import {isString} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'

import {BottomSheetTextInput} from '@gorhom/bottom-sheet'
import * as React from 'react'
import {
  TextInputProps as RNTextInputProps,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native'

import {Icon} from '~/ui/Icon'
import {isEmptyString} from '~/wallets/utils/string'

export type ModalTextInputProps = RNTextInputProps & {
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
  right?: React.ReactNode
  error?: boolean
}

const useDebounced = (callback: VoidFunction, value: unknown, delay = 1000) => {
  const first = React.useRef(true)
  React.useEffect(() => {
    if (first.current) {
      first.current = false
    }

    const handler = setTimeout(() => callback(), delay)

    return () => clearTimeout(handler)
  }, [callback, delay, value])
}

export const ModalTextInput = React.forwardRef<
  React.ElementRef<typeof BottomSheetTextInput>,
  ModalTextInputProps
>((props, ref) => {
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
    error,
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

  const showError = (errorTextEnabled && !isEmptyString(errorText)) || error
  const showHelperComponent = helper != null && !isString(helper)

  const helperToShow = showError ? (
    <HelperText type="error" visible faded={faded}>
      {errorText}
    </HelperText>
  ) : showHelperComponent ? (
    helper
  ) : (
    <HelperText type="info" visible faded={faded}>
      {helper}
    </HelperText>
  )

  return (
    <View style={containerStyle}>
      <View
        style={[
          {
            borderWidth: 1,
            borderRadius: 8,
            minHeight: 56,
            paddingHorizontal: 16,
            paddingVertical: 8,
            position: 'relative',
            borderColor: showError
              ? p.sys_magenta_500
              : faded
                ? p.gray_400
                : p.gray_200,
            backgroundColor: faded ? p.gray_100 : p.bg_color_max,
          },
        ]}
      >
        <InputContainer>
          <BottomSheetTextInput
            ref={ref}
            style={[
              {
                flex: 1,
                fontSize: 16,
                lineHeight: 24,
                minHeight: 24,
                padding: 0,
                margin: 0,
              },
              renderComponentStyle,
              {
                color: faded ? p.gray_900 : p.gray_900,
                textAlign,
              },
            ]}
            value={value}
            placeholderTextColor={faded ? p.gray_400 : p.gray_600}
            onChange={() => setErrorTextEnabled(false)}
            autoCorrect={false}
            autoComplete={autoComplete}
            autoCapitalize="none"
            keyboardAppearance={isDark ? 'dark' : 'light'}
            autoFocus={selectTextOnAutoFocus || autoFocus}
            onFocus={(event) => {
              if (selectTextOnAutoFocus && value) {
                event.currentTarget.setNativeProps?.({
                  selection: {start: 0, end: value.length},
                })
              }
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
            secureTextEntry={secureTextEntry && !showPassword}
            editable={editable}
            {...restProps}
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
            >
              {right}
            </AdornmentContainer>
          ) : null}

          {secureTextEntry ? (
            <SecureTextEntryToggle
              showPassword={showPassword}
              onPress={() => setShowPassword(!showPassword)}
            />
          ) : null}
        </InputContainer>
      </View>

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
}) => {
  const {palette: p} = useTheme()

  if (!visible || !children) return null

  return (
    <Text
      style={[
        a.body_2_md_regular,
        a.pt_xs,
        a.px_sm,
        {
          color:
            type === 'error'
              ? p.sys_magenta_500
              : faded
                ? p.gray_400
                : p.gray_700,
        },
      ]}
      {...props}
    >
      {children}
    </Text>
  )
}

export const Checkmark = () => {
  const {palette: p} = useTheme()
  return <Icon.Check size={24} color={p.secondary_500} />
}

const SecureTextEntryToggle = ({
  showPassword,
  onPress,
}: {
  showPassword: boolean
  onPress: () => void
}) => {
  const {palette: p} = useTheme()
  return (
    <AdornmentContainer style={[a.pr_lg]}>
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

const InputContainer = ({children}: {children: React.ReactNode}) => {
  return <View style={[a.flex_row, a.flex_1]}>{children}</View>
}

const AdornmentContainer = ({style, children}: ViewProps) => {
  return <View style={[a.justify_center, style]}>{children}</View>
}
