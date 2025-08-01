import * as React from 'react'
import {View} from 'react-native'

import {memoMaxLenght} from '~/features/SetupWallet/common/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {HelperText} from '~/ui/TextInput/TextInput'

export const ShowMemoInstructions = ({memo = ''}: {memo?: string}) => {
  const strings = useStrings()

  const lenghtInfo = `${memo.length}/${memoMaxLenght}`

  return (
    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      <HelperText type="info">{strings.send.helperMemoInstructions}</HelperText>

      <HelperText type="info">{lenghtInfo}</HelperText>
    </View>
  )
}
