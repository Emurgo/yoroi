// @flow

import React from 'react'
import _ from 'lodash'
import {useDispatch} from 'react-redux'
import {SafeAreaView} from 'react-native-safe-area-context'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
import {View, ScrollView, TouchableOpacity, Dimensions} from 'react-native'

import assert from '../../../utils/assert'
import {ignoreConcurrentAsyncHandler} from '../../../utils/utils'
import {Text, Button, StatusBar} from '../../UiKit'
import {ROOT_ROUTES, WALLET_ROOT_ROUTES} from '../../../RoutesList'
import {createWallet} from '../../../actions'

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

const validatePhrase = (mnemonic, words, partialPhrase) => {
  const phrase = partialPhrase.map((wordIdx) => words[wordIdx]).join(' ')
  const isPhraseCorrect = phrase === mnemonic

  return isPhraseCorrect
}

type WordProps = {
  word: string,
  selected: boolean,
  hidden?: boolean,
  onPress: (number) => any,
  value: number,
}

const WordBadge = ({word, onPress, value, selected, hidden}: WordProps) => (
  <TouchableOpacity
    activeOpacity={0.5}
    onPress={() => onPress(value)}
    disabled={selected}
    style={[styles.wordBadge, selected && styles.selected, hidden === true && styles.hidden]}
    testID={selected ? `wordBadgeTapped-${word}` : `wordBadgeNonTapped-${word}`}
  >
    <Text style={[selected && styles.selectedText]}>{word}</Text>
  </TouchableOpacity>
)

const shouldScreenScroll = () => Dimensions.get('window').height <= 520

const MnemonicCheckScreen = ({intl, navigation, route}: {intl: IntlShape} & Object /* TODO: type */) => {
  const mnemonic = route.params.mnemonic
  const words = mnemonic.split(' ').sort()
  const [partialPhrase, setPartialPhrase] = React.useState([])
  const deselectWord = (wordIdx) => setPartialPhrase(partialPhrase.filter((idx) => idx !== wordIdx))
  const selectWord = (wordIdx) => setPartialPhrase([...partialPhrase, wordIdx])
  const handleClear = () => setPartialPhrase([])

  const isPhraseComplete = partialPhrase.length === words.length
  const isPhraseValid = validatePhrase(mnemonic, words, partialPhrase)

  const initial = _.initial(partialPhrase)
  const last = _.last(partialPhrase)

  const dispatch = useDispatch()
  const handleWalletConfirmation = async () => {
    const {mnemonic, password, name, networkId, walletImplementationId} = route.params

    assert.assert(!!mnemonic, 'handleWalletConfirmation:: mnemonic')
    assert.assert(!!password, 'handleWalletConfirmation:: password')
    assert.assert(!!name, 'handleWalletConfirmation:: name')
    assert.assert(networkId != null, 'handleWalletConfirmation:: networkId')
    assert.assert(!!walletImplementationId, 'handleWalletConfirmation:: implementationId')

    await dispatch(createWallet(name, mnemonic, password, networkId, walletImplementationId))

    navigation.navigate(ROOT_ROUTES.WALLET, {
      screen: WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES,
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

      <ScrollView
        contentContainerStyle={styles.scrollViewContentContainer}
        automaticallyAdjustContentInsets={shouldScreenScroll()}
        bounces={shouldScreenScroll()}
      >
        <View style={styles.instructions}>
          <Text>{intl.formatMessage(messages.instructions)}</Text>
        </View>

        <View style={[styles.recoveryPhrase, !isPhraseValid && isPhraseComplete && styles.recoveryPhraseError]}>
          {initial.map((id) => (
            <View key={id} style={styles.wordBadgeContainer}>
              <Text style={styles.wordText}>{words[id]}</Text>
            </View>
          ))}
          {last != null && (
            <View style={styles.wordBadgeContainer}>
              <WordBadge value={last} selected={false} word={words[last]} onPress={deselectWord} />
            </View>
          )}
        </View>

        {!(isPhraseValid || !isPhraseComplete) && (
          <View style={styles.error}>
            <Text style={styles.errorMessage}>{intl.formatMessage(messages.mnemonicWordsInputInvalidPhrase)}</Text>
          </View>
        )}

        <View style={styles.words}>
          {words.map((word, index) => (
            <View key={word} style={styles.wordBadgeContainer}>
              <WordBadge value={index} selected={partialPhrase.includes(index)} onPress={selectWord} word={word} />
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttons}>
        <Button
          block
          outlineOnLight
          onPress={handleClear}
          title={intl.formatMessage(messages.clearButton)}
          style={styles.clearButton}
        />

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
