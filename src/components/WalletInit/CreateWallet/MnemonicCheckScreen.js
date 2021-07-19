// @flow

import React from 'react'
import _ from 'lodash'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {SafeAreaView} from 'react-native-safe-area-context'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
import {View, ScrollView, TouchableOpacity, Dimensions} from 'react-native'

import assert from '../../../utils/assert'
import {ignoreConcurrentAsyncHandler} from '../../../utils/utils'
import {Text, Button, StatusBar} from '../../UiKit'
import {ROOT_ROUTES, WALLET_ROOT_ROUTES} from '../../../RoutesList'
import {createWallet} from '../../../actions'

import styles from './styles/MnemonicCheckScreen.style'

import type {ComponentType} from 'react'
import type {Navigation} from '../../../types/navigation'

const messages = defineMessages({
  instructions: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.instructions',
    defaultMessage: '!!!Tap each word in the correct order to verify your recovery phrase',
  },
  clearButton: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.clearButton',
    defaultMessage: '!!!Clear',
    description: 'some desc',
  },
  confirmButton: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.confirmButton',
    defaultMessage: '!!!Confirm',
    description: 'some desc',
  },
  mnemonicWordsInputLabel: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.mnemonicWordsInputLabel',
    defaultMessage: '!!!Recovery phrase',
    description: 'some desc',
  },
  mnemonicWordsInputInvalidPhrase: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.mnemonicWordsInputInvalidPhrase',
    defaultMessage: '!!!Recovery phrase does not match',
    description: 'some desc',
  },
})

const validatePhrase = (mnemonic, words, partialPhrase) => {
  const phrase = partialPhrase.map((wordIdx) => words[wordIdx]).join(' ')
  const isPhraseCorrect = phrase === mnemonic

  return isPhraseCorrect
}

const handleWalletConfirmation =
  ({navigation, route, createWallet}) =>
  async () => {
    const {mnemonic, password, name, networkId, walletImplementationId} = route.params
    assert.assert(!!mnemonic, 'handleWalletConfirmation:: mnemonic')
    assert.assert(!!password, 'handleWalletConfirmation:: password')
    assert.assert(!!name, 'handleWalletConfirmation:: name')
    assert.assert(networkId != null, 'handleWalletConfirmation:: networkId')
    assert.assert(!!walletImplementationId, 'handleWalletConfirmation:: implementationId')

    await createWallet(name, mnemonic, password, networkId, walletImplementationId)

    navigation.navigate(ROOT_ROUTES.WALLET, {
      screen: WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES,
    })
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

const MnemonicCheckScreen = ({intl, confirmWalletCreation, route}: {intl: IntlShape} & Object /* TODO: type */) => {
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

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <View style={styles.content}>
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
              <Text style={styles.wordText} key={id}>
                {words[id]}
              </Text>
            ))}
            {last != null && <WordBadge value={last} selected={false} word={words[last]} onPress={deselectWord} />}
          </View>

          {!(isPhraseValid || !isPhraseComplete) && (
            <View style={styles.error}>
              <Text style={styles.errorMessage}>{intl.formatMessage(messages.mnemonicWordsInputInvalidPhrase)}</Text>
            </View>
          )}

          <View style={styles.words}>
            {words.map((word, index) => (
              <WordBadge
                key={index}
                value={index}
                selected={partialPhrase.includes(index)}
                onPress={selectWord}
                word={word}
              />
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
      </View>
    </SafeAreaView>
  )
}

export default injectIntl(
  (compose(
    connect(() => ({}), {
      createWallet,
    }),
    withHandlers({
      confirmWalletCreation: ignoreConcurrentAsyncHandler(handleWalletConfirmation, 1000),
    }),
  )(MnemonicCheckScreen): ComponentType<{|
    navigation: Navigation,
    route: any,
    intl: IntlShape,
  |}>),
)
