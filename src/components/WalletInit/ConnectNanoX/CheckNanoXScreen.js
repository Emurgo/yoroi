// @flow

import React from 'react'
import {View, SafeAreaView, Image} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'
import {compose} from 'redux'
import {withHandlers} from 'recompose'

import {Text, Button, Link, BulletPointItem} from '../../UiKit'
import {withNavigationTitle} from '../../../utils/renderUtils'
import {confirmationMessages} from '../../../../src/i18n/global-messages'

import styles from './styles/CheckNanoXScreen.style'
import image from '../../../assets/img/ledger_1.png'

import type {ComponentType} from 'react'
import type {IntlShape} from 'react-intl'
import type {Navigation} from '../../../types/navigation'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.connectnanox.checknanoxscreen.title',
    defaultMessage: '!!!Create Wallet with Ledger',
  },
  introline: {
    id: 'components.walletinit.connectnanox.checknanoxscreen.introline',
    defaultMessage: '!!!Before continuing, please make sure that:',
  },
  line1: {
    id: 'components.walletinit.connectnanox.checknanoxscreen.line1',
    defaultMessage: '!!!Bluetooth is enabled on your smartphone.',
  },
  line2: {
    id: 'components.walletinit.connectnanox.checknanoxscreen.line2',
    defaultMessage:
      '!!!Cardano ADA app is installed on your Ledger Nano X device.',
  },
  line3: {
    id: 'components.walletinit.connectnanox.checknanoxscreen.line3',
    defaultMessage: '!!!Your smartphone is connected to the Internet.',
  },
  learnMore: {
    id: 'components.walletinit.connectnanox.checknanoxscreen.learnMore',
    defaultMessage: '!!!Learn more about using Yoroi with Ledger',
  },
})

// TODO
const url = 'https://yoroi-wallet.com/'

const CheckNanoXScreen = ({intl, onPress, navigation}) => {
  const rows = [
    intl.formatMessage(messages.line1),
    intl.formatMessage(messages.line2),
    intl.formatMessage(messages.line3),
  ]
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.heading}>
            <Image source={image} />
          </View>
          <View style={styles.paragraph}>
            <Text>{intl.formatMessage(messages.introline)}</Text>
            {rows.map((row, i) => (
              <BulletPointItem textRow={row} key={i} style={styles.item} />
            ))}
          </View>
        </View>
        <View style={styles.linkContainer}>
          <Link url={url} text={intl.formatMessage(messages.learnMore)} />
        </View>
      </View>
      <View style={styles.buttons}>
        <Button
          block
          onPress={onPress}
          title={intl.formatMessage(
            confirmationMessages.commonButtons.continueButton,
          )}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  )
}

type ExternalProps = {|
  navigation: Navigation,
  intl: IntlShape,
|}

export default injectIntl(
  (compose(
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withHandlers({
      // TODO
      onPress: ({navigation}) => () => navigation.navigate(),
    }),
  )(CheckNanoXScreen): ComponentType<ExternalProps>),
)
