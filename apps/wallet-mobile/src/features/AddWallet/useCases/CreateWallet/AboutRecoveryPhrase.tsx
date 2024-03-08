import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer, StatusBar} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {CardAboutPhrase} from '../../common/CardAboutPhrase/CardAboutPhrase'
import {LearnMoreButton} from '../../common/LearnMoreButton/LearnMoreButton'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
import {useStrings} from '../../common/useStrings'

export const AboutRecoveryPhrase = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const navigation = useNavigation()
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <StatusBar type="light" />

      <View>
        <StepperProgress
          currentStep={1}
          currentStepTitle={strings.aboutRecoveryPhraseStepper}
          totalSteps={4}
          displayStepNumber
        />

        <Space height="l" />

        <Text style={styles.title}>{strings.aboutRecoveryPhraseTitle}</Text>

        <Space height="l" />

        <CardAboutPhrase
          background
          padding
          items={[
            strings.aboutRecoveryPhraseCardFirstItem,
            strings.aboutRecoveryPhraseCardSecondItem,
            strings.aboutRecoveryPhraseCardThirdItem,
            strings.aboutRecoveryPhraseCardFourthItem,
            strings.aboutRecoveryPhraseCardFifthItem,
          ]}
        />

        <Space height="l" />

        <LearnMoreButton
          onPress={() => {
            ;('')
          }}
        />
      </View>

      <View>
        <Button
          title="next"
          style={styles.button}
          onPress={() =>
            navigation.navigate('new-wallet', {
              screen: 'save-recovery-phrase',
            })
          }
        />

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

  return {styles} as const
}
