import * as React from 'react'
import {View} from 'react-native'

import {Spacer} from '../../../../../components/Spacer'
import {Text} from '../../../../../components/Text'
import {YoroiTarget} from '../../../../../yoroi-wallets/types'
import {useStrings} from '../../../../Send/common/strings'

type Props = {
  target: YoroiTarget
}
export const ReceiverInfo = ({target}: Props) => {
  const strings = useStrings()

  return (
    <View>
      <Text>{strings.receiver}:</Text>

      <Spacer height={12} />

      <Text testID="receiverAddressText">{target.entry.address}</Text>
    </View>
  )
}
