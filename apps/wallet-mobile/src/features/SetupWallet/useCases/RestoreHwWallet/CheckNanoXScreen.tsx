import {useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Linking, Platform, StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {BulletPointItem} from '../../../../components/BulletPointItem'
import {Button} from '../../../../components/Button/Button'
import {Space} from '../../../../components/Space/Space'
import {StepperProgress} from '../../../../components/StepperProgress/StepperProgress'
import {Text} from '../../../../components/Text'
import {SetupWalletRouteNavigation} from '../../../../kernel/navigation'
import {useStrings} from '../../common/useStrings'
import {LedgerCheckIllustration} from '../../illustrations/LedgerCheckIllustration'

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

        <Text style={styles.introline}>{strings.hwCheckIntroline}</Text>

        <Space height="lg" />

        {(useUSB ? usbRequirements : bleRequirements).map((item) => (
          <BulletPointItem key={item} style={styles.item} textRow={item} />
        ))}

        <Space height="lg" />

        <Illustration />

        <LedgerSupportLink />
      </ScrollView>

      <Actions>
        <Button onPress={onContinue} title={strings.continueButton} testID="continueButton" />
      </Actions>
    </SafeAreaView>
  )
}

const ledgerSupport = 'https://emurgohelpdesk.zendesk.com/hc/en-us/sections/4413677248399-Hardware-Wallet-Ledger-Trezor'

const LedgerSupportLink = () => {
  const onPress = () => Linking.openURL(ledgerSupport)
  const strings = useStrings()
  const styles = useStyles()

  return (
    <TouchableOpacity style={styles.link} onPress={onPress}>
      <Text style={styles.linkText}>{strings.ledgerSupportLink}</Text>
    </TouchableOpacity>
  )
}

const Illustration = () => {
  const styles = useStyles()
  return (
    <View style={styles.illustration}>
      <LedgerCheckIllustration />
    </View>
  )
}

const Actions = (props: ViewProps) => {
  const styles = useStyles()
  return <View {...props} style={styles.actions} />
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      ...atoms.flex_1,
      backgroundColor: color.bg_color_max,
    },
    introline: {
      ...atoms.body_1_lg_medium,
      color: color.text_gray_medium,
    },
    scroll: {
      ...atoms.px_lg,
    },
    linkText: {
      color: color.primary_500,
    },
    link: {
      ...atoms.link_1_lg,
      ...atoms.flex_row,
      ...atoms.justify_center,
      ...atoms.align_center,
    },
    illustration: {
      ...atoms.flex_1,
      ...atoms.align_center,
    },
    item: {
      ...atoms.body_1_lg_regular,
      color: color.text_gray_medium,
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
