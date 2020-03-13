// @flow

import React from 'react'
import _ from 'lodash'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withProps, withStateHandlers} from 'recompose'
import {SafeAreaView} from 'react-navigation'
import {injectIntl, defineMessages, intlShape} from 'react-intl'
import {View, ScrollView, TouchableOpacity, Dimensions} from 'react-native'

import assert from '../../../utils/assert'
import {ignoreConcurrentAsyncHandler} from '../../../utils/utils'
import {Text, Button, StatusBar} from '../../UiKit'
import {ROOT_ROUTES} from '../../../RoutesList'
import {createWallet} from '../../../actions'
import {withNavigationTitle} from '../../../utils/renderUtils'

import styles from './styles/MnemonicCheckScreen.style'

import type {ComponentType} from 'react'
import type {Navigation} from '../../../types/navigation'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.title',
    defaultMessage: '!!!Recovery phrase',
  },
  instructions: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.instructions',
    defaultMessage:
      '!!!Tap each word in the correct order to verify your recovery phrase',
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
    id:
      'components.walletinit.createwallet.mnemoniccheckscreen.mnemonicWordsInputLabel',
    defaultMessage: '!!!Recovery phrase',
    description: 'some desc',
  },
  mnemonicWordsInputInvalidPhrase: {
    id:
      'components.walletinit.createwallet.mnemoniccheckscreen.mnemonicWordsInputInvalidPhrase',
    defaultMessage: '!!!Recovery phrase does not match',
    description: 'some desc',
  },
})

const validatePhrase = (mnemonic, words, partialPhrase) => {
  const phrase = partialPhrase.map((wordIdx) => words[wordIdx]).join(' ')
  const isPhraseCorrect = phrase === mnemonic

  return isPhraseCorrect
}

const handleWalletConfirmation = ({navigation, createWallet}) => async () => {
  const mnemonic = navigation.getParam('mnemonic')
  const password = navigation.getParam('password')
  const name = navigation.getParam('name')
  const isShelleyWallet = navigation.getParam('isShelleyWallet')
  assert.assert(!!mnemonic, 'handleWalletConfirmation:: mnemonic')
  assert.assert(!!password, 'handleWalletConfirmation:: password')
  assert.assert(!!name, 'handleWalletConfirmation:: name')
  assert.assert(
    isShelleyWallet != null,
    'handleWalletConfirmation:: isShelleyWallet',
  )

  await createWallet(name, mnemonic, password, isShelleyWallet)

  const route = isShelleyWallet
    ? ROOT_ROUTES.SHELLEY_WALLET
    : ROOT_ROUTES.WALLET
  navigation.navigate(route)
}

type WordProps = {
  word: string,
  selected: boolean,
  hidden?: boolean,
  onPress: (number) => any,
  value: number,
}

const _WordBadge = ({word, handleOnPress, selected, hidden}) => (
  <TouchableOpacity
    activeOpacity={0.5}
    onPress={handleOnPress}
    disabled={selected}
    style={[
      styles.wordBadge,
      selected && styles.selected,
      hidden && styles.hidden,
    ]}
    testID={selected ? `wordBadgeTapped-${word}` : `wordBadgeNonTapped-${word}`}
  >
    <Text style={[selected && styles.selectedText]}>{word}</Text>
  </TouchableOpacity>
)

const WordBadge: ComponentType<WordProps> = withHandlers({
  handleOnPress: ({onPress, value}) => () => onPress(value),
})(_WordBadge)

const shouldScreenScroll = () => Dimensions.get('window').height <= 520

const MnemonicCheckScreen = ({
  mnemonic,
  partialPhrase,
  intl,
  words,
  confirmWalletCreation,
  handleClear,
  selectWord,
  deselectWord,
}) => {
  const isPhraseComplete = partialPhrase.length === words.length
  const isPhraseValid = validatePhrase(mnemonic, words, partialPhrase)

  const initial = _.initial(partialPhrase)
  const last = _.last(partialPhrase)

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.container}>
        <StatusBar type="dark" />
        <ScrollView
          automaticallyAdjustContentInsets={shouldScreenScroll()}
          bounces={shouldScreenScroll()}
        >
          <View style={styles.content}>
            <Text>{intl.formatMessage(messages.instructions)}</Text>
            <View
              style={[
                styles.recoveryPhrase,
                !isPhraseValid &&
                  isPhraseComplete &&
                  styles.recoveryPhraseError,
              ]}
            >
              {initial.map((id) => (
                <Text style={styles.wordText} key={id}>
                  {words[id]}
                </Text>
              ))}
              {last != null && (
                <WordBadge
                  value={last}
                  selected={false}
                  word={words[last]}
                  onPress={deselectWord}
                />
              )}
            </View>
            {!(isPhraseValid || !isPhraseComplete) && (
              <Text style={styles.error}>
                {intl.formatMessage(messages.mnemonicWordsInputInvalidPhrase)}
              </Text>
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
    connect(
      () => ({}),
      {
        createWallet,
      },
    ),
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withStateHandlers(
      {
        partialPhrase: [],
      },
      {
        deselectWord: ({partialPhrase}) => (wordIdx) => ({
          partialPhrase: partialPhrase.filter((idx) => idx !== wordIdx),
        }),
        selectWord: ({partialPhrase}) => (wordIdx) => ({
          partialPhrase: [...partialPhrase, wordIdx],
        }),
        handleClear: (state) => () => ({
          partialPhrase: [],
        }),
      },
    ),
    withProps(({navigation}) => {
      const mnemonic = navigation.getParam('mnemonic')
      return {
        mnemonic,
        words: mnemonic.split(' ').sort(),
      }
    }),
    withHandlers({
      confirmWalletCreation: ignoreConcurrentAsyncHandler(
        handleWalletConfirmation,
        1000,
      ),
    }),
  )(MnemonicCheckScreen): ComponentType<{|
    navigation: Navigation,
    intl: intlShape,
  |}>),
)
