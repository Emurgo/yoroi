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

import {useStrings} from '~/features/common/useStrings'
import {LedgerCheckIllustration} from '~/illustrations/LedgerCheckIllustration'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {SetupWalletRouteNavigation} from '~/kernel/navigation'
import {BulletPointItem} from '~/ui/BulletPointItem/BulletPointItem'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {StepperProgress} from '~/ui/StepperProgress/StepperProgress'
import {Text} from '~/ui/Text/Text'

export const CheckNanoXScreen = () => {
  const strings = useStrings()
  const styles = useStyles()
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

  const commonRequirements = [strings.appInstalled, strings.appOpened]
  const usbRequirements = [
    strings.haveOTGAdapter,
    strings.usbAlwaysConnected,
    ...commonRequirements,
  ]
  const bleRequirements = [
    strings.bluetoothEnabled,
    ...(Platform.OS === 'android' ? [strings.locationEnabled] : []),
    ...commonRequirements,
  ]

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={styles.safeAreaView}
    >
      <StepperProgress
        style={styles.stepper}
        currentStepTitle="Intro"
        currentStep={1}
        totalSteps={3}
      />

      <ScrollView style={styles.scroll} bounces={false}>
        <Space.Height.lg />

        <Text style={styles.introline}>{strings.hwCheckIntroline}</Text>

        <Space.Height.lg />

        {(useUSB ? usbRequirements : bleRequirements).map((item) => (
          <BulletPointItem key={item} style={styles.item} textRow={item} />
        ))}

        <Space.Height.lg />

        <Illustration />

        <LedgerSupportLink />
      </ScrollView>

      <Actions>
        <Button
          onPress={onContinue}
          title={strings.continueButton}
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
  const {palette: p} = useTheme()
  const styles = {
    safeAreaView: {
      flex: 1,
      backgroundColor: p.bg_color_max,
    },
    introline: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '500' as const,
      color: p.text_gray_medium,
    },
    scroll: {
      paddingHorizontal: 16,
    },
    linkText: {
      color: p.primary_500,
    },
    link: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    illustration: {
      flex: 1,
      alignItems: 'center' as const,
    },
    item: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
      color: p.text_gray_medium,
    },
    actions: {
      padding: 16,
    },
    stepper: {
      paddingHorizontal: 16,
    },
  }

  return styles
}
