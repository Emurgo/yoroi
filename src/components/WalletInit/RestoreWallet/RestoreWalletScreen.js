// @flow

import React from 'react'
import {View, TextInput} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withState} from 'recompose'

import {Text, Button} from '../../UiKit'
import Screen from '../../Screen'
import {ROOT_ROUTES} from '../../../RoutesList'
import walletManager from '../../../crypto/wallet'
import {CONFIG} from '../../../config'
import {validateRecoveryPhrase} from '../../../utils/validators'

import {COLORS} from '../../../styles/config'
import styles from './styles/RestoreWalletScreen.style'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'
import type {
  RecoveryPhraseErrors,
  InvalidPhraseError,
} from '../../../utils/validators'

const getTranslations = (state: State) => state.trans.RestoreWalletScreen

const _translateInvalidPhraseError = (
  translations: SubTranslation<typeof getTranslations>,
  error: InvalidPhraseError,
) => {
  const translation = translations.errors[error.code]
  return typeof translation === 'string'
    ? translation
    : translation(error.parameter)
}

type Props = {
  navigateToWallet: () => mixed,
  translations: SubTranslation<typeof getTranslations>,
  phrase: string,
  setPhrase: (phrase: string) => mixed,
  validatePhrase: () => RecoveryPhraseErrors,
  translateInvalidPhraseError: (InvalidPhraseError) => string,
}

const RestoreWalletScreen = ({
  navigateToWallet,
  translations,
  phrase,
  setPhrase,
  validatePhrase,
  translateInvalidPhraseError,
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
          {/* prettier-ignore */ errors && errors.invalidPhrase &&
            errors.invalidPhrase.map((error) => (
              <Text key={error.code} style={styles.error}>
                {translateInvalidPhraseError(error)}
              </Text>))}
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
    validatePhrase: ({phrase}) => () => validateRecoveryPhrase(phrase),
    translateInvalidPhraseError: ({translations}) => (error) =>
      _translateInvalidPhraseError(translations, error),
  }),
)(RestoreWalletScreen)
