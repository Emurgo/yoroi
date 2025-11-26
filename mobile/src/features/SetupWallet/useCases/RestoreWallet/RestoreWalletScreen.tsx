import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'

import {useNavigation} from '@react-navigation/native'
import {validateMnemonic} from 'bip39'
import * as React from 'react'
import {Keyboard, Text, TouchableOpacity, View} from 'react-native'
import {FlatList, ScrollView} from 'react-native-gesture-handler'

import {WalletDuplicatedModal} from '~/features/SetupWallet/common/WalletDuplicatedModal/WalletDuplicatedModal'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useBold} from '~/hooks/useBold'
import {useStrings} from '~/kernel/i18n/useStrings'
import {android} from '~/kernel/runtime'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {useScrollView} from '~/ui/ScrollView/hooks/useScrollView'
import {Space} from '~/ui/Space/Space'
import {StepperProgress} from '~/ui/StepperProgress/StepperProgress'
import {isEmptyString} from '~/wallets/utils/string'

import {MnemonicInput} from './MnemonicInput/MnemonicInput'

export type MnemonicWordInputRef = {
  focus: () => void
  selectWord: (matchingWord: string) => void
}

export const RestoreWalletScreen = () => {
  const navigation = useNavigation<any>()
  const strings = useStrings()
  const {palette: p, atoms: ta} = useTheme()
  const bold = useBold({style: a.body_1_lg_medium})
  const {openModal} = useModal()
  const {walletManager} = useWalletManager()

  const [mnemonic, setMnemonic] = React.useState('')
  const {
    publicKeyHexChanged,
    mnemonicChanged,
    mnemonicType,
    walletImplementation,
    accountVisual,
  } = useSetupWallet()
  const {scrollViewRef} = useScrollView()
  const [focusedIndex, setFocusedIndex] = React.useState<number>(0)
  const [isValidPhrase, setIsValidPhrase] = React.useState(false)

  if (mnemonicType === null) throw new Error('mnemonicType missing')

  const [suggestedWords, setSuggestedWords] = React.useState<Array<string>>([])
  const [mnemonicSelectedWords, setMnemonicSelectedWords] = React.useState<
    Array<string>
  >(Array.from({length: mnemonicType}).map(() => ''))
  const [inputErrorsIndexes, setInputErrorsIndexes] = React.useState<
    Array<number>
  >([])

  // Memoize hasFocusedInputError to avoid recalculation
  const hasFocusedInputError = React.useMemo(
    () => inputErrorsIndexes.includes(focusedIndex),
    [inputErrorsIndexes, focusedIndex],
  )

  const onError = React.useCallback((indexToAdd: number) => {
    setInputErrorsIndexes((prev) => {
      if (prev.includes(indexToAdd)) return prev
      return [...prev, indexToAdd]
    })
  }, [])

  const onClearError = React.useCallback((indexToRemove: number) => {
    setInputErrorsIndexes((prev) =>
      prev.filter((index) => index !== indexToRemove),
    )
  }, [])

  // Optimize refs array - create once based on mnemonicType
  const mnenonicRefs = React.useMemo(
    () =>
      Array.from({length: mnemonicType}).map(() =>
        React.createRef<MnemonicWordInputRef>(),
      ),
    [mnemonicType],
  )

  // Memoize computed values
  const mnemonicWordsComplete = React.useMemo(
    () => mnemonicSelectedWords.every(Boolean),
    [mnemonicSelectedWords],
  )

  const mnemonicString = React.useMemo(
    () => mnemonicSelectedWords.join(' '),
    [mnemonicSelectedWords],
  )

  // Memoize validation result
  const isValidPhraseMemoized = React.useMemo(() => {
    if (!mnemonicWordsComplete) return false
    return validateMnemonic(mnemonicString)
  }, [mnemonicWordsComplete, mnemonicString])

  // Sync validation state
  React.useEffect(() => {
    setIsValidPhrase(isValidPhraseMemoized)
  }, [isValidPhraseMemoized])

  const onSelect = React.useCallback(
    (index: number, word: string) => {
      const newWords = [...mnemonicSelectedWords]
      newWords[index] = word
      setMnemonicSelectedWords(newWords)
      mnenonicRefs[index]?.current?.selectWord(isEmptyString(word) ? '' : word)

      const newMnemonicWordsComplete = newWords.every(Boolean)
      const newMnemonicString = newWords.join(' ')

      // Only validate if phrase is complete (optimization)
      const isValid: boolean = newMnemonicWordsComplete
        ? validateMnemonic(newMnemonicString)
        : false

      // Batch state updates using React.startTransition for better performance
      React.startTransition(() => {
        if (newMnemonicWordsComplete && isValid) {
          Keyboard.dismiss()
          setMnemonic(newMnemonicString)
          return
        }

        if (newMnemonicWordsComplete && !isValid) {
          setMnemonic(newMnemonicString)
          return
        }

        if (!newMnemonicWordsComplete) {
          if (!isEmptyString(mnemonic)) setMnemonic('')

          const newIndex = index + 1
          mnenonicRefs[newIndex]?.current?.focus()

          return
        }
      })
    },
    [mnemonicSelectedWords, mnenonicRefs, mnemonic],
  )

  const onFocus = React.useCallback((index: number) => {
    setFocusedIndex(index)
  }, [])

  const handleOnNext = React.useCallback(async () => {
    const {accountPubKeyHex} = walletManager.generateWalletKeys(
      walletImplementation,
      mnemonic,
      accountVisual,
    )

    const duplicatedAccountWalletMeta =
      walletManager.findWalletMetadataByPublicKeyHex(accountPubKeyHex)

    if (duplicatedAccountWalletMeta) {
      const {plate, seed} = walletManager.checksum(accountPubKeyHex)

      openModal({
        title: strings.setupWallet.restoreDuplicatedWalletModalTitle,
        content: (
          <WalletDuplicatedModal.Content
            plate={plate}
            seed={seed}
            duplicatedAccountWalletMetaName={duplicatedAccountWalletMeta.name}
          />
        ),
        footer: (
          <WalletDuplicatedModal.Footer
            duplicatedAccountWalletMetaId={duplicatedAccountWalletMeta.id}
          />
        ),
      })

      return
    }

    mnemonicChanged(mnemonic)
    publicKeyHexChanged(accountPubKeyHex)
    navigation.navigate('setup-wallet-restore-details')
  }, [
    strings,
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
    <SafeArea>
      <StepperProgress
        style={[a.px_lg]}
        currentStep={1}
        currentStepTitle={strings.setupWallet.stepRestoreWalletScreen}
        totalSteps={2}
      />

      <ScrollView
        bounces={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={a.p_lg}
        style={a.flex_1}
      >
        <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
          {strings.setupWallet.restoreWalletScreenTitle(bold)}
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
          focusedIndex={focusedIndex}
        />
      </ScrollView>

      {!isEmptyString(mnemonic) && isValidPhrase && (
        <SafeArea.Footer>
          <Button
            title={strings.setupWallet.next}
            onPress={handleOnNext}
            testID="setup-restore-step1-next-button"
          />
        </SafeArea.Footer>
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
          style={[
            ta.bg_color_max,
            a.border_t,
            a.py_sm,
            a.align_center,
            {
              borderColor: p.gray_200,
            },
          ]}
        >
          <Text
            style={[ta.text_gray_medium, a.body_1_lg_regular, a.text_center]}
          >
            {strings.setupWallet.wordNotFound}
          </Text>
        </View>
      )}
    </SafeArea>
  )
}

const WordSuggestionList = React.memo(
  ({
    data,
    index,
    onSelect,
  }: {
    data: Array<string>
    index: number
    onSelect: (index: number, word: string) => void
  }) => {
    const {palette: p, atoms: ta} = useTheme()

    const renderItem = React.useCallback(
      ({item: word, index: wordIndex}: {item: string; index: number}) => (
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
      ),
      [index, onSelect, data.length],
    )

    const ItemSeparator = React.useCallback(() => <Space.Width.sm />, [])

    return (
      <View
        style={[
          ta.bg_color_max,
          a.border_t,
          {
            borderColor: p.gray_200,
            ...android(a.pb_sm),
          },
          a.flex_row,
          a.align_center,
          a.pt_sm,
        ]}
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={data}
          keyboardShouldPersistTaps="always"
          renderItem={renderItem}
          ItemSeparatorComponent={ItemSeparator}
        />
      </View>
    )
  },
)

const WordSuggestionButton = React.memo(
  ({title, onPress}: {title: string; onPress: () => void}) => {
    const {palette: p, atoms: ta} = useTheme()
    return (
      <TouchableOpacity
        style={[
          a.px_lg,
          a.py_sm,
          a.bg_transparent,
          a.rounded_sm,
          {
            borderColor: p.primary_300,
            borderWidth: 2,
          },
        ]}
        onPress={onPress}
      >
        <Text style={[ta.text_primary_medium, a.body_1_lg_regular]}>
          {title}
        </Text>
      </TouchableOpacity>
    )
  },
)
