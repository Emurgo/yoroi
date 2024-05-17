import {useTheme} from '@yoroi/theme'
import {wordlists} from 'bip39'
import * as React from 'react'
import {Platform, StyleSheet, Text, TextInput as RNTextInput, TouchableOpacity, View} from 'react-native'

import {Spacer, useScrollView} from '../../../../../components'
import {Space} from '../../../../../components/Space/Space'
import {isEmptyString} from '../../../../../utils/utils'
import {TextInput} from '../../../common/TextInput'
import {useStrings} from '../../../common/useStrings'
import {Alert as AlertIllustration} from '../../../illustrations/Alert'
import {Check2} from '../../../illustrations/Check2'
import {MnemonicWordInputRef} from '../RestoreWalletScreen'

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
  mnenonicRefs: React.RefObject<MnemonicWordInputRef>[]
  inputErrorsIndexes: Array<number>
  mnemonic: string
  onError: (index: number) => void
  onClearError: (index: number) => void
}) => {
  const strings = useStrings()
  const {styles} = useStyles()

  const isMnemonicCompleted = !isEmptyString(mnemonic)
  const error = !isValidPhrase && isMnemonicCompleted ? strings.invalidChecksum : ''

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
      />

      <Space height="lg" />

      {!isEmptyString(error) && (
        <View style={styles.textView}>
          <AlertIllustration />

          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isValidPhrase && (
        <View style={[styles.textView]}>
          <Check2 />

          <Text style={styles.successText}>{strings.validChecksum}</Text>
        </View>
      )}

      {!isMnemonicCompleted && (
        <ClearAllButton
          onPress={() => {
            setMnemonicSelectedWords(Array.from({length}).map(() => ''))
            mnenonicRefs.forEach((ref) => ref.current?.selectWord(''))
            mnenonicRefs[0].current?.focus()
          }}
        />
      )}

      <Spacer height={50} />
    </View>
  )
}

const ClearAllButton = ({onPress}: {onPress: () => void}) => {
  const {styles} = useStyles()
  const strings = useStrings()
  return (
    <View style={styles.textView}>
      <TouchableOpacity activeOpacity={0.5} onPress={onPress}>
        <Text style={styles.clearAll}>{strings.clearAll}</Text>
      </TouchableOpacity>
    </View>
  )
}

type MnemonicWordsInputProps = {
  mnenonicRefs: React.RefObject<MnemonicWordInputRef>[]
  mnemonicSelectedWords: Array<string>
  onSelect: (index: number, word: string) => void
  isValidPhrase: boolean
  suggestedWords: Array<string>
  inputErrorsIndexes: Array<number>
  setSuggestedWords: (suggestedWord: Array<string>) => void
  onFocus: (index: number) => void
  onError: (index: number) => void
  onClearError: (index: number) => void
}
const MnemonicWordsInput = ({
  onSelect,
  mnemonicSelectedWords,
  mnenonicRefs,
  isValidPhrase = false,
  suggestedWords,
  inputErrorsIndexes,
  setSuggestedWords,
  onFocus,
  onError,
  onClearError,
}: MnemonicWordsInputProps) => {
  const {styles} = useStyles()
  const scrollView = useScrollView()
  const rowHeightRef = React.useRef<number | void>()

  useAutoFocus(mnenonicRefs[0])

  return (
    <View style={styles.mnemonicInputView} testID="mnemonicInputsView">
      {mnemonicSelectedWords.map((word, index) => {
        const error = inputErrorsIndexes.includes(index)

        return (
          <View
            key={index}
            style={styles.mnemonicInput}
            onLayout={({nativeEvent}) => (rowHeightRef.current = nativeEvent.layout.height)}
            testID={`mnemonicInput${index}`}
          >
            <Text style={styles.mnemonicIndex}>{index + 1}.</Text>

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
                scrollView?.scrollTo({y: rowNumber * rowHeightRef.current})

                onFocus(index)
              }}
              isValidPhrase={isValidPhrase}
              onKeyPress={(currentWord: string) => {
                if (mnenonicRefs[index].current && isEmptyString(currentWord) && index > 0) {
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

      {mnemonicSelectedWords.length === 15 && <View style={styles.mnemonicInput} />}
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

const MnemonicWordInput = React.forwardRef<MnemonicWordInputRef, MnemonicWordInputProps>(
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
    const {styles, colors} = useStyles()
    const [word, setWord] = React.useState(selectedWord)

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
        onFocus={(e) => {
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
        style={styles.textInput}
        isValidPhrase={isValidPhrase}
        showErrorOnBlur={false}
        onKeyPress={({nativeEvent}) => {
          if (nativeEvent.key === 'Backspace') {
            onKeyPress(word)
          }
        }}
        onBlur={handleOnBlur}
        cursorColor={colors.primary_c600} // only works for android
        selectionColor={Platform.OS === 'android' ? colors.gray_c100 : undefined} // on ios, selectionColor changes cursor and selection
        keyboardType={Platform.OS === 'android' ? 'visible-password' : undefined} // to hide keyboard suggestions on android
      />
    )
  },
)

const normalizeText = (text: string) => {
  const NON_LOWERCASE_LETTERS = /[^a-z]+/g

  return text.trim().toLowerCase().replace(NON_LOWERCASE_LETTERS, '')
}
const getMatchingWords = (targetWord: string) =>
  (wordlists.EN as Array<string>).filter((word) => word.startsWith(normalizeText(targetWord)))

const useAutoFocus = (ref: React.RefObject<MnemonicWordInputRef>) =>
  React.useEffect(() => {
    const timeout = setTimeout(() => ref.current?.focus(), 100)

    return () => clearTimeout(timeout)
  }, [ref])

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    mnemonicInputView: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
    },
    mnemonicInput: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      width: '50%',
      ...atoms.py_2xs,
      ...atoms.px_xs,
    },
    textInput: {
      minWidth: 143,
      flex: 1,
      textAlign: 'center',
    },
    mnemonicIndex: {
      color: color.primary_c400,
      ...atoms.body_1_lg_regular,
    },
    textView: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    errorText: {
      ...atoms.body_1_lg_regular,
      color: color.sys_magenta_c500,
    },
    successText: {
      ...atoms.body_1_lg_medium,
      color: color.gray_cmax,
    },
    clearAll: {
      ...atoms.button_2_md,
      ...atoms.pl_sm,
      color: color.primary_c500,
      textTransform: 'uppercase',
    },
  })
  return {styles, colors: color} as const
}
