// @flow

import React from 'react'
import {injectIntl, type IntlShape, defineMessages} from 'react-intl'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers} from 'recompose'

import WalletNameForm from '../WalletNameForm'
import {createWalletWithBip44Account} from '../../../actions'
import {saveHW} from '../../../actions/hwWallet'
import {WALLET_ROOT_ROUTES, ROOT_ROUTES} from '../../../RoutesList'
import {CONFIG} from '../../../config/config'
import assert from '../../../utils/assert'
import {withNavigationTitle} from '../../../utils/renderUtils'

import image from '../../../assets/img/ledger_2.png'

import type {ComponentType} from 'react'
import type {Navigation} from '../../../types/navigation'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.connectnanox.savenanoxscreen.title',
    defaultMessage: '!!!Save wallet',
  },
})

type Props = {
  onSubmit: any,
}
const SaveNanoXScreen = ({onSubmit}: Props) => (
  <WalletNameForm
    onSubmit={onSubmit}
    defaultWalletName={CONFIG.HARDWARE_WALLETS.LEDGER_NANO.DEFAULT_WALLET_NAME}
    // $FlowFixMe
    image={image}
    progress={{
      currentStep: 3,
      totalSteps: 3,
    }}
  />
)

type ExternalProps = {|
  intl: IntlShape,
  navigation: Navigation,
  route: Object, // TODO(navigation): type
|}

export default injectIntl(
  (compose(
    connect((_state) => ({}), {
      createWalletWithBip44Account,
      saveHW,
    }),
    withNavigationTitle(({intl}: {intl: IntlShape}) => intl.formatMessage(messages.title)),
    withHandlers({
      onSubmit:
        ({createWalletWithBip44Account, saveHW, navigation, route}) =>
        async ({name}) => {
          const {networkId, walletImplementationId, hwDeviceInfo} = route.params
          assert.assert(hwDeviceInfo != null, 'SaveNanoXScreen::onPress hwDeviceInfo')
          await createWalletWithBip44Account(
            name,
            hwDeviceInfo.bip44AccountPublic,
            networkId,
            walletImplementationId,
            hwDeviceInfo,
            false,
          )
          saveHW(hwDeviceInfo)
          navigation.navigate(ROOT_ROUTES.WALLET, {
            screen: WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES,
          })
        },
    }),
  )(SaveNanoXScreen): ComponentType<ExternalProps>),
)
