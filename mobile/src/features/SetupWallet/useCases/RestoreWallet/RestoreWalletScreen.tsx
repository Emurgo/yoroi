import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'

import {useNavigation} from '@react-navigation/native'
import {validateMnemonic} from 'bip39'
import * as React from 'react'
import {Keyboard, Text, TouchableOpacity, View} from 'react-native'
import {FlatList, ScrollView} from 'react-native-gesture-handler'

import {usePageViewTracking} from '~/features/Analytics/hooks/usePageViewTracking'
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

  usePageViewTracking('Restore Wallet Enter Phrase Step Viewed')

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
    mnenonicRefs[index]?.current?.selectWord(isEmptyString(word) ? '' : word)

    const mnemonicWordsComplete = newWords.every(Boolean)
    const isValid: boolean = mnemonicWordsComplete
      ? validateMnemonic(newWords.join(' '))
      : false

    if (mnemonicWordsComplete && isValid) {
      Keyboard.dismiss()
      setIsValidPhrase(true)
      setMnemonic(newWords.join(' '))

      return
    }

    if (mnemonicWordsComplete && !isValid) {
      setIsValidPhrase(false)
      setMnemonic(newWords.join(' '))

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

const WordSuggestionList = ({
  data,
  index,
  onSelect,
}: {
  data: Array<string>
  index: number
  onSelect: (index: number, word: string) => void
}) => {
  const {palette: p, atoms: ta} = useTheme()

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
      <Text style={[ta.text_primary_medium, a.body_1_lg_regular]}>{title}</Text>
    </TouchableOpacity>
  )
}
