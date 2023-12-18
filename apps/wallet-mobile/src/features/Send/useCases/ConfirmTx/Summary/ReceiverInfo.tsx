import {nameServerName} from '@yoroi/resolver'
import * as React from 'react'
import {View} from 'react-native'

import {Spacer} from '../../../../../components/Spacer'
import {Text} from '../../../../../components/Text'
import {YoroiTarget} from '../../../../../yoroi-wallets/types'
import {useStrings} from '../../../common/strings'

type Props = {
  target: YoroiTarget
}
export const ReceiverInfo = ({target}: Props) => {
  const strings = useStrings()
  const {receiver, entry} = target

  return (
    <View>
      <Text>{strings.receiver}:</Text>

      <Spacer height={12} />

      {target.receiver.as === 'domain' ? (
        <>
          <View style={{flexDirection: 'row'}}>
            <Text>{receiver.selectedNameServer ? nameServerName[receiver.selectedNameServer] : ''}:</Text>

            <Spacer width={5} />

            <Text>{receiver.resolve}</Text>
          </View>

          <Spacer height={12} />

          <Text>{strings.walletAddress}:</Text>

          <Spacer height={12} />

          <Text testID="receiverAddressText">{entry.address}</Text>
        </>
      ) : (
        <Text testID="receiverAddressText">{entry.address}</Text>
      )}
    </View>
  )
}
