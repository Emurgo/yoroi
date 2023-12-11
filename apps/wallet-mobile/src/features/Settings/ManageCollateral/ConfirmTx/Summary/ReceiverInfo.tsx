import * as React from 'react'
import {View} from 'react-native'

import {Spacer} from '../../../../../components/Spacer'
import {Text} from '../../../../../components/Text'
import {useStrings} from '../../../../Send/common/strings'

type Props = {
  receiver: string
}
export const ReceiverInfo = ({receiver}: Props) => {
  const strings = useStrings()

  return (
    <View>
      <Text>{strings.receiver}:</Text>

      <Spacer height={12} />

      <Text testID="receiverAddressText">{receiver}</Text>
    </View>
  )
}
