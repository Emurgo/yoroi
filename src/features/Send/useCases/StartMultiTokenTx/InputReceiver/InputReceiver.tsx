import {useNavigation} from '@react-navigation/native'
import _ from 'lodash'
import React from 'react'

import {TextInput, TextInputProps} from '../../../../../components'
import {TxHistoryRouteNavigation} from '../../../../../navigation'
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

const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  return {
    reader: () => navigation.navigate('send-read-qr-code'),
  }
}
