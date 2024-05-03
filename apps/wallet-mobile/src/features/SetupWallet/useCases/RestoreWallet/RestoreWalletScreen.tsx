import {walletChecksum} from '@emurgo/cip4-js'
import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import {Api} from '@yoroi/types'
import {validateMnemonic} from 'bip39'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {InteractionManager, Keyboard, StyleSheet, Text, View} from 'react-native'
import {FlatList, ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Icon, KeyboardAvoidingView, useModal} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {showErrorDialog} from '../../../../dialogs'
import {errorMessages} from '../../../../i18n/global-messages'
import {useMetrics} from '../../../../metrics/metricsManager'
import {useWalletNavigation, WalletInitRouteNavigation} from '../../../../navigation'
import {isEmptyString} from '../../../../utils'
import {useWalletManager} from '../../../../wallet-manager/WalletManagerContext'
import {InvalidState} from '../../../../yoroi-wallets/cardano/errors'
import {makeKeys} from '../../../../yoroi-wallets/cardano/shelley/makeKeys'
import {useOpenWallet, usePlate, useWalletMetas} from '../../../../yoroi-wallets/hooks'
import {useSetSelectedWallet} from '../../../WalletManager/Context/SelectedWalletContext'
import {useSetSelectedWalletMeta} from '../../../WalletManager/Context/SelectedWalletMetaContext'
import {MnemonicInput} from '../../common/MnemonicInput'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
import {useStrings} from '../../common/useStrings'

export type MnemonicWordInputRef = {
  focus: () => void
  selectWord: (matchingWord: string) => void
}

export const RestoreWalletScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const bold = useBold()
  const intl = useIntl()
  const [mnemonic, setMnemonic] = React.useState('')
  const navigation = useNavigation<WalletInitRouteNavigation>()
  const {publicKeyHexChanged, mnemonicChanged, mnemonicType} = useSetupWallet()
  const {track} = useMetrics()
  const walletManager = useWalletManager()
  const {walletMetas} = useWalletMetas(walletManager)
  const {openModal} = useModal()
  const {navigateToTxHistory} = useWalletNavigation()
  const selectWalletMeta = useSetSelectedWalletMeta()
  const selectWallet = useSetSelectedWallet()
  const [focusedIndex, setFocusedIndex] = React.useState<number>(0)
  const [isValidPhrase, setIsValidPhrase] = React.useState(false)

  if (mnemonicType === null) throw new Error('mnemonicType missing')

  const [suggestedWords, setSuggestedWords] = React.useState<Array<string>>([])
  const [mnemonicSelectedWords, setMnemonicSelectedWords] = React.useState<Array<string>>(
    Array.from({length: mnemonicType}).map(() => ''),
  )
  const [inputErrorsIndexes, setInputErrorsIndexes] = React.useState<Array<number>>([])
  const hasFocusedInputError = inputErrorsIndexes.find((index) => index === focusedIndex) !== undefined

  const addInputErrorIndex = (indexToAdd: number) => {
    const newInputErrors = [...inputErrorsIndexes, indexToAdd]
    setInputErrorsIndexes(newInputErrors)
  }

  const removeInputErrorIndex = (indexToRemove: number) => {
    const newInputErrors = inputErrorsIndexes.filter((index) => index !== indexToRemove)
    setInputErrorsIndexes(newInputErrors)
  }

  const onError = (error: string, index: number) => {
    if (!isEmptyString(error)) addInputErrorIndex(index)
    else removeInputErrorIndex(index)
  }

  const mnenonicRefs = React.useRef(mnemonicSelectedWords.map(() => React.createRef<MnemonicWordInputRef>())).current

  const onSelect = (index: number, word: string) => {
    const newWords = [...mnemonicSelectedWords]
    newWords[index] = word
    setSuggestedWords([])
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

  const {openWallet} = useOpenWallet({
    onSuccess: ([wallet, walletMeta]) => {
      selectWalletMeta(walletMeta)
      selectWallet(wallet)
      navigateToTxHistory()
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof InvalidState
          ? showErrorDialog(errorMessages.walletStateInvalid, intl)
          : error instanceof Api.Errors.Network
          ? showErrorDialog(errorMessages.networkError, intl)
          : showErrorDialog(errorMessages.generalError, intl, {message: error.message})
      })
    },
  })

  const handleOnNext = React.useCallback(async () => {
    const {accountPubKeyHex} = await makeKeys({mnemonic})
    const checksum = walletChecksum(accountPubKeyHex)

    const duplicatedWalletMeta = walletMetas?.find((walletMeta) => walletMeta.checksum.TextPart === checksum.TextPart)

    if (duplicatedWalletMeta) {
      openModal(
        strings.restoreDuplicatedWalletModalTitle,
        <Modal
          walletName={duplicatedWalletMeta.name}
          publicKeyHex={accountPubKeyHex}
          onPress={() => openWallet(duplicatedWalletMeta)}
        />,
      )

      return
    }

    mnemonicChanged(mnemonic)
    publicKeyHexChanged(accountPubKeyHex)
    navigation.navigate('setup-wallet-restore-details')
  }, [
    mnemonic,
    mnemonicChanged,
    navigation,
    openModal,
    openWallet,
    publicKeyHexChanged,
    strings.restoreDuplicatedWalletModalTitle,
    walletMetas,
  ])

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <KeyboardAvoidingView style={{flex: 1}}>
        <View style={styles.stepper}>
          <StepperProgress currentStep={1} currentStepTitle={strings.stepRestoreWalletScreen} totalSteps={2} />
        </View>

        <ScrollView style={styles.scroll} bounces={false}>
          <View>
            <Text style={styles.title}>{strings.restoreWalletScreenTitle(bold)}</Text>

            <Space height="l" />
          </View>

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
            onError={onError}
          />
        </ScrollView>

        {mnemonic !== '' && isValidPhrase && <NextButton onPress={handleOnNext} />}

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
      <Button title={strings.next} style={styles.button} onPress={onPress} />
    </View>
  )
}

