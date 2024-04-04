import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import {generateMnemonic} from 'bip39'
import {BlurView} from 'expo-blur'
import * as React from 'react'
import {
  Keyboard,
  Linking,
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
import {WalletInitRouteNavigation} from '../../../../navigation'
import {CardAboutPhrase} from '../../common/CardAboutPhrase/CardAboutPhrase'
import {YoroiZendeskLink} from '../../common/contants'
import {LearnMoreButton} from '../../common/LearnMoreButton/LearnMoreButton'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
import {useWalletSetup} from '../../common/translators/reactjs/hooks/useWalletSetup'
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
  const {mnemonicChanged} = useWalletSetup()
  const bold = useBold()

  const mnemonic = React.useMemo(() => generateMnemonic(), [])

  const handleOnShowModal = () => {
    Keyboard.dismiss()
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
          <BlurView intensity={isBlur ? 14 : 0} style={styles.blurView} />

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
            navigation.navigate('verify-recovery-phrase-mnemonic')
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
      ...theme.padding['x-l'],
      justifyContent: 'space-between',
      backgroundColor: theme.color['white-static'],
    },
    modal: {
      flex: 1,
    },
    title: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray[900],
    },
    bolder: {
      ...theme.typography['body-1-l-medium'],
    },
    content: {
      gap: 16,
    },
    button: {backgroundColor: theme.color.primary[500]},
    mnemonicWords: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      ...theme.padding['y-s'],
    },
    mnemonicTextContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      borderRadius: 8,
      overflow: 'hidden',
      ...theme.padding['x-l'],
      ...theme.padding['y-s'],
    },
    mnemonicText: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.primary['600'],
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
      color: theme.color.primary[500],
    },
  })

  const colors = {
    gradientBlueGreen: theme.color.gradients['blue-green'],
  }

  return {styles, colors} as const
}
