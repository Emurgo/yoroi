// @flow

import React from 'react'
import {View, TextInput} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withState} from 'recompose'
import {NavigationActions, StackActions} from 'react-navigation'
import _ from 'lodash'
import {wordlists} from 'bip39'

import {Text, Button} from '../../UiKit'
import Screen from '../../Screen'
import {ROOT_ROUTES} from '../../../RoutesList'

import {COLORS} from '../../../styles/config'
import styles from './styles/RestoreWalletScreen.style'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'

const resetNavigationAction = StackActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({
      routeName: ROOT_ROUTES.MAIN,
    }),
  ],
  key: null,
})

const getTranslations = (state: State) => state.trans.restoreWalletScreen

type PhraseErrors = {
  maxLength?: boolean,
  minLength?: boolean,
  unknownWords?: Array<string>,
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

  return (maxLength || minLength || unknownWords.length > 0)
    ? {maxLength, minLength, unknownWords: unknownWords.length > 0 ? unknownWords : null}
    : null
}

type Props = {
  navigateToWallet: () => mixed,
  translations: SubTranslation<typeof getTranslations>,
  phrase: string,
  setPhrase: () => mixed,
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
          {errors && errors.unknownWords &&
            (<Text style={styles.error}>
              {translations.errors.unknownWords(errors.unknownWords)}
            </Text>)
          }
          {(errors && errors.maxLength) &&
            (<Text style={styles.error}>{translations.errors.maxLength}</Text>)}
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
  withState('phrase', 'setPhrase', ''),
  withHandlers({
    navigateToWallet: ({navigation}) => (event) => navigation.dispatch(resetNavigationAction),
    validatePhrase: ({phrase}) => () => validatePhrase(phrase),
  })
)(RestoreWalletScreen)
