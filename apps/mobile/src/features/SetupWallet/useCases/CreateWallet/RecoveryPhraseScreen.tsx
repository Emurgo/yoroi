import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {BlurView} from 'expo-blur'
import * as React from 'react'
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {Button} from '../../../../ui/Button/Button'
import {CardAboutPhrase} from '../../../../ui/CardAboutPhrase/CardAboutPhrase'
import {Info as InfoIcon} from '../../../../ui/InfoIcon/InfoIcon'
import {LearnMoreButton} from '../../../../ui/LearnMoreButton/LearnMoreButton'
import {useModal} from '../../../../ui/Modal/ModalContext'
import {Space, SpaceHeight} from '../../../../ui/Space/Space'
import {StepperProgress} from '../../../../ui/StepperProgress/StepperProgress'
import {generateAdaMnemonic} from '../../../../wallets/cardano/mnemonic/mnemonic'
import {YoroiZendeskLink} from '../../common/constants'
import {useStrings} from '../../common/useStrings'
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
    // showCreateWalletInfoModalChanged,
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
      // title: strings.recoveryPhraseModalTitle,
      content: (
        <View style={[styles.modal, a.flex_1, a.px_lg]}>
          <CardAboutPhrase
            title={strings.recoveryPhraseCardTitle}
            linesOfText={[
              strings.recoveryPhraseCardFirstItem,
              strings.recoveryPhraseCardSecondItem,
              strings.recoveryPhraseCardThirdItem,
              strings.recoveryPhraseCardFourthItem,
              strings.recoveryPhraseCardFifthItem,
            ]}
          />

          <SpaceHeight fill size="lg" />

          <LearnMoreButton
            onPress={() => {
              Linking.openURL(YoroiZendeskLink)
            }}
          />

          <Space.Height.xl />
        </View>
      ),
      /* footer: (
        <Button
          title={strings.continueButton}
          onPress={() => {
            closeModal()
            showCreateWalletInfoModalChanged(false)
          }}
          testID="setup-step2-continue-button"
        />
      ), */
      ///height: 552,
    })
  }, [
    openModal,
    strings.recoveryPhraseCardFifthItem,
    strings.recoveryPhraseCardFirstItem,
    strings.recoveryPhraseCardFourthItem,
    strings.recoveryPhraseCardSecondItem,
    strings.recoveryPhraseCardThirdItem,
    strings.recoveryPhraseCardTitle,
  ])

  React.useEffect(() => {
    if (showCreateWalletInfoModal) handleOnShowModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCreateWalletInfoModal])

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[
        styles.root,
        a.flex_1,
        a.px_lg,
        {backgroundColor: p.bg_color_max},
      ]}
    >
      <View style={[styles.content, a.gap_lg]}>
        <StepperProgress
          currentStep={2}
          currentStepTitle={strings.stepRecoveryPhrase}
          totalSteps={4}
        />

        <Text style={[styles.title, a.body_1_lg_regular, {color: p.gray_900}]}>
          {strings.recoveryPhraseTitle(bold)}

          <Info onPress={handleOnShowModal} testID="step2-info-icon" />
        </Text>

        <View
          style={[
            styles.mnemonicWords,
            a.flex_row,
            a.flex_wrap,
            a.py_sm,
            a.gap_sm,
          ]}
        >
          <BlurView
            experimentalBlurMethod={
              Platform.OS === 'android' ? 'dimezisBlurView' : 'none'
            }
            intensity={isBlur ? 14 : 0}
            style={[
              styles.blurView,
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
                styles.mnemonicTextContainer,
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
                  StyleSheet.absoluteFill,
                  styles.buttonBackground,
                  {backgroundColor: p.primary_100},
                ]}
              />

              <Text
                style={[
                  styles.mnemonicText,
                  a.body_1_lg_regular,
                  {color: p.primary_600},
                ]}
              >
                <Text
                  style={[
                    styles.mnemonicText,
                    a.body_1_lg_regular,
                    {color: p.primary_600},
                  ]}
                >
                  {index + 1}.{' '}
                </Text>

                {word}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.5}
          style={[styles.blurButton, a.flex_row, a.align_center, a.gap_sm]}
          onPress={() => setIsBlur(!isBlur)}
          testID="step2-show_hide-recovery-phrase-button"
        >
          {isBlur ? <EyeOpen /> : <EyeClosed />}

          <Text
            style={[
              styles.blurTextButton,
              {color: p.primary_500},
              a.button_2_md,
              {textTransform: 'none'},
            ]}
          >
            {!isBlur
              ? strings.hideRecoveryPhraseButton
              : strings.showRecoveryPhraseButton}
          </Text>
        </TouchableOpacity>
      </View>

      <SpaceHeight fill size="lg" />

      <Button
        title={strings.next}
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
    <TouchableOpacity style={[styles.info, a.relative]} onPress={onPress}>
      <View
        style={[
          styles.infoIcon,
          a.absolute,
          {top: Platform.OS === 'ios' ? -22 : -18, left: 0},
        ]}
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

const styles = StyleSheet.create({
  root: {},
  modal: {},
  title: {},
  bolder: {},
  content: {},
  mnemonicWords: {},
  mnemonicTextContainer: {},
  mnemonicText: {},
  blurView: {},
  blurButton: {},
  blurTextButton: {},
  info: {},
  infoIcon: {},
  buttonBackground: {},
})
