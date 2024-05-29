import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, ScrollView, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {ViewProps} from 'react-native-svg/lib/typescript/fabric/utils'

import {Button, Spacer} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {SetupWalletRouteNavigation} from '../../../../kernel/navigation'
import {CardAboutPhrase} from '../../common/CardAboutPhrase/CardAboutPhrase'
import {YoroiZendeskLink} from '../../common/constants'
import {LearnMoreButton} from '../../common/LearnMoreButton/LearnMoreButton'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
import {useStrings} from '../../common/useStrings'

export const AboutRecoveryPhraseScreen = () => {
  const bold = useBold()
  const {styles} = useStyles()
  const strings = useStrings()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.createWalletLearnPhraseStepViewed()
    }, [track]),
  )

  const handleOnLearMoreButtonPress = () => {
    track.createWalletTermsPageViewed()
    Linking.openURL(YoroiZendeskLink)
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <ScrollView bounces={false} contentContainerStyle={styles.scroll}>
        <StepperProgress currentStep={1} currentStepTitle={strings.stepAboutRecoveryPhrase} totalSteps={4} />

        <Space height="lg" />

        <Text style={styles.aboutRecoveryPhraseTitle}>{strings.aboutRecoveryPhraseTitle(bold)}</Text>

        <Space height="lg" />

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
      </ScrollView>

      <Spacer fill />

      <LearnMoreButton onPress={handleOnLearMoreButtonPress} />

      <Space height="lg" />

      <Actions style={styles.actions}>
        <Button
          title={strings.next}
          style={styles.button}
          onPress={() => navigation.navigate('setup-wallet-recovery-phrase-mnemonic')}
        />
      </Actions>
    </SafeAreaView>
  )
}

const Actions = ({style, ...props}: ViewProps) => <View style={style} {...props} />

const useBold = () => {
  const {styles} = useStyles()

  return {
    b: (text: React.ReactNode) => <Text style={styles.bolder}>{text}</Text>,
  }
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      ...atoms.px_lg,
      justifyContent: 'space-between',
      backgroundColor: color.white_static,
    },
    aboutRecoveryPhraseTitle: {
      ...atoms.body_1_lg_regular,
      color: color.gray_c900,
    },
    button: {backgroundColor: color.primary_c500},
    bolder: {
      ...atoms.body_1_lg_medium,
    },
    actions: {
      ...atoms.p_lg,
    },
    scroll: {
      ...atoms.px_lg,
    },
  })

  return {styles} as const
}
