import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import {validateMnemonic} from 'bip39'
import * as React from 'react'
import {Keyboard, StyleSheet, Text, View} from 'react-native'
import {FlatList, ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, KeyboardAvoidingView, useModal} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {StepperProgress} from '../../../../components/StepperProgress/StepperProgress'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {SetupWalletRouteNavigation} from '../../../../kernel/navigation'
import {isEmptyString} from '../../../../kernel/utils'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {useStrings} from '../../common/useStrings'
import {WalletDuplicatedModal} from '../../common/WalletDuplicatedModal/WalletDuplicatedModal'
import {MnemonicInput} from './MnemonicInput/MnemonicInput'

export type MnemonicWordInputRef = {
  focus: () => void
  selectWord: (matchingWord: string) => void
}

export const RestoreWalletScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const bold = useBold()
  const [mnemonic, setMnemonic] = React.useState('')
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const {publicKeyHexChanged, mnemonicChanged, mnemonicType, walletImplementation, accountVisual} = useSetupWallet()
  const {track} = useMetrics()
  const {walletManager} = useWalletManager()
  const {openModal} = useModal()
  const [focusedIndex, setFocusedIndex] = React.useState<number>(0)
  const [isValidPhrase, setIsValidPhrase] = React.useState(false)

  if (mnemonicType === null) throw new Error('mnemonicType missing')

  const [suggestedWords, setSuggestedWords] = React.useState<Array<string>>([])
  const [mnemonicSelectedWords, setMnemonicSelectedWords] = React.useState<Array<string>>(
    Array.from({length: mnemonicType}).map(() => ''),
  )
  const [inputErrorsIndexes, setInputErrorsIndexes] = React.useState<Array<number>>([])
  const hasFocusedInputError = inputErrorsIndexes.find((index) => index === focusedIndex) !== undefined

  const onError = (indexToAdd: number) => {
    const newInputErrors = [...inputErrorsIndexes, indexToAdd]
    setInputErrorsIndexes(newInputErrors)
  }

  const onClearError = (indexToRemove: number) => {
    const newInputErrors = inputErrorsIndexes.filter((index) => index !== indexToRemove)
    setInputErrorsIndexes(newInputErrors)
  }

  const mnenonicRefs = React.useRef(mnemonicSelectedWords.map(() => React.createRef<MnemonicWordInputRef>())).current

  const onSelect = (index: number, word: string) => {
    const newWords = [...mnemonicSelectedWords]
    newWords[index] = word
    setMnemonicSelectedWords(newWords)
    mnenonicRefs[index].current?.selectWord(isEmptyString(word) ? '' : word)

    const mnemonicWordsComplete = newWords.every(Boolean)
    const isValid: boolean = mnemonicWordsComplete ? validateMnemonic(newWords.join(' ')) : false

    if (mnemonicWordsComplete && isValid) {
      Keyboard.dismiss()
      setIsValidPhrase(true)
      setMnemonic(newWords.join(' '))
      track.restoreWalletEnterPhraseStepStatus({recovery_prhase_status: true})

      return
    }

    if (mnemonicWordsComplete && !isValid) {
      setIsValidPhrase(false)
      setMnemonic(newWords.join(' '))
      track.restoreWalletEnterPhraseStepStatus({recovery_prhase_status: false})

      return
    }

    if (!mnemonicWordsComplete) {
      if (isValid) setIsValidPhrase(false)
      if (!isEmptyString(mnemonic)) setMnemonic('')

      const newIndex = index + 1
      mnenonicRefs[newIndex]?.current?.focus()

      return
    }
  }

  const onFocus = (index: number) => {
    setFocusedIndex(index)
  }

  useFocusEffect(
    React.useCallback(() => {
      const recoveryPhraseLenght = String(mnemonicType) as '15' | '24'
      track.restoreWalletEnterPhraseStepViewed({recovery_phrase_lenght: recoveryPhraseLenght})
    }, [mnemonicType, track]),
  )

  const handleOnNext = React.useCallback(async () => {
    const {accountPubKeyHex} = await walletManager.generateWalletKeys(walletImplementation, mnemonic, accountVisual)

    const iswalletDuplicated = walletManager.isWalletAccountDuplicated(accountPubKeyHex)

    if (iswalletDuplicated) {
      openModal(strings.restoreDuplicatedWalletModalTitle, <WalletDuplicatedModal publicKeyHex={accountPubKeyHex} />)

      return
    }

    mnemonicChanged(mnemonic)
    publicKeyHexChanged(accountPubKeyHex)
    navigation.navigate('setup-wallet-restore-details')
  }, [
    accountVisual,
    mnemonic,
    mnemonicChanged,
    navigation,
    openModal,
    publicKeyHexChanged,
    strings.restoreDuplicatedWalletModalTitle,
    walletImplementation,
    walletManager,
  ])

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <KeyboardAvoidingView style={{flex: 1}}>
        <View style={styles.stepper}>
          <StepperProgress currentStep={1} currentStepTitle={strings.stepRestoreWalletScreen} totalSteps={2} />
        </View>

        <ScrollView style={styles.scroll} bounces={false} keyboardShouldPersistTaps="always">
          <Text style={styles.title}>{strings.restoreWalletScreenTitle(bold)}</Text>

          <Space height="lg" />

          <MnemonicInput
            isValidPhrase={isValidPhrase}
            suggestedWords={suggestedWords}
            setSuggestedWords={setSuggestedWords}
            length={mnemonicType}
            onDone={setMnemonic}
            mnemonicSelectedWords={mnemonicSelectedWords}
            setMnemonicSelectedWords={setMnemonicSelectedWords}
            onSelect={onSelect}
            onFocus={onFocus}
            mnemonic={mnemonic}
            mnenonicRefs={mnenonicRefs}
            inputErrorsIndexes={inputErrorsIndexes}
            onError={onError}
            onClearError={onClearError}
          />
        </ScrollView>

        {!isEmptyString(mnemonic) && isValidPhrase && <NextButton onPress={handleOnNext} />}

        {suggestedWords.length > 0 && !hasFocusedInputError && (
          <WordSuggestionList data={suggestedWords} index={focusedIndex} onSelect={onSelect} />
        )}

        {suggestedWords.length === 0 && hasFocusedInputError && (
          <View style={styles.suggestionArea}>
            <Text style={styles.suggestionMessage}>{strings.wordNotFound}</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const NextButton = ({onPress}: {onPress: () => void}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.padding}>
      <Button title={strings.next} style={styles.button} onPress={onPress} testID="setup-restore-step1-next-button" />
    </View>
  )
}

