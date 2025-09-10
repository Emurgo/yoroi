import * as React from 'react'
import {View} from 'react-native'

import {memoMaxLenght} from '~/features/Send/common/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {HelperText} from '~/ui/TextInput/TextInput'

export const ShowMemoErrorTooLong = ({memo = ''}: {memo?: string}) => {
  const strings = useStrings()

  const lenghtInfo = `${memo.length}/${memoMaxLenght}`

  return (
    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      <HelperText type="error">
        {strings.send.helperMemoErrorTooLong}
      </HelperText>

      <HelperText type="error">{lenghtInfo}</HelperText>
    </View>
  )
}
