import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import Animated, {FadeIn, FadeOut, Layout} from 'react-native-reanimated'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components/Button/NewButton'
import {Space} from '../../../../components/Space/Space'
import {StepperProgress} from '../../../../components/StepperProgress/StepperProgress'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {SetupWalletRouteNavigation} from '../../../../kernel/navigation'
import {walletManager} from '../../../WalletManager/wallet-manager'
import {useStrings} from '../../common/useStrings'
import {Alert as AlertIllustration} from '../../illustrations/Alert'
import {Check2 as Check2Illustration} from '../../illustrations/Check2'

export const VerifyRecoveryPhraseScreen = () => {
  const {styles} = useStyles()
  const bold = useBold()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const strings = useStrings()
  const {mnemonic, publicKeyHexChanged, accountVisual, walletImplementation} = useSetupWallet()
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.createWalletSavePhraseStepViewed()
    }, [track]),
  )

  const mnemonicEntries: Array<Entry> = mnemonic
    .split(' ')
    .sort()
    .map((word: string, id: number) => ({word, id}))

  const mnemonicDefault: Array<Entry> = mnemonic.split(' ').map((word: string, id: number) => ({word, id}))

  const [userEntries, setUserEntries] = React.useState<Array<Entry>>([])
  const appendEntry = (entry: Entry) => setUserEntries([...userEntries, entry])
  const removeLastEntry = () => setUserEntries((entries) => entries.slice(0, -1))
  const removeLastEntryAndAddNew = (entry: Entry) => {
    setUserEntries((entries) => {
      const updatedEntries = entries.slice(0, -1)
      updatedEntries.push(entry)
      return updatedEntries
    })
  }

  const isPhraseComplete = userEntries.length === mnemonicEntries.length
  const isValidPhrase = userEntries.map((entry) => entry.word).join(' ') === mnemonic

  const disabled = !isPhraseComplete || !isValidPhrase

  const lastUserEntry = userEntries.findLast((last) => last)

  const isLastWordValid = () => {
    const lastUserEntryId = userEntries.length - 1
    const isMatch = mnemonicDefault.some(
      (defaultValue) => defaultValue.id === lastUserEntryId && defaultValue.word === lastUserEntry?.word,
    )
    return isMatch
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <StepperProgress
        currentStep={3}
        currentStepTitle={strings.stepVerifyRecoveryPhrase}
        totalSteps={4}
        style={styles.padding}
      />

      <Text style={[styles.title, styles.padding]}>{strings.verifyRecoveryPhraseTitle(bold)}</Text>

      <MnemonicInput
        onPress={removeLastEntry}
        defaultMnemonic={mnemonicDefault}
        userEntries={userEntries}
        error={isPhraseComplete && !isValidPhrase}
      />

      {isPhraseComplete && isLastWordValid() && <SuccessMessage />}

      <ScrollView bounces={false} style={styles.padding}>
        <WordBadges
          defaultMnemonic={mnemonicDefault}
          mnemonicEntries={mnemonicEntries}
          userEntries={userEntries}
          onPress={appendEntry}
          removeLastEntryAndAddNew={removeLastEntryAndAddNew}
        />

        {!isLastWordValid() && userEntries.length > 0 && <ErrorMessage />}
      </ScrollView>

      <View style={[styles.actions, styles.padding]}>
        <Button
          title={strings.next}
          disabled={disabled}
          onPress={async () => {
            const {accountPubKeyHex} = await walletManager.generateWalletKeys(
              walletImplementation,
              mnemonic,
              accountVisual,
            )
            publicKeyHexChanged(accountPubKeyHex)

            navigation.navigate('setup-wallet-details-form')
          }}
          testID="setup-next-button"
        />
      </View>
    </SafeAreaView>
  )
}

const ErrorMessage = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  return (
    <View style={[styles.errorMessageContainer, styles.padding]}>
      <AlertIllustration />

      <Space width="sm" />

      <Text style={styles.errorMessage}>{strings.verifyRecoveryPhraseErrorMessage}</Text>
    </View>
  )
}

const SuccessMessage = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  return (
    <View style={[styles.successMessageContainer, styles.padding]}>
      <Check2Illustration />

      <Space width="sm" />

      <Text style={styles.successMessage}>{strings.verifyRecoveryPhraseSuccessMessage}</Text>
    </View>
  )
}

