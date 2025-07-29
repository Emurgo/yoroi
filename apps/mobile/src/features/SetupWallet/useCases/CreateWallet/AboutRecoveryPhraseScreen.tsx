import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, ScrollView, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {ViewProps} from 'react-native-svg/lib/typescript/fabric/utils'

import {YoroiZendeskLink} from '~/features/SetupWallet/common/constants'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Button} from '~/ui/Button/Button'
import {CardAboutPhrase} from '~/ui/CardAboutPhrase/CardAboutPhrase'
import {LearnMoreButton} from '~/ui/LearnMoreButton/LearnMoreButton'
import {Space} from '~/ui/Space/Space'
import {StepperProgress} from '~/ui/StepperProgress/StepperProgress'
import {useStrings} from '../../common/useStrings'

export const AboutRecoveryPhraseScreen = () => {
  const bold = useBold()
  const strings = useStrings()
  const navigation = useNavigation<any>()
  const {track} = useMetrics()
  const {palette: p} = useTheme()

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
      style={[a.flex_1, a.pb_lg, {backgroundColor: p.bg_color_max}]}
    >
      <ScrollView bounces={false} contentContainerStyle={[a.px_lg]}>
        <StepperProgress
          currentStep={1}
          currentStepTitle={strings.stepAboutRecoveryPhrase}
          totalSteps={4}
        />

        <Space.Height.lg />

        <Text style={[{color: p.text_gray_medium}, a.body_1_lg_regular]}>
          {strings.aboutRecoveryPhraseTitle(bold)}
        </Text>

        <Space.Height.lg />

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

      <Space.Height.lg fill />

      <Actions style={[a.pt_lg, a.gap_lg, a.px_lg]}>
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
  return {
    b: (text: React.ReactNode) => (
      <Text style={a.body_1_lg_medium}>{text}</Text>
    ),
  }
}
