import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import {BlurView} from 'expo-blur'
import * as React from 'react'
import {Linking, Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer, useModal} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {useMetrics} from '../../../../metrics/metricsManager'
import {WalletInitRouteNavigation} from '../../../../navigation'
import {generateAdaMnemonic} from '../../../../yoroi-wallets/cardano/mnemonic'
import {CardAboutPhrase} from '../../common/CardAboutPhrase/CardAboutPhrase'
import {YoroiZendeskLink} from '../../common/constants'
import {LearnMoreButton} from '../../common/LearnMoreButton/LearnMoreButton'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
import {useStrings} from '../../common/useStrings'
import {EyeClosed as EyeClosedIllustration} from '../../illustrations/EyeClosed'
import {EyeOpen as EyeOpenIllustration} from '../../illustrations/EyeOpen'
import {Info as InfoIcon} from '../../illustrations/Info'

export const RecoveryPhraseScreen = () => {
  const {styles, colors} = useStyles()
  const {openModal, closeModal} = useModal()
  const [isBlur, setIsBlur] = React.useState(true)
  const navigation = useNavigation<WalletInitRouteNavigation>()
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
          style={styles.button}
          onPress={() => {
            closeModal()
            showCreateWalletInfoModalChanged(false)
          }}
        />
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
    styles.button,
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

          <Info onPress={handleOnShowModal} />
        </Text>

        <View style={styles.mnemonicWords}>
          <BlurView
            experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : 'none'}
            intensity={isBlur ? 14 : 0}
            style={styles.blurView}
          />

          {mnemonic.split(' ').map((word, index) => (
            <View key={`mnemonic-${index}`} testID={`mnemonic-${index}`} style={styles.mnemonicTextContainer}>
              <LinearGradient
                style={[StyleSheet.absoluteFill, {opacity: 1}]}
                start={{x: 1, y: 0}}
                end={{x: 0, y: 0}}
                colors={colors.gradientBlueGreen}
              />

              <Text style={styles.mnemonicText}>
                <Text style={styles.mnemonicText}>{index + 1}. </Text>

                {word}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity activeOpacity={0.5} style={styles.blurButton} onPress={() => setIsBlur(!isBlur)}>
          {isBlur ? <EyeOpenIllustration /> : <EyeClosedIllustration />}

          <Text style={styles.blurTextButton}>
            {!isBlur ? strings.hideRecoveryPhraseButton : strings.showRecoveryPhraseButton}
          </Text>
        </TouchableOpacity>
      </View>

      <Spacer fill />

      <Button
        title={strings.next}
        style={styles.button}
        disabled={isBlur}
        onPress={() => {
          mnemonicChanged(mnemonic)
          navigation.navigate('setup-wallet-verify-recovery-phrase-mnemonic')
        }}
      />

      <Space height="lg" />
    </SafeAreaView>
  )
}

const Info = ({onPress}: {onPress: () => void}) => {
  const {styles} = useStyles()
  return (
    <TouchableOpacity style={styles.info} onPress={onPress}>
      <View style={styles.infoIcon}>
        <InfoIcon size={24} />
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
      flex: 1,
      ...atoms.px_lg,
      justifyContent: 'space-between',
      backgroundColor: color.gray_cmin,
    },
    modal: {
      flex: 1,
    },
    title: {
      ...atoms.body_1_lg_regular,
      color: color.gray_c900,
    },
    bolder: {
      ...atoms.body_1_lg_medium,
    },
    content: {
      gap: 16,
    },
    button: {backgroundColor: color.primary_c500},
    mnemonicWords: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      ...atoms.py_sm,
    },
    mnemonicTextContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      borderRadius: 8,
      overflow: 'hidden',
      ...atoms.px_lg,
      ...atoms.py_sm,
    },
    mnemonicText: {
      ...atoms.body_1_lg_regular,
      color: color.primary_c600,
    },
    blurView: {
      position: 'absolute',
      ...atoms.p_2xl,
      left: -8,
      right: -8,
      bottom: 0,
      top: 0,
      zIndex: 1,
    },
    blurButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    blurTextButton: {
      ...atoms.button_2_md,
      color: color.primary_c500,
      textTransform: 'none',
    },
    info: {
      position: 'relative',
    },
    infoIcon: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? -22 : -18,
      left: 0,
    },
  })

  const colors = {
    gradientBlueGreen: color.bg_gradient_1,
  }

  return {styles, colors} as const
}
