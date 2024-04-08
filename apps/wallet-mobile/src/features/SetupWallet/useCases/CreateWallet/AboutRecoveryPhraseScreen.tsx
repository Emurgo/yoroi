import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {WalletInitRouteNavigation} from '../../../../navigation'
import {CardAboutPhrase} from '../../common/CardAboutPhrase/CardAboutPhrase'
import {YoroiZendeskLink} from '../../common/contants'
import {LearnMoreButton} from '../../common/LearnMoreButton/LearnMoreButton'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
import {useStrings} from '../../common/useStrings'

export const AboutRecoveryPhraseScreen = () => {
  const bold = useBold()
  const {styles} = useStyles()
  const strings = useStrings()
  const navigation = useNavigation<WalletInitRouteNavigation>()
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <View>
        <StepperProgress currentStep={1} currentStepTitle={strings.stepAboutRecoveryPhrase} totalSteps={4} />

        <Space height="l" />

        <Text style={styles.aboutRecoveryPhraseTitle}>{strings.aboutRecoveryPhraseTitle(bold)}</Text>

        <Space height="l" />

        <CardAboutPhrase
          showBackgroundColor
          includeSpacing
          linesOfText={[
            strings.aboutRecoveryPhraseCardFirstItem(bold),
            strings.aboutRecoveryPhraseCardSecondItem(bold),
            strings.aboutRecoveryPhraseCardThirdItem(bold),
            strings.aboutRecoveryPhraseCardFourthItem(bold),
            strings.aboutRecoveryPhraseCardFifthItem(bold),
          ]}
        />

        <Space height="l" />

        <LearnMoreButton
          onPress={() => {
            Linking.openURL(YoroiZendeskLink)
          }}
        />
      </View>

      <Button
        title={strings.next}
        style={styles.button}
        onPress={() => navigation.navigate('setup-wallet-recovery-phrase-mnemonic')}
      />
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
    aboutRecoveryPhraseTitle: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray[900],
    },
    button: {backgroundColor: theme.color.primary[500]},
    bolder: {
      ...theme.typography['body-1-l-medium'],
    },
  })

  return {styles} as const
}
