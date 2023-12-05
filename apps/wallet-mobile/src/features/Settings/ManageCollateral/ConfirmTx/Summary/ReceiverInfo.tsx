import {useResolver} from '@yoroi/resolver'
import * as React from 'react'
import {View} from 'react-native'

import {Spacer} from '../../../../../components/Spacer'
import {Text} from '../../../../../components/Text'
import {Service} from '../../../../../features/Send/useCases/StartMultiTokenTx/InputReceiver/ResolveAddress'
import {isEmptyString} from '../../../../../utils'
import {useStrings} from '../../../../Send/common/strings'

type Props = {
  receiver: string
}
export const ReceiverInfo = ({receiver}: Props) => {
  const strings = useStrings()

  const {resolvedAddressSelected} = useResolver()

  const isResolved =
    !isEmptyString(resolvedAddressSelected?.address) && !isEmptyString(resolvedAddressSelected?.service)

  return (
    <View>
      <Text>{strings.receiver}:</Text>

      <Spacer height={12} />

      {isResolved ? (
        <>
          <View style={{flexDirection: 'row'}}>
            <Text>{Service[resolvedAddressSelected?.service ?? ''] ?? ''}:</Text>

            <Spacer width={5} />

            <Text>{receiver}</Text>
          </View>

          <Spacer height={12} />

          <Text>{strings.walletAddress}:</Text>

          <Spacer height={12} />

          <Text testID="receiverAddressText">{resolvedAddressSelected?.address}</Text>
        </>
      ) : (
        <Text testID="receiverAddressText">{receiver}</Text>
      )}
    </View>
  )
}
