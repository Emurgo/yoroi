// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {injectIntl, defineMessages} from 'react-intl'
import {BigNumber} from 'bignumber.js'
import {withNavigation} from 'react-navigation'

import WalletVerifyModal from './WalletVerifyModal'
import UpgradeCheckModal from './UpgradeCheckModal'
import UpgradeConfirmModal from './UpgradeConfirmModal'
import {ROOT_ROUTES} from '../../../RoutesList'
import {withNavigationTitle} from '../../../utils/renderUtils'
import WalletForm from '../WalletForm'
import {createWallet} from '../../../actions'
import {
  getMasterKeyFromMnemonic,
  getAccountFromMasterKey,
  getAddresses,
} from '../../../crypto/byron/util'
import {getFirstInternalAddr} from '../../../crypto/shelley/util'

import type {Navigation} from '../../../types/navigation'

const RESTORATION_DIALOG_STEPS = {
  CLOSED: 'CLOSED',
  WALLET_VERIFY: 'WALLET_VERIFY',
  CHECK_UPGRADE: 'CHECK_UPGRADE',
  CONFIRM_UPGRADE: 'CONFIRM_UPGRADE',
}
type restorationDialogSteps = $Values<typeof RESTORATION_DIALOG_STEPS>

// TODO: just placeholders, delete
const byronAddresses = [
  '2cWKMJemoBakWtKxxsZpnEhs3ZWRf9tG3R9ReJX6UsAGiZP7PBpmutxYPRAakqEgMsK1g',
  '2cWKMJemoBahkhQS5QofBQxmsQMQDTxv1xzzqU9eHXBx6aDxaswBEksqurrfwhMNTYVFK',
]
// const shelleyAddress =
// 'addr1qw8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguqd6r42j'
const balance = new BigNumber('1234235.234')
const finalBalance = new BigNumber('1234235.0')
const fees = new BigNumber('234123')

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
}

type State = {
  name: string,
  password: string,
  byronAddress: string,
  shelleyAddress: string,
  currentDialogStep: restorationDialogSteps,
  upgrading: boolean,
}

class WalletCredentialsScreen extends React.Component<Props, State> {
  state = {
    name: '',
    password: '',
    byronAddress: '',
    shelleyAddress: '',
    currentDialogStep: RESTORATION_DIALOG_STEPS.CLOSED,
    upgrading: false,
  }

  startWalletRestoration = async ({name, password}) => {
    const {navigation} = this.props
    const phrase = navigation.getParam('phrase')
    const mk = await getMasterKeyFromMnemonic(phrase)
    const acc = await getAccountFromMasterKey(mk)
    const addrs = await getAddresses(acc, 'External', [0])
    this.setState({
      byronAddress: addrs[0],
      shelleyAddress: await getFirstInternalAddr(phrase),
      currentDialogStep: RESTORATION_DIALOG_STEPS.WALLET_VERIFY,
      name,
      password,
    })
  }

  onConfirmVerify = () =>
    this.setState({currentDialogStep: RESTORATION_DIALOG_STEPS.CHECK_UPGRADE})

  onBack = () =>
    this.setState({
      currentDialogStep: RESTORATION_DIALOG_STEPS.CLOSED,
    })

  onCheck = () =>
    this.setState({
      currentDialogStep: RESTORATION_DIALOG_STEPS.CONFIRM_UPGRADE,
    })

  onConfirmUpgrade = () => {
    this.setState({upgrading: true})
  }

  navigateToWallet = async () => {
    const {name, password} = this.state
    const {navigation} = this.props
    const phrase = navigation.getParam('phrase')
    await createWallet(name, phrase, password)
    navigation.navigate(ROOT_ROUTES.WALLET)
  }

  render() {
    const {currentDialogStep, byronAddress, shelleyAddress} = this.state

    return (
      <>
        <WalletForm onSubmit={this.startWalletRestoration} />
        <WalletVerifyModal
          visible={currentDialogStep === RESTORATION_DIALOG_STEPS.WALLET_VERIFY}
          onConfirm={this.onConfirmVerify}
          onBack={this.onBack}
          byronAddress={byronAddress}
          shelleyAddress={shelleyAddress}
          onRequestClose={this.onBack}
        />
        <UpgradeCheckModal
          visible={currentDialogStep === RESTORATION_DIALOG_STEPS.CHECK_UPGRADE}
          onCheck={this.onCheck}
          onSkip={this.navigateToWallet}
          onRequestClose={this.onBack}
        />
        <UpgradeConfirmModal
          visible={
            currentDialogStep === RESTORATION_DIALOG_STEPS.CONFIRM_UPGRADE
          }
          byronAddresses={byronAddresses}
          shelleyAddress={shelleyAddress}
          balance={balance}
          finalBalance={finalBalance}
          fees={fees}
          onCancel={this.navigateToWallet}
          onConfirm={this.onConfirmUpgrade}
          onContinue={this.navigateToWallet}
          onRequestClose={this.onBack}
        />
      </>
    )
  }
}

export default injectIntl(
  compose(
    connect(
      () => ({}),
      {createWallet},
    ),
    withNavigation,
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
  )(WalletCredentialsScreen),
)
