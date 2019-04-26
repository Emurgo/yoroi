// @flow

import React from 'react'
import {View} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'

import YoroiWalletIcon from '../../assets/YoroiWalletIcon'
import EmurgoIcon from '../../assets/EmurgoIcon'
import {Text} from '../UiKit'

import {COLORS} from '../../styles/config'
import styles from './styles/WalletInitScreen.style'

const messages = defineMessages({
  byEmurgo: {
    id: 'components.walletinit.walletdescription.byEmurgo',
    defaultMessage: '!!!By',
    description: 'some desc',
  },
})

type Props = {
  intl: any,
}

const WalletDescription = ({intl}: Props) => (
  <View style={styles.description}>
    <YoroiWalletIcon color={COLORS.WHITE} width={208} height={60} />
    <View style={styles.emurgoCreditsContainer}>
      <Text light>{intl.formatMessage(messages.byEmurgo)}</Text>
      <EmurgoIcon color={COLORS.WHITE} width={100} height={37} />
    </View>
  </View>
)

export default injectIntl(WalletDescription)
