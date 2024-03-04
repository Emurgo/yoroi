import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer, StatusBar} from '../../../../components'
import {CardAboutPhrase} from '../../common/CardAboutPhrase/CardAboutPhrase'
import {LearnMoreButton} from '../../common/LearnMoreButton/LearnMoreButton'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
// import {useStrings} from '../common/useStrings'

export const AboutRecoveryPhrase = () => {
  const {styles} = useStyles()
  //   const strings = useStrings()

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <StatusBar type="light" />

      <View style={styles.content}>
        <StepperProgress currentStep={1} currentStepTitle="Verify recovery phrase" totalSteps={4} displayStepNumber />

        <Text style={styles.title}>Read this information carefully before saving your recovery phrase: </Text>

        <CardAboutPhrase
          background
          items={[
            'Recovery phrase is a unique combination of words',
            'Recovery phrase is the only way to access your wallet',
            'If you lose your Recovery phrase, it will not be possible to recover your wallet',
            'You are the only person who knows and stores your Recovery phrase',
            'Yoroi NEVER asks for your Recovery phrase. Watch out for scammers and impersonators',
          ]}
        />

        <LearnMoreButton
          onPress={() => {
            ;('')
          }}
        />
      </View>

      <View>
        <Button title="next" style={styles.button} />

        <Spacer height={7} />
      </View>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      justifyContent: 'space-between',
    },
    title: {
      fontFamily: 'Rubik',
      fontWeight: '500',
      fontSize: 16,
      lineHeight: 24,
      color: theme.color.gray[900],
    },
    content: {
      gap: 16,
    },
    button: {backgroundColor: theme.color.primary[500]},
  })

  const colors = {
    gray900: theme.color.gray[900],
  }

  return {styles, colors} as const
}
