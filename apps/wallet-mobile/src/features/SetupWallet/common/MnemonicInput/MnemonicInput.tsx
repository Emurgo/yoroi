import {useTheme} from '@yoroi/theme'
import {validateMnemonic, wordlists} from 'bip39'
import * as React from 'react'
import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import {Menu, Spacer, useScrollView} from '../../../../components'
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
}: {
  length: number
  onDone: (phrase: string) => void
  validate?: (text: string) => boolean
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
}
const MnemonicWordsInput = ({onSelect, words, refs, isPhraseValid = false}: MnemonicWordsInputProps) => {
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
  words: string[]
  index: number
}

const MnemonicWordInput = React.forwardRef<RNTextInput, MnemonicWordInputProps>(
  ({onSelect, onFocus, isPhraseValid = false, onKeyPress, words, index}, ref) => {
    const {styles} = useStyles()
    const strings = useStrings()
    const [word, setWord] = React.useState(words[index])
    const [menuEnabled, setMenuEnabled] = React.useState(false)
    const dateTime = React.useRef<number>()
    const [error, setError] = React.useState('')
    const [matchingWords, setMatchingWords] = React.useState<Array<string>>([])

    const selectWord = React.useCallback(
      (matchingWord: string) => {
        setWord(normalizeText(matchingWord))
        onSelect(normalizeText(matchingWord))

        if (dateTime.current == null) throw new Error()
        setTimeout(() => {
          setMenuEnabled(false)
        }, 1000 - (Date.now() - dateTime.current)) // RNP.Menu has a buggy show/hide
      },
      [onSelect],
    )

    const onSubmitEditing = React.useCallback(() => {
      if (!isEmptyString(matchingWords[0])) {
        selectWord(matchingWords[0])
      }
    }, [matchingWords, selectWord])

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
          const matchingWords = getMatchingWords(text)
          setMatchingWords(matchingWords)

          if (matchingWords.length <= 0) {
            setError('error')
          } else if (error !== '') setError('')
        } else setMatchingWords([])
      },
      [error, onSubmitEditing],
    )

    React.useEffect(() => {
      if (isEmptyString(words[index])) {
        setWord('')
      }
    }, [index, words])

    return (
      <Menu
        style={styles.menu}
        contentStyle={styles.menuContent}
        anchor={
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
            onChange={() => {
              setMenuEnabled(true)
              dateTime.current = Date.now()
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
        }
        visible={menuEnabled && word.length > 0 && !isEmptyString(word)}
        onDismiss={() => {
          setMenuEnabled(false)
          setWord('')
        }}
      >
        <ScrollView style={styles.menuScrollView} keyboardShouldPersistTaps="always">
          {matchingWords.length !== 0 ? (
            matchingWords.map((word) => (
              <Menu.Item
                titleStyle={styles.menuItemText}
                style={matchingWords[0] === word && styles.menuItem}
                key={word}
                title={word}
                onPress={() => selectWord(word)}
              />
            ))
          ) : (
            <Menu.Item
              titleStyle={styles.menuItemText}
              style={matchingWords[0] === word && styles.menuItem}
              title={strings.notFound}
            />
          )}
        </ScrollView>
      </Menu>
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
  const ROW_HEIGHT = 50
  const styles = StyleSheet.create({
    menu: {
      paddingTop: Platform.OS === 'ios' ? ROW_HEIGHT : ROW_HEIGHT / 2,
      minWidth: 143,
    },
    menuContent: {
      backgroundColor: theme.color['white-static'],
      borderRadius: 8,
    },
    menuScrollView: {
      maxHeight: ROW_HEIGHT * 3.5,
    },
    menuItemText: {
      color: theme.color.gray[600],
    },
    menuItem: {
      backgroundColor: theme.color.gray[50],
    },
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
