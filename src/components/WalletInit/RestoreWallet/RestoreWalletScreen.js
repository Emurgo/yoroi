// @flow

import React from 'react'
import {View, TextInput} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withState} from 'recompose'
import _ from 'lodash'
import {validateMnemonic, wordlists} from 'bip39'

import {Text, Button} from '../../UiKit'
import Screen from '../../Screen'
import {ROOT_ROUTES} from '../../../RoutesList'
import walletManager from '../../../crypto/wallet'
import {CONFIG} from '../../../config'

import {COLORS} from '../../../styles/config'
import styles from './styles/RestoreWalletScreen.style'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'

const getTranslations = (state: State) => state.trans.RestoreWalletScreen

type PhraseErrors = {
  maxLength?: boolean,
  minLength?: boolean,
  unknownWords?: Array<string>,
  invalidChecksum?: boolean,
}

const MNEMONIC_LENGTH = 15

const validatePhrase = (phrase) => {
  const words = phrase.split(' ').filter((word) => !!word)
  const maxLength = words.length > MNEMONIC_LENGTH
  const minLength = words.length < MNEMONIC_LENGTH

  const notInWordlist = (word) => !wordlists.EN.includes(word)
  const unknownWords = minLength
    ? _.initial(words).filter(notInWordlist)
    : words.filter(notInWordlist)

  const invalidChecksum = !validateMnemonic(phrase)

  // prettier-ignore
  if (maxLength || minLength || unknownWords.length > 0) {
    return {
      maxLength,
      minLength,
      unknownWords: unknownWords.length > 0 ? unknownWords : null,
    }
  } else if (invalidChecksum) {
    return {invalidChecksum}
  } else {
    return null
  }
}

type Props = {
  navigateToWallet: () => mixed,
  translations: SubTranslation<typeof getTranslations>,
  phrase: string,
  setPhrase: (phrase: string) => mixed,
  validatePhrase: () => PhraseErrors,
}

const RestoreWalletScreen = ({
  navigateToWallet,
  translations,
  phrase,
  setPhrase,
  validatePhrase,
}: Props) => {
  const errors = validatePhrase()
  return (
    <Screen bgColor={COLORS.TRANSPARENT} scroll>
      <View style={styles.container}>
        <Text>{translations.title}</Text>
        <Text>{translations.instructions}</Text>
        <View>
          <TextInput
            multiline
            numberOfLines={3}
            style={styles.phrase}
            value={phrase}
            onChangeText={setPhrase}
            placeholder={translations.phrase}
          />
          {/* prettier-ignore */ errors && errors.invalidChecksum && (
            <Text style={styles.error}>
              {translations.errors.invalidChecksum}
            </Text>
          )}
          {/* prettier-ignore */ errors && errors.unknownWords && (
            <Text style={styles.error}>
              {translations.errors.unknownWords(errors.unknownWords)}
            </Text>
          )}
          {/* prettier-ignore */ errors && errors.maxLength && (
            <Text style={styles.error}>{translations.errors.maxLength}</Text>
          )}
        </View>
        <Button
          onPress={navigateToWallet}
          title={translations.restoreButton}
          disabled={!!errors}
        />
      </View>
    </Screen>
  )
}

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withState(
    'phrase',
    'setPhrase',
    CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.MNEMONIC1 : '',
  ),
  withHandlers({
    navigateToWallet: ({navigation, phrase}) => async (event) => {
      await walletManager.createWallet('uuid', 'MyWallet', phrase, 'password')
      navigation.navigate(ROOT_ROUTES.WALLET)
    },
    validatePhrase: ({phrase}) => () => validatePhrase(phrase),
  }),
)(RestoreWalletScreen)
