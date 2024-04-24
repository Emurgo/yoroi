import {useTheme} from '@yoroi/theme'
import {validateMnemonic, wordlists} from 'bip39'
import * as React from 'react'
import {Keyboard, Platform, StyleSheet, Text, TextInput as RNTextInput, TouchableOpacity, View} from 'react-native'

import {Spacer, useScrollView} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {useMetrics} from '../../../../metrics/metricsManager'
import {isEmptyString} from '../../../../utils/utils'
import {Alert as AlertIllustration} from '../../illustrations/Alert'
import {Check2} from '../../illustrations/Check2'
import {TextInput} from '../TextInput'
import {useStrings} from '../useStrings'

export const MnemonicInput = ({
  length,
  onDone,
  validate = validateMnemonic,
  suggestedWords,
  setSuggestedWords,
}: {
  length: number
  onDone: (phrase: string) => void
  validate?: (text: string) => boolean
  suggestedWords: Array<string>
  setSuggestedWords: (suggestedWord: Array<string>) => void
}) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const [mnemonicWords, setMnemonicWords] = React.useState<Array<string>>(Array.from({length}).map(() => ''))
  const {track} = useMetrics()
  const refs = React.useRef(mnemonicWords.map(() => React.createRef<RNTextInput>())).current

  const mnemonicWordsComplete = mnemonicWords.every(Boolean)
  const isValid: boolean = mnemonicWordsComplete ? validate(mnemonicWords.join(' ')) : false
  const errorText = !isValid && mnemonicWordsComplete ? strings.invalidChecksum : ''

  const onSelect = (index: number, word: string) =>
    setMnemonicWords((words) => {
      const newWords = [...words]
      newWords[index] = word

      return newWords
    })

  React.useEffect(() => {
    if (mnemonicWordsComplete) {
      if (isValid) {
        track.restoreWalletEnterPhraseStepStatus({recovery_prhase_status: true})
        Keyboard.dismiss()
        onDone(mnemonicWords.join(' '))
      } else {
        track.restoreWalletEnterPhraseStepStatus({recovery_prhase_status: false})
        onDone('')
      }
    }
  }, [mnemonicWordsComplete, isValid, mnemonicWords, onDone, track])

  return (
    <View>
      <MnemonicWordsInput
        refs={refs}
        onSelect={onSelect}
        words={mnemonicWords}
        isPhraseValid={isValid && mnemonicWordsComplete}
        suggestedWords={suggestedWords}
        setSuggestedWords={setSuggestedWords}
      />

      <Space height="l" />

      {!isValid && mnemonicWordsComplete && (
        <View style={styles.textView}>
          <AlertIllustration />

          <Text style={styles.errorText}>{errorText}</Text>
        </View>
      )}

      {isValid && mnemonicWordsComplete && (
        <View style={[styles.textView]}>
          <Check2 />

          <Text style={styles.successText}>{strings.validChecksum}</Text>
        </View>
      )}

      {!mnemonicWordsComplete && (
        <TouchableOpacity
          activeOpacity={0.5}
          style={[styles.textView]}
          onPress={() => {
            setMnemonicWords(Array.from({length}).map(() => ''))
            refs[0].current?.focus()
          }}
        >
          <Text style={styles.clearAll}>{strings.clearAll}</Text>
        </TouchableOpacity>
      )}

      <Spacer height={50} />
    </View>
  )
}

type MnemonicWordsInputProps = {
  refs: React.RefObject<RNTextInput>[]
  words: Array<string>
  onSelect: (index: number, word: string) => void
  isPhraseValid: boolean
  suggestedWords: Array<string>
  setSuggestedWords: (suggestedWord: Array<string>) => void
}
const MnemonicWordsInput = ({
  onSelect,
  words,
  refs,
  isPhraseValid = false,
  suggestedWords,
  setSuggestedWords,
}: MnemonicWordsInputProps) => {
  const {styles} = useStyles()
  const scrollView = useScrollView()
  const rowHeightRef = React.useRef<number | void>()

  useAutoFocus(refs[0])

  return (
    <View style={styles.mnemonicInputView} testID="mnemonicInputsView">
      {words.map((word, index) => (
        <View
          key={index}
          style={styles.mnemonicInput}
          onLayout={({nativeEvent}) => (rowHeightRef.current = nativeEvent.layout.height)}
          testID={`mnemonicInput${index}`}
        >
          <Text style={styles.mnemonicIndex}>{index + 1}.</Text>

          <MnemonicWordInput
            words={words}
            index={index}
            suggestedWords={suggestedWords}
            setSuggestedWords={setSuggestedWords}
            ref={refs[index]}
            onSelect={(word: string) => {
              onSelect(index, word)
              refs[index + 1]?.current?.focus()
            }}
            onFocus={() => {
              if (rowHeightRef.current == null) return
              const columnNumber = index % 3
              const rowNumber = (index - columnNumber) / 3
              scrollView?.scrollTo({y: rowNumber * rowHeightRef.current})
            }}
            isPhraseValid={isPhraseValid}
            onKeyPress={(currentWord: string) => {
              if (refs[index].current && isEmptyString(currentWord) && index > 0) {
                refs[index - 1]?.current?.focus()
              }
            }}
          />
        </View>
      ))}

      {words.length === 15 && <View style={styles.mnemonicInput} />}
    </View>
  )
}

