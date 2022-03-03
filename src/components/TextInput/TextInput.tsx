import React from 'react'
import {
  Image,
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native'
import {HelperText, TextInput as RNPTextInput} from 'react-native-paper'
import {TextInputProps} from 'react-native-paper/lib/typescript/components/TextInput/TextInput'
import {RenderProps} from 'react-native-paper/lib/typescript/components/TextInput/types'

import closedEyeIcon from '../../../legacy/assets/img/icon/visibility-closed.png'
import openedEyeIcon from '../../../legacy/assets/img/icon/visibility-opened.png'
import {COLORS} from '../../../legacy/styles/config'
import {Icon} from '../Icon'

type Props = Omit<
  RNTextInputProps &
    TextInputProps & {
      containerStyle?: ViewStyle
      label?: string
      helperText?: string
      errorText?: string
      disabled?: boolean
      errorOnMount?: boolean
      errorDelay?: number
      right?: React.ReactNode
      noErrors?: boolean
      dense?: boolean
      faded?: boolean
      textAlign?: 'left' | 'center' | 'right'
      value?: string
      secureTextEntry?: boolean
      render?: (renderProps: RenderProps) => React.ReactNode
    } & {selectionColor?: string},
  'theme'
>

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

export const TextInput = React.forwardRef((props: Props, ref: React.Ref<RNTextInput>) => {
  const {
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
    faded,
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
            placeholder: faded ? COLORS.GREY_6 : COLORS.TEXT_INPUT,
            primary: faded ? COLORS.GREY_6 : COLORS.BLACK,
            error: COLORS.ERROR_TEXT_COLOR,
          },
        }}
        secureTextEntry={secureTextEntry && !showPassword}
        mode={'outlined'}
        error={errorTextEnabled && !!errorText}
        render={({style, ...inputProps}) => (
          <InputContainer>
            <RNTextInput {...inputProps} style={[style, {color: faded ? COLORS.GREY_6 : COLORS.BLACK}]} />
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
})

export const Checkmark = () => <Icon.Check height={24} width={24} color={COLORS.LIGHT_POSITIVE_GREEN} />

const SecureTextEntryToggle = ({showPassword, onPress}: {showPassword: boolean; onPress: () => void}) => (
  <AdornmentContainer style={styles.secureTextEntryToggleContainer}>
    <TouchableOpacity onPress={onPress}>
      {showPassword ? <Image source={closedEyeIcon} /> : <Image source={openedEyeIcon} />}
    </TouchableOpacity>
  </AdornmentContainer>
)

const InputContainer: React.FC = ({children}) => <View style={styles.inputContainer}>{children}</View>

const AdornmentContainer: React.FC<ViewProps> = ({style, children}) => (
  <View style={[styles.adornmentContainer, style]}>{children}</View>
)

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
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
