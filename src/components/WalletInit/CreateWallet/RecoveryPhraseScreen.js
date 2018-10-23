// @flow

import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withState} from 'recompose'

import {Text, Button} from '../../UiKit'
import Screen from '../../Screen'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {generateAdaMnemonic} from '../../../crypto/util'

import styles from './styles/RecoveryPhraseScreen.style'
import {COLORS} from '../../../styles/config'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'

const getTranslations = (state: State) => state.trans.recoveryPhraseScreen

type Props = {
  navigateToRecoveryPhraseConfirmation: () => mixed,
  translations: SubTranslation<typeof getTranslations>,
  mnemonic: string,
}

const CreateWalletScreen = ({
  navigateToRecoveryPhraseConfirmation,
  translations,
  mnemonic,
}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT} style={styles.screen}>
    <View style={styles.contentContainer}>
      <View>
        <View style={styles.titleContainer}>
          <Text>{translations.title}</Text>
        </View>

        <View style={styles.mnemonicWordsContainer}>
          <Text>{mnemonic}</Text>
        </View>

        <View style={styles.mnemonicNoteContainer}>
          <Text>{translations.mnemonicNote}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          onPress={navigateToRecoveryPhraseConfirmation}
          title={translations.confirmationButton}
        />
      </View>
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withState('mnemonic', 'setMnemonic', generateAdaMnemonic()),
  withHandlers({
    navigateToRecoveryPhraseConfirmation: ({navigation, mnemonic}) =>
      () => navigation.navigate(
        WALLET_INIT_ROUTES.RECOVERY_PHRASE_CONFIRMATION, {
          mnemonic,
          password: navigation.getParam('password'),
        }),
  })
)(CreateWalletScreen)
