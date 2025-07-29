import {atoms as a, useTheme} from '@yoroi/theme'
import {wordlists} from 'bip39'
import * as React from 'react'
import {
  NativeSyntheticEvent,
  Platform,
  TextInput as RNTextInput,
  ScrollView,
  Text,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from 'react-native'

import {Alert} from '~/ui/AlertIllustration/AlertIllustration'
import {Check2} from '~/ui/Check2Illustration/Check2Illustration'
import {Space} from '~/ui/Space/Space'
import {isEmptyString} from '~/wallets/utils/string'
import {useStrings} from '../../../common/useStrings'
import {MnemonicWordInputRef} from '../RestoreWalletScreen'
import {TextInput} from './TextInput/TextInput'

export const MnemonicInput = ({
  length,
  isValidPhrase,
  suggestedWords,
  setSuggestedWords,
  mnemonicSelectedWords,
  setMnemonicSelectedWords,
  onSelect,
  onFocus,
  mnenonicRefs,
  mnemonic,
  inputErrorsIndexes,
  scrollViewRef,
  onError,
  onClearError,
}: {
  length: number
  isValidPhrase: boolean
  onDone: (phrase: string) => void
  validate?: (text: string) => boolean
  suggestedWords: Array<string>
  setSuggestedWords: React.Dispatch<React.SetStateAction<Array<string>>>
  mnemonicSelectedWords: Array<string>
  setMnemonicSelectedWords: React.Dispatch<React.SetStateAction<Array<string>>>
  onSelect: (index: number, word: string) => void
  onFocus: (index: number) => void
  mnenonicRefs: React.RefObject<MnemonicWordInputRef | null>[]
  inputErrorsIndexes: Array<number>
  mnemonic: string
  scrollViewRef: React.MutableRefObject<ScrollView | null>
  onError: (index: number) => void
  onClearError: (index: number) => void
}) => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  const isMnemonicCompleted = !isEmptyString(mnemonic)
  const error =
    !isValidPhrase && isMnemonicCompleted ? strings.invalidChecksum : ''

  return (
    <View>
      <MnemonicWordsInput
        mnenonicRefs={mnenonicRefs}
        onSelect={onSelect}
        mnemonicSelectedWords={mnemonicSelectedWords}
        isValidPhrase={isValidPhrase}
        suggestedWords={suggestedWords}
        inputErrorsIndexes={inputErrorsIndexes}
        setSuggestedWords={setSuggestedWords}
        onFocus={onFocus}
        onError={onError}
        onClearError={onClearError}
        scrollViewRef={scrollViewRef}
      />

      <Space.Height.lg />

      {!isEmptyString(error) && (
        <View style={[a.flex_row, a.align_center, a.gap_sm]}>
          <Alert />

          <Text style={[a.body_1_lg_regular, {color: p.sys_magenta_500}]}>
            {error}
          </Text>
        </View>
      )}

      {isValidPhrase && (
        <View style={[a.flex_row, a.align_center, a.gap_sm]}>
          <Check2 color={p.secondary_600} />

          <Text style={[a.body_1_lg_medium, {color: p.gray_max}]}>
            {strings.validChecksum}
          </Text>
        </View>
      )}

      {!isMnemonicCompleted && (
        <ClearAllButton
          onPress={() => {
            setMnemonicSelectedWords(Array.from({length}).map(() => ''))
            mnenonicRefs.forEach((ref) => ref.current?.selectWord(''))
            mnenonicRefs[0].current?.focus()
          }}
          testID="clearAll-button"
        />
      )}

      <Space.Height.lg />
    </View>
  )
}

const ClearAllButton = ({
  onPress,
  testID,
}: {
  onPress: () => void
  testID?: string
}) => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <View style={[a.flex_row, a.align_center, a.gap_sm]} testID={testID}>
      <TouchableOpacity activeOpacity={0.5} onPress={onPress}>
        <Text
          style={[
            a.button_2_md,
            a.pl_sm,
            {color: p.text_primary_medium, textTransform: 'uppercase'},
          ]}
        >
          {strings.clearAll}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

