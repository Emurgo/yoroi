// @flow

import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {SafeAreaView} from 'react-navigation'
import {isEmpty} from 'lodash'

import {Text, Button, ValidatedTextInput} from '../../UiKit'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {CONFIG} from '../../../config'
import {
  validateRecoveryPhrase,
  INVALID_PHRASE_ERROR_CODES,
} from '../../../utils/validators'
import {withNavigationTitle, withTranslations} from '../../../utils/renderUtils'

import styles from './styles/RestoreWalletScreen.style'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'
import type {InvalidPhraseError} from '../../../utils/validators'
import type {ComponentType} from 'react'
import type {Navigation} from '../../../types/navigation'

const getTranslations = (state: State) => state.trans.RestoreWalletScreen

const _translateInvalidPhraseError = (
  translations: SubTranslation<typeof getTranslations>,
  error: InvalidPhraseError,
) => {
  if (error.code === INVALID_PHRASE_ERROR_CODES.UNKNOWN_WORDS) {
    return translations.errors.UNKNOWN_WORDS(error.parameter)
  } else {
    return translations.errors[error.code]
  }
}

const RestoreWalletScreen = ({
  navigateToWalletCredentials,
  translations,
  phrase,
  setPhrase,
  validatePhrase,
  translateInvalidPhraseError,
}) => {
  const errors = validatePhrase()
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.container}>
        <View>
          <Text>{translations.instructions}</Text>
          <ValidatedTextInput
            multiline
            numberOfLines={3}
            style={styles.phrase}
            value={phrase}
            onChangeText={setPhrase}
            placeholder={translations.phrase}
            blurOnSubmit
            error={
              errors.invalidPhrase &&
              errors.invalidPhrase.map((error) =>
                translateInvalidPhraseError(error),
              )
            }
          />
        </View>
        <Button
          onPress={navigateToWalletCredentials}
          title={translations.restoreButton}
          disabled={!isEmpty(errors)}
        />
      </View>
    </SafeAreaView>
  )
}

export default (compose(
  withTranslations(getTranslations),
  withNavigationTitle(({translations}) => translations.title),
  withStateHandlers(
    {
      phrase: CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.MNEMONIC1 : '',
    },
    {
      setPhrase: (state) => (value) => ({phrase: value}),
    },
  ),
  withHandlers({
    navigateToWalletCredentials: ({navigation, phrase}) => (event) => {
      navigation.navigate(WALLET_INIT_ROUTES.WALLET_CREDENTIALS, {phrase})
    },
    validatePhrase: ({phrase}) => () => validateRecoveryPhrase(phrase),
    translateInvalidPhraseError: ({translations}) => (error) =>
      _translateInvalidPhraseError(translations, error),
  }),
)(RestoreWalletScreen): ComponentType<{navigation: Navigation}>)
