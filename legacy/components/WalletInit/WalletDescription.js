// @flow

import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {View} from 'react-native'

// $FlowExpectedError
import * as Icon from '../../../src/components/Icon'
import {COLORS} from '../../styles/config'
import {Text} from '../UiKit'
import styles from './styles/WalletInitScreen.style'

const messages = defineMessages({
  slogan: {
    id: 'components.walletinit.walletdescription.slogan',
    defaultMessage: '!!!Your gateway to the financial world',
  },
})

const WalletDescription = () => {
  const intl = useIntl()

  return (
    <View style={styles.description}>
      <Icon.YoroiWallet color={COLORS.WHITE} width={208} height={60} />
      <View style={styles.emurgoCreditsContainer}>
        <Text light>{intl.formatMessage(messages.slogan)}</Text>
      </View>
    </View>
  )
}

export default WalletDescription
