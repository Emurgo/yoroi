// @flow

import React from 'react'
import {View, TextInput, TouchableHighlight} from 'react-native'
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
  empty: boolean,
  unknownWord: boolean,
  unknownRemainder: boolean,
}

const validatePhrase = ({phrase}) => () => {
  if (phrase) {
    const words = _(phrase.split(' '))
    const unknownWord = words.initial().some((word) => !wordlists.EN.includes(word))
    const unknownRemainder = words.last() && !wordlists.EN.includes(words.last())

    return (unknownWord || unknownRemainder)
      ? {unknownWord, unknownRemainder}
      : null
  } else {
    return {empty: true}
  }
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
          {(errors && errors.unknownWord) &&
            (<Text style={styles.error}>{translations.unknownWord}</Text>)
          }
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
    validatePhrase,
  })
)(RestoreWalletScreen)
