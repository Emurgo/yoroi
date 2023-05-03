import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {View} from 'react-native'

import {Text} from '../../../../../components/Text'
import {txLabels} from '../../../../../i18n/global-messages'

type Props = {
  receiver: string
  address: string
}
export const ReceiverInfo = ({receiver, address}: Props) => {
  const strings = useStrings()

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

const messages = defineMessages({
  resolvesTo: {
    id: 'components.send.sendscreen.resolvesTo',
    defaultMessage: '!!!Resolves to',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    receiver: intl.formatMessage(txLabels.receiver),
    resolvesTo: intl.formatMessage(messages.resolvesTo),
  }
}
