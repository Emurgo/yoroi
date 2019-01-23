// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'

import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {generateAdaMnemonic} from '../../../crypto/util'
import {CONFIG} from '../../../config'
import {withNavigationTitle, withTranslations} from '../../../utils/renderUtils'
import WalletForm from '../WalletForm'

import type {State} from '../../../state'

import MnemonicExplanationModal from './MnemonicExplanationModal'

const getTranslations = (state: State) => state.trans.CreateWalletScreen

const CreateWalletScreen = ({
  setFormData,
  hideMnemonicExplanation,
  visibleMnemonicExplanation,
  navigateToMnemonicScreen,
}) => (
  <>
    <WalletForm onSubmit={setFormData} />
    <MnemonicExplanationModal
      visible={visibleMnemonicExplanation}
      onRequestClose={hideMnemonicExplanation}
      onConfirm={navigateToMnemonicScreen}
    />
  </>
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
      const mnemonic = CONFIG.DEBUG.PREFILL_FORMS ? CONFIG.DEBUG.MNEMONIC2: generateAdaMnemonic()
      navigation.navigate(WALLET_INIT_ROUTES.MNEMONIC_SHOW, {mnemonic, ...formData})
    },
  }),
)(CreateWalletScreen)
