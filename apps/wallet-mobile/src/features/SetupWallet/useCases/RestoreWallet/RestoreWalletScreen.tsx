import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, KeyboardAvoidingView} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {useMetrics} from '../../../../metrics/metricsManager'
import {WalletInitRouteNavigation} from '../../../../navigation'
import {isEmptyString} from '../../../../utils'
import {makeKeys} from '../../../../yoroi-wallets/cardano/shelley/makeKeys'
import {MnemonicInput} from '../../common/MnemonicInput'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
import {useStrings} from '../../common/useStrings'

export const RestoreWalletScreen = () => {
  const {styles} = useStyles()
  const bold = useBold()
  const [mnemonic, setMnemonic] = React.useState('')
  const navigation = useNavigation<WalletInitRouteNavigation>()
  const {publicKeyHexChanged, mnemonicChanged, mnemonicType} = useSetupWallet()
  const {track} = useMetrics()

  const strings = useStrings()

  if (mnemonicType === null) throw new Error('mnemonicType missing')

  useFocusEffect(
    React.useCallback(() => {
      const recoveryPhraseLenght = String(mnemonicType) as '15' | '24'
      track.restoreWalletEnterPhraseStepViewed({recovery_phrase_lenght: recoveryPhraseLenght})
    }, [mnemonicType, track]),
  )

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <KeyboardAvoidingView style={{flex: 1}}>
        <View style={styles.padding}>
          <StepperProgress currentStep={1} currentStepTitle={strings.stepRestoreWalletScreen} totalSteps={2} />
        </View>

        <ScrollView style={styles.padding} bounces={false}>
          <View>
            <Text style={styles.title}>{strings.restoreWalletScreenTitle(bold)}</Text>

            <Space height="xl" />
          </View>

          <MnemonicInput length={mnemonicType} onDone={setMnemonic} />
        </ScrollView>

        <View style={styles.padding}>
          <Button
            title={strings.next}
            style={styles.button}
            disabled={isEmptyString(mnemonic)}
            onPress={async () => {
              const {accountPubKeyHex} = await makeKeys({mnemonic})
              mnemonicChanged(mnemonic)
              publicKeyHexChanged(accountPubKeyHex)
              navigation.navigate('setup-wallet-restore-details')
            }}
          />

          <Space height="s" />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const useBold = () => {
  const {styles} = useStyles()

  return {
    b: (text: React.ReactNode) => <Text style={styles.bolder}>{text}</Text>,
  }
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: theme.color.white_static,
    },
    title: {
      ...theme.atoms.body_1_lg_regular,
      color: theme.color.gray_c900,
    },
    button: {backgroundColor: theme.color.primary_c500},
    bolder: {
      ...(theme.atoms.body - 1 - lg - medium),
    },
    padding: {
      ...theme.atoms.p_lg,
    },
  })

  const colors = {
    gray900: theme.color.gray_c900,
    gradientBlueGreen: theme.color.gradients['blue-green'],
  }

  return {styles, colors} as const
}
