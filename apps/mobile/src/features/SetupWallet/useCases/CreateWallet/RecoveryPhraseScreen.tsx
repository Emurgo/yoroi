import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {BlurView} from 'expo-blur'
import * as React from 'react'
import {Linking, Platform, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {YoroiZendeskLink} from '~/features/SetupWallet/common/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Button} from '~/ui/Button/Button'
import {CardAboutPhrase} from '~/ui/CardAboutPhrase/CardAboutPhrase'
import {Info as InfoIcon} from '~/ui/InfoIcon/InfoIcon'
import {LearnMoreButton} from '~/ui/LearnMoreButton/LearnMoreButton'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'
import {StepperProgress} from '~/ui/StepperProgress/StepperProgress'
import {generateAdaMnemonic} from '~/wallets/cardano/mnemonic/mnemonic'
import {EyeClosed} from '../../illustrations/EyeClosed'
import {EyeOpen} from '../../illustrations/EyeOpen'

export const RecoveryPhraseScreen = () => {
  const bold = useBold()
  const {openModal, closeModal} = useModal()
  const [isBlur, setIsBlur] = React.useState(true)
  const navigation = useNavigation<any>()
  const strings = useStrings()
  const {
    mnemonicChanged,
    showCreateWalletInfoModal,
    showCreateWalletInfoModalChanged,
  } = useSetupWallet()
  const {track} = useMetrics()
  const {palette: p} = useTheme()

  const mnemonic = React.useMemo(() => generateAdaMnemonic(), [])

  useFocusEffect(
    React.useCallback(() => {
      track.createWalletLearnPhraseStepViewed()
    }, [track]),
  )

  const handleOnShowModal = React.useCallback(() => {
    openModal({
      title: strings.setupWallet.recoveryPhraseModalTitle,
      content: (
        <View style={[a.flex_1, a.px_lg]}>
          <CardAboutPhrase
            title={strings.setupWallet.recoveryPhraseCardTitle}
            linesOfText={[
              strings.setupWallet.recoveryPhraseCardFirstItem,
              strings.setupWallet.recoveryPhraseCardSecondItem,
              strings.setupWallet.recoveryPhraseCardThirdItem,
              strings.setupWallet.recoveryPhraseCardFourthItem,
              strings.setupWallet.recoveryPhraseCardFifthItem,
            ]}
          />

          <Space.Height.lg fill />

          <LearnMoreButton
            onPress={() => {
              Linking.openURL(YoroiZendeskLink)
            }}
          />

          <Space.Height.xl />
        </View>
      ),
      footer: (
        <Button
          title={strings.setupWallet.continueButton}
          onPress={() => {
            closeModal()
            showCreateWalletInfoModalChanged(false)
          }}
          testID="setup-step2-continue-button"
        />
      ),
      height: 552,
    })
  }, [
    openModal,
    strings.setupWallet.recoveryPhraseCardFifthItem,
    strings.setupWallet.recoveryPhraseCardFirstItem,
    strings.setupWallet.recoveryPhraseCardFourthItem,
    strings.setupWallet.recoveryPhraseCardSecondItem,
    strings.setupWallet.recoveryPhraseCardThirdItem,
    strings.setupWallet.recoveryPhraseCardTitle,
    closeModal,
    showCreateWalletInfoModalChanged,
  ])

  React.useEffect(() => {
    if (showCreateWalletInfoModal) handleOnShowModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCreateWalletInfoModal])

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}
    >
      <View style={[a.gap_lg]}>
        <StepperProgress
          currentStep={2}
          currentStepTitle={strings.setupWallet.stepRecoveryPhrase}
          totalSteps={4}
        />

        <Text style={[a.body_1_lg_regular, {color: p.gray_900}]}>
          {strings.setupWallet.recoveryPhraseTitle(bold)}

          <Info onPress={handleOnShowModal} testID="step2-info-icon" />
        </Text>

        <View style={[a.flex_row, a.flex_wrap, a.py_sm, a.gap_sm]}>
          <BlurView
            experimentalBlurMethod={
              Platform.OS === 'android' ? 'dimezisBlurView' : 'none'
            }
            intensity={isBlur ? 14 : 0}
            style={[
              a.z_10,
              a.absolute,
              a.p_2xl,
              {left: -8, right: -8, bottom: 0, top: 0},
            ]}
          />

          {mnemonic.split(' ').map((word, index) => (
            <View
              key={`mnemonic-${index}`}
              testID={`mnemonic-${index}`}
              style={[
                a.overflow_hidden,
                a.flex_row,
                a.flex_wrap,
                a.px_lg,
                a.py_sm,
                {borderRadius: 8},
              ]}
            >
              <View
                style={[
                  a.absolute,
                  {backgroundColor: p.primary_100},
                  {top: 0, left: 0, right: 0, bottom: 0},
                ]}
              />

              <Text style={[a.body_1_lg_regular, {color: p.primary_600}]}>
                <Text style={[a.body_1_lg_regular, {color: p.primary_600}]}>
                  {index + 1}.{' '}
                </Text>

                {word}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.5}
          style={[a.flex_row, a.align_center, a.gap_sm]}
          onPress={() => setIsBlur(!isBlur)}
          testID="step2-show_hide-recovery-phrase-button"
        >
          {isBlur ? <EyeOpen /> : <EyeClosed />}

          <Text
            style={[
              {color: p.primary_500},
              a.button_2_md,
              {textTransform: 'none'},
            ]}
          >
            {!isBlur
              ? strings.setupWallet.hideRecoveryPhraseButton
              : strings.setupWallet.showRecoveryPhraseButton}
          </Text>
        </TouchableOpacity>
      </View>

      <Space.Height.lg fill />

      <Button
        title={strings.setupWallet.next}
        disabled={isBlur}
        onPress={() => {
          mnemonicChanged(mnemonic)
          navigation.navigate('setup-wallet-verify-recovery-phrase-mnemonic')
        }}
        testID="setup-step2-next-button"
      />

      <Space.Height.lg />
    </SafeAreaView>
  )
}

const Info = ({onPress, testID}: {onPress: () => void; testID?: string}) => {
  const {palette: p, isDark} = useTheme()
  return (
    <TouchableOpacity style={[a.relative]} onPress={onPress}>
      <View
        style={[a.absolute, {top: Platform.OS === 'ios' ? -22 : -18, left: 0}]}
        testID={testID}
      >
        <InfoIcon size={24} color={isDark ? p.white_static : p.black_static} />
      </View>
    </TouchableOpacity>
  )
}

const useBold = () => {
  return {
    b: (text: React.ReactNode) => (
      <Text style={a.body_1_lg_medium}>{text}</Text>
    ),
  }
}
