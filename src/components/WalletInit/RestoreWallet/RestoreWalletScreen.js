// @flow

import React from 'react'
import {View, TextInput} from 'react-native'
import {compose} from 'redux'
import {withHandlers, withState} from 'recompose'

import {Text, Button} from '../../UiKit'
import Screen from '../../Screen'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {CONFIG} from '../../../config'
import {validateRecoveryPhrase} from '../../../utils/validators'
import {withNavigationTitle, withTranslations} from '../../../utils/renderUtils'

import {COLORS} from '../../../styles/config'
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
  const translation = translations.errors[error.code]
  return typeof translation === 'string'
    ? translation
    : translation(error.parameter)
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
    <Screen bgColor={COLORS.BACKGROUND_GRAY} scroll>
      <View style={styles.container}>
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
          onPress={navigateToWalletCredentials}
          title={translations.restoreButton}
          disabled={!!errors}
        />
      </View>
    </Screen>
  )
}

export default (compose(
  withTranslations(getTranslations),
  withNavigationTitle(({translations}) => translations.title),
  withState(
    'phrase',
    'setPhrase',
    CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.MNEMONIC1 : '',
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
