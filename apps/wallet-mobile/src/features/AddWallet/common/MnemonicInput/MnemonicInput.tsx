import {useTheme} from '@yoroi/theme'
import {validateMnemonic, wordlists} from 'bip39'
import * as React from 'react'
import {Keyboard, ScrollView, StyleSheet, Text, TextInput as RNTextInput, View} from 'react-native'

import {Menu, useScrollView} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
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
    if (mnemonicWordsComplete && isValid) {
      Keyboard.dismiss()
      onDone(mnemonicWords.join(' '))
    }
  }, [mnemonicWordsComplete, isValid, mnemonicWords, onDone])

  return (
    <View>
      <MnemonicWordsInput onSelect={onSelect} words={mnemonicWords} isPhraseValid={isValid && mnemonicWordsComplete} />

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
    </View>
  )
}

type MnemonicWordsInputProps = {
  words: Array<string>
  onSelect: (index: number, word: string) => void
  isPhraseValid: boolean
}
const MnemonicWordsInput = ({onSelect, words, isPhraseValid = false}: MnemonicWordsInputProps) => {
  const {styles} = useStyles()
  const refs = React.useRef(words.map(() => React.createRef<RNTextInput>())).current
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
  isPhraseValid: boolean
}

const MnemonicWordInput = React.forwardRef<RNTextInput, MnemonicWordInputProps>(
  ({onSelect, onFocus, isPhraseValid = false}, ref) => {
    const {styles} = useStyles()
    const [word, setWord] = React.useState('')
    const matchingWords = React.useMemo(() => (!isEmptyString(word) ? getMatchingWords(word) : []), [word])
    const [menuEnabled, setMenuEnabled] = React.useState(false)
    const dateTime = React.useRef<number>()

    const selectWord = (word: string) => {
      setWord(normalizeText(word))
      onSelect(normalizeText(word))

      if (dateTime.current == null) throw new Error()
      setTimeout(() => {
        setMenuEnabled(false)
      }, 1000 - (Date.now() - dateTime.current)) // RNP.Menu has a buggy show/hide
    }

    const onSubmitEditing = () => {
      if (!isEmptyString(matchingWords[0])) {
        setWord(matchingWords[0])
        selectWord(matchingWords[0])
      }
    }

    return (
      <Menu
        style={styles.menu}
        contentStyle={styles.menuContent}
        anchor={
          <TextInput
            ref={ref}
            value={word}
            onFocus={onFocus}
            onChange={() => {
              setMenuEnabled(true)
              dateTime.current = Date.now()
            }}
            onChangeText={(word) => setWord(normalizeText(word))}
            enablesReturnKeyAutomatically
            blurOnSubmit={false}
            onSubmitEditing={onSubmitEditing}
            dense
            noHelper
            errorDelay={0}
            errorText={matchingWords.length <= 0 ? 'No matching words' : ''}
            autoComplete="off"
            style={styles.textInput}
            isPhraseValid={isPhraseValid}
          />
        }
        visible={menuEnabled && word.length > 0 && !isEmptyString(word)}
        onDismiss={() => {
          setMenuEnabled(false)
          setWord('')
        }}
      >
        <ScrollView style={styles.menuScrollView} keyboardShouldPersistTaps="always">
          {matchingWords.map((word) => (
            <Menu.Item
              titleStyle={styles.menuItemText}
              style={matchingWords[0] === word && styles.menuItem}
              key={word}
              title={word}
              onPress={() => selectWord(word)}
            />
          ))}
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
      marginTop: ROW_HEIGHT,
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
  })

  const colors = {
    gradientBlueGreen: theme.color.gradients['blue-green'],
    gradientGreen: theme.color.gradients['green'],
  }
  return {styles, colors} as const
}
