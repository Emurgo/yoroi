import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, StatusBar} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {isEmptyString} from '../../../../utils'
import {MnemonicInput} from '../../../../WalletInit/MnemonicInput'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
import {useStrings} from '../../common/useStrings'

export const RestoreWalletScreen = () => {
  const {styles} = useStyles()
  const [phrase, setPhrase] = React.useState('')
  const navigation = useNavigation()

  const strings = useStrings()

  const mnemonicLength = 15

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <StatusBar />

      <View>
        <StepperProgress currentStep={1} currentStepTitle="Enter recovery phrase" totalSteps={2} />

        <Text style={styles.title}>Add the recovery phrase you received upon your wallet creation process.</Text>

        <Space height="xl" />
      </View>

      <ScrollView bounces={false} automaticallyAdjustKeyboardInsets>
        <MnemonicInput length={mnemonicLength} onDone={setPhrase} />
      </ScrollView>

      <View>
        <Button
          title={strings.next}
          style={styles.button}
          disabled={isEmptyString(phrase)}
          onPress={() => navigation.navigate('storybook')}
        />

        <Space height="s" />
      </View>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    container: {
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
  })

  const colors = {
    gray900: theme.color.gray[900],
    gradientBlueGreen: theme.color.gradients['blue-green'],
  }

  return {styles, colors} as const
}
