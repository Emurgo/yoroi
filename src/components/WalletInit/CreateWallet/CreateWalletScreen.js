// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {generateAdaMnemonic} from '../../../crypto/byron/util'
import {withNavigationTitle} from '../../../utils/renderUtils'
import WalletForm from '../WalletForm'

import MnemonicExplanationModal from './MnemonicExplanationModal'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.createwallet.createwalletscreen.title',
    defaultMessage: '!!!Create a new wallet',
    description: 'some desc',
  },
})

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

export default injectIntl(
  compose(
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
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
        // TODO(v-almonacid): we need to generate mnemonics according to the
        // target network.
        const mnemonic = generateAdaMnemonic()
        const networkId = navigation.getParam('networkId')
        navigation.navigate(WALLET_INIT_ROUTES.MNEMONIC_SHOW, {
          mnemonic,
          networkId,
          ...formData,
        })
      },
    }),
  )(CreateWalletScreen),
)
