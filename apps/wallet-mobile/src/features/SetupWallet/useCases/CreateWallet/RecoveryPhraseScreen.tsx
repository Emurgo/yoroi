import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import {BlurView} from 'expo-blur'
import * as React from 'react'
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, useModal} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {useMetrics} from '../../../../metrics/metricsManager'
import {WalletInitRouteNavigation} from '../../../../navigation'
import {generateAdaMnemonic} from '../../../../yoroi-wallets/cardano/mnemonic'
import {CardAboutPhrase} from '../../common/CardAboutPhrase/CardAboutPhrase'
import {YoroiZendeskLink} from '../../common/contants'
import {LearnMoreButton} from '../../common/LearnMoreButton/LearnMoreButton'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
import {useStrings} from '../../common/useStrings'
import {EyeClosed as EyeClosedIllustration} from '../../illustrations/EyeClosed'
import {EyeOpen as EyeOpenIllustration} from '../../illustrations/EyeOpen'
import {Info as InfoIllustration} from '../../illustrations/Info'

const useSizeModal = () => {
  const HEIGHT_SCREEN = useWindowDimensions().height
  const mediumScreenHeight = 800
  const largerScreenHeight = 900
  const PERCENTAGE = HEIGHT_SCREEN >= largerScreenHeight ? 48 : HEIGHT_SCREEN >= mediumScreenHeight ? 55 : 75
  const HEIGHT_MODAL = (HEIGHT_SCREEN / 100) * PERCENTAGE

  return {HEIGHT_MODAL} as const
}

export const RecoveryPhraseScreen = () => {
  const {styles, colors} = useStyles()
  const {HEIGHT_MODAL} = useSizeModal()
  const {openModal, closeModal} = useModal()
  const [isBlur, setIsBlur] = React.useState(true)
  const navigation = useNavigation<WalletInitRouteNavigation>()
  const strings = useStrings()
  const {mnemonicChanged} = useSetupWallet()
  const {track} = useMetrics()
  const bold = useBold()

  const mnemonic = React.useMemo(() => generateAdaMnemonic(), [])

  useFocusEffect(
    React.useCallback(() => {
      track.createWalletLearnPhraseStepViewed()
    }, [track]),
  )

  const handleOnShowModal = () => {
    openModal(
      strings.recoveryPhraseModalTitle,
      <View style={styles.modal}>
        <ScrollView>
          <View style={styles.content}>
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

            <LearnMoreButton
              onPress={() => {
                Linking.openURL(YoroiZendeskLink)
              }}
            />
          </View>
        </ScrollView>

        <Space height="s" />

        <Button title={strings.continueButton} style={styles.button} onPress={closeModal} />

        <Space height="l" />
      </View>,
      HEIGHT_MODAL,
    )
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <View style={styles.content}>
        <StepperProgress currentStep={2} currentStepTitle={strings.stepRecoveryPhrase} totalSteps={4} />

        <Text style={styles.title}>
          {strings.recoveryPhraseTitle(bold)}

          <TouchableOpacity onPress={handleOnShowModal}>
            <InfoIllustration />
          </TouchableOpacity>
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

      <View>
        <Button
          title={strings.next}
          style={styles.button}
          disabled={isBlur}
          onPress={() => {
            mnemonicChanged(mnemonic)
            navigation.navigate('setup-wallet-verify-recovery-phrase-mnemonic')
          }}
        />

        <Space height="s" />
      </View>
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
      ...theme.atoms.px_lg,
      justifyContent: 'space-between',
      backgroundColor: color.white_static,
    },
    modal: {
      flex: 1,
    },
    title: {
      ...theme.atoms.body_1_lg_regular,
      color: theme.color.gray_c900,
    },
    bolder: {
      ...atoms.body_1_lg_medium,
    },
    content: {
      gap: 16,
    },
    button: {backgroundColor: theme.color.primary_c500},
    mnemonicWords: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      ...theme.atoms.py_sm,
    },
    mnemonicTextContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      borderRadius: 8,
      overflow: 'hidden',
      ...theme.atoms.px_lg,
      ...theme.atoms.py_sm,
    },
    mnemonicText: {
      ...theme.atoms.body_1_lg_regular,
      color: theme.color.primary_c600,
    },
    blurView: {
      position: 'absolute',
      ...theme.padding['xxl'],
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
      ...theme.typography['button-2-m'],
      color: theme.color.primary_c500,
    },
  })

  const colors = {
    gradientBlueGreen: theme.color.gradients['blue-green'],
  }

  return {styles, colors} as const
}
