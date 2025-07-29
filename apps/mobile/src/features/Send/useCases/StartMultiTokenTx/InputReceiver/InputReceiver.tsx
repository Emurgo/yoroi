import {useTheme} from '@yoroi/theme'
import React from 'react'
import {ActivityIndicator, TextInput as RNTextInput, Text} from 'react-native'

import {ScannerButton} from '~/features/Send/common/ScannerButton'
import {useStrings} from '~/features/Send/common/useStrings'
import {Icon} from '~/ui/Icon'
import {TextInput, TextInputProps} from '~/ui/TextInput/TextInput'
import {useNavigateTo} from '../../common/navigation'
import {ShowResolvedAddressSelected} from './ShowResolvedAddressSelected'

export const InputReceiver = React.forwardRef(
  (
    {
      isLoading,
      isValid,
      ...props
    }: {isLoading?: boolean; isValid?: boolean} & TextInputProps,
    ref: React.ForwardedRef<RNTextInput>,
  ) => {
    const strings = useStrings()
    const {palette: p} = useTheme()
    const navigateTo = useNavigateTo()
    const rightAdornment = isLoading ? (
      <ActivityIndicator size={25} color={p.primary_600} />
    ) : isValid ? (
      <Icon.Check size={25} color={p.secondary_500} />
    ) : (
      <ScannerButton onPress={navigateTo.reader} />
    )

    return (
      <TextInput
        right={rightAdornment}
        label={<Text style={{fontSize: 15}}>{strings.addressInputLabel}</Text>}
        testID="receiverInput"
        autoCorrect={false}
        focusable
        errorOnMount
        showErrorOnBlur
        multiline
        blurOnSubmit
        helper={<ShowResolvedAddressSelected />}
        renderComponentStyle={{
          minHeight: 120,
        }}
        ref={ref}
        {...props}
      />
    )
  },
)
