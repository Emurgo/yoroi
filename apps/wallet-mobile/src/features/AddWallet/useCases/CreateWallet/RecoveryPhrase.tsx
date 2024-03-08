import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import {BlurView} from 'expo-blur'
import * as React from 'react'
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, StatusBar, useModal} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {CardAboutPhrase} from '../../common/CardAboutPhrase/CardAboutPhrase'
import {LearnMoreButton} from '../../common/LearnMoreButton/LearnMoreButton'
import {mockAddWallet} from '../../common/mocks'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
import {useStrings} from '../../common/useStrings'
import EyeClosedIcon from '../../illustrations/EyeClosed'
import EyeOpenIcon from '../../illustrations/EyeOpen'
import InfoIcon from '../../illustrations/InfoIcon'

export const RecoveryPhrase = () => {
  const {styles, colors} = useStyles()
  const {openModal, closeModal} = useModal()
  const [isBlur, setIsBlur] = React.useState(true)

  const navigation = useNavigation()

  const HEIGHT_SCREEN = useWindowDimensions().height
  const PERCENTAGE = HEIGHT_SCREEN >= 900 ? 48 : HEIGHT_SCREEN >= 800 ? 55 : 75
  const HEIGHT_MODAL = (HEIGHT_SCREEN / 100) * PERCENTAGE

  const strings = useStrings()

  const showModal = () => {
    Keyboard.dismiss()
    openModal(
      strings.recoveryPhraseModalTitle,
      <View style={styles.modal}>
        <ScrollView>
          <View style={styles.content}>
            <CardAboutPhrase
              title={strings.recoveryPhraseCardTitle}
              items={[
                strings.recoveryPhraseCardFirstItem,
                strings.recoveryPhraseCardSecondItem,
                strings.recoveryPhraseCardThirdItem,
                strings.recoveryPhraseCardFourthItem,
                strings.recoveryPhraseCardFifthItem,
              ]}
            />

            <LearnMoreButton
              onPress={() => {
                ;('')
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
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <StatusBar type="light" />

      <View style={styles.content}>
        <StepperProgress currentStep={2} currentStepTitle={strings.recoveryStepper} totalSteps={4} displayStepNumber />

        <Text style={styles.title}>
          {strings.recoveryPhraseTitle}

          <Pressable onPress={showModal}>
            <InfoIcon />
          </Pressable>
        </Text>

        <View style={styles.mnemonicWords}>
          <BlurView intensity={isBlur ? 14 : 0} style={styles.blurView} />

          {mockAddWallet.mnemonic.split(' ').map((word, index) => (
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

        <TouchableOpacity activeOpacity={0.5} style={styles.blurViewButton} onPress={() => setIsBlur(!isBlur)}>
          {isBlur ? <EyeOpenIcon /> : <EyeClosedIcon />}

          <Text style={styles.blurViewTextButton}>
            {!isBlur ? strings.hideRecoveryPhraseButton : strings.showRecoveryPhraseButton}
          </Text>
        </TouchableOpacity>
      </View>

      <View>
        <Button
          title={strings.nextButton}
          style={styles.button}
          onPress={() =>
            navigation.navigate('new-wallet', {
              screen: 'verify-recovery-phrase',
            })
          }
        />

        <Space height="s" />
      </View>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    container: {
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
    blurViewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    blurViewTextButton: {
      ...theme.typography['button-2-m'],
      color: theme.color.primary[500],
    },
  })

  const colors = {
    gray900: theme.color.gray[900],
    gradientBlueGreen: theme.color.gradients['blue-green'],
  }

  return {styles, colors} as const
}