const Modal = ({
  onPress,
  publicKeyHex,
  walletName,
}: {
  onPress: () => void
  publicKeyHex: string
  walletName: string
}) => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {networkId} = useSetupWallet()
  const plate = usePlate({networkId, publicKeyHex})

  return (
    <View style={styles.modal}>
      <Text style={styles.modalText}>{strings.restoreDuplicatedWalletModalText}</Text>

      <Space height="l" />

      <View style={styles.checksum}>
        <Icon.WalletAccount iconSeed={plate.accountPlate.ImagePart} style={styles.walletChecksum} />

        <Space width="s" />

        <View>
          <Text style={styles.plateName}>{walletName}</Text>

          <Text style={styles.plateText}>{plate.accountPlate.TextPart}</Text>
        </View>
      </View>

      <Space fill />

      <Button title={strings.restoreDuplicatedWalletModalButton} style={styles.button} onPress={onPress} />

      <Space height="xl" />
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
        keyboardShouldPersistTaps="handled"
        renderItem={({item: word, index: wordIndex}) => (
          <>
            {wordIndex === 0 && <Space width="l" />}

            <WordSuggestionButton
              onPress={() => {
                onSelect(index, word)
              }}
              title={word}
            />

            {wordIndex === data.length - 1 && <Space width="l" />}
          </>
        )}
        ItemSeparatorComponent={() => <Space width="s" />}
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
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: theme.color['white-static'],
    },
    title: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray[900],
    },
    button: {backgroundColor: theme.color.primary[500]},
    bolder: {
      ...theme.typography['body-1-l-medium'],
    },
    stepper: {
      ...theme.padding['x-l'],
    },
    scroll: {
      ...theme.padding['l'],
    },
    padding: {
      ...theme.padding['l'],
    },
    checksum: {
      flexDirection: 'row',
      alignItems: 'center',
      textAlignVertical: 'center',
    },
    walletChecksum: {
      width: 38,
      height: 38,
      borderRadius: 8,
    },
    modalText: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray[900],
      lineHeight: 24,
    },
    plateText: {
      ...theme.typography['body-3-s-regular'],
      color: theme.color.gray[600],
      textAlign: 'center',
      justifyContent: 'center',
    },
    plateName: {
      ...theme.typography['body-2-m-medium'],
      color: theme.color.gray[900],
    },
    modal: {
      flex: 1,
    },
    suggestions: {
      backgroundColor: 'rgba(255, 255, 255, 0.80)',
      borderColor: theme.color.gray[200],
      borderTopWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 16,
      paddingBottom: 19,
    },
    suggestion: {
      borderColor: theme.color.primary[500],
      borderWidth: 2,
      borderRadius: 8,
      backgroundColor: 'transparent',
    },
    suggestionText: {
      ...theme.typography['body-1-l-regular'],
      textTransform: 'none',
      color: theme.color.primary[500],
    },
    suggestionArea: {
      backgroundColor: 'rgba(255, 255, 255, 0.80)',
      borderColor: theme.color.gray[200],
      borderTopWidth: 1,
      alignItems: 'center',
      paddingTop: 30,
      paddingBottom: 30,
    },
    suggestionMessage: {
      ...theme.typography['body-1-l-regular'],
      textAlign: 'center',
    },
  })

  const colors = {
    gray900: theme.color.gray[900],
    gradientBlueGreen: theme.color.gradients['blue-green'],
  }

  return {styles, colors} as const
}
