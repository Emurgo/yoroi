import {useTheme} from '@yoroi/theme'
import {Resolver} from '@yoroi/types'

import * as React from 'react'
import {ActivityIndicator, TextInput as RNTextInput, Text} from 'react-native'

import {ScannerButton} from '~/features/Send/common/ScannerButton'
import {useNavigateTo} from '~/features/Send/common/navigation'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'
import {TextInput, TextInputProps} from '~/ui/TextInput/TextInput'

import {ResolvedAddressDisplay} from './components/ResolvedAddressDisplay'
import {useAddressInput} from './hooks/useAddressInput'

export type AddressInputProps = {
  value: string
  onChangeText: (text: string) => void
  onResolved?: (address: string) => void
  onResolvedWithDetails?: (
    address: string,
    nameServer: Resolver.NameServer | null,
  ) => void
  onValidationChange?: (isValid: boolean) => void
  onScanPress?: () => void
  label?: string | React.ReactElement
  placeholder?: string
  multiline?: boolean
  numberOfLines?: number
  errorOnMount?: boolean
  showErrorOnBlur?: boolean
  testID?: string
} & Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'label' | 'helper' | 'errorText' | 'right'
>

export const AddressInput = React.forwardRef(
  (
    {
      value,
      onChangeText,
      onResolved,
      onResolvedWithDetails,
      onValidationChange,
      onScanPress,
      label,
      placeholder,
      multiline,
      numberOfLines: _numberOfLines,
      errorOnMount = true,
      showErrorOnBlur = true,
      testID,
      ...props
    }: AddressInputProps,
    ref: React.ForwardedRef<RNTextInput>,
  ) => {
    const strings = useStrings()
    const {palette: p} = useTheme()
    const navigateTo = useNavigateTo()

    const options = React.useMemo<{
      onResolved?: (address: string) => void
      onResolvedWithDetails?: (
        address: string,
        nameServer: Resolver.NameServer | null,
      ) => void
    }>(
      () => ({
        onResolved,
        onResolvedWithDetails,
      }),
      [onResolved, onResolvedWithDetails],
    )

    const {
      isLoading,
      isValid,
      hasError,
      errorMessage,
      resolvedAddress,
      selectedNameServer,
    } = useAddressInput(value, options)

    // Notify parent of validation state changes
    React.useEffect(() => {
      onValidationChange?.(isValid)
    }, [isValid, onValidationChange])

    // Get error message string
    const errorText = React.useMemo(() => {
      if (!hasError || !errorMessage) return undefined
      let result: string | undefined
      switch (errorMessage) {
        case 'helperAddressErrorInvalid':
          result = strings.send.helperAddressErrorInvalid
          break
        case 'helperAddressErrorWrongBlockchain':
          result = strings.send.helperAddressErrorWrongBlockchain
          break
        case 'helperAddressErrorWrongNetwork':
          result = strings.send.helperAddressErrorWrongNetwork
          break
        case 'helperResolverErrorDomainNotFound':
          result = strings.send.helperResolverErrorDomainNotFound
          break
        default:
          result = undefined
      }
      return result
    }, [hasError, errorMessage, strings.send])

    // Right adornment: loading -> check -> scanner
    const handleScanPress = onScanPress ?? navigateTo.reader
    const rightAdornment = isLoading ? (
      <ActivityIndicator size={25} color={p.primary_600} />
    ) : isValid ? (
      <Icon.Check size={25} color={p.secondary_500} />
    ) : (
      <ScannerButton onPress={handleScanPress} />
    )

    // Helper: resolved address display (only when no error)
    const helper = React.useMemo(
      () =>
        !errorText ? (
          <ResolvedAddressDisplay
            resolvedAddress={resolvedAddress}
            selectedNameServer={selectedNameServer}
          />
        ) : undefined,
      [errorText, resolvedAddress, selectedNameServer],
    )

    // Label: use provided label or default
    const finalLabel: string | React.ReactElement =
      label != null ? (
        label
      ) : (
        <Text style={{fontSize: 15}}>{strings.send.addressInputLabel}</Text>
      )

    return (
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        right={rightAdornment}
        helper={helper}
        errorText={errorText}
        label={finalLabel}
        placeholder={placeholder}
        multiline={multiline ?? true}
        blurOnSubmit
        errorOnMount={errorOnMount}
        showErrorOnBlur={showErrorOnBlur}
        autoCorrect={false}
        focusable
        renderComponentStyle={{
          minHeight: 120,
        }}
        testID={testID}
        {...props}
      />
    )
  },
)

AddressInput.displayName = 'AddressInput'
