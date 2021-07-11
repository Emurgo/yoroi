// @flow

import React from 'react'
import {View, ScrollView} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {SafeAreaView} from 'react-native-safe-area-context'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
import _ from 'lodash'

import {Text, Button, ValidatedTextInput, StatusBar} from '../../UiKit'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {CONFIG, getWalletConfigById} from '../../../config/config'
import {
  validateRecoveryPhrase,
  INVALID_PHRASE_ERROR_CODES,
  cleanMnemonic,
} from '../../../utils/validators'
import {isKeyboardOpenSelector} from '../../../selectors'

import styles from './styles/RestoreWalletScreen.style'

import type {InvalidPhraseError} from '../../../utils/validators'
import type {ComponentType} from 'react'
import type {Navigation} from '../../../types/navigation'
import type {WalletImplementationId} from '../../../config/types'

const mnemonicInputErrorsMessages = defineMessages({
  TOO_LONG: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.toolong',
    defaultMessage: '!!!Phrase is too long. ',
    description: 'some desc',
  },
  TOO_SHORT: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.tooshort',
    defaultMessage: '!!!Phrase is too short. ',
    description: 'some desc',
  },
  INVALID_CHECKSUM: {
    id:
      'components.walletinit.restorewallet.restorewalletscreen.invalidchecksum',
    defaultMessage: '!!!Please enter valid mnemonic.',
    description: 'some desc',
  },
  UNKNOWN_WORDS: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.unknowwords',
    defaultMessage: '!!!{wordlist} {cnt, plural, one {is} other {are}} invalid',
    description: 'some desc',
  },
})

const messages = defineMessages({
  mnemonicInputLabel: {
    id:
      'components.walletinit.restorewallet.restorewalletscreen.mnemonicInputLabel',
    defaultMessage: '!!!Recovery phrase',
    description: 'some desc',
  },
  restoreButton: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.restoreButton',
    defaultMessage: '!!!Restore wallet',
    description: 'some desc',
  },
  instructions: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.instructions',
    defaultMessage:
      '!!!To restore your wallet please provide the {mnemonicLength}-word ' +
      'recovery phrase you received when you created your wallet for the ' +
      'first time.',
    description: 'some desc',
  },
})

const _translateInvalidPhraseError = (
  intl: IntlShape,
  error: InvalidPhraseError,
) => {
  if (error.code === INVALID_PHRASE_ERROR_CODES.UNKNOWN_WORDS) {
    return intl.formatMessage(mnemonicInputErrorsMessages.UNKNOWN_WORDS, {
      cnt: error.words.length,
      wordlist: error.words.map((word) => `'${word}'`).join(', '),
    })
  } else {
    return intl.formatMessage(mnemonicInputErrorsMessages[error.code])
  }
}

const errorsVisibleWhileWriting = (errors) => {
  return errors
    .map((error) => {
      if (error.code !== INVALID_PHRASE_ERROR_CODES.UNKNOWN_WORDS) return error
      if (!error.lastMightBeUnfinished) return error
      if (error.words.length <= 1) return null
      return {
        code: error.code,
        words: _.initial(error.words),
        lastMightBeUnfinished: error.lastMightBeUnfinished,
      }
    })
    .filter((error) => !!error)
}

const RestoreWalletScreen = (
  {
    navigateToWalletCredentials,
    intl,
    phrase,
    setPhrase,
    translateInvalidPhraseError,
    isKeyboardOpen,
    route,
  }: {intl: IntlShape} & Object /* TODO: type */,
) => {
  const implId: WalletImplementationId = route.params.walletImplementationId
  const walletConfig = getWalletConfigById(implId)
  const errors = validateRecoveryPhrase(phrase, walletConfig.MNEMONIC_LEN)
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
          <Text>
            {intl.formatMessage(messages.instructions, {
              mnemonicLength: walletConfig.MNEMONIC_LEN,
            })}
          </Text>
          <ValidatedTextInput
            multiline
            numberOfLines={3}
            style={styles.phrase}
            value={phrase}
            onChangeText={setPhrase}
            placeholder={intl.formatMessage(messages.mnemonicInputLabel)}
            blurOnSubmit
            error={errorText}
            autoCapitalize="none"
            keyboardType="visible-password"
            // hopefully this prevents keyboard from learning the mnemonic
            autoCorrect={false}
          />
        </View>
      </ScrollView>

      <Button
        onPress={navigateToWalletCredentials}
        title={intl.formatMessage(messages.restoreButton)}
        disabled={!_.isEmpty(errors)}
      />
    </SafeAreaView>
  )
}

export default injectIntl(
  (compose(
    connect((state) => ({
      isKeyboardOpen: isKeyboardOpenSelector(state),
    })),
    withStateHandlers(
      {
        phrase: CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.MNEMONIC3 : '',
      },
      {
        setPhrase: () => (value) => ({phrase: value}),
      },
    ),
    withHandlers({
      navigateToWalletCredentials: ({navigation, route, phrase}) => (
        _event,
      ) => {
        navigation.navigate(WALLET_INIT_ROUTES.VERIFY_RESTORED_WALLET, {
          phrase: cleanMnemonic(phrase),
          networkId: route.params.networkId,
          walletImplementationId: route.params.walletImplementationId,
        })
      },
      translateInvalidPhraseError: ({intl}: {intl: IntlShape}) => (error) =>
        _translateInvalidPhraseError(intl, error),
    }),
  )(RestoreWalletScreen): ComponentType<{
    navigation: Navigation,
    route: Object, // TODO(navigation): type
    intl: IntlShape,
  }>),
)