const WordSuggestionList = ({
  data,
  index,
  onSelect,
}: {
  data: Array<string>
  index: number
  onSelect: (index: number, word: string) => void
}) => {
  const {styles} = useStyles()
  return (
    <View style={styles.suggestions}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyboardShouldPersistTaps="always"
        renderItem={({item: word, index: wordIndex}) => (
          <>
            {wordIndex === 0 && <Space width="lg" />}

            <WordSuggestionButton
              onPress={() => {
                onSelect(index, word)
              }}
              title={word}
            />

            {wordIndex === data.length - 1 && <Space width="lg" />}
          </>
        )}
        ItemSeparatorComponent={() => <Space width="sm" />}
      />
    </View>
  )
}

const WordSuggestionButton = ({title, onPress}: {title: string; onPress: () => void}) => {
  const {styles} = useStyles()
  return <Button onPress={onPress} style={styles.suggestion} textStyles={styles.suggestionText} title={title} />
}

const useBold = () => {
  const {styles} = useStyles()

  return {
    b: (text: React.ReactNode) => <Text style={styles.bolder}>{text}</Text>,
  }
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: color.bg_color_max,
    },
    title: {
      ...atoms.body_1_lg_regular,
      color: color.gray_900,
    },
    button: {backgroundColor: color.primary_500},
    bolder: {
      ...atoms.body_1_lg_medium,
    },
    stepper: {
      ...atoms.px_lg,
    },
    scroll: {
      ...atoms.p_lg,
    },
    padding: {
      ...atoms.p_lg,
    },
    suggestions: {
      backgroundColor: color.bg_color_max,
      borderColor: color.gray_200,
      borderTopWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 16,
      paddingBottom: 19,
    },
    suggestion: {
      borderColor: color.primary_500,
      borderWidth: 2,
      borderRadius: 8,
      backgroundColor: 'transparent',
    },
    suggestionText: {
      ...atoms.body_1_lg_regular,
      textTransform: 'none',
      color: color.text_primary_max,
    },
    suggestionArea: {
      backgroundColor: color.bg_color_max,
      borderColor: color.gray_200,
      borderTopWidth: 1,
      alignItems: 'center',
      paddingTop: 30,
      paddingBottom: 30,
    },
    suggestionMessage: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_regular,
      ...atoms.text_center,
    },
  })

  const colors = {
    gray900: color.gray_900,
    gradientBlueGreen: color.bg_gradient_1,
  }

  return {styles, colors} as const
}
