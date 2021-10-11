// @flow

import {useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch} from 'react-redux'

import {createWallet} from '../../../actions'
import {ROOT_ROUTES, WALLET_ROOT_ROUTES} from '../../../RoutesList'
import assert from '../../../utils/assert'
import {ignoreConcurrentAsyncHandler} from '../../../utils/utils'
import {Button, Spacer, StatusBar, Text} from '../../UiKit'
import styles from './styles/MnemonicCheckScreen.style'

const messages = defineMessages({
  instructions: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.instructions',
    defaultMessage: '!!!Tap each word in the correct order to verify your recovery phrase',
  },
  clearButton: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.clearButton',
    defaultMessage: '!!!Clear',
  },
  confirmButton: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.confirmButton',
    defaultMessage: '!!!Confirm',
  },
  mnemonicWordsInputLabel: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.mnemonicWordsInputLabel',
    defaultMessage: '!!!Recovery phrase',
  },
  mnemonicWordsInputInvalidPhrase: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.mnemonicWordsInputInvalidPhrase',
    defaultMessage: '!!!Recovery phrase does not match',
  },
})

const MnemonicCheckScreen = () => {
  const intl = useIntl()
  const navigation = useNavigation()
  const route = (useRoute(): any)
  const mnemonic: string = route.params.mnemonic

  /*
   * The mnemonic are handled in "word entries" instead of plain text word
   * Where each entry is [word, wordIndex] with index in sorted array
   * This is done so that each word including any duplicates
   * is uniquely identified by its index in the sorted array
   * to improve the UX of the word selecting.
   *
   * Example: original words might be [air, sand, air, desk], which is valid.
   * Sorted entries will be: [[air, 0], [air, 1], [desk, 2], [sand, 3]]
   *
   * We don't care which of the "air" words the user will want to use first.
   * If user clicks on [air, 1] we will be able to detect that this specific
   * was selected and hide it from the options while keeping the first "air"
   * visible, which should be the most intuitive and expected behaviour for the users.
   *
   * When comparing with the original mnemonic we ignore the indexes.
   */
  const sortedWordEntries = mnemonic
    .split(' ')
    .sort()
    .map((s, i) => [s, i]);

  const [partialPhraseEntries, setPartialPhraseEntries] =
    React.useState<Array<[string, number]>>([])
  const selectWord = (addWordEntry: [string, number]) =>
    setPartialPhraseEntries([...partialPhraseEntries, addWordEntry])
  const deselectWord = ([, removeWordIdx]: [string, number]) =>
    setPartialPhraseEntries(partialPhraseEntries.filter(([, idx]) => idx !== removeWordIdx))

  const isPhraseComplete = partialPhraseEntries.length === sortedWordEntries.length
  const isPhraseValid = mnemonic === partialPhraseEntries.map(([w]) => w).join(' ')

  const dispatch = useDispatch()
  const handleWalletConfirmation = async () => {
    const {mnemonic, password, name, networkId, walletImplementationId, provider} = route.params

    assert.assert(!!mnemonic, 'handleWalletConfirmation:: mnemonic')
    assert.assert(!!password, 'handleWalletConfirmation:: password')
    assert.assert(!!name, 'handleWalletConfirmation:: name')
    assert.assert(networkId != null, 'handleWalletConfirmation:: networkId')
    assert.assert(!!walletImplementationId, 'handleWalletConfirmation:: implementationId')

    await dispatch(createWallet(name, mnemonic, password, networkId, walletImplementationId, provider))

    navigation.navigate(ROOT_ROUTES.WALLET, {
      screen: WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES,
      mnemonic,
      password,
      name,
      networkId,
      walletImplementationId,
    })
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const confirmWalletCreation = React.useCallback(
    ignoreConcurrentAsyncHandler(() => handleWalletConfirmation, 1000)(),
    [],
  )

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <Spacer height={24} />

      <Instructions />

      <Spacer height={24} />

      <MnemonicInput onPress={deselectWord} partialPhraseEntries={partialPhraseEntries} error={!isPhraseValid && isPhraseComplete} />

      <Spacer height={8} />

      <ErrorMessage visible={!(isPhraseValid || !isPhraseComplete)} />

      <ScrollView bounces={false} contentContainerStyle={styles.scrollViewContentContainer}>
        <WordBadges wordEntries={sortedWordEntries} partialPhraseEntries={partialPhraseEntries} onSelect={selectWord} />
      </ScrollView>

      <View style={styles.buttons}>
        <Button
          block
          onPress={confirmWalletCreation}
          disabled={!isPhraseComplete || !isPhraseValid}
          title={intl.formatMessage(messages.confirmButton)}
          style={styles.confirmButton}
          testID="mnemonicCheckScreen::confirm"
        />
      </View>
    </SafeAreaView>
  )
}

export default MnemonicCheckScreen

const MnemonicInput = ({
  partialPhraseEntries,
  error,
  onPress,
}: {
  partialPhraseEntries: Array<[string, number]>,
  error: boolean,
  onPress: (wordEntry: [string, number]) => any,
}) => {
  return (
    <View style={styles.recoveryPhrase}>
      <View style={[styles.recoveryPhraseOutline, error && styles.recoveryPhraseError]}>
        {partialPhraseEntries.map(([word, wordIdx], index, array) => {
          const isLast = index === array.length - 1
          return (
            <View key={word} style={[styles.wordBadgeContainer, !isLast && styles.selected]}>
              <WordBadge word={word} disabled={!isLast} onPress={isLast ? () => onPress([word, wordIdx]) : undefined} />
            </View>
          )
        })}
      </View>
    </View>
  )
}

const Instructions = () => {
  const intl = useIntl()

  return (
    <View style={styles.instructions}>
      <Text>{intl.formatMessage(messages.instructions)}</Text>
    </View>
  )
}

const ErrorMessage = ({visible}: {visible: boolean}) => {
  const intl = useIntl()

  return (
    <View style={[styles.error, !visible && styles.hidden]}>
      <Text style={styles.errorMessage}>{intl.formatMessage(messages.mnemonicWordsInputInvalidPhrase)}</Text>
    </View>
  )
}

const WordBadges = ({
  wordEntries,
  partialPhraseEntries,
  onSelect,
}: {
  wordEntries: Array<[string, number]>,
  partialPhraseEntries: Array<[string, number]>,
  onSelect: (wordEntry: [string, number]) => any,
}) => {
  const isWordUsed = (wordIdx: number) =>
    partialPhraseEntries.some(([, idx]) => idx === wordIdx);
  return (
    <View style={styles.words}>
      {wordEntries.map(([word, wordIdx]) => {
        const isUsed = isWordUsed(wordIdx);
        return (
          <View key={word} style={[styles.wordBadgeContainer, isUsed && styles.hidden]}>
            <WordBadge
              word={word}
              onPress={() => onSelect([word, wordIdx])}
              disabled={isUsed}
              testID={isUsed ? `wordBadgeTapped-${word}` : `wordBadgeNonTapped-${word}`}
            />
          </View>
        );
      })}
    </View>
  )
}

const WordBadge = ({word, onPress, disabled}: {word: string, disabled?: boolean, onPress?: () => any}) => (
  <TouchableOpacity activeOpacity={0.5} onPress={onPress} disabled={disabled} style={styles.wordBadge}>
    <Text style={styles.wordBadgeText}>{word} x</Text>
  </TouchableOpacity>
)
