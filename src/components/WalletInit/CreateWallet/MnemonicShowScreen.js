// @flow

import React from 'react'
import {View, Image} from 'react-native'
import {compose} from 'redux'
import {withHandlers, withStateHandlers, withProps} from 'recompose'
import {SafeAreaView} from 'react-navigation'

import assert from '../../../utils/assert'
import {Text, Button, StatusBar} from '../../UiKit'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'

import styles from './styles/MnemonicShowScreen.style'
import MnemonicBackupImportanceModal from './MnemonicBackupImportanceModal'
import recoveryPhrase from '../../../assets/img/recovery_phrase.png'

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
  <SafeAreaView style={styles.safeAreaView}>
    <StatusBar type="dark" />
    <View style={styles.contentContainer}>
      <View>
        <Text>{translations.mnemonicNote}</Text>
        <View style={styles.mnemonicWordsContainer}>
          {mnemonic.split(' ').map((word, index) => (
            <Text key={index} style={styles.mnemonicText}>
              {word}
            </Text>
          ))}
        </View>
      </View>
      <View style={styles.image}>
        <Image source={recoveryPhrase} />
      </View>
      <View>
        <Button onPress={showModal} title={translations.confirmationButton} />
      </View>
    </View>

    {modal && (
      <MnemonicBackupImportanceModal
        visible={modal}
        onConfirm={navigateToMnemonicCheck}
        onRequestClose={hideModal}
      />
    )}
  </SafeAreaView>
)

export default (compose(
  withTranslations(getTranslations),
  withNavigationTitle(({translations}) => translations.title),
  withProps((props) => ({mnemonic: props.navigation.getParam('mnemonic')})),
  withStateHandlers(
    {
      modal: false,
    },
    {
      showModal: (state) => () => ({modal: true}),
      hideModal: (state) => () => ({modal: false}),
    },
  ),
  withHandlers({
    navigateToMnemonicCheck: ({navigation, hideModal, mnemonic}) => () => {
      const name = navigation.getParam('name')
      const password = navigation.getParam('password')
      const mnemonic = navigation.getParam('mnemonic')
      assert.assert(!!mnemonic, 'handleWalletConfirmation:: mnemonic')
      assert.assert(!!password, 'handleWalletConfirmation:: password')
      assert.assert(!!name, 'handleWalletConfirmation:: name')
      navigation.navigate(WALLET_INIT_ROUTES.MNEMONIC_CHECK, {
        mnemonic,
        password,
        name,
      })
      hideModal()
    },
  }),
)(MnemonicShowScreen): ComponentType<{navigation: Navigation}>)