type MnemonicWordsInputProps = {
  mnenonicRefs: React.RefObject<MnemonicWordInputRef | null>[]
  mnemonicSelectedWords: Array<string>
  isValidPhrase: boolean
  suggestedWords: Array<string>
  inputErrorsIndexes: Array<number>
  scrollViewRef: React.MutableRefObject<ScrollView | null>
  onSelect: (index: number, word: string) => void
  setSuggestedWords: (suggestedWord: Array<string>) => void
  onFocus: (index: number) => void
  onError: (index: number) => void
  onClearError: (index: number) => void
}
const MnemonicWordsInput = ({
  mnemonicSelectedWords,
  mnenonicRefs,
  isValidPhrase = false,
  suggestedWords,
  inputErrorsIndexes,
  scrollViewRef,
  onSelect,
  setSuggestedWords,
  onFocus,
  onError,
  onClearError,
}: MnemonicWordsInputProps) => {
  const rowHeightRef = React.useRef<number | null>(null)
  const {palette: p} = useTheme()

  useAutoFocus(mnenonicRefs[0])

  return (
    <View
      style={[a.flex_row, a.flex_wrap, {justifyContent: 'space-around'}]}
      testID="mnemonicInputsView"
    >
      {mnemonicSelectedWords.map((word, index) => {
        const error = inputErrorsIndexes.includes(index)

        return (
          <View
            key={index}
            style={[
              a.flex_row,
              a.align_center,
              a.align_center,
              a.py_2xs,
              a.px_xs,
              {justifyContent: 'space-evenly', width: '50%'},
            ]}
            onLayout={({nativeEvent}) =>
              (rowHeightRef.current = nativeEvent.layout.height)
            }
            testID={`mnemonicInput${index}`}
          >
            <Text
              style={[
                {
                  color: p.text_primary_medium,
                },
                a.body_1_lg_regular,
              ]}
            >
              {index + 1}.
            </Text>

            <MnemonicWordInput
              selectedWord={word}
              index={index}
              suggestedWords={suggestedWords}
              setSuggestedWords={setSuggestedWords}
              ref={mnenonicRefs[index]}
              onSelect={(word: string) => {
                onSelect(index, word)
              }}
              onFocus={() => {
                if (rowHeightRef.current == null) return
                const columnNumber = index % 3
                const rowNumber = (index - columnNumber) / 3
                scrollViewRef?.current?.scrollTo({
                  y: rowNumber * rowHeightRef.current,
                })

                onFocus(index)
              }}
              isValidPhrase={isValidPhrase}
              onKeyPress={(currentWord: string) => {
                if (
                  mnenonicRefs[index].current &&
                  isEmptyString(currentWord) &&
                  index > 0
                ) {
                  mnenonicRefs[index - 1]?.current?.focus()
                }
              }}
              onError={() => onError(index)}
              onClearError={() => onClearError(index)}
              error={error}
            />
          </View>
        )
      })}

      {mnemonicSelectedWords.length === 15 && (
        <View
          style={[
            a.flex_row,
            a.align_center,
            a.align_center,
            a.py_2xs,
            a.px_xs,
            {justifyContent: 'space-evenly', width: '50%'},
          ]}
        />
      )}
    </View>
  )
}

type MnemonicWordInputProps = {
  onSelect: (word: string) => void
  onFocus: () => void
  onKeyPress: (word: string) => void
  isValidPhrase: boolean
  selectedWord: string
  index: number
  suggestedWords: Array<string>
  setSuggestedWords: (suggestedWord: Array<string>) => void
  onError: (error: string) => void
  onClearError: () => void
  error: boolean
}

const MnemonicWordInput = React.forwardRef<
  MnemonicWordInputRef,
  MnemonicWordInputProps
