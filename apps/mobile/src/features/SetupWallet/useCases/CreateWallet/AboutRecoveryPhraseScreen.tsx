import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, ScrollView, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {ViewProps} from 'react-native-svg/lib/typescript/fabric/utils'

import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {SetupWalletRouteNavigation} from '../../../../kernel/navigation'
import {Button} from '../../../../ui/Button/Button'
import {CardAboutPhrase} from '../../../../ui/CardAboutPhrase/CardAboutPhrase'
import {LearnMoreButton} from '../../../../ui/LearnMoreButton/LearnMoreButton'
import {Space, Spacer} from '../../../../ui/Space/Space'
import {StepperProgress} from '../../../../ui/StepperProgress/StepperProgress'
import {YoroiZendeskLink} from '../../common/constants'
import {useStrings} from '../../common/useStrings'

export const AboutRecoveryPhraseScreen = () => {
  const bold = useBold()
  const strings = useStrings()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const {track} = useMetrics()
  const {color} = useTheme()

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
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[
        styles.root,
        a.flex_1,
        a.pb_lg,
        {backgroundColor: color.bg_color_max},
      ]}
    >
      <ScrollView
        bounces={false}
        contentContainerStyle={[styles.scroll, a.px_lg]}
      >
        <StepperProgress
          currentStep={1}
          currentStepTitle={strings.stepAboutRecoveryPhrase}
          totalSteps={4}
        />

        <Space height="lg" />

        <Text
          style={[
            styles.aboutRecoveryPhraseTitle,
            {color: color.text_gray_medium},
            a.body_1_lg_regular,
          ]}
        >
          {strings.aboutRecoveryPhraseTitle(bold)}
        </Text>

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

      <Actions
        style={[styles.actions, styles.padding, a.pt_lg, a.gap_lg, a.px_lg]}
      >
        <LearnMoreButton onPress={handleOnLearMoreButtonPress} />

        <Button
          title={strings.next}
          onPress={() =>
            navigation.navigate('setup-wallet-recovery-phrase-mnemonic')
          }
          testID="setup-step1-next-button"
        />
      </Actions>
    </SafeAreaView>
  )
}

const Actions = ({style, ...props}: ViewProps) => (
  <View style={style} {...props} />
)

const useBold = () => {
  const {atoms} = useTheme()

  return {
    b: (text: React.ReactNode) => (
      <Text style={atoms.body_1_lg_medium}>{text}</Text>
    ),
  }
}

const styles = StyleSheet.create({
  root: {},
  padding: {},
  aboutRecoveryPhraseTitle: {},
  bolder: {},
  actions: {},
  scroll: {},
})
