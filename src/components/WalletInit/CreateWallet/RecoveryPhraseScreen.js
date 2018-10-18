// @flow

import React from 'react'
import {View, TouchableHighlight} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withState} from 'recompose'

import {Text} from '../../UiKit'
import Screen from '../../Screen'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {generateAdaMnemonic} from '../../../crypto/util'

import styles from './styles/RecoveryPhraseScreen.style'
import {COLORS} from '../../../styles/config'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'

const getTrans = (state: State) => state.trans.recoveryPhraseScreen

type Props = {
  navigateToRecoveryPhraseConfirmation: () => mixed,
  trans: SubTranslation<typeof getTrans>,
  mnemonic: string,
}

const CreateWalletScreen = ({navigateToRecoveryPhraseConfirmation, trans, mnemonic}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT} style={styles.screen}>
    <View style={styles.contentContainer}>
      <View>
        <View style={styles.titleContainer}>
          <Text>{trans.title}</Text>
        </View>

        <View style={styles.mnemonicWordsContainer}>
          <Text>{mnemonic}</Text>
        </View>

        <View style={styles.mnemonicNoteContainer}>
          <Text>{trans.mnemonicNote}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableHighlight
          activeOpacity={0.1}
          underlayColor={COLORS.WHITE}
          onPress={navigateToRecoveryPhraseConfirmation}
          style={styles.button}
        >
          <Text>{trans.confirmationButton}</Text>
        </TouchableHighlight>
      </View>
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    trans: getTrans(state),
  })),
  withState('mnemonic', 'setMnemonic', generateAdaMnemonic()),
  withHandlers({
    navigateToRecoveryPhraseConfirmation: ({navigation, mnemonic}) => () =>
      navigation.navigate(WALLET_INIT_ROUTES.RECOVERY_PHRASE_CONFIRMATION, {mnemonic}),
  })
)(CreateWalletScreen)
