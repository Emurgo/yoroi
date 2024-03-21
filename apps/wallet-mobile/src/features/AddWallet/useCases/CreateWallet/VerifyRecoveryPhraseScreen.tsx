import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import LinearGradient from 'react-native-linear-gradient'
import Animated, {FadeIn, FadeOut, Layout} from 'react-native-reanimated'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components'
import {useStatusBar} from '../../../../components/hooks/useStatusBar'
import {Space} from '../../../../components/Space/Space'
import {WalletInitRouteNavigation} from '../../../../navigation'
import {mockAddWallet} from '../../common/mocks'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
import {useStrings} from '../../common/useStrings'
import {Alert as AlertIllustration} from '../../illustrations/Alert'
import {Check2 as Check2Illustration} from '../../illustrations/Check2'

export const VerifyRecoveryPhraseScreen = () => {
  useStatusBar()
  const {styles} = useStyles()
  const bold = useBold()
  const navigation = useNavigation<WalletInitRouteNavigation>()
  const strings = useStrings()
  const mnemonic = mockAddWallet.mnemonic

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
  const isPhraseValid = userEntries.map((entry) => entry.word).join(' ') === mnemonic

  const disabled = !isPhraseComplete || !isPhraseValid

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

      <Space height="l" />

      <Text style={styles.title}>{strings.verifyRecoveryPhraseTitle(bold)}</Text>

      <Space height="l" />

      <MnemonicInput
        onPress={removeLastEntry}
        defaultMnemonic={mnemonicDefault}
        userEntries={userEntries}
        error={isPhraseComplete && !isPhraseValid}
      />

      {isPhraseComplete && isLastWordValid() && (
        <>
          <Space height="l" />

          <SuccessMessage />
        </>
      )}

      <Space height="l" />

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
            <Space height="l" />

            <ErrorMessage />
          </>
        )}
      </ScrollView>

      <Space height="l" />

      <View>
        <Button
          title="next"
          style={styles.button}
          disabled={disabled}
          onPress={() =>
            navigation.navigate('wallet-details-form', {
              networkId: 1,
              walletImplementationId: 'haskell-byron',
            })
          }
        />

        <Space height="s" />
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

      <Space width="s" />

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

      <Space width="s" />

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

  const mnemonic = mockAddWallet.mnemonic // mocked value

  const isPhraseComplete = userEntries.length === defaultMnemonic.length
  const isPhraseValid = userEntries.map((entry) => entry.word).join(' ') === mnemonic

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
              <Animated.View
                key={entry.id}
                style={styles.wordBadgeView}
                layout={Layout}
                entering={FadeIn}
                exiting={FadeOut}
              >
                <WordBadge
                  word={`${(index + 1).toString()}.`}
                  used
                  disabled={!isLast || !recoveryWordError}
                  onPress={onPress}
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
                      start={isPhraseComplete && isPhraseValid ? {x: 0, y: 0} : {x: 1, y: 0}}
                      end={isPhraseComplete && isPhraseValid ? {x: 0, y: 1} : {x: 0, y: 0}}
                      colors={isPhraseComplete && isPhraseValid ? colors.gradientGreen : colors.gradientBlueGreen}
                    />
                  )}

                  <WordBadge
                    word={entry.word}
                    disabled={!isLast || !recoveryWordError}
                    onPress={onPress}
                    recoveryWordError={recoveryWordError}
                    defaultMnemonic={defaultMnemonic}
                  />
                </Animated.View>
              </Animated.View>
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
          <Animated.View
            key={entry.id}
            layout={Layout}
            entering={FadeIn}
            exiting={FadeOut}
            style={[styles.wordBadgeContainer]}
          >
            <LinearGradient
              style={[StyleSheet.absoluteFill, {opacity: 1}]}
              start={{x: 1, y: 0}}
              end={{x: 0, y: 0}}
              colors={!usedError ? colors.gradientBlueGreen : [colors.error, colors.error]}
            />

            {isUsed && <View style={styles.usedWordBackground} />}

            <WordBadge
              word={entry.word}
              onPress={() => selectWord(entry)}
              disabled={isUsed}
              used={isUsed}
              usedError={usedError}
              testID={isUsed ? `wordBadgeTapped-${entry.word}` : `wordBadgeNonTapped-${entry.word}`}
              defaultMnemonic={defaultMnemonic}
            />
          </Animated.View>
        )
      })}
    </Animated.View>
  )
}

type WordBadgeProps = {
  word: string
  disabled?: boolean
  used?: boolean
  usedError?: boolean
  recoveryWordError?: boolean
  onPress?: () => void
  testID?: string
  defaultMnemonic: Array<Entry>
}
const WordBadge = ({word, onPress, disabled, testID, used, usedError, recoveryWordError}: WordBadgeProps) => {
  const {styles} = useStyles()
  return (
    <Animated.View layout={Layout} entering={FadeIn} exiting={FadeOut}>
      <TouchableOpacity
        testID={testID}
        activeOpacity={0.5}
        onPress={onPress}
        disabled={disabled}
        style={styles.wordBadge}
      >
        <Animated.Text
          layout={Layout}
          entering={FadeIn}
          exiting={FadeOut}
          style={[styles.wordBadgeText, used && !usedError && styles.usedWord, recoveryWordError && styles.errorBadge]}
        >
          {word}
        </Animated.Text>
      </TouchableOpacity>
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
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      ...theme.padding['x-l'],
      justifyContent: 'space-between',
      backgroundColor: theme.color['white-static'],
    },
    title: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray[900],
    },
    button: {backgroundColor: theme.color.primary[500]},
    recoveryPhrase: {
      ...theme.padding['xxs'],
      minHeight: 182,
      borderRadius: 8,
      overflow: 'hidden',
    },
    recoveryPhraseBackground: {
      borderRadius: 6,
      overflow: 'hidden',
      backgroundColor: theme.color['white-static'],
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
      color: theme.color.magenta['500'],
      ...theme.typography['body-2-m-regular'],
    },
    successMessageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    successMessage: {
      color: theme.color.gray.max,
      ...theme.typography['body-1-l-medium'],
    },
    errorBadge: {
      color: theme.color.magenta['500'],
    },
    errorBadgeBackground: {
      backgroundColor: theme.color.magenta['100'],
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
      ...theme.padding['x-s'],
      ...theme.padding['y-xs'],
      borderRadius: 8,
      overflow: 'hidden',
    },
    wordBadgeContainer: {
      ...theme.padding['x-l'],
      ...theme.padding['y-s'],
      borderRadius: 8,
      overflow: 'hidden',
    },
    wordBadge: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    wordBadgeText: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.primary['600'],
    },
    usedWord: {
      color: theme.color.primary['400'],
    },
    usedWordBackground: {
      position: 'absolute',
      backgroundColor: theme.color['white-static'],
      borderRadius: 6,
      left: 2,
      right: 2,
      top: 2,
      bottom: 2,
    },
    bolder: {
      ...theme.typography['body-1-l-medium'],
    },
  })

  const colors = {
    error: theme.color.magenta['500'],
    gradientBlueGreen: theme.color.gradients['blue-green'],
    gradientGreen: theme.color.gradients['green'],
  }

  return {styles, colors} as const
}

type Entry = {id: number; word: string}
