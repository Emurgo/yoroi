import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Text} from 'react-native'

import {ErrorPanel} from '../../../../../../components/ErrorPanel/ErrorPanel'
import globalMessages from '../../../../../../i18n/global-messages'
import {limitOfSecondaryAmountsPerTx} from '../../../../../../yoroi-wallets/contants'

export const MaxAmountsPerTx = () => {
  const strings = useStrings()

  return (
    <ErrorPanel>
      <Text>
        <Text
          style={{fontWeight: '500', fontFamily: 'Rubik-Medium'}}
        >{`${limitOfSecondaryAmountsPerTx} ${strings.assets.toLocaleLowerCase()} `}</Text>

        {strings.maxAmountsPerTx}
      </Text>
    </ErrorPanel>
  )
}

const messages = defineMessages({
  maxAmountsPerTx: {
    id: 'components.send.sendscreen.errorBannerMaxTokenLimit',
    defaultMessage: '!!!is the maximum number allowed to send in one transaction',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    maxAmountsPerTx: intl.formatMessage(messages.maxAmountsPerTx),
    assets: intl.formatMessage(globalMessages.assetsLabel),
  }
}
