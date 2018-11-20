// @flow

import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {withHandlers, withState} from 'recompose'

import assert from '../../../utils/assert'
import {Text, Button} from '../../UiKit'
import Screen from '../../Screen'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {generateAdaMnemonic} from '../../../crypto/util'
import {CONFIG} from '../../../config'

import styles from './styles/RecoveryPhraseScreen.style'
import {COLORS} from '../../../styles/config'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'

import {withNavigationTitle, withTranslations} from '../../../utils/renderUtils'
import type {Navigation} from '../../../types/navigation'
import type {ComponentType} from 'react'

const getTranslations = (state: State) => state.trans.RecoveryPhraseScreen

type Props = {
  navigateToRecoveryPhraseConfirmation: () => mixed,
  translations: SubTranslation<typeof getTranslations>,
  mnemonic: string,
}

const RecoveryPhraseScreen = ({
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

export default (compose(
  withTranslations(getTranslations),
  withNavigationTitle(({translations}) => translations.title),
  withState(
    'mnemonic',
    'setMnemonic',
    CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.MNEMONIC2 : generateAdaMnemonic(),
  ),
  withHandlers({
    navigateToRecoveryPhraseConfirmation: ({navigation, mnemonic}) => () => {
      const name = navigation.getParam('name')
      const password = navigation.getParam('password')
      assert.assert(!!mnemonic, 'handleWalletConfirmation:: mnemonic')
      assert.assert(!!password, 'handleWalletConfirmation:: password')
      assert.assert(!!name, 'handleWalletConfirmation:: name')
      navigation.navigate(
        WALLET_INIT_ROUTES.RECOVERY_PHRASE_CONFIRMATION_DIALOG,
        {
          mnemonic,
          password,
          name,
        },
      )
    },
  }),
)(RecoveryPhraseScreen): ComponentType<{navigation: Navigation}>)
