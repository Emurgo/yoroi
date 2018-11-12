// @flow

import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'

import assert from '../../../utils/assert'
import {Text, Button} from '../../UiKit'
import Screen from '../../Screen'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'

import styles from './styles/RecoveryPhraseExplanationDialog.style'
import {COLORS} from '../../../styles/config'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'

const getTranslations = (state: State) =>
  state.trans.RecoveryPhraseExplanationDialog

type Props = {
  navigateToRecoveryPhrase: () => mixed,
  translations: SubTranslation<typeof getTranslations>,
}

const RecoveryPhraseExplanationDialog = ({
  navigateToRecoveryPhrase,
  translations,
}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT_BLACK}>
    <View style={styles.dialogBody}>
      <Text>{translations.title}</Text>
      <Text>{translations.paragraph1}</Text>
      <Text>{translations.paragraph2}</Text>

      <Button
        onPress={navigateToRecoveryPhrase}
        title={translations.nextButton}
      />
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withHandlers({
    navigateToRecoveryPhrase: ({navigation}) => (event) => {
      const name = navigation.getParam('name')
      const password = navigation.getParam('password')

      assert.assert(!!password, 'handleWalletConfirmation:: password')
      assert.assert(!!name, 'handleWalletConfirmation:: name')
      navigation.replace(WALLET_INIT_ROUTES.RECOVERY_PHRASE, {
        name,
        password,
      })
    },
  }),
)(RecoveryPhraseExplanationDialog)
