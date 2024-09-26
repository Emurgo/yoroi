import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import {BlurView} from 'expo-blur'
import * as React from 'react'
import {Linking, Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components/Button/NewButton'
import {useModal} from '../../../../components/Modal/ModalContext'
import {Space} from '../../../../components/Space/Space'
import {Spacer} from '../../../../components/Spacer/Spacer'
import {StepperProgress} from '../../../../components/StepperProgress/StepperProgress'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {SetupWalletRouteNavigation} from '../../../../kernel/navigation'
import {generateAdaMnemonic} from '../../../../yoroi-wallets/cardano/mnemonic/mnemonic'
import {CardAboutPhrase} from '../../common/CardAboutPhrase/CardAboutPhrase'
import {YoroiZendeskLink} from '../../common/constants'
import {LearnMoreButton} from '../../common/LearnMoreButton/LearnMoreButton'
import {useStrings} from '../../common/useStrings'
import {EyeClosed as EyeClosedIllustration} from '../../illustrations/EyeClosed'
import {EyeOpen as EyeOpenIllustration} from '../../illustrations/EyeOpen'
import {Info as InfoIcon} from '../../illustrations/Info'

export const RecoveryPhraseScreen = () => {
  const {styles} = useStyles()
  const {openModal, closeModal} = useModal()
  const [isBlur, setIsBlur] = React.useState(true)
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const strings = useStrings()
  const {mnemonicChanged, showCreateWalletInfoModal, showCreateWalletInfoModalChanged} = useSetupWallet()
  const {track} = useMetrics()
  const bold = useBold()

  const mnemonic = React.useMemo(() => generateAdaMnemonic(), [])

  useFocusEffect(
    React.useCallback(() => {
      track.createWalletLearnPhraseStepViewed()
    }, [track]),
  )

  const handleOnShowModal = React.useCallback(() => {
    openModal(
      strings.recoveryPhraseModalTitle,
      <View style={styles.modal}>
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

        <Spacer fill />

        <LearnMoreButton
          onPress={() => {
            Linking.openURL(YoroiZendeskLink)
          }}
        />

        <Space height="xl" />

        <Button
          title={strings.continueButton}
          onPress={() => {
            closeModal()
            showCreateWalletInfoModalChanged(false)
          }}
          testID="setup-step2-continue-button"
        />

        <Space height="_2xl" />
      </View>,
      552,
    )
  }, [
    closeModal,
    openModal,
    showCreateWalletInfoModalChanged,
    strings.continueButton,
    strings.recoveryPhraseCardFifthItem,
    strings.recoveryPhraseCardFirstItem,
    strings.recoveryPhraseCardFourthItem,
    strings.recoveryPhraseCardSecondItem,
    strings.recoveryPhraseCardThirdItem,
    strings.recoveryPhraseCardTitle,
    strings.recoveryPhraseModalTitle,
    styles.modal,
  ])

  React.useEffect(() => {
    if (showCreateWalletInfoModal) handleOnShowModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCreateWalletInfoModal])

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <View style={styles.content}>
        <StepperProgress currentStep={2} currentStepTitle={strings.stepRecoveryPhrase} totalSteps={4} />

        <Text style={styles.title}>
          {strings.recoveryPhraseTitle(bold)}

          <Info onPress={handleOnShowModal} testID="step2-info-icon" />
        </Text>

        <View style={styles.mnemonicWords}>
          <BlurView
            experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : 'none'}
            intensity={isBlur ? 14 : 0}
            style={styles.blurView}
          />

          {mnemonic.split(' ').map((word, index) => (
            <View key={`mnemonic-${index}`} testID={`mnemonic-${index}`} style={styles.mnemonicTextContainer}>
              <View style={[StyleSheet.absoluteFill, styles.buttonBackground]} />

              <Text style={styles.mnemonicText}>
                <Text style={styles.mnemonicText}>{index + 1}. </Text>

                {word}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.blurButton}
          onPress={() => setIsBlur(!isBlur)}
          testID="step2-show_hide-recovery-phrase-button"
        >
          {isBlur ? <EyeOpenIllustration /> : <EyeClosedIllustration />}

          <Text style={styles.blurTextButton}>
            {!isBlur ? strings.hideRecoveryPhraseButton : strings.showRecoveryPhraseButton}
          </Text>
        </TouchableOpacity>
      </View>

      <Spacer fill />

      <Button
        title={strings.next}
        disabled={isBlur}
        onPress={() => {
          mnemonicChanged(mnemonic)
          navigation.navigate('setup-wallet-verify-recovery-phrase-mnemonic')
        }}
        testID="setup-step2-next-button"
      />

      <Space height="lg" />
    </SafeAreaView>
  )
}

const Info = ({onPress, testID}: {onPress: () => void; testID?: string}) => {
  const {styles} = useStyles()
  const {color, isDark} = useTheme()
  return (
    <TouchableOpacity style={styles.info} onPress={onPress}>
      <View style={styles.infoIcon} testID={testID}>
        <InfoIcon size={24} color={isDark ? color.white_static : color.black_static} />
      </View>
    </TouchableOpacity>
  )
}

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
      backgroundColor: color.bg_color_max,
      ...atoms.flex_1,
      ...atoms.px_lg,
    },
    modal: {
      ...atoms.flex_1,
      ...atoms.px_lg,
    },
    title: {
      ...atoms.body_1_lg_regular,
      color: color.gray_900,
    },
    bolder: {
      ...atoms.body_1_lg_medium,
    },
    content: {
      gap: 16,
    },
    mnemonicWords: {
      ...atoms.flex_row,
      ...atoms.flex_wrap,
      ...atoms.py_sm,
      ...atoms.gap_sm,
    },
    mnemonicTextContainer: {
      borderRadius: 8,
      ...atoms.overflow_hidden,
      ...atoms.flex_row,
      ...atoms.flex_wrap,
      ...atoms.px_lg,
      ...atoms.py_sm,
    },
    mnemonicText: {
      ...atoms.body_1_lg_regular,
      color: color.primary_600,
    },
    blurView: {
      left: -8,
      right: -8,
      bottom: 0,
      top: 0,
      ...atoms.z_10,
      ...atoms.absolute,
      ...atoms.p_2xl,
    },
    blurButton: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.gap_sm,
    },
    blurTextButton: {
      color: color.primary_500,
      ...atoms.button_2_md,
      textTransform: 'none',
    },
    info: {
      ...atoms.relative,
    },
    infoIcon: {
      top: Platform.OS === 'ios' ? -22 : -18,
      left: 0,
      ...atoms.absolute,
    },
    buttonBackground: {
      backgroundColor: color.primary_100,
    },
  })

  const colors = {
    gradientBlueGreen: color.bg_gradient_1,
  }

  return {styles, colors} as const
}
