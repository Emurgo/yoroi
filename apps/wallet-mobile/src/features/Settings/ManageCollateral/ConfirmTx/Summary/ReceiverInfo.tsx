import {Resolver} from '@yoroi/types'
import * as React from 'react'
import {View} from 'react-native'

import {Spacer} from '../../../../../components/Spacer'
import {Text} from '../../../../../components/Text'
import {useStrings} from '../../../../Send/common/strings'

type Props = {
  receiver: Resolver.Receiver
}
export const ReceiverInfo = ({receiver}: Props) => {
  const strings = useStrings()

  return (
    <View>
      <Text>{strings.receiver}:</Text>

      <Spacer height={12} />

      {/* TODO: revisit, should receive the target not the receiver for collateral is irrelevant */}
      <Text testID="receiverAddressText">{receiver.resolve}</Text>
    </View>
  )
}
