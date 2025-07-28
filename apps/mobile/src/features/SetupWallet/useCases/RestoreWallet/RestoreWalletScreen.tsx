import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {validateMnemonic} from 'bip39'
import * as React from 'react'
import {
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import {FlatList, ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {Button} from '../../../../ui/Button/Button'
import {KeyboardAvoidingView} from '../../../../ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {useModal} from '../../../../ui/Modal/ModalContext'
import {useScrollView} from '../../../../ui/ScrollView/ScrollView'
import {Space} from '../../../../ui/Space/Space'
import {StepperProgress} from '../../../../ui/StepperProgress/StepperProgress'
import {isEmptyString} from '../../../../wallets/utils/string'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {useStrings} from '../../common/useStrings'
import {WalletDuplicatedModal} from '../../common/WalletDuplicatedModal/WalletDuplicatedModal'
import {MnemonicInput} from './MnemonicInput/MnemonicInput'

export type MnemonicWordInputRef = {
  focus: () => void
  selectWord: (matchingWord: string) => void
}

export const RestoreWalletScreen = () => {
  const strings = useStrings()
  const bold = useBold()
  const [mnemonic, setMnemonic] = React.useState('')
  const navigation = useNavigation<any>()
  const {
    publicKeyHexChanged,
    mnemonicChanged,
    mnemonicType,
    walletImplementation,
    accountVisual,
  } = useSetupWallet()
  const {track} = useMetrics()
  const {walletManager} = useWalletManager()
  const {openModal} = useModal()
  const [focusedIndex, setFocusedIndex] = React.useState<number>(0)
  const [isValidPhrase, setIsValidPhrase] = React.useState(false)
  const {scrollViewRef} = useScrollView()
  const {palette: p} = useTheme()

  if (mnemonicType === null) throw new Error('mnemonicType missing')

  const [suggestedWords, setSuggestedWords] = React.useState<Array<string>>([])
  const [mnemonicSelectedWords, setMnemonicSelectedWords] = React.useState<
    Array<string>
  >(Array.from({length: mnemonicType}).map(() => ''))
  const [inputErrorsIndexes, setInputErrorsIndexes] = React.useState<
    Array<number>
  >([])
  const hasFocusedInputError =
    inputErrorsIndexes.find((index) => index === focusedIndex) !== undefined

  const onError = (indexToAdd: number) => {
    const newInputErrors = [...inputErrorsIndexes, indexToAdd]
    setInputErrorsIndexes(newInputErrors)
  }

  const onClearError = (indexToRemove: number) => {
    const newInputErrors = inputErrorsIndexes.filter(
      (index) => index !== indexToRemove,
    )
    setInputErrorsIndexes(newInputErrors)
  }

  const mnenonicRefs = React.useRef(
    mnemonicSelectedWords.map(() => React.createRef<MnemonicWordInputRef>()),
  ).current

  const onSelect = (index: number, word: string) => {
    const newWords = [...mnemonicSelectedWords]
    newWords[index] = word
    setMnemonicSelectedWords(newWords)
    mnenonicRefs[index].current?.selectWord(isEmptyString(word) ? '' : word)

    const mnemonicWordsComplete = newWords.every(Boolean)
    const isValid: boolean = mnemonicWordsComplete
      ? validateMnemonic(newWords.join(' '))
      : false

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
      track.restoreWalletEnterPhraseStepViewed({
        recovery_phrase_lenght: recoveryPhraseLenght,
      })
    }, [mnemonicType, track]),
  )

  const handleOnNext = React.useCallback(async () => {
    const {accountPubKeyHex} = await walletManager.generateWalletKeys(
      walletImplementation,
      mnemonic,
      accountVisual,
    )

    const duplicatedAccountWalletMeta =
      walletManager.findWalletMetadataByPublicKeyHex(accountPubKeyHex)

    if (duplicatedAccountWalletMeta) {
      const {plate, seed} = walletManager.checksum(accountPubKeyHex)

      openModal({
        // title: strings.restoreDuplicatedWalletModalTitle,
        content: (
          <WalletDuplicatedModal
            plate={plate}
            seed={seed}
            duplicatedAccountWalletMetaName={duplicatedAccountWalletMeta.name}
          />
        ),
        /* footer: (
          <WalletDuplicatedModalActions
            duplicatedAccountWalletMetaId={duplicatedAccountWalletMeta.id}
          />
        ), */
      })

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
    walletImplementation,
    walletManager,
  ])

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[a.flex_1, a.justify_between, {backgroundColor: p.bg_color_max}]}
    >
      <KeyboardAvoidingView style={a.flex_1}>
        <View style={a.px_lg}>
          <StepperProgress
            currentStep={1}
            currentStepTitle={strings.stepRestoreWalletScreen}
            totalSteps={2}
          />
        </View>

        <ScrollView
          style={a.p_lg}
          bounces={false}
          keyboardShouldPersistTaps="always"
        >
          <Text style={[a.body_1_lg_regular, {color: p.gray_900}]}>
            {strings.restoreWalletScreenTitle(bold)}
          </Text>

          <Space.Height.lg />

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
            scrollViewRef={scrollViewRef}
          />
        </ScrollView>

        {!isEmptyString(mnemonic) && isValidPhrase && (
          <NextButton onPress={handleOnNext} />
        )}

        {suggestedWords.length > 0 && !hasFocusedInputError && (
          <WordSuggestionList
            data={suggestedWords}
            index={focusedIndex}
            onSelect={onSelect}
          />
        )}

        {suggestedWords.length === 0 && hasFocusedInputError && (
          <View
            style={{
              backgroundColor: p.bg_color_max,
              borderColor: p.gray_200,
              borderTopWidth: 1,
              paddingTop: 30,
              paddingBottom: 30,
              ...a.align_center,
            }}
          >
            <Text
              style={[
                {
                  color: p.text_gray_medium,
                },
                a.body_1_lg_regular,
                a.text_center,
              ]}
            >
              {strings.wordNotFound}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const NextButton = ({onPress}: {onPress: () => void}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  return (
    <View style={a.p_lg}>
      <Button
        title={strings.next}
        style={{backgroundColor: p.primary_500}}
        onPress={onPress}
        testID="setup-restore-step1-next-button"
      />
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
  const {palette: p} = useTheme()
  const {height: screenHeight} = useWindowDimensions()

  const paddingBottom = React.useMemo(() => {
    if (Platform.OS !== 'ios') return 16
    return screenHeight < 700 ? screenHeight * 0.01 : screenHeight * 0.05
  }, [screenHeight])

  return (
    <View
      style={[
        {
          backgroundColor: p.bg_color_max,
          borderColor: p.gray_200,
          borderTopWidth: 1,
          paddingBottom: paddingBottom,
        },
        a.flex_row,
        a.align_center,
        a.pt_lg,
      ]}
    >
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyboardShouldPersistTaps="always"
        renderItem={({item: word, index: wordIndex}) => (
          <>
            {wordIndex === 0 && <Space.Width.lg />}

            <WordSuggestionButton
              onPress={() => {
                onSelect(index, word)
              }}
              title={word}
            />

            {wordIndex === data.length - 1 && <Space.Width.lg />}
          </>
        )}
        ItemSeparatorComponent={() => <Space.Width.sm />}
      />
    </View>
  )
}

const WordSuggestionButton = ({
  title,
  onPress,
}: {
  title: string
  onPress: () => void
}) => {
  const {palette: p} = useTheme()
  return (
    <TouchableOpacity
      style={[
        a.px_lg,
        a.py_sm,
        {
          borderColor: p.primary_300,
          borderWidth: 2,
          borderRadius: 8,
          backgroundColor: 'transparent',
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          {
            color: p.text_primary_medium,
          },
          a.body_1_lg_regular,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  )
}

const useBold = () => {
  return {
    b: (text: React.ReactNode) => (
      <Text style={a.body_1_lg_medium}>{text}</Text>
    ),
  }
}
