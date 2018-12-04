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

import styles from './styles/MnemonicShowScreen.style'
import {COLORS} from '../../../styles/config'
import MnemonicBackupImportanceModal from './MnemonicBackupImportanceModal'

import type {State} from '../../../state'

import {withNavigationTitle, withTranslations} from '../../../utils/renderUtils'
import type {Navigation} from '../../../types/navigation'
import type {ComponentType} from 'react'

const getTranslations = (state: State) => state.trans.MnemonicShowScreen

const MnemonicShowScreen = ({
  navigateToMnemonicCheck,
  translations,
  mnemonic,
  modal,
  showModal,
  hideModal,
}) => (
  <Screen bgColor={COLORS.BACKGROUND_GRAY} style={styles.screen}>
    <View style={styles.contentContainer}>
      <View>
        <View style={styles.mnemonicNoteContainer}>
          <Text>{translations.mnemonicNote}</Text>
        </View>
        <View style={styles.mnemonicWordsContainer}>
          <Text>{mnemonic}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button onPress={showModal} title={translations.confirmationButton} />
      </View>
    </View>

    {modal ? (
      <MnemonicBackupImportanceModal
        visible={modal}
        onConfirm={navigateToMnemonicCheck}
        onRequestClose={hideModal}
      />
    ) : null}
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
  withState('modal', 'setModal', false),
  withHandlers({
    showModal: ({setModal}) => () => {
      setModal(true)
    },
    hideModal: ({setModal}) => () => {
      setModal(false)
    },
    navigateToMnemonicCheck: ({navigation, setModal, mnemonic}) => () => {
      const name = navigation.getParam('name')
      const password = navigation.getParam('password')
      assert.assert(!!mnemonic, 'handleWalletConfirmation:: mnemonic')
      assert.assert(!!password, 'handleWalletConfirmation:: password')
      assert.assert(!!name, 'handleWalletConfirmation:: name')
      navigation.navigate(WALLET_INIT_ROUTES.MNEMONIC_CHECK, {
        mnemonic,
        password,
        name,
      })
      setModal(false)
    },
  }),
)(MnemonicShowScreen): ComponentType<{navigation: Navigation}>)