type MnemonicInputProps = {
  defaultMnemonic: Array<Entry>
  userEntries: Array<Entry>
  error: boolean
  onPress: () => void
}
const MnemonicInput = ({defaultMnemonic, userEntries, onPress}: MnemonicInputProps) => {
  const {styles, colors} = useStyles()

  const {mnemonic} = useSetupWallet()

  const isPhraseComplete = userEntries.length === defaultMnemonic.length
  const isValidPhrase = userEntries.map((entry) => entry.word).join(' ') === mnemonic

  const lastUserEntry = userEntries.findLast((last) => last)

  const isLastWordValid = () => {
    const lastUserEntryId = userEntries.length - 1
    const isWordValid = defaultMnemonic.some(
      (defaultValue) => defaultValue.id === lastUserEntryId && defaultValue.word === lastUserEntry?.word,
    )
    return isWordValid
  }

  return (
    <Animated.View layout={Layout} entering={FadeIn} exiting={FadeOut} style={[styles.recoveryPhrase, styles.padding]}>
      <View style={[StyleSheet.absoluteFill, {backgroundColor: colors.bg}]} />

      <View style={styles.recoveryPhraseBackground}>
        <View style={styles.recoveryPhraseOutline}>
          {userEntries.map((entry, index, array) => {
            const isLast = index === array.length - 1
            const recoveryWordError = !isLastWordValid() && lastUserEntry?.id === entry.id

            return (
              <TouchableOpacity
                key={entry.id}
                activeOpacity={0.5}
                onPress={onPress}
                disabled={!isLast || !recoveryWordError}
                style={styles.wordBadge}
              >
                <Animated.View style={styles.wordBadgeView} layout={Layout} entering={FadeIn} exiting={FadeOut}>
                  <WordBadge
                    word={`${(index + 1).toString()}.`}
                    used
                    recoveryWordError={recoveryWordError}
                    defaultMnemonic={defaultMnemonic}
                    style={styles.mnemonicNumberWordBadge}
                  />

                  <Animated.View
                    layout={Layout}
                    entering={FadeIn}
                    exiting={FadeOut}
                    style={[styles.wordBadgeContainerOutline, recoveryWordError && styles.errorBadgeBackground]}
                  >
                    {!recoveryWordError && (
                      <View
                        style={[
                          StyleSheet.absoluteFill,
                          {
                            backgroundColor: isPhraseComplete && isValidPhrase ? colors.gradientGreen : colors.buttonBg,
                          },
                        ]}
                      />
                    )}

                    <WordBadge
                      word={entry.word}
                      recoveryWordError={recoveryWordError}
                      defaultMnemonic={defaultMnemonic}
                      style={[
                        styles.mnemonicInputWordBadge,
                        isPhraseComplete && isValidPhrase && {color: colors.black},
                      ]}
                    />
                  </Animated.View>
                </Animated.View>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    </Animated.View>
  )
}

type WordBadgesProps = {
  defaultMnemonic: Array<Entry>
  mnemonicEntries: Array<Entry>
  userEntries: Array<Entry>
  onPress: (wordEntry: Entry) => void
  removeLastEntryAndAddNew: (entry: Entry) => void
}

const WordBadges = ({
  defaultMnemonic,
  mnemonicEntries,
  userEntries,
  onPress,
  removeLastEntryAndAddNew,
}: WordBadgesProps) => {
  const {track} = useMetrics()
  const isWordUsed = (entryId: number) => userEntries.some((entry) => entry.id === entryId)

  const lastUserEntry = userEntries.findLast((last) => last)
  const isLastWordValid = () => {
    const lastUserEntryId = userEntries.length - 1
    const isMatch = defaultMnemonic.some(
      (defaultValue) => defaultValue.id === lastUserEntryId && defaultValue.word === lastUserEntry?.word,
    )
    return isMatch
  }

  const selectWord = (entry: {id: number; word: string}) => {
    track.createWalletVerifyPhraseWordSelected()

    if (isLastWordValid() || userEntries.length === 0) {
      onPress(entry)
    } else {
      removeLastEntryAndAddNew(entry)
    }
  }

  const {styles, colors} = useStyles()

  return (
    <Animated.View layout={Layout} style={styles.words}>
      {mnemonicEntries.map((entry) => {
        const isUsed = isWordUsed(entry.id)

        const usedError = isUsed && !isLastWordValid() && lastUserEntry?.id === entry.id

        return (
          <TouchableOpacity
            testID={isUsed ? `wordBadgeTapped-${entry.word}` : `wordBadgeNonTapped-${entry.word}`}
            key={entry.id}
            activeOpacity={0.5}
            disabled={isUsed}
            onPress={() => selectWord(entry)}
          >
            <Animated.View layout={Layout} entering={FadeIn} exiting={FadeOut} style={styles.wordBadgeContainer}>
              <View style={[StyleSheet.absoluteFill, {backgroundColor: !usedError ? colors.buttonBg : colors.error}]} />

              {isUsed && <View style={styles.usedWordBackground} />}

              <WordBadge
                word={entry.word}
                used={isUsed}
                usedError={usedError}
                defaultMnemonic={defaultMnemonic}
                style={styles.wordBadgeBottom}
              />
            </Animated.View>
          </TouchableOpacity>
        )
      })}
    </Animated.View>
  )
}

type WordBadgeProps = {
  word: string
  used?: boolean
  usedError?: boolean
  recoveryWordError?: boolean
  defaultMnemonic: Array<Entry>
  style?: StyleProp<Animated.AnimateStyle<StyleProp<TextStyle>>>
}
const WordBadge = ({word, used, usedError, recoveryWordError, style}: WordBadgeProps) => {
  const {styles} = useStyles()
  return (
    <Animated.View layout={Layout} entering={FadeIn} exiting={FadeOut} style={styles.wordBadge}>
      <Animated.Text
        layout={Layout}
        entering={FadeIn}
        exiting={FadeOut}
        style={[
          styles.wordBadgeText,
          used && !usedError && styles.usedWord,
          recoveryWordError && styles.errorBadge,
          style,
        ]}
      >
        {word}
      </Animated.Text>
    </Animated.View>
  )
}

const useBold = () => {
  const {styles} = useStyles()

  return {
    b: (text: React.ReactNode) => <Text style={styles.bolder}>{text}</Text>,
  }
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      backgroundColor: color.bg_color_max,
      ...atoms.flex_1,
      ...atoms.justify_between,
      ...atoms.gap_lg,
    },
    padding: {
      ...atoms.px_lg,
    },
    actions: {
      ...atoms.pb_lg,
    },
    title: {
      ...atoms.body_1_lg_regular,
      color: color.text_gray_medium,
    },
    recoveryPhrase: {
      minHeight: 182,
      borderRadius: 8,
      ...atoms.p_2xs,
      ...atoms.overflow_hidden,
    },
    recoveryPhraseBackground: {
      borderColor: color.primary_200,
      borderWidth: 1,
      backgroundColor: color.bg_color_max,
      borderRadius: 6,
      minHeight: 182,
      ...atoms.overflow_hidden,
    },
    recoveryPhraseOutline: {
      ...atoms.p_sm,
      ...atoms.flex_row,
      ...atoms.flex_wrap,
      ...atoms.gap_sm,
    },
    errorMessageContainer: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    errorMessage: {
      color: color.sys_magenta_500,
      ...atoms.body_2_md_regular,
    },
    successMessageContainer: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.justify_start,
    },
    successMessage: {
      color: color.text_gray_max,
      ...atoms.body_1_lg_medium,
    },
    errorBadge: {
      color: color.sys_magenta_500,
    },
    errorBadgeBackground: {
      backgroundColor: color.sys_magenta_100,
    },
    words: {
      ...atoms.flex_row,
      ...atoms.flex_wrap,
      ...atoms.gap_sm,
    },
    wordBadgeView: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.gap_2xs,
    },
    wordBadgeContainerOutline: {
      borderRadius: 8,
      ...atoms.overflow_hidden,
      ...atoms.px_xs,
      ...atoms.py_xs,
    },
    wordBadgeContainer: {
      borderRadius: 8,
      ...atoms.py_sm,
      ...atoms.overflow_hidden,
    },
    wordBadge: {
      ...atoms.flex_row,
      ...atoms.flex_wrap,
    },
    wordBadgeText: {
      color: color.text_primary_medium,
      ...atoms.body_1_lg_regular,
    },
    usedWord: {
      color: color.primary_400,
    },
    usedWordBackground: {
      ...atoms.absolute,
      backgroundColor: color.bg_color_max,
      borderRadius: 6,
      left: 2,
      right: 2,
      top: 2,
      bottom: 2,
    },
    bolder: {
      ...atoms.body_1_lg_medium,
    },
    mnemonicInputWordBadge: {
      ...atoms.px_sm,
    },
    mnemonicNumberWordBadge: {
      ...atoms.pr_xs,
    },
    wordBadgeBottom: {
      ...atoms.px_lg,
    },
  })

  const colors = {
    error: color.sys_magenta_500,
    buttonBg: color.primary_100,
    gradientGreen: color.secondary_300,
    black: color.black_static,
    bg: color.bg_color_max,
  }

  return {styles, colors} as const
}

type Entry = {id: number; word: string}
