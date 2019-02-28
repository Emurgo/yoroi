// @flow

import React from 'react'
import {View, ScrollView} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {SafeAreaView} from 'react-navigation'
import _ from 'lodash'

import {Text, Button, ValidatedTextInput, StatusBar} from '../../UiKit'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {CONFIG} from '../../../config'
import {
  validateRecoveryPhrase,
  INVALID_PHRASE_ERROR_CODES,
  cleanMnemonic,
} from '../../../utils/validators'
import {withNavigationTitle, withTranslations} from '../../../utils/renderUtils'
import {isKeyboardOpenSelector} from '../../../selectors'

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
    return translations.mnemonicInput.errors.UNKNOWN_WORDS(error.words)
  } else {
    return translations.mnemonicInput.errors[error.code]
  }
}

const errorsVisibleWhileWriting = (errors) => {
  return errors
    .map((error) => {
      if (error.code !== INVALID_PHRASE_ERROR_CODES.UNKNOWN_WORDS) return error
      if (!error.lastMightBeUnfinished) return error
      // $FlowFixMe flow does not like null here
      if (error.words.length <= 1) return null
      return {
        code: error.code,
        words: _.initial(error.words),
        lastMightBeUnfinished: error.lastMightBeUnfinished,
      }
    })
    .filter((error) => !!error)
}

const RestoreWalletScreen = ({
  navigateToWalletCredentials,
  translations,
  phrase,
  setPhrase,
  translateInvalidPhraseError,
  isKeyboardOpen,
}) => {
  const errors = validateRecoveryPhrase(phrase)
  const visibleErrors = isKeyboardOpen
    ? errorsVisibleWhileWriting(errors.invalidPhrase || [])
    : errors.invalidPhrase || []

  const errorText = visibleErrors
    .map((error) => translateInvalidPhraseError(error))
    .join(' ')

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <ScrollView keyboardDismissMode="on-drag">
        <View style={styles.container}>
          <Text>{translations.instructions}</Text>
          <ValidatedTextInput
            multiline
            numberOfLines={3}
            style={styles.phrase}
            value={phrase}
            onChangeText={setPhrase}
            placeholder={translations.mnemonicInput.label}
            blurOnSubmit
            error={errorText}
            autoCapitalize="none"
            // keyboardType="visible-password"
            // hopefully this prevents keyboard from learning the mnemonic
            autoCorrect={false}
          />
        </View>
      </ScrollView>

      <Button
        onPress={navigateToWalletCredentials}
        title={translations.restoreButton}
        disabled={!_.isEmpty(errors)}
      />
    </SafeAreaView>
  )
}

export default (compose(
  connect((state) => ({
    isKeyboardOpen: isKeyboardOpenSelector(state),
  })),
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
      navigation.navigate(WALLET_INIT_ROUTES.WALLET_CREDENTIALS, {
        phrase: cleanMnemonic(phrase),
      })
    },
    translateInvalidPhraseError: ({translations}) => (error) =>
      _translateInvalidPhraseError(translations, error),
  }),
)(RestoreWalletScreen): ComponentType<{navigation: Navigation}>)
