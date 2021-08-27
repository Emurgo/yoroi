// @flow

import React from 'react'
import {View, ScrollView, Image, Platform, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {injectIntl, defineMessages} from 'react-intl'

import {Text, Button, BulletPointItem, ProgressStep, Spacer} from '../../UiKit'
import {confirmationMessages, ledgerMessages} from '../../../../src/i18n/global-messages'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'

import image from '../../../assets/img/ledger_1.png'

import type {IntlShape} from 'react-intl'
import {useNavigation} from '@react-navigation/core'
import {useRoute} from '@react-navigation/native'

import type {NetworkId, WalletImplementationId} from '../../../config/types'

const messages = defineMessages({
  introline: {
    id: 'components.walletinit.connectnanox.checknanoxscreen.introline',
    defaultMessage: '!!!Before continuing, please make sure that:',
  },
})

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    alignSelf: 'center',
  },
  introline: {
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  item: {
    fontSize: 14,
    lineHeight: 22,
  },
  actions: {
    padding: 16,
  },
})

export type Params = {
  networkId: NetworkId,
  walletImplementationId: WalletImplementationId,
  useUSB: boolean,
}

const CheckNanoXScreen = ({intl}: {intl: IntlShape}) => {
  const route = useRoute()
  const {networkId, walletImplementationId, useUSB} = ((route.params: any): Params)

  const navigation = useNavigation()
  const onContinue = () =>
    navigation.navigate(WALLET_INIT_ROUTES.CONNECT_NANO_X, {networkId, walletImplementationId, useUSB})

  const commonRequirements = [
    intl.formatMessage(ledgerMessages.appInstalled),
    intl.formatMessage(ledgerMessages.appOpened),
  ]
  const usbRequirements = [
    intl.formatMessage(ledgerMessages.haveOTGAdapter),
    intl.formatMessage(ledgerMessages.usbAlwaysConnected),
    ...commonRequirements,
  ]
  const bleRequirements = [
    intl.formatMessage(ledgerMessages.bluetoothEnabled),
    ...(Platform.OS === 'android' ? [intl.formatMessage(ledgerMessages.locationEnabled)] : []),
    ...commonRequirements,
  ]

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ProgressStep currentStep={1} totalSteps={3} displayStepNumber />

      <Spacer height={32} />

      <Image style={styles.image} source={image} />

      <View style={styles.introline}>
        <Text style={styles.item}>{intl.formatMessage(messages.introline)}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Spacer height={16} />
        {(useUSB ? usbRequirements : bleRequirements).map((item, index) => (
          <>
            <BulletPointItem key={item} style={styles.item} textRow={item} />
            {index !== usbRequirements.length - 1 && <Spacer height={16} />}
          </>
        ))}
      </ScrollView>

      <Actions>
        <Button onPress={onContinue} title={intl.formatMessage(confirmationMessages.commonButtons.continueButton)} />
      </Actions>
    </SafeAreaView>
  )
}

export default injectIntl(CheckNanoXScreen)

const Actions = (props) => <View {...props} style={styles.actions} />