>(
  (
    {
      onSelect,
      onFocus,
      isValidPhrase = false,
      onKeyPress,
      selectedWord,
      suggestedWords,
      setSuggestedWords,
      onError,
      onClearError,
      error,
    },
    ref,
  ) => {
    const inputRef = React.useRef<RNTextInput>(null)
    const [word, setWord] = React.useState(selectedWord)
    const {isDark, palette: p} = useTheme()

    React.useImperativeHandle(
      ref,
      () => ({
        selectWord: setWord,
        focus: () => inputRef.current?.focus(),
      }),
      [],
    )

    const handleOnSubmitEditing = React.useCallback(() => {
      if (!isEmptyString(suggestedWords[0])) {
        onSelect(normalizeText(suggestedWords[0]))
      }
    }, [suggestedWords, onSelect])

    const handleOnChangeText = React.useCallback(
      (text: string) => {
        if (text.endsWith(' ')) {
          text = text.trimEnd()
          setWord(normalizeText(text))
          handleOnSubmitEditing()
        } else {
          setWord(normalizeText(text))
        }

        if (!isEmptyString(text)) {
          const suggestedWords = getMatchingWords(text)
          setSuggestedWords(suggestedWords)

          if (suggestedWords.length <= 0) {
            onError('error')
          } else {
            onClearError()
          }
        } else {
          setSuggestedWords([])
          onClearError()
        }
      },
      [onClearError, onError, handleOnSubmitEditing, setSuggestedWords],
    )

    const handleOnBlur = React.useCallback(() => {
      if (word !== selectedWord) {
        handleOnSubmitEditing()
      }
      setSuggestedWords([])
    }, [handleOnSubmitEditing, selectedWord, setSuggestedWords, word])

    return (
      <TextInput
        ref={inputRef}
        value={word}
        onFocus={(e: {
          currentTarget: {
            setNativeProps: (arg0: {
              selection: {start: number; end: number}
            }) => void
          }
        }) => {
          // selectTextOnFocus is buggy on ios
          if (Platform.OS === 'ios') {
            e.currentTarget.setNativeProps({
              selection: {start: 0, end: word?.length},
            })
          }

          onFocus()
        }}
        onChangeText={handleOnChangeText}
        enablesReturnKeyAutomatically
        blurOnSubmit={false}
        onSubmitEditing={handleOnSubmitEditing}
        dense
        selectTextOnFocus
        noHelper
        errorDelay={0}
        errorText={error ? 'error' : ''}
        autoCorrect={false}
        spellCheck={false}
        autoComplete="off"
        style={[{minWidth: 143}, a.flex_1, a.text_center]}
        isValidPhrase={isValidPhrase}
        showErrorOnBlur={false}
        onKeyPress={({
          nativeEvent: {key},
        }: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
          if (key === 'Backspace') {
            onKeyPress(word)
          }
        }}
        onBlur={handleOnBlur}
        cursorColor={p.primary_600} // only works for android
        selectionColor={
          Platform.OS === 'android' ? p.input_selected : undefined
        } // on ios, selectionColor changes cursor and selection
        keyboardType={
          Platform.OS === 'android' ? 'visible-password' : undefined
        } // to hide keyboard suggestions on android
        keyboardAppearance={isDark ? 'dark' : 'light'} // ios feature
      />
    )
  },
)

const normalizeText = (text: string) => {
  const NON_LOWERCASE_LETTERS = /[^a-z]+/g

  return text.trim().toLowerCase().replace(NON_LOWERCASE_LETTERS, '')
}
const getMatchingWords = (targetWord: string) =>
  (wordlists.EN as Array<string>).filter((word) =>
    word.startsWith(normalizeText(targetWord)),
  )

const useAutoFocus = (ref: React.RefObject<MnemonicWordInputRef | null>) =>
  React.useEffect(() => {
    const timeout = setTimeout(() => ref.current?.focus(), 100)

    return () => clearTimeout(timeout)
  }, [ref])
