import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Text} from 'react-native'

import globalMessages from '../../i18n/global-messages'
import {limitOfSecondaryAmountsPerTx} from '../../yoroi-wallets/contants'
import {ScreenBackground} from '../ScreenBackground'
import {ErrorPanel} from './ErrorPanel'

storiesOf('Error Panel', module).add('with error message', () => {
  const strings = useStrings()
  return (
    <ScreenBackground style={{padding: 16, backgroundColor: 'white'}}>
      <ErrorPanel>
        <Text>
          <Text
            style={{fontWeight: '500', fontFamily: 'Rubik-Medium'}}
          >{`${limitOfSecondaryAmountsPerTx} ${strings.assets.toLocaleLowerCase()} `}</Text>

          {strings.maxAmountsPerTx}
        </Text>
      </ErrorPanel>
    </ScreenBackground>
  )
})

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
