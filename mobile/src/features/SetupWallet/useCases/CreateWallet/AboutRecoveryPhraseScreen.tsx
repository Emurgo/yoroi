import {atoms as a, useTheme} from '@yoroi/theme'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {Linking, ScrollView, Text, View} from 'react-native'
import {ViewProps} from 'react-native-svg/lib/typescript/fabric/utils'

import {YoroiHelpLink} from '~/features/SetupWallet/common/constants'
import {useBold} from '~/hooks/useBold'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {CardAboutPhrase} from '~/ui/CardAboutPhrase/CardAboutPhrase'
import {LearnMoreButton} from '~/ui/LearnMoreButton/LearnMoreButton'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {StepperProgress} from '~/ui/StepperProgress/StepperProgress'

export const AboutRecoveryPhraseScreen = () => {
  const bold = useBold({style: a.body_1_lg_medium})
  const strings = useStrings()
  const navigation = useNavigation<any>()
  const {atoms: ta} = useTheme()

  const handleOnLearMoreButtonPress = () => {
    Linking.openURL(YoroiHelpLink)
  }

  return (
    <SafeArea>
      <ScrollView bounces={false} contentContainerStyle={[a.px_lg, a.gap_lg]}>
        <StepperProgress
          currentStep={1}
          currentStepTitle={strings.setupWallet.stepAboutRecoveryPhrase}
          totalSteps={4}
        />

        <Text style={[ta.text_gray_medium, a.body_1_lg_regular]}>
          {strings.setupWallet.aboutRecoveryPhraseTitle(bold)}
        </Text>

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
    </SafeArea>
  )
}

const Actions = ({style, ...props}: ViewProps) => (
  <View style={style} {...props} />
)
