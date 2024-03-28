import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {WalletInitRouteNavigation} from '../../../../navigation'
import {isEmptyString} from '../../../../utils'
import {MnemonicInput} from '../../common/MnemonicInput'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
import {useStrings} from '../../common/useStrings'

export const RestoreWalletScreen = () => {
  const {styles} = useStyles()
  const bold = useBold()
  const [phrase, setPhrase] = React.useState('')
  const navigation = useNavigation<WalletInitRouteNavigation>()

  const strings = useStrings()

  const mnemonicLength = 15

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <StepperProgress currentStep={1} currentStepTitle={strings.stepRestoreWalletScreen} totalSteps={2} />

      <ScrollView bounces={false} automaticallyAdjustKeyboardInsets>
        <View>
          <Text style={styles.title}>{strings.restoreWalletScreenTitle(bold)}</Text>

          <Space height="xl" />
        </View>

        <MnemonicInput length={mnemonicLength} onDone={setPhrase} />
      </ScrollView>

      <View>
        <Button
          title={strings.next}
          style={styles.button}
          disabled={isEmptyString(phrase)}
          onPress={() =>
            navigation.navigate('restore-wallet-details', {
              networkId: 1,
              walletImplementationId: 'haskell-shelley',
            })
          }
        />

        <Space height="s" />
      </View>
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
      ...theme.padding['x-l'],
      justifyContent: 'space-between',
      backgroundColor: theme.color['white-static'],
    },
    title: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray[900],
    },
    button: {backgroundColor: theme.color.primary[500]},
    bolder: {
      ...theme.typography['body-1-l-medium'],
    },
  })

  const colors = {
    gray900: theme.color.gray[900],
    gradientBlueGreen: theme.color.gradients['blue-green'],
  }

  return {styles, colors} as const
}
