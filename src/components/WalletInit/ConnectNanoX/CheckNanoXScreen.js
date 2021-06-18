// @flow

import React from 'react'
import {View, SafeAreaView, ScrollView, Image, Platform} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'
import {compose} from 'redux'
import {withHandlers} from 'recompose'

import {Text, Button, Link, BulletPointItem, ProgressStep} from '../../UiKit'
import {withNavigationTitle} from '../../../utils/renderUtils'
import {
  confirmationMessages,
  ledgerMessages,
} from '../../../../src/i18n/global-messages'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'

import styles from './styles/CheckNanoXScreen.style'
import image from '../../../assets/img/ledger_1.png'

import type {ComponentType} from 'react'
import type {IntlShape} from 'react-intl'
import type {Navigation} from '../../../types/navigation'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.connectnanox.checknanoxscreen.title',
    defaultMessage: '!!!Connect to Ledger Device',
  },
  introline: {
    id: 'components.walletinit.connectnanox.checknanoxscreen.introline',
    defaultMessage: '!!!Before continuing, please make sure that:',
  },
  learnMore: {
    id: 'components.walletinit.connectnanox.checknanoxscreen.learnMore',
    defaultMessage: '!!!Learn more about using Yoroi with Ledger',
  },
})

// TODO
const url = '' // 'https://yoroi-wallet.com/...'

const CheckNanoXScreen = ({
  intl,
  onPress,
  route,
}: {
  intl: IntlShape,
  onPress: any,
  route: any,
}) => {
  const {networkId, walletImplementationId, useUSB} = route.params
  const requirements: Array<string> = []
  if (useUSB) {
    requirements.push(intl.formatMessage(ledgerMessages.haveOTGAdapter))
    requirements.push(intl.formatMessage(ledgerMessages.usbAlwaysConnected))
  } else {
    requirements.push(intl.formatMessage(ledgerMessages.bluetoothEnabled))
    if (Platform.OS === 'android') {
      requirements.push(intl.formatMessage(ledgerMessages.locationEnabled))
    }
  }
  requirements.push(
    intl.formatMessage(ledgerMessages.appInstalled),
    intl.formatMessage(ledgerMessages.appOpened),
  )

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ProgressStep currentStep={1} totalSteps={3} displayStepNumber />
      <View style={styles.container}>
        <View style={styles.heading}>
          <Image source={image} />
        </View>
        <Text style={styles.item}>
          {intl.formatMessage(messages.introline)}
        </Text>
        <ScrollView style={styles.scrollView}>
          {requirements.map((row, i) => (
            <BulletPointItem textRow={row} key={i} style={styles.item} />
          ))}
        </ScrollView>
        {url !== '' && (
          <View style={styles.linkContainer}>
            <Link url={url} text={intl.formatMessage(messages.learnMore)} />
          </View>
        )}
      </View>
      <Button
        onPress={(event) =>
          onPress(event, networkId, walletImplementationId, useUSB)
        }
        title={intl.formatMessage(
          confirmationMessages.commonButtons.continueButton,
        )}
        style={styles.button}
      />
    </SafeAreaView>
  )
}

type ExternalProps = {|
  navigation: Navigation,
  route: Object, // TODO(navigation): type
  intl: IntlShape,
|}

export default injectIntl(
  (compose(
    withNavigationTitle(({intl}: {intl: IntlShape}) =>
      intl.formatMessage(messages.title),
    ),
    withHandlers({
      onPress:
        ({navigation}) =>
        (event, networkId, walletImplementationId, useUSB) =>
          navigation.navigate(WALLET_INIT_ROUTES.CONNECT_NANO_X, {
            networkId,
            walletImplementationId,
            useUSB,
          }),
    }),
  )(CheckNanoXScreen): ComponentType<ExternalProps>),
)
