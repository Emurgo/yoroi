import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'

import {useFocusEffect, useNavigation} from '@react-navigation/native'
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

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useBold} from '~/hooks/useBold'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Alert as AlertIllustration} from '~/ui/AlertIllustration/AlertIllustration'
import {Button} from '~/ui/Button/Button'
import {Check2 as Check2Illustration} from '~/ui/Check2Illustration/Check2Illustration'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {StepperProgress} from '~/ui/StepperProgress/StepperProgress'

export const VerifyRecoveryPhraseScreen = () => {
  const bold = useBold({style: a.body_1_lg_medium})
  const navigation = useNavigation<any>()
  const strings = useStrings()
  const {mnemonic, publicKeyHexChanged, accountVisual, walletImplementation} =
    useSetupWallet()
  const {track} = useMetrics()
  const {atoms: ta} = useTheme()
  const {walletManager} = useWalletManager()

  useFocusEffect(
    React.useCallback(() => {
      track.createWalletSavePhraseStepViewed()
    }, [track]),
  )

  // Handle empty mnemonic case
  const processedMnemonic = mnemonic.trim() || ''

  const mnemonicEntries: Array<Entry> = React.useMemo(
    () =>
      processedMnemonic
        ? processedMnemonic
            .split(' ')
            .filter((word) => word.trim().length > 0) // Filter out empty strings
            .sort()
            .map((word: string, id: number) => ({word, id}))
        : [],
    [processedMnemonic],
  )

  const mnemonicDefault: Array<Entry> = React.useMemo(
    () =>
      processedMnemonic
        ? processedMnemonic
            .split(' ')
            .filter((word) => word.trim().length > 0) // Filter out empty strings
            .map((word: string, id: number) => ({word, id}))
        : [],
    [processedMnemonic],
  )

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
    <SafeArea>
      <View style={[a.gap_lg]}>
        <StepperProgress
          currentStep={3}
          currentStepTitle={strings.setupWallet.stepVerifyRecoveryPhrase}
          totalSteps={4}
          style={a.px_lg}
        />

        <Text style={[a.body_1_lg_regular, ta.text_gray_medium, a.px_lg]}>
          {strings.setupWallet.verifyRecoveryPhraseTitle(bold)}
        </Text>

        <MnemonicInput
          onPress={removeLastEntry}
          defaultMnemonic={mnemonicDefault}
          userEntries={userEntries}
          error={isPhraseComplete && !isValidPhrase}
        />

        {isPhraseComplete && isLastWordValid() && <SuccessMessage />}
      </View>

      <ScrollView
        bounces={false}
        contentContainerStyle={[a.px_lg, a.pt_lg]}
        style={a.flex_1}
      >
        {mnemonicEntries.length > 0 && (
          <>
            <WordBadges
              defaultMnemonic={mnemonicDefault}
              mnemonicEntries={mnemonicEntries}
              userEntries={userEntries}
              onPress={appendEntry}
              removeLastEntryAndAddNew={removeLastEntryAndAddNew}
            />

            <Space.Height.md />

            {!isLastWordValid() && userEntries.length > 0 && <ErrorMessage />}
          </>
        )}
      </ScrollView>

      <View style={a.px_lg}>
        <Button
          title={strings.setupWallet.next}
          disabled={disabled}
          onPress={() => {
            const {accountPubKeyHex} = walletManager.generateWalletKeys(
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
    </SafeArea>
  )
}

const ErrorMessage = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  return (
    <View style={[a.flex_row, a.align_center, a.px_lg]}>
      <AlertIllustration />

      <Space.Width.sm />

      <Text style={[{color: p.sys_magenta_500}, a.body_2_md_regular]}>
        {strings.setupWallet.verifyRecoveryPhraseErrorMessage}
      </Text>
    </View>
  )
}

const SuccessMessage = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  return (
    <View
      style={[a.flex_row, a.align_center, a.justify_start, a.px_lg, a.gap_sm]}
    >
      <Check2Illustration />

      <Text style={[ta.text_gray_max, a.body_1_lg_medium]}>
        {strings.setupWallet.verifyRecoveryPhraseSuccessMessage}
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
  const {palette: p} = useTheme()

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
      style={[a.p_2xs, a.overflow_hidden, {minHeight: 182}, a.px_lg]}
    >
      <View
        style={[StyleSheet.absoluteFill, {backgroundColor: p.bg_color_max}]}
      />

      <View
        style={[
          a.border,
          {
            borderColor: p.primary_200,
            backgroundColor: p.bg_color_max,
            borderRadius: 6,
          },
          {minHeight: 182},

          a.overflow_hidden,
          a.p_xs,
        ]}
      >
        <View style={[a.p_sm, a.flex_row, a.flex_wrap, a.gap_sm]}>
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
                style={[a.flex_row, a.align_center, a.gap_2xs]}
              >
                <Animated.View
                  style={[a.flex_row, a.align_center, a.gap_2xs]}
                  layout={Layout}
                  entering={FadeIn}
                  exiting={FadeOut}
                >
                  <View
                    style={[a.px_xs, a.py_xs, a.rounded_md, a.overflow_hidden]}
                  >
                    <Text
                      style={[
                        a.body_1_lg_regular,
                        {
                          color: recoveryWordError
                            ? p.sys_magenta_500
                            : p.text_primary_medium,
                        }, // Red number for errors
                        a.pr_xs,
                      ]}
                    >
                      {(index + 1).toString()}.
                    </Text>
                  </View>

                  <Animated.View
                    layout={Layout}
                    entering={FadeIn}
                    exiting={FadeOut}
                    style={[
                      a.overflow_hidden,
                      a.px_xs,
                      a.py_xs,
                      {borderRadius: 6},
                      recoveryWordError && {backgroundColor: p.sys_magenta_100},
                    ]}
                  >
                    {!recoveryWordError && (
                      <View
                        style={[
                          a.absolute,
                          a.inset_0,
                          {
                            backgroundColor:
                              isPhraseComplete && isValidPhrase
                                ? p.secondary_300
                                : p.primary_100,
                          },
                        ]}
                      />
                    )}

                    <Text
                      style={[
                        a.body_1_lg_regular,
                        {
                          color: recoveryWordError
                            ? p.sys_magenta_500
                            : p.text_primary_medium,
                        },
                        a.px_sm,
                        isPhraseComplete &&
                          isValidPhrase && {color: p.black_static},
                      ]}
                    >
                      {entry.word}
                    </Text>
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

  const {palette: p} = useTheme()

  return (
    <Animated.View layout={Layout} style={[a.flex_row, a.flex_wrap, a.gap_sm]}>
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
              style={[a.py_sm, a.overflow_hidden, {borderRadius: 8}]}
            >
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: !usedError
                      ? p.primary_100
                      : p.sys_magenta_500,
                  },
                ]}
              />

              {isUsed && (
                <View
                  style={[
                    a.absolute,
                    {
                      borderRadius: 6,
                      backgroundColor: p.bg_color_max,
                      left: 2,
                      right: 2,
                      top: 2,
                      bottom: 2,
                    },
                  ]}
                />
              )}

              <WordBadge
                word={entry.word}
                used={isUsed}
                usedError={usedError}
                defaultMnemonic={defaultMnemonic}
                style={{
                  ...a.px_lg,
                }}
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
  const {palette: p} = useTheme()
  return (
    <Animated.View
      layout={Layout}
      entering={FadeIn}
      exiting={FadeOut}
      style={{
        ...a.flex_row,
        ...a.flex_wrap,
      }}
    >
      <Animated.Text
        layout={Layout}
        entering={FadeIn}
        exiting={FadeOut}
        style={[
          {color: p.text_primary_medium, ...a.body_1_lg_regular},
          used &&
            !usedError && {
              color: p.primary_400,
            },
          used && !usedError && {color: p.primary_400},
          recoveryWordError && {
            color: p.sys_magenta_500,
          },
          recoveryWordError && {color: p.sys_magenta_500},
          style,
        ]}
      >
        {word}
      </Animated.Text>
    </Animated.View>
  )
}

type Entry = {id: number; word: string}
