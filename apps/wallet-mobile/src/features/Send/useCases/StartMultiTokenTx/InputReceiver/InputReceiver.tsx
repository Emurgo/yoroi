import React from 'react'
import {StyleSheet} from 'react-native'

import {TextInput, TextInputProps} from '../../../../../components'
import {useNavigateTo} from '../../../common/navigation'
import {ScannerButton} from '../../../common/ScannerButton'
import {useStrings} from '../../../common/strings'

export const InputReceiver = ({isLoading, ...props}: {isLoading: boolean} & TextInputProps) => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()

  return (
    <TextInput
      right={<ScannerButton disabled={isLoading} onPress={navigateTo.reader} />}
      label={strings.addressInputLabel}
      testID="receiverInput"
      style={styles.receiver}
      autoCorrect={false}
      focusable
      autoFocus
      errorOnMount
      showErrorOnBlur
      noHelper
      multiline
      blurOnSubmit
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  receiver: {
    height: 120,
  },
})
