import React from 'react'
import {ActivityIndicator, StyleSheet} from 'react-native'

import {Icon, TextInput, TextInputProps} from '../../../../../components'
import {useNavigateTo} from '../../../common/navigation'
import {ScannerButton} from '../../../common/ScannerButton'
import {useStrings} from '../../../common/strings'
import {ShowResolvedAddressSelected} from './ShowResolvedAddressSelected'

export const InputReceiver = ({
  isLoading,
  isValid,
  ...props
}: {isLoading?: boolean; isValid?: boolean} & TextInputProps) => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const rightAdornment = isLoading ? (
    <ActivityIndicator size={25} color="#3154CB" />
  ) : isValid ? (
    <Icon.Check size={25} color="#08C29D" />
  ) : (
    <ScannerButton onPress={navigateTo.reader} />
  )

  return (
    <TextInput
      right={rightAdornment}
      label={strings.addressInputLabel}
      testID="receiverInput"
      style={styles.receiver}
      autoCorrect={false}
      focusable
      autoFocus
      errorOnMount
      showErrorOnBlur
      multiline
      blurOnSubmit
      helper={<ShowResolvedAddressSelected />}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  receiver: {
    height: 120,
  },
})
