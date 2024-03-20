import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components'
import {useStatusBar} from '../../../../components/hooks/useStatusBar'
import {Space} from '../../../../components/Space/Space'
import {WalletInitRouteNavigation} from '../../../../navigation'
import {CardAboutPhrase} from '../../common/CardAboutPhrase/CardAboutPhrase'
import {LearnMoreButton} from '../../common/LearnMoreButton/LearnMoreButton'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
import {useStrings} from '../../common/useStrings'

export const AboutRecoveryPhraseScreen = () => {
  useStatusBar()
  const {styles} = useStyles()
  const strings = useStrings()
  const navigation = useNavigation<WalletInitRouteNavigation>()
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <View>
        <StepperProgress currentStep={1} currentStepTitle={strings.stepAboutRecoveryPhrase} totalSteps={4} />

        <Space height="l" />

        <Text style={styles.aboutRecoveryPhraseTitle}>{strings.aboutRecoveryPhraseTitle}</Text>

        <Space height="l" />

        <CardAboutPhrase
          showBackgroundColor
          includeSpacing
          linesOfText={[
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

      <Button
        title={strings.next}
        style={styles.button}
        onPress={() =>
          navigation.navigate('mnemonic-show', {
            mnemonic: '',
            name: '',
            networkId: 1,
            password: '',
            walletImplementationId: 'haskell-byron',
          })
        }
      />
    </SafeAreaView>
  )
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
    aboutRecoveryPhraseTitle: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray[900],
    },
    button: {backgroundColor: theme.color.primary[500]},
  })

  return {styles} as const
}
