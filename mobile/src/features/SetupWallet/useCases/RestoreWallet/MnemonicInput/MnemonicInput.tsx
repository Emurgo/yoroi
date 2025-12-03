import {useDebouncedCallback} from '@yoroi/common'
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

import {useStrings} from '~/kernel/i18n/useStrings'
import {Alert} from '~/ui/AlertIllustration/AlertIllustration'
import {Check2} from '~/ui/Check2Illustration/Check2Illustration'
import {Space} from '~/ui/Space/Space'
import {isEmptyString} from '~/wallets/utils/string'

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
  focusedIndex,
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
  scrollViewRef: React.RefObject<ScrollView | null>
  onError: (index: number) => void
  onClearError: (index: number) => void
  focusedIndex: number
}) => {
  const strings = useStrings()
  const {palette: p, atoms: ta} = useTheme()

  const isMnemonicCompleted = !isEmptyString(mnemonic)
  const error =
    !isValidPhrase && isMnemonicCompleted
      ? strings.setupWallet.invalidChecksum
      : ''

  const handleClearAll = () => {
    setMnemonicSelectedWords(Array.from({length}).map(() => ''))
    mnenonicRefs.forEach((ref) => ref.current?.selectWord(''))
    mnenonicRefs[0]?.current?.focus()
  }

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
        focusedIndex={focusedIndex}
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

          <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
            {strings.setupWallet.validChecksum}
          </Text>
        </View>
      )}

      {!isMnemonicCompleted && (
        <ClearAllButton onPress={handleClearAll} testID="clearAll-button" />
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
  const {atoms: ta} = useTheme()

  return (
    <View style={[a.flex_row, a.align_center, a.gap_sm]} testID={testID}>
      <TouchableOpacity activeOpacity={0.5} onPress={onPress}>
        <Text
          style={[
            a.button_2_md,
            a.pl_sm,
            ta.text_primary_medium,
            {textTransform: 'uppercase'},
          ]}
        >
          {strings.setupWallet.clearAll}
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
  focusedIndex: number
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
  focusedIndex,
}: MnemonicWordsInputProps) => {
  const rowHeightRef = React.useRef<number | null>(null)
  const {atoms: ta} = useTheme()

  useAutoFocus(mnenonicRefs[0])

  const handleSelect = React.useCallback(
    (index: number) => (word: string) => {
      onSelect(index, word)
    },
    [onSelect],
  )

  const handleFocus = React.useCallback(
    (index: number) => () => {
      if (rowHeightRef.current == null) return
      const columnNumber = index % 3
      const rowNumber = (index - columnNumber) / 3
      scrollViewRef?.current?.scrollTo({
        y: rowNumber * rowHeightRef.current,
      })

      onFocus(index)
    },
    [onFocus, scrollViewRef],
  )

  const handleKeyPress = React.useCallback(
    (index: number) => (currentWord: string) => {
      if (
        mnenonicRefs[index]?.current &&
        isEmptyString(currentWord) &&
        index > 0
      ) {
        mnenonicRefs[index - 1]?.current?.focus()
      }
    },
    [mnenonicRefs],
  )

  const handleError = React.useCallback(
    (index: number) => () => {
      onError(index)
    },
    [onError],
  )

  const handleClearError = React.useCallback(
    (index: number) => () => {
      onClearError(index)
    },
    [onClearError],
  )

  return (
    <View
      style={[a.flex_row, a.flex_wrap, {justifyContent: 'space-around'}]}
      testID="mnemonicInputsView"
    >
      {mnemonicSelectedWords.map((word, index) => {
        const error = inputErrorsIndexes.includes(index)
        const isFocused = focusedIndex === index

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
            <Text style={[ta.text_primary_medium, a.body_1_lg_regular]}>
              {index + 1}.
            </Text>

            <MnemonicWordInput
              selectedWord={word}
              index={index}
              isFocused={isFocused}
              suggestedWords={isFocused ? suggestedWords : []}
              setSuggestedWords={setSuggestedWords}
              ref={mnenonicRefs[index]}
              onSelect={handleSelect(index)}
              onFocus={handleFocus(index)}
              isValidPhrase={isValidPhrase}
              onKeyPress={handleKeyPress(index)}
              onError={handleError(index)}
              onClearError={handleClearError(index)}
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
  isFocused: boolean
  suggestedWords: Array<string>
  setSuggestedWords: (suggestedWord: Array<string>) => void
  onError: (error: string) => void
  onClearError: () => void
  error: boolean
}

const MnemonicWordInputComponent = React.forwardRef<
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
      isFocused,
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

    // Sync local state with prop changes
    React.useEffect(() => {
      setWord(selectedWord)
    }, [selectedWord])

    // Update suggestions when this input becomes focused
    React.useEffect(() => {
      if (isValidPhrase) return // Don't update suggestions when phrase is verified
      if (isFocused) {
        if (!isEmptyString(word)) {
          const matches = getMatchingWords(normalizeText(word))
          setSuggestedWords(matches)
        } else {
          setSuggestedWords([])
        }
      }
    }, [isFocused, word, setSuggestedWords, isValidPhrase])

    React.useImperativeHandle(
      ref,
      () => ({
        selectWord: setWord,
        focus: () => inputRef.current?.focus(),
      }),
      [],
    )

    const handleOnSubmitEditing = React.useCallback(() => {
      // If there's a suggested word, use it
      if (!isEmptyString(suggestedWords[0])) {
        const selectedWord = normalizeText(suggestedWords[0] ?? '')
        setWord(selectedWord)
        onSelect(selectedWord)
      } else if (!isEmptyString(word)) {
        // If no suggestion but word exists, check if it's a valid word
        const normalizedWord = normalizeText(word)
        const matches = getMatchingWords(normalizedWord)
        // If it's an exact match (only one match and it's the same), select it
        if (matches.length === 1 && matches[0] === normalizedWord) {
          setWord(normalizedWord)
          onSelect(normalizedWord)
        }
      }
    }, [suggestedWords, word, onSelect])

    // Debounced word matching - only update if this input is focused
    useDebouncedCallback(
      React.useCallback(() => {
        if (isValidPhrase) {
          setSuggestedWords([])
          return
        }
        if (!isFocused) return // Only update suggestions for focused input

        if (!isEmptyString(word)) {
          const matches = getMatchingWords(word)
          setSuggestedWords(matches)

          if (matches.length <= 0) {
            onError('error')
          } else {
            onClearError()
          }
        } else {
          setSuggestedWords([])
          onClearError()
        }
      }, [
        word,
        setSuggestedWords,
        onError,
        onClearError,
        isFocused,
        isValidPhrase,
      ]),
      word,
      100, // 100ms debounce
      false, // Don't skip first render
    )

    const handleOnChangeText = React.useCallback(
      (text: string) => {
        if (text.endsWith(' ')) {
          // Space pressed - try to complete the word
          text = text.trimEnd()
          const normalized = normalizeText(text)
          setWord(normalized)
          handleOnSubmitEditing()
        } else {
          // Regular typing - only update local state
          const normalized = normalizeText(text)
          setWord(normalized)
        }

        // Clear suggestions immediately if empty
        if (isEmptyString(text)) {
          if (isFocused) {
            setSuggestedWords([])
          }
          onClearError()
          onSelect('')
        }
      },
      [
        onClearError,
        handleOnSubmitEditing,
        setSuggestedWords,
        onSelect,
        isFocused,
      ],
    )

    const handleOnBlur = React.useCallback(() => {
      // If word changed and doesn't match selectedWord, try to submit it
      if (word !== selectedWord && !isEmptyString(word)) {
        handleOnSubmitEditing()
      } else if (isEmptyString(word) && !isEmptyString(selectedWord)) {
        // If field was cleared, notify parent
        onSelect('')
      }
    }, [handleOnSubmitEditing, selectedWord, word, onSelect])

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

// Memoize component to prevent unnecessary re-renders
export const MnemonicWordInput = React.memo(
  MnemonicWordInputComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.selectedWord === nextProps.selectedWord &&
      prevProps.error === nextProps.error &&
      prevProps.isValidPhrase === nextProps.isValidPhrase &&
      prevProps.isFocused === nextProps.isFocused &&
      prevProps.suggestedWords === nextProps.suggestedWords
    )
  },
)

const normalizeText = (text: string) => {
  const NON_LOWERCASE_LETTERS = /[^a-z]+/g

  return text.trim().toLowerCase().replace(NON_LOWERCASE_LETTERS, '')
}

// Pre-compute normalized wordlist once at module level for faster lookups
const normalizedWordlist = (wordlists.EN as Array<string>).map(normalizeText)

// Optimized word matching function (uses pre-normalized wordlist)
const getMatchingWords = (targetWord: string) => {
  const normalized = normalizeText(targetWord)
  return normalizedWordlist.filter((word) => word.startsWith(normalized))
}

const useAutoFocus = (
  ref: React.RefObject<MnemonicWordInputRef | null> | undefined,
) =>
  React.useLayoutEffect(() => {
    const timeout = setTimeout(() => ref?.current?.focus(), 100)

    return () => clearTimeout(timeout)
  }, [ref])
