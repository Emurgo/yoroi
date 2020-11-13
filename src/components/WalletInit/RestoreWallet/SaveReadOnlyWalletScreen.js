// @flow

import React from 'react'
import {injectIntl, intlShape, defineMessages} from 'react-intl'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers} from 'recompose'

import WalletNameForm from '../WalletNameForm'
import {
  createWalletWithBip44Account,
  handleGeneralError,
} from '../../../actions'
import {WALLET_ROOT_ROUTES} from '../../../RoutesList'
import {CONFIG} from '../../../config/config'
import assert from '../../../utils/assert'
import {Logger} from '../../../utils/logging'

import type {ComponentType} from 'react'
import type {Navigation} from '../../../types/navigation'

const messages = defineMessages({
  defaultWalletName: {
    id: 'components.walletinit.savereadonlywalletscreen.defaultWalletName',
    defaultMessage: '!!!My read-only wallet',
  },
})

const SaveReadOnlyWalletScreen = ({onSubmit, navigation, intl}) => (
  <WalletNameForm
    onSubmit={onSubmit}
    navigation={navigation}
    defaultWalletName={intl.formatMessage(messages.defaultWalletName)}
  />
)

type ExternalProps = {|
  intl: intlShape,
  navigation: Navigation,
  route: Object, // TODO(navigation): type
|}

export default injectIntl(
  (compose(
    connect(
      (_state) => ({}),
      {
        createWalletWithBip44Account,
      },
    ),
    withHandlers({
      onSubmit: ({
        createWalletWithBip44Account,
        navigation,
        intl,
        route,
      }) => async ({name}) => {
        try {
          const {publicKeyHex} = route.params
          assert.assert(
            publicKeyHex != null,
            'SaveReadOnlyWalletScreen::onPress publicKeyHex',
          )
          await createWalletWithBip44Account(
            name,
            publicKeyHex,
            CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
            CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
            null,
            true, // important: read-only flag
          )
          navigation.navigate(WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES)
        } catch (e) {
          Logger.error('SaveReadOnlyWalletScreen::onSubmit', e)
          await handleGeneralError(e.message, e, intl)
        }
      },
    }),
  )(SaveReadOnlyWalletScreen): ComponentType<ExternalProps>),
)
