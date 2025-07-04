import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Text} from 'react-native'

import {ErrorPanel} from '../../../../../../components/ErrorPanel/ErrorPanel'
import globalMessages from '../../../../../../kernel/i18n/global-messages'
import {limitOfSecondaryAmountsPerTx} from '../../../../common/constants'

export const MaxAmountsPerTx = () => {
  const strings = useStrings()
  const theme = useTheme()

  return (
    <ErrorPanel>
      <Text
        style={[theme.atoms.body_2_md_regular, {color: theme.color.gray_max}]}
      >
        <Text
          style={theme.atoms.body_2_md_medium}
        >{`${limitOfSecondaryAmountsPerTx} ${strings.assets.toLocaleLowerCase()} `}</Text>

        {strings.maxAmountsPerTx}
      </Text>
    </ErrorPanel>
  )
}

const messages = defineMessages({
  maxAmountsPerTx: {
    id: 'components.send.sendscreen.errorBannerMaxTokenLimit',
    defaultMessage:
      '!!!is the maximum number allowed to send in one transaction',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    maxAmountsPerTx: intl.formatMessage(messages.maxAmountsPerTx),
    assets: intl.formatMessage(globalMessages.assetsLabel),
  }
}
