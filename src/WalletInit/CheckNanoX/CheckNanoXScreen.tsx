import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, Platform, ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import image from '../../assets/img/ledger_1.png'
import {BulletPointItem, Button, ProgressStep, Spacer, Text} from '../../components'
import {confirmationMessages, ledgerMessages} from '../../i18n/global-messages'
import {WalletInitRouteNavigation, WalletInitRoutes} from '../../navigation'

export const CheckNanoXScreen = () => {
  const strings = useStrings()
  const route = useRoute<RouteProp<WalletInitRoutes, 'connect-nano-x'>>()
  const {networkId, walletImplementationId, useUSB} = route.params

  const navigation = useNavigation<WalletInitRouteNavigation>()
  const onContinue = () => navigation.navigate('connect-nano-x', {networkId, walletImplementationId, useUSB})

  const commonRequirements = [strings.appInstalled, strings.appOpened]
  const usbRequirements = [strings.haveOTGAdapter, strings.usbAlwaysConnected, ...commonRequirements]
  const bleRequirements = [
    strings.bluetoothEnabled,
    ...(Platform.OS === 'android' ? [strings.locationEnabled] : []),
    ...commonRequirements,
  ]

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ProgressStep currentStep={1} totalSteps={3} displayStepNumber />

      <Spacer height={32} />

      <Image style={styles.image} source={image} />

      <View style={styles.introline}>
        <Text style={styles.item}>{strings.introline}</Text>
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
        <Button onPress={onContinue} title={strings.continueButton} />
      </Actions>
    </SafeAreaView>
  )
}

const Actions = (props) => <View {...props} style={styles.actions} />

const messages = defineMessages({
  introline: {
    id: 'components.walletinit.connectnanox.checknanoxscreen.introline',
    defaultMessage: '!!!Before continuing, please make sure that:',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    introline: intl.formatMessage(messages.introline),
    appInstalled: intl.formatMessage(ledgerMessages.appInstalled),
    appOpened: intl.formatMessage(ledgerMessages.appOpened),
    haveOTGAdapter: intl.formatMessage(ledgerMessages.haveOTGAdapter),
    usbAlwaysConnected: intl.formatMessage(ledgerMessages.usbAlwaysConnected),
    bluetoothEnabled: intl.formatMessage(ledgerMessages.bluetoothEnabled),
    locationEnabled: intl.formatMessage(ledgerMessages.locationEnabled),
    continueButton: intl.formatMessage(confirmationMessages.commonButtons.continueButton),
  }
}

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