type MnemonicWordInputProps = {
  onSelect: (word: string) => void
  onFocus: () => void
  onKeyPress: (word: string) => void
  isPhraseValid: boolean
  words: Array<string>
  index: number
  suggestedWords: Array<string>
  setSuggestedWords: (suggestedWord: Array<string>) => void
}

const MnemonicWordInput = React.forwardRef<RNTextInput, MnemonicWordInputProps>(
  ({onSelect, onFocus, isPhraseValid = false, onKeyPress, words, index, suggestedWords, setSuggestedWords}, ref) => {
    const {styles} = useStyles()
    const [word, setWord] = React.useState(words[index])
    const [error, setError] = React.useState('')

    const selectWord = React.useCallback(
      (matchingWord: string) => {
        setWord(normalizeText(matchingWord))
        onSelect(normalizeText(matchingWord))
      },
      [onSelect],
    )

    const onSubmitEditing = React.useCallback(() => {
      if (!isEmptyString(suggestedWords[0])) {
        selectWord(suggestedWords[0])
      }
    }, [suggestedWords, selectWord])

    const onChangeText = React.useCallback(
      (text: string) => {
        if (text.endsWith(' ')) {
          text = text.trimEnd()
          setWord(normalizeText(text))
          onSubmitEditing()
        } else {
          setWord(normalizeText(text))
        }

        if (!isEmptyString(text)) {
          const suggestedWords = getMatchingWords(text)
          setSuggestedWords(suggestedWords)

          if (suggestedWords.length <= 0) {
            setError('error')
          } else if (error !== '') setError('')
        } else setSuggestedWords([])
      },
      [error, onSubmitEditing, setSuggestedWords],
    )

    React.useEffect(() => {
      if (isEmptyString(words[index])) {
        setWord('')
      }
    }, [index, words])

    return (
      <TextInput
        ref={ref}
        value={word}
        onFocus={(e) => {
          // selectTextOnFocus buggy on ios

          if (Platform.OS === 'ios') {
            e.currentTarget.setNativeProps({
              selection: {start: 0, end: word?.length},
            })
          }

          onFocus()
        }}
        onChangeText={onChangeText}
        enablesReturnKeyAutomatically
        blurOnSubmit={false}
        onSubmitEditing={onSubmitEditing}
        dense
        selectTextOnFocus
        noHelper
        errorDelay={0}
        errorText={error}
        autoCorrect={false}
        spellCheck={false}
        autoComplete="off"
        style={styles.textInput}
        isPhraseValid={isPhraseValid}
        showErrorOnBlur={false}
        onKeyPress={({nativeEvent}) => {
          if (nativeEvent.key === 'Backspace') {
            onKeyPress(word)
          }
        }}
        onBlur={() => {
          setError('')
        }}
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

const useAutoFocus = (ref: React.RefObject<RNTextInput>) =>
  React.useEffect(() => {
    const timeout = setTimeout(() => ref.current?.focus(), 100)

    return () => clearTimeout(timeout)
  }, [ref])

const useStyles = () => {
  const {theme} = useTheme()
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
      ...theme.padding['x-xs'],
      ...theme.padding['y-xxs'],
    },
    textInput: {
      minWidth: 143,
      flex: 1,
      textAlign: 'center',
    },
    mnemonicIndex: {
      color: theme.color.primary[400],
      ...theme.typography['body-1-l-regular'],
    },
    textView: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    errorText: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.magenta[500],
    },
    successText: {
      ...theme.typography['body-1-l-medium'],
      color: theme.color.gray.max,
    },
    clearAll: {
      ...theme.typography['button-2-m'],
      ...theme.padding['l-s'],
      color: theme.color.primary[500],
      textTransform: 'uppercase',
    },
  })
  return {styles} as const
}
