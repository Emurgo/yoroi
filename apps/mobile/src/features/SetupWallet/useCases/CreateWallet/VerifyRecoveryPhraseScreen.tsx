import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import Animated, {FadeIn, FadeOut, Layout} from 'react-native-reanimated'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {SetupWalletRouteNavigation} from '../../../../kernel/navigation'
import {Alert as AlertIllustration} from '../../../../ui/AlertIllustration/AlertIllustration'
import {Button} from '../../../../ui/Button/Button'
import {Check2 as Check2Illustration} from '../../../../ui/Check2Illustration/Check2Illustration'
import {Space} from '../../../../ui/Space/Space'
import {StepperProgress} from '../../../../ui/StepperProgress/StepperProgress'
import {walletManager} from '../../../WalletManager/wallet-manager'
import {useStrings} from '../../common/useStrings'

export const VerifyRecoveryPhraseScreen = () => {
  const bold = useBold()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const strings = useStrings()
  const {mnemonic, publicKeyHexChanged, accountVisual, walletImplementation} =
    useSetupWallet()
  const {track} = useMetrics()
  const {color} = useTheme()

  useFocusEffect(
    React.useCallback(() => {
      track.createWalletSavePhraseStepViewed()
    }, [track]),
  )

  const mnemonicEntries: Array<Entry> = mnemonic
    .split(' ')
    .sort()
    .map((word: string, id: number) => ({word, id}))

  const mnemonicDefault: Array<Entry> = mnemonic
    .split(' ')
    .map((word: string, id: number) => ({word, id}))

  const [userEntries, setUserEntries] = React.useState<Array<Entry>>([])
  const appendEntry = (entry: Entry) => setUserEntries([...userEntries, entry])
  const removeLastEntry = () =>
    setUserEntries((entries) => entries.slice(0, -1))
  const removeLastEntryAndAddNew = (entry: Entry) => {
    setUserEntries((entries) => {
      const updatedEntries = entries.slice(0, -1)
      updatedEntries.push(entry)
      return updatedEntries
    })
  }

  const isPhraseComplete = userEntries.length === mnemonicEntries.length
  const isValidPhrase =
    userEntries.map((entry) => entry.word).join(' ') === mnemonic

  const disabled = !isPhraseComplete || !isValidPhrase

  const lastUserEntry = userEntries.findLast((last) => last)

  const isLastWordValid = () => {
    const lastUserEntryId = userEntries.length - 1
    const isMatch = mnemonicDefault.some(
      (defaultValue) =>
        defaultValue.id === lastUserEntryId &&
        defaultValue.word === lastUserEntry?.word,
    )
    return isMatch
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[
        styles.container,
        a.flex_1,
        a.justify_between,
        a.gap_lg,
        {backgroundColor: color.bg_color_max},
      ]}
    >
      <StepperProgress
        currentStep={3}
        currentStepTitle={strings.stepVerifyRecoveryPhrase}
        totalSteps={4}
        style={[styles.padding, a.px_lg]}
      />

      <Text
        style={[
          styles.title,
          styles.padding,
          a.body_1_lg_regular,
          {color: color.text_gray_medium},
          a.px_lg,
        ]}
      >
        {strings.verifyRecoveryPhraseTitle(bold)}
      </Text>

      <MnemonicInput
        onPress={removeLastEntry}
        defaultMnemonic={mnemonicDefault}
        userEntries={userEntries}
        error={isPhraseComplete && !isValidPhrase}
      />

      {isPhraseComplete && isLastWordValid() && <SuccessMessage />}

      <ScrollView bounces={false} style={[styles.padding, a.px_lg]}>
        <WordBadges
          defaultMnemonic={mnemonicDefault}
          mnemonicEntries={mnemonicEntries}
          userEntries={userEntries}
          onPress={appendEntry}
          removeLastEntryAndAddNew={removeLastEntryAndAddNew}
        />

        {!isLastWordValid() && userEntries.length > 0 && <ErrorMessage />}
      </ScrollView>

      <View style={[styles.actions, styles.padding, a.pb_lg, a.px_lg]}>
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
  const strings = useStrings()
  const {color} = useTheme()
  return (
    <View
      style={[
        styles.errorMessageContainer,
        styles.padding,
        a.flex_row,
        a.align_center,
        a.px_lg,
      ]}
    >
      <AlertIllustration />

      <Space width="sm" />

      <Text
        style={[
          styles.errorMessage,
          {color: color.sys_magenta_500},
          a.body_2_md_regular,
        ]}
      >
        {strings.verifyRecoveryPhraseErrorMessage}
      </Text>
    </View>
  )
}

