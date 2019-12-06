// @flow
import React from 'react'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {connect} from 'react-redux'
import {injectIntl, defineMessages} from 'react-intl'

import WalletVerifyModal from './WalletVerifyModal'
import UpgradeCheckModal from './UpgradeCheckModal'
import UpgradeConfirmModal from './UpgradeConfirmModal'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {withNavigationTitle} from '../../../utils/renderUtils'
import WalletForm from '../WalletForm'
import {createWallet} from '../../../actions'

import type {Navigation} from '../../../types/navigation'

/* TODO */
const RESTORATION_DIALOG_STEPS = {
  WALLET_VERIFY: 'WALLET_VERIFY',
  CHECK_UPGRADE: 'CHECK_UPGRADE',
  CONFIRM_UPGRADE: 'CONFIRM_UPGRADE',
}
type restorationDialogSteps = $Values<typeof TRANSACTION_DIRECTION>

// TODO: just placeholders, delete
const byronAddresses = [
  '2cWKMJemoBakWtKxxsZpnEhs3ZWRf9tG3R9ReJX6UsAGiZP7PBpmutxYPRAakqEgMsK1g',
  '2cWKMJemoBahkhQS5QofBQxmsQMQDTxv1xzzqU9eHXBx6aDxaswBEksqurrfwhMNTYVFK',
]
const shelleyAddress = 'addr1qw8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguqd6r42j'
const balance = new BigNumber('1234235.234')
const finalBalance = new BigNumber('1234235.0')
const fees = new BigNumber('0.234')


const messages = defineMessages({
  title: {
    id: 'components.walletinit.restorewallet.walletcredentialsscreen.title',
    defaultMessage: '!!!Wallet credentials',
    description: 'some desc',
  },
})

type Props = {
  intl: any,
  navigation: Navigation,
  navigateToWalletVerify: ({
    name: string,
    password: string,
  }) => mixed,
}

const WalletCredentialsScreen = ({
  intl,
  navigation,
  showWalletVerifyModal,
  showUpgradeCheckModal,
  showUpgradeConfirmModal,
  navigateToWalletVerify,
}: Props) => (
  <>
    <WalletForm onSubmit={navigateToWalletVerify} />
    <WalletVerifyModal
      visible={showWalletVerifyModal}
      onConfirmVerify={}
      onBack={}
      onRequestClose={closeWalletVerifyModal}
    />
    <UpgradeCheckModal
      visible={showUpgradeCheckModal}
      onCheck={}
      onSkip={}
    />
    <UpgradeConfirmModal
      visible={showUpgradeConfirmModal}
      byronAddresses={byronAddresses}
      shelleyAddress={shelleyAddress}
      balance={balance}
      finalBalance={finalBalance}
      fees={fees}
      onCancel={}
      onConfirm={}
      onContinue={}
    />
  </>
)

export default injectIntl(
  compose(
    connect(
      () => ({}),
      {createWallet},
    ),
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withHandlers({
      // navigateToWalletVerify:
      //   ({navigation}) => ({name, password}) => {
      //     const phrase = navigation.getParam('phrase')
      //     // create wallet here, derive 1st Byron address and Shelley address
      //     // await createWallet(name, phrase, password)
      //     navigation.navigate(WALLET_INIT_ROUTES.WALLET_VERIFY, {
      //       name, password, phrase,
      //     })
      //   },
    }),
    withStateHandlers(
      {
        // TODO
        showalletVerifyModal: false,
        showUpgradeCheckModal: false,
        showUpgradeConfirmModal: false,
      },
      {
        onConfirmVerify: (state) => () => ({
          showalletVerifyModal: false,
          showUpgradeCheckModal: true,
        }),
      },
    ),
  )(WalletCredentialsScreen),
)
