import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Linking, ScrollView, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {ViewProps} from 'react-native-svg/lib/typescript/fabric/utils'

import {YoroiZendeskLink} from '~/features/SetupWallet/common/constants'
import {useBold} from '~/hooks/useBold'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Button} from '~/ui/Button/Button'
import {CardAboutPhrase} from '~/ui/CardAboutPhrase/CardAboutPhrase'
import {LearnMoreButton} from '~/ui/LearnMoreButton/LearnMoreButton'
import {Space} from '~/ui/Space/Space'
import {StepperProgress} from '~/ui/StepperProgress/StepperProgress'

export const AboutRecoveryPhraseScreen = () => {
  const bold = useBold({style: a.body_1_lg_medium})
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
          currentStepTitle={strings.setupWallet.stepAboutRecoveryPhrase}
          totalSteps={4}
        />

        <Space.Height.lg />

        <Text style={[{color: p.text_gray_medium}, a.body_1_lg_regular]}>
          {strings.setupWallet.aboutRecoveryPhraseTitle(bold)}
        </Text>

        <Space.Height.lg />

        <CardAboutPhrase
          showBackgroundColor
          includeSpacing
          linesOfText={[
            strings.setupWallet.aboutRecoveryPhraseCardFirstItem(bold),
            strings.setupWallet.aboutRecoveryPhraseCardSecondItem(bold),
            strings.setupWallet.aboutRecoveryPhraseCardThirdItem(bold),
            strings.setupWallet.aboutRecoveryPhraseCardFourthItem(bold),
            strings.setupWallet.aboutRecoveryPhraseCardFifthItem(bold),
          ]}
        />
      </ScrollView>

      <Space.Height.lg fill />

      <Actions style={[a.pt_lg, a.gap_lg, a.px_lg]}>
        <LearnMoreButton onPress={handleOnLearMoreButtonPress} />

        <Button
          title={strings.setupWallet.next}
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
