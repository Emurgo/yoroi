// @flow

import React from 'react'
import {injectIntl, intlShape} from 'react-intl'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers} from 'recompose'

import WalletNameForm from '../WalletNameForm'
import {createWalletWithBip44Account} from '../../../actions'
import {saveHW} from '../../../actions/hwWallet'
import {WALLET_ROOT_ROUTES} from '../../../RoutesList'
import {CONFIG} from '../../../config/config'
import assert from '../../../utils/assert'

import image from '../../../assets/img/ledger_2.png'

import type {ComponentType} from 'react'
import type {Navigation} from '../../../types/navigation'

const SaveNanoXScreen = ({onSubmit, navigation}) => (
  <WalletNameForm
    onSubmit={onSubmit}
    navigation={navigation}
    defaultWalletName={CONFIG.HARDWARE_WALLETS.LEDGER_NANO.DEFAULT_WALLET_NAME}
    image={image}
    progress={{
      currentStep: 3,
      totalSteps: 3,
    }}
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
        saveHW,
      },
    ),
    withHandlers({
      onSubmit: ({
        createWalletWithBip44Account,
        saveHW,
        navigation,
        route,
      }) => async ({name}) => {
        const {networkId, walletImplementationId, hwDeviceInfo} = route.params
        assert.assert(
          hwDeviceInfo != null,
          'SaveNanoXScreen::onPress hwDeviceInfo',
        )
        await createWalletWithBip44Account(
          name,
          hwDeviceInfo.bip44AccountPublic,
          networkId,
          walletImplementationId,
          hwDeviceInfo,
          false,
        )
        saveHW(hwDeviceInfo)
        navigation.navigate(WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES)
      },
    }),
  )(SaveNanoXScreen): ComponentType<ExternalProps>),
)
