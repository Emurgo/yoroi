import * as React from 'react'
import {useIntl} from 'react-intl'
import {Text} from 'react-native'

import {ErrorPanel} from '../../../../../../components/ErrorPanel/ErrorPanel'
import globalMessages from '../../../../../../i18n/global-messages'
import {maxTokensPerTx} from '../../../../../../yoroi-wallets/contants'

export const MaxTokensPerTx = () => {
  const strings = useStrings()

  return (
    <ErrorPanel>
      <Text>
        <Text
          style={{fontWeight: '500', fontFamily: 'Rubik-Medium'}}
        >{`${maxTokensPerTx} ${strings.assets.toLocaleLowerCase()} `}</Text>

        {strings.maxTokenLimit}
      </Text>
    </ErrorPanel>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    maxTokenLimit: intl.formatMessage({
      id: 'components.send.sendscreen.errorBannerMaxTokenLimit',
      defaultMessage: '!!!is the maximum number allowed to send in one transaction',
    }),
    assets: intl.formatMessage(globalMessages.assetsLabel),
  }
}
