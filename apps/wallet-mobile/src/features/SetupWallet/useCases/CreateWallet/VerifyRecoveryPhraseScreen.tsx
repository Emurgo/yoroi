import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import LinearGradient from 'react-native-linear-gradient'
import Animated, {FadeIn, FadeOut, Layout} from 'react-native-reanimated'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {SetupWalletRouteNavigation} from '../../../../kernel/navigation'
import {makeKeys} from '../../../../yoroi-wallets/cardano/shelley/makeKeys'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
import {useStrings} from '../../common/useStrings'
import {Alert as AlertIllustration} from '../../illustrations/Alert'
import {Check2 as Check2Illustration} from '../../illustrations/Check2'

export const VerifyRecoveryPhraseScreen = () => {
  const {styles} = useStyles()
  const bold = useBold()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const strings = useStrings()
  const {mnemonic, publicKeyHexChanged} = useSetupWallet()
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
      <StepperProgress currentStep={3} currentStepTitle={strings.stepVerifyRecoveryPhrase} totalSteps={4} />

      <Space height="lg" />

      <Text style={styles.title}>{strings.verifyRecoveryPhraseTitle(bold)}</Text>

      <Space height="lg" />

      <MnemonicInput
        onPress={removeLastEntry}
        defaultMnemonic={mnemonicDefault}
        userEntries={userEntries}
        error={isPhraseComplete && !isValidPhrase}
      />

      {isPhraseComplete && isLastWordValid() && (
        <>
          <Space height="lg" />

          <SuccessMessage />
        </>
      )}

      <Space height="lg" />

      <ScrollView bounces={false}>
        <WordBadges
          defaultMnemonic={mnemonicDefault}
          mnemonicEntries={mnemonicEntries}
          userEntries={userEntries}
          onPress={appendEntry}
          removeLastEntryAndAddNew={removeLastEntryAndAddNew}
        />

        {!isLastWordValid() && userEntries.length > 0 && (
          <>
            <Space height="lg" />

            <ErrorMessage />
          </>
        )}
      </ScrollView>

      <Space height="lg" />

      <View>
        <Button
          title="next"
          style={styles.button}
          disabled={disabled}
          onPress={async () => {
            const {accountPubKeyHex} = await makeKeys({mnemonic})
            publicKeyHexChanged(accountPubKeyHex)
            navigation.navigate('setup-wallet-details-form')
          }}
        />

        <Space height="sm" />
      </View>
    </SafeAreaView>
  )
}

const ErrorMessage = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  return (
    <View style={styles.errorMessageContainer}>
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
    <View style={styles.successMessageContainer}>
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
    <Animated.View layout={Layout} entering={FadeIn} exiting={FadeOut} style={styles.recoveryPhrase}>
      <LinearGradient
        style={[StyleSheet.absoluteFill, {opacity: 1}]}
        start={{x: 1, y: 0}}
        end={{x: 0, y: 0}}
        colors={colors.gradientBlueGreen}
      />

      <View style={styles.recoveryPhraseBackground}>
        <View style={[styles.recoveryPhraseOutline]}>
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
                  />

                  <Animated.View
                    layout={Layout}
                    entering={FadeIn}
                    exiting={FadeOut}
                    style={[styles.wordBadgeContainerOutline, recoveryWordError && styles.errorBadgeBackground]}
                  >
                    {!recoveryWordError && (
                      <LinearGradient
                        style={[StyleSheet.absoluteFill, {opacity: 1}]}
                        start={isPhraseComplete && isValidPhrase ? {x: 0, y: 0} : {x: 1, y: 0}}
                        end={isPhraseComplete && isValidPhrase ? {x: 0, y: 1} : {x: 0, y: 0}}
                        colors={isPhraseComplete && isValidPhrase ? colors.gradientGreen : colors.gradientBlueGreen}
                      />
                    )}

                    <WordBadge
                      word={entry.word}
                      recoveryWordError={recoveryWordError}
                      defaultMnemonic={defaultMnemonic}
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
            <Animated.View layout={Layout} entering={FadeIn} exiting={FadeOut} style={[styles.wordBadgeContainer]}>
              <LinearGradient
                style={[StyleSheet.absoluteFill, {opacity: 1}]}
                start={{x: 1, y: 0}}
                end={{x: 0, y: 0}}
                colors={!usedError ? colors.gradientBlueGreen : [colors.error, colors.error]}
              />

              {isUsed && <View style={styles.usedWordBackground} />}

              <WordBadge word={entry.word} used={isUsed} usedError={usedError} defaultMnemonic={defaultMnemonic} />
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
}
const WordBadge = ({word, used, usedError, recoveryWordError}: WordBadgeProps) => {
  const {styles} = useStyles()
  return (
    <Animated.View layout={Layout} entering={FadeIn} exiting={FadeOut} style={styles.wordBadge}>
      <Animated.Text
        layout={Layout}
        entering={FadeIn}
        exiting={FadeOut}
        style={[styles.wordBadgeText, used && !usedError && styles.usedWord, recoveryWordError && styles.errorBadge]}
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
      flex: 1,
      ...atoms.px_lg,
      justifyContent: 'space-between',
      backgroundColor: color.gray_cmin,
    },
    title: {
      ...atoms.body_1_lg_regular,
      color: color.gray_c900,
    },
    button: {backgroundColor: color.primary_c500},
    recoveryPhrase: {
      ...atoms.p_2xs,
      minHeight: 182,
      borderRadius: 8,
      overflow: 'hidden',
    },
    recoveryPhraseBackground: {
      borderRadius: 6,
      overflow: 'hidden',
      backgroundColor: color.gray_cmin,
      minHeight: 182,
    },
    recoveryPhraseOutline: {
      padding: 6,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    errorMessageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    errorMessage: {
      color: color.sys_magenta_c500,
      ...atoms.body_2_md_regular,
    },
    successMessageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    successMessage: {
      color: color.gray_cmax,
      ...atoms.body_1_lg_medium,
    },
    errorBadge: {
      color: color.sys_magenta_c500,
    },
    errorBadgeBackground: {
      backgroundColor: color.sys_magenta_c100,
    },
    words: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    wordBadgeView: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    wordBadgeContainerOutline: {
      ...atoms.px_xs,
      ...atoms.py_xs,
      borderRadius: 8,
      overflow: 'hidden',
    },
    wordBadgeContainer: {
      ...atoms.px_lg,
      ...atoms.py_sm,
      borderRadius: 8,
      overflow: 'hidden',
    },
    wordBadge: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    wordBadgeText: {
      ...atoms.body_1_lg_regular,
      color: color.primary_c600,
    },
    usedWord: {
      color: color.primary_c400,
    },
    usedWordBackground: {
      position: 'absolute',
      backgroundColor: color.gray_cmin,
      borderRadius: 6,
      left: 2,
      right: 2,
      top: 2,
      bottom: 2,
    },
    bolder: {
      ...atoms.body_1_lg_medium,
    },
  })

  const colors = {
    error: color.sys_magenta_c500,
    gradientBlueGreen: color.bg_gradient_1,
    gradientGreen: color.bg_gradient_2,
  }

  return {styles, colors} as const
}

type Entry = {id: number; word: string}