const SuccessMessage = () => {
  const strings = useStrings()
  const {color} = useTheme()
  return (
    <View
      style={[
        styles.successMessageContainer,
        styles.padding,
        a.flex_row,
        a.align_center,
        a.justify_start,
        a.px_lg,
      ]}
    >
      <Check2Illustration />

      <Space width="sm" />

      <Text
        style={[
          styles.successMessage,
          {color: color.text_gray_max},
          a.body_1_lg_medium,
        ]}
      >
        {strings.verifyRecoveryPhraseSuccessMessage}
      </Text>
    </View>
  )
}

type MnemonicInputProps = {
  defaultMnemonic: Array<Entry>
  userEntries: Array<Entry>
  error: boolean
  onPress: () => void
}
const MnemonicInput = ({
  defaultMnemonic,
  userEntries,
  onPress,
}: MnemonicInputProps) => {
  const {color} = useTheme()

  const {mnemonic} = useSetupWallet()

  const isPhraseComplete = userEntries.length === defaultMnemonic.length
  const isValidPhrase =
    userEntries.map((entry) => entry.word).join(' ') === mnemonic

  const lastUserEntry = userEntries.findLast((last) => last)

  const isLastWordValid = () => {
    const lastUserEntryId = userEntries.length - 1
    const isMatch = defaultMnemonic.some(
      (defaultValue) =>
        defaultValue.id === lastUserEntryId &&
        defaultValue.word === lastUserEntry?.word,
    )
    return isMatch
  }

  return (
    <Animated.View
      layout={Layout}
      entering={FadeIn}
      exiting={FadeOut}
      style={[
        styles.recoveryPhrase,
        a.p_2xs,
        a.overflow_hidden,
        {minHeight: 182},
      ]}
    >
      <View
        style={[StyleSheet.absoluteFill, {backgroundColor: color.bg_color_max}]}
      />

      <View
        style={[
          styles.recoveryPhraseBackground,
          {borderColor: color.primary_200, backgroundColor: color.bg_color_max},
          {minHeight: 182},
          a.overflow_hidden,
        ]}
      >
        <View
          style={[
            styles.recoveryPhraseOutline,
            a.p_sm,
            a.flex_row,
            a.flex_wrap,
            a.gap_sm,
          ]}
        >
          {userEntries.map((entry, index, array) => {
            const isLast = index === array.length - 1
            const recoveryWordError =
              !isLastWordValid() && lastUserEntry?.id === entry.id

            return (
              <TouchableOpacity
                key={entry.id}
                activeOpacity={0.5}
                onPress={onPress}
                disabled={!isLast || !recoveryWordError}
                style={styles.wordBadge}
              >
                <Animated.View
                  style={[
                    styles.wordBadgeView,
                    a.flex_row,
                    a.align_center,
                    a.gap_2xs,
                  ]}
                  layout={Layout}
                  entering={FadeIn}
                  exiting={FadeOut}
                >
                  <WordBadge
                    word={`${(index + 1).toString()}.`}
                    used
                    recoveryWordError={recoveryWordError}
                    defaultMnemonic={defaultMnemonic}
                    style={[styles.mnemonicNumberWordBadge, a.pr_xs]}
                  />

                  <Animated.View
                    layout={Layout}
                    entering={FadeIn}
                    exiting={FadeOut}
                    style={[
                      styles.wordBadgeContainerOutline,
                      a.overflow_hidden,
                      a.px_xs,
                      a.py_xs,
                      recoveryWordError && styles.errorBadgeBackground,
                      recoveryWordError && {
                        backgroundColor: color.sys_magenta_100,
                      },
                    ]}
                  >
                    {!recoveryWordError && (
                      <View
                        style={[
                          StyleSheet.absoluteFill,
                          {
                            backgroundColor:
                              isPhraseComplete && isValidPhrase
                                ? color.secondary_300
                                : color.primary_100,
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
                        a.px_sm,
                        isPhraseComplete &&
                          isValidPhrase && {color: color.black_static},
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
  const isWordUsed = (entryId: number) =>
    userEntries.some((entry) => entry.id === entryId)

  const lastUserEntry = userEntries.findLast((last) => last)
  const isLastWordValid = () => {
    const lastUserEntryId = userEntries.length - 1
    const isMatch = defaultMnemonic.some(
      (defaultValue) =>
        defaultValue.id === lastUserEntryId &&
        defaultValue.word === lastUserEntry?.word,
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

  const {color} = useTheme()

  return (
    <Animated.View
      layout={Layout}
      style={[styles.words, a.flex_row, a.flex_wrap, a.gap_sm]}
    >
      {mnemonicEntries.map((entry) => {
        const isUsed = isWordUsed(entry.id)

        const usedError =
          isUsed && !isLastWordValid() && lastUserEntry?.id === entry.id

        return (
          <TouchableOpacity
            testID={
              isUsed
                ? `wordBadgeTapped-${entry.word}`
                : `wordBadgeNonTapped-${entry.word}`
            }
            key={entry.id}
            activeOpacity={0.5}
            disabled={isUsed}
            onPress={() => selectWord(entry)}
          >
            <Animated.View
              layout={Layout}
              entering={FadeIn}
              exiting={FadeOut}
              style={[
                styles.wordBadgeContainer,
                a.py_sm,
                a.overflow_hidden,
                {borderRadius: 8},
              ]}
            >
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: !usedError
                      ? color.primary_100
                      : color.sys_magenta_500,
                  },
                ]}
              />

              {isUsed && (
                <View
                  style={[
                    styles.usedWordBackground,
                    {backgroundColor: color.bg_color_max},
                  ]}
                />
              )}

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
const WordBadge = ({
  word,
  used,
  usedError,
  recoveryWordError,
  style,
}: WordBadgeProps) => {
  const {color} = useTheme()
  return (
    <Animated.View
      layout={Layout}
      entering={FadeIn}
      exiting={FadeOut}
      style={styles.wordBadge}
    >
      <Animated.Text
        layout={Layout}
        entering={FadeIn}
        exiting={FadeOut}
        style={[
          styles.wordBadgeText,
          {color: color.text_primary_medium},
          used && !usedError && styles.usedWord,
          used && !usedError && {color: color.primary_400},
          recoveryWordError && styles.errorBadge,
          recoveryWordError && {color: color.sys_magenta_500},
          style,
        ]}
      >
        {word}
      </Animated.Text>
    </Animated.View>
  )
}

const useBold = () => {
  const {atoms} = useTheme()

  return {
    b: (text: React.ReactNode) => (
      <Text style={atoms.body_1_lg_medium}>{text}</Text>
    ),
  }
}

const styles = StyleSheet.create({
  container: {},
  padding: {},
  actions: {},
  title: {},
  recoveryPhrase: {},
  recoveryPhraseBackground: {},
  recoveryPhraseOutline: {},
  errorMessageContainer: {},
  errorMessage: {},
  successMessageContainer: {},
  successMessage: {},
  errorBadge: {},
  errorBadgeBackground: {},
  words: {},
  wordBadgeView: {},
  wordBadgeContainerOutline: {},
  wordBadgeContainer: {},
  wordBadge: {},
  wordBadgeText: {},
  usedWord: {},
  usedWordBackground: {
    borderRadius: 6,
    left: 2,
    right: 2,
    top: 2,
    bottom: 2,
  },
  bolder: {},
  mnemonicInputWordBadge: {},
  mnemonicNumberWordBadge: {},
  wordBadgeBottom: {},
})
