import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'

import {useFocusEffect, useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {Linking, Platform, TouchableOpacity, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {BulletPointItem} from '~/ui/BulletPointItem'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {StepperProgress} from '~/ui/StepperProgress/StepperProgress'
import {Text} from '~/ui/Text/Text'

import {LedgerCheckIllustration} from '../../illustrations/LedgerCheckIllustration'

export const CheckNanoXScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {track} = useMetrics()

  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const handleOnContinue = () =>
    navigation.navigate('setup-wallet-connect-nano-x')
  const {useUSB} = useSetupWallet()

  useFocusEffect(
    React.useCallback(() => {
      track.connectWalletCheckPageViewed()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  )

  const commonRequirements = [
    strings.ledgerMessages.appInstalled,
    strings.ledgerMessages.appOpened,
  ]
  const usbRequirements = [
    strings.ledgerMessages.haveOTGAdapter,
    strings.ledgerMessages.usbAlwaysConnected,
    ...commonRequirements,
  ]
  const bleRequirements = [
    strings.ledgerMessages.bluetoothEnabled,
    ...(Platform.OS === 'android'
      ? [strings.ledgerMessages.locationEnabled]
      : []),
    ...commonRequirements,
  ]

  return (
    <SafeArea>
      <StepperProgress
        style={[a.px_lg]}
        currentStepTitle={strings.setupWallet.hwIntroTitle}
        currentStep={1}
        totalSteps={3}
      />

      <ScrollView
        style={[a.flex_1]}
        contentContainerStyle={[a.px_lg, a.gap_lg]}
        bounces={false}
      >
        <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
          {strings.setupWallet.hwCheckIntroline}
        </Text>

        <View>
          {(useUSB ? usbRequirements : bleRequirements).map((item) => (
            <BulletPointItem
              key={item}
              style={[a.body_1_lg_regular, ta.text_gray_medium]}
              textRow={item}
            />
          ))}
        </View>

        <Illustration />

        <LedgerSupportLink />
      </ScrollView>

      <SafeArea.Footer>
        <Button
          onPress={handleOnContinue}
          title={strings.setupWallet.continueButton}
          testID="continueButton"
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}

const ledgerSupport =
  'https://help.yoroi-wallet.com/en/article/how-to-connect-a-ledger-hardware-wallet-to-yoroi-1ghfwpw/'

const LedgerSupportLink = () => {
  const handleOnPress = () => Linking.openURL(ledgerSupport)
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity
      style={[a.flex_row, a.justify_center, a.align_center]}
      onPress={handleOnPress}
    >
      <Text style={[{color: p.primary_500}]}>
        {strings.setupWallet.ledgerSupportLink}
      </Text>
    </TouchableOpacity>
  )
}

const Illustration = () => {
  return (
    <View style={[a.flex_1, a.align_center]}>
      <LedgerCheckIllustration />
    </View>
  )
}
