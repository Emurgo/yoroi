import * as React from 'react'
import {View} from 'react-native'

import {useStrings} from '~/features/Send/common/useStrings'
import {memoMaxLenght} from '~/features/SetupWallet/common/constants'
import {HelperText} from '~/ui/TextInput/TextInput'

export const ShowMemoInstructions = ({memo = ''}: {memo?: string}) => {
  const strings = useStrings()

  const lenghtInfo = `${memo.length}/${memoMaxLenght}`

  return (
    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      <HelperText type="info">{strings.helperMemoInstructions}</HelperText>

      <HelperText type="info">{lenghtInfo}</HelperText>
    </View>
  )
}
