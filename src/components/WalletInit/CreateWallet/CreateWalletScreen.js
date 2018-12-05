// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'

import MnemonicExplanationModal from './MnemonicExplanationModal'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {withNavigationTitle, withTranslations} from '../../../utils/renderUtils'
import WalletForm from '../WalletForm'
import Screen from '../../Screen'

import type {State} from '../../../state'

const getTranslations = (state: State) => state.trans.CreateWalletScreen

const CreateWalletScreen = ({
  setFormData,
  hideMnemonicExplanation,
  visibleMnemonicExplanation,
  navigateToMnemonicScreen,
}) => (
  <Screen scroll>
    <WalletForm onSubmit={setFormData} />
    <MnemonicExplanationModal
      visible={visibleMnemonicExplanation}
      onRequestClose={hideMnemonicExplanation}
      onConfirm={navigateToMnemonicScreen}
    />
  </Screen>
)

export default compose(
  withTranslations(getTranslations),
  withNavigationTitle(({translations}) => translations.title),
  withStateHandlers(
    {
      visibleMnemonicExplanation: false,
      formData: null,
    },
    {
      setFormData: (state) => (formData: any) => ({
        formData,
        visibleMnemonicExplanation: true,
      }),
      hideMnemonicExplanation: (state) => () => ({
        visibleMnemonicExplanation: false,
      }),
      clear: (state) => () => ({
        visibleMnemonicExplanation: false,
        formData: null,
      }),
    },
  ),
  withHandlers({
    navigateToMnemonicScreen: ({formData, clear, navigation}) => () => {
      clear()
      navigation.navigate(WALLET_INIT_ROUTES.MNEMONIC_SHOW, formData)
    },
  }),
)(CreateWalletScreen)
