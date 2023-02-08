import _ from 'lodash'
import React from 'react'
import {StyleSheet} from 'react-native'

import {TextInput, TextInputProps} from '../../../../components'
import {ScannerButton} from '../../../shared/ScannerButton'
import {useStrings} from '../../../shared/strings'

export const InputReceiver = ({isLoading, ...props}: {isLoading: boolean} & TextInputProps) => {
  const strings = useStrings()

  return (
    <TextInput
      right={<ScannerButton disabled={isLoading} />}
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
