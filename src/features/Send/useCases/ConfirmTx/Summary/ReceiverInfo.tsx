import * as React from 'react'
import {useIntl} from 'react-intl'
import {View} from 'react-native'

import {Text} from '../../../../../components/Text'
import {txLabels} from '../../../../../i18n/global-messages'
import {useSend} from '../../../common/SendContext'

export const ReceiverInfo = () => {
  const strings = useStrings()
  const {targets} = useSend()

  const receiver = targets[0].receiver
  const address = targets[0].entry.address
  const isResolved = receiver !== address

  return (
    <View>
      <Text>{strings.receiver}</Text>

      <Text testID="receiverAddressText">{receiver}</Text>

      {isResolved && (
        <View>
          <Text>{strings.resolvesTo}</Text>

          <Text testID="addressText">{address}</Text>
        </View>
      )}
    </View>
  )
}

const messages = {
  resolvesTo: {
    id: 'components.send.sendscreen.resolvesTo',
    defaultMessage: '!!!Resolves to',
  },
}

const useStrings = () => {
  const intl = useIntl()

  return {
    receiver: intl.formatMessage(txLabels.receiver),
    resolvesTo: intl.formatMessage(messages.resolvesTo),
  }
}
