import {useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Platform, StyleSheet, View, ViewProps} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {BulletPointItem, Button, Text} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {StepperProgress} from '../../../../components/StepperProgress/StepperProgress'
import {confirmationMessages, ledgerMessages} from '../../../../kernel/i18n/global-messages'
import {SetupWalletRouteNavigation} from '../../../../kernel/navigation'
import {LedgerCHeckIllustration} from '../../illustrations/LedgerCheckIllustration'

export const CheckNanoXScreen = () => {
  const strings = useStrings()
  const styles = useStyles()

  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const onContinue = () => navigation.navigate('setup-wallet-connect-nano-x')
  const {useUSB} = useSetupWallet()

  const commonRequirements = [strings.appInstalled, strings.appOpened]
  const usbRequirements = [strings.haveOTGAdapter, strings.usbAlwaysConnected, ...commonRequirements]
  const bleRequirements = [
    strings.bluetoothEnabled,
    ...(Platform.OS === 'android' ? [strings.locationEnabled] : []),
    ...commonRequirements,
  ]

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <StepperProgress style={styles.stepper} currentStepTitle="Intro" currentStep={1} totalSteps={3} />

      <ScrollView style={styles.scroll} bounces={false}>
        <Space height="lg" />

        <Text style={styles.introline}>{strings.introline}</Text>

        <Space height="lg" />

        {(useUSB ? usbRequirements : bleRequirements).map((item) => (
          <BulletPointItem key={item} style={styles.item} textRow={item} />
        ))}

        <Space height="lg" />

        <Illustration />
      </ScrollView>

      <Actions>
        <Button shelleyTheme onPress={onContinue} title={strings.continueButton} testID="continueButton" />
      </Actions>
    </SafeAreaView>
  )
}

const Illustration = () => {
  const styles = useStyles()
  return (
    <View style={styles.illustration}>
      <LedgerCHeckIllustration />
    </View>
  )
}

const Actions = (props: ViewProps) => {
  const styles = useStyles()
  return <View {...props} style={styles.actions} />
}

const messages = defineMessages({
  introline: {
    id: 'components.walletinit.connectnanox.checknanoxscreen.introline',
    defaultMessage: '!!!Before continuing, please make sure that:',
  },
  title: {
    id: 'components.walletinit.connectnanox.checknanoxscreen.steppertitle',
    defaultMessage: '!!!Intro',
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

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      ...atoms.flex_1,
      backgroundColor: color.bg_color_high,
    },
    introline: {
      ...atoms.body_1_lg_medium,
      color: color.text_gray_normal,
    },
    scroll: {
      ...atoms.px_lg,
    },
    illustration: {
      ...atoms.flex_1,
      ...atoms.align_center,
    },
    item: {
      ...atoms.body_1_lg_regular,
      color: color.text_gray_normal,
    },
    actions: {
      ...atoms.p_lg,
    },
    stepper: {
      ...atoms.px_lg,
    },
  })

  return styles
}
