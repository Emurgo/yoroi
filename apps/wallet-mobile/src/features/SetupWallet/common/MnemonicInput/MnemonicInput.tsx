import {useTheme} from '@yoroi/theme'
import {wordlists} from 'bip39'
import * as React from 'react'
import {Platform, StyleSheet, Text, TextInput as RNTextInput, TouchableOpacity, View} from 'react-native'

import {Spacer, useScrollView} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {isEmptyString} from '../../../../utils/utils'
import {Alert as AlertIllustration} from '../../illustrations/Alert'
import {Check2} from '../../illustrations/Check2'
import {MnemonicWordInputRef} from '../../useCases/RestoreWallet/RestoreWalletScreen'
import {TextInput} from '../TextInput'
import {useStrings} from '../useStrings'

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
  mnemonic: string
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
        setSuggestedWords={setSuggestedWords}
        onFocus={onFocus}
      />

      <Space height="l" />

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
    <TouchableOpacity activeOpacity={0.5} style={styles.textView} onPress={onPress}>
      <Text style={styles.clearAll}>{strings.clearAll}</Text>
    </TouchableOpacity>
  )
}

type MnemonicWordsInputProps = {
  mnenonicRefs: React.RefObject<MnemonicWordInputRef>[]
  mnemonicSelectedWords: Array<string>
  onSelect: (index: number, word: string) => void
  isValidPhrase: boolean
  suggestedWords: Array<string>
  setSuggestedWords: (suggestedWord: Array<string>) => void
  onFocus: (index: number) => void
}
const MnemonicWordsInput = ({
  onSelect,
  mnemonicSelectedWords,
  mnenonicRefs,
  isValidPhrase = false,
  suggestedWords,
  setSuggestedWords,
  onFocus,
}: MnemonicWordsInputProps) => {
  const {styles} = useStyles()
  const scrollView = useScrollView()
  const rowHeightRef = React.useRef<number | void>()

  useAutoFocus(mnenonicRefs[0])

  return (
    <View style={styles.mnemonicInputView} testID="mnemonicInputsView">
      {mnemonicSelectedWords.map((_, index) => (
        <View
          key={index}
          style={styles.mnemonicInput}
          onLayout={({nativeEvent}) => (rowHeightRef.current = nativeEvent.layout.height)}
          testID={`mnemonicInput${index}`}
        >
          <Text style={styles.mnemonicIndex}>{index + 1}.</Text>

          <MnemonicWordInput
            mnemonicSelectedWords={mnemonicSelectedWords}
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
          />
        </View>
      ))}

      {mnemonicSelectedWords.length === 15 && <View style={styles.mnemonicInput} />}
    </View>
  )
}

type MnemonicWordInputProps = {
  onSelect: (word: string) => void
  onFocus: () => void
  onKeyPress: (word: string) => void
  isValidPhrase: boolean
  mnemonicSelectedWords: Array<string>
  index: number
  suggestedWords: Array<string>
  setSuggestedWords: (suggestedWord: Array<string>) => void
}

const MnemonicWordInput = React.forwardRef<MnemonicWordInputRef, MnemonicWordInputProps>(
  (
    {
      onSelect,
      onFocus,
      isValidPhrase = false,
      onKeyPress,
      mnemonicSelectedWords,
      index,
      suggestedWords,
      setSuggestedWords,
    },
    ref,
  ) => {
    const inputRef = React.useRef<RNTextInput>(null)
    const {styles} = useStyles()
    const [word, setWord] = React.useState(mnemonicSelectedWords[index])
    const [error, setError] = React.useState('')

    React.useImperativeHandle(
      ref,
      () => {
        return {
          selectWord: setWord,
          word: word,
          focus: () => inputRef.current?.focus(),
        }
      },
      [word],
    )

    const onSubmitEditing = React.useCallback(() => {
      if (!isEmptyString(suggestedWords[0])) {
        onSelect(normalizeText(suggestedWords[0]))
      }
    }, [suggestedWords, onSelect])

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
        isValidPhrase={isValidPhrase}
        showErrorOnBlur={false}
        onKeyPress={({nativeEvent}) => {
          if (nativeEvent.key === 'Backspace') {
            onKeyPress(word)
          }
        }}
        onBlur={() => {
          setError('')
        }}
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
