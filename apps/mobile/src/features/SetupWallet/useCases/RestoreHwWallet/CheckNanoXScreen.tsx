import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {
  Linking,
  Platform,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useMetrics} from '~/kernel/metrics/metricsManager'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {BulletPointItem} from '~/ui/BulletPointItem'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {StepperProgress} from '~/ui/StepperProgress/StepperProgress'
import {Text} from '~/ui/Text/Text'
import {useStrings} from '~/kernel/i18n/useStrings'
import {LedgerCheckIllustration} from '../../illustrations/LedgerCheckIllustration'

export const CheckNanoXScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {track} = useMetrics()

  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const onContinue = () => navigation.navigate('setup-wallet-connect-nano-x')
  const {useUSB} = useSetupWallet()

  useFocusEffect(
    React.useCallback(() => {
      track.connectWalletCheckPageViewed()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  )

  const commonRequirements = [strings.setupWallet.appInstalled, strings.setupWallet.appOpened]
  const usbRequirements = [
    strings.setupWallet.haveOTGAdapter,
    strings.setupWallet.usbAlwaysConnected,
    ...commonRequirements,
  ]
  const bleRequirements = [
    strings.setupWallet.bluetoothEnabled,
    ...(Platform.OS === 'android' ? [strings.setupWallet.locationEnabled] : []),
    ...commonRequirements,
  ]

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[{flex: 1, backgroundColor: p.bg_color_max}]}
    >
      <StepperProgress
        style={[{paddingHorizontal: 16}]}
        currentStepTitle="Intro"
        currentStep={1}
        totalSteps={3}
      />

      <ScrollView style={[{paddingHorizontal: 16}]} bounces={false}>
        <Space.Height.lg />

        <Text
          style={[
            {
              fontSize: 16,
              lineHeight: 24,
              fontWeight: '500',
              color: p.text_gray_medium,
            },
          ]}
        >
          {strings.setupWallet.hwCheckIntroline}
        </Text>

        <Space.Height.lg />

        {(useUSB ? usbRequirements : bleRequirements).map((item) => (
          <BulletPointItem
            key={item}
            style={[
              {
                fontSize: 16,
                lineHeight: 24,
                fontWeight: '400',
                color: p.text_gray_medium,
              },
            ]}
            textRow={item}
          />
        ))}

        <Space.Height.lg />

        <Illustration />

        <LedgerSupportLink />
      </ScrollView>

      <Actions>
        <Button
          onPress={onContinue}
          title={strings.setupWallet.continueButton}
          testID="continueButton"
        />
      </Actions>
    </SafeAreaView>
  )
}

const ledgerSupport =
  'https://emurgohelpdesk.zendesk.com/hc/en-us/sections/4413677248399-Hardware-Wallet-Ledger-Trezor'

const LedgerSupportLink = () => {
  const onPress = () => Linking.openURL(ledgerSupport)
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity
      style={[
        {
          fontSize: 16,
          lineHeight: 24,
          fontWeight: '400',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}
      onPress={onPress}
    >
      <Text style={[{color: p.primary_500}]}>{strings.setupWallet.ledgerSupportLink}</Text>
    </TouchableOpacity>
  )
}

const Illustration = () => {
  return (
    <View style={[{flex: 1, alignItems: 'center'}]}>
      <LedgerCheckIllustration />
    </View>
  )
}

const Actions = (props: ViewProps) => {
  return <View {...props} style={[{padding: 16}]} />
}
