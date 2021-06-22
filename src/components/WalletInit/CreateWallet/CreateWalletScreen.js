// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'

import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {generateAdaMnemonic} from '../../../crypto/byron/util'
import WalletForm from '../WalletForm'

import MnemonicExplanationModal from './MnemonicExplanationModal'

const CreateWalletScreen = ({
  setFormData,
  hideMnemonicExplanation,
  visibleMnemonicExplanation,
  navigateToMnemonicScreen,
  navigation,
}) => (
  <>
    <WalletForm onSubmit={setFormData} navigation={navigation} />
    <MnemonicExplanationModal
      visible={visibleMnemonicExplanation}
      onRequestClose={hideMnemonicExplanation}
      onConfirm={navigateToMnemonicScreen}
    />
  </>
)

export default compose(
  withStateHandlers(
    {
      visibleMnemonicExplanation: false,
      formData: null,
    },
    {
      setFormData: () => (formData: any) => ({
        formData,
        visibleMnemonicExplanation: true,
      }),
      hideMnemonicExplanation: () => () => ({
        visibleMnemonicExplanation: false,
      }),
      clear: () => () => ({
        visibleMnemonicExplanation: false,
        formData: null,
      }),
    },
  ),
  withHandlers({
    navigateToMnemonicScreen: ({formData, clear, navigation, route}) => () => {
      clear()
      // TODO(v-almonacid): we need to generate mnemonics according to the
      // target network.
      const mnemonic = generateAdaMnemonic()
      const {networkId, walletImplementationId} = route.params
      navigation.navigate(WALLET_INIT_ROUTES.MNEMONIC_SHOW, {
        mnemonic,
        networkId,
        walletImplementationId,
        ...formData,
      })
    },
  }),
)(CreateWalletScreen)
