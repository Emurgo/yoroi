// @flow

import React from 'react'
import {useDispatch} from 'react-redux'
import {SafeAreaView} from 'react-native-safe-area-context'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
import {View, ScrollView, TouchableOpacity} from 'react-native'

import assert from '../../../utils/assert'
import {ignoreConcurrentAsyncHandler} from '../../../utils/utils'
import {Text, Button, Spacer, StatusBar} from '../../UiKit'
import {ROOT_ROUTES, WALLET_ROOT_ROUTES} from '../../../RoutesList'
import {createWallet} from '../../../actions'

import type {Navigation} from '../../../types/navigation'

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

const MnemonicCheckScreen = ({intl, navigation, route}: {intl: IntlShape, navigation: Navigation, route: any}) => {
  const mnemonic: string = route.params.mnemonic
  const sortedWords = mnemonic.split(' ').sort()
  const [partialPhrase, setPartialPhrase] = React.useState<Array<string>>([])
  const deselectWord = (removeWord: string) => setPartialPhrase(partialPhrase.filter((word) => word !== removeWord))
  const selectWord = (addWord: string) => setPartialPhrase([...partialPhrase, addWord])

  const isPhraseComplete = partialPhrase.length === sortedWords.length
  const isPhraseValid = mnemonic === partialPhrase.join(' ')

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

      <MnemonicInput onPress={deselectWord} partialPhrase={partialPhrase} error={!isPhraseValid && isPhraseComplete} />

      <Spacer height={8} />

      <ErrorMessage visible={!(isPhraseValid || !isPhraseComplete)} />

      <ScrollView bounces={false} contentContainerStyle={styles.scrollViewContentContainer}>
        <WordBadges words={sortedWords} partialPhrase={partialPhrase} onSelect={selectWord} />
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

export default injectIntl(MnemonicCheckScreen)

const MnemonicInput = ({
  partialPhrase,
  error,
  onPress,
}: {
  partialPhrase: Array<string>,
  error: boolean,
  onPress: (word: string) => any,
}) => {
  return (
    <View style={styles.recoveryPhrase}>
      <View style={[styles.recoveryPhraseOutline, error && styles.recoveryPhraseError]}>
        {partialPhrase.map((word, index, array) => {
          const isLast = index === array.length - 1

          return (
            <View key={word} style={[styles.wordBadgeContainer, !isLast && styles.selected]}>
              <WordBadge word={word} disabled={!isLast} onPress={isLast ? () => onPress(word) : undefined} />
            </View>
          )
        })}
      </View>
    </View>
  )
}

const Instructions = injectIntl(({intl}: {intl: IntlShape}) => (
  <View style={styles.instructions}>
    <Text>{intl.formatMessage(messages.instructions)}</Text>
  </View>
))

const ErrorMessage = injectIntl(({intl, visible}: {intl: IntlShape, visible: boolean}) => {
  return (
    <View style={[styles.error, !visible && styles.hidden]}>
      <Text style={styles.errorMessage}>{intl.formatMessage(messages.mnemonicWordsInputInvalidPhrase)}</Text>
    </View>
  )
})

const WordBadges = ({
  words,
  partialPhrase,
  onSelect,
}: {
  words: Array<string>,
  partialPhrase: Array<string>,
  onSelect: (word: string) => any,
}) => {
  return (
    <View style={styles.words}>
      {words.map((word) => (
        <View key={word} style={[styles.wordBadgeContainer, partialPhrase.includes(word) && styles.hidden]}>
          <WordBadge
            word={word}
            onPress={() => onSelect(word)}
            disabled={partialPhrase.includes(word)}
            testID={partialPhrase.includes(word) ? `wordBadgeTapped-${word}` : `wordBadgeNonTapped-${word}`}
          />
        </View>
      ))}
    </View>
  )
}

const WordBadge = ({word, onPress, disabled}: {word: string, disabled?: boolean, onPress?: () => any}) => (
  <TouchableOpacity activeOpacity={0.5} onPress={onPress} disabled={disabled} style={styles.wordBadge}>
    <Text style={styles.wordBadgeText}>{word} x</Text>
  </TouchableOpacity>
)
