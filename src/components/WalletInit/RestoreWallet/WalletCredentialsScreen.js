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
import {
  createWallet,
  submitShelleyTransferTx,
  // handleGeneralError,
  showErrorDialog,
} from '../../../actions'
import {
  getAddressesFromMnemonics,
  mnemonicsToAddresses,
  balanceForAddresses,
} from '../../../crypto/byron/util'
import {getFirstInternalAddr} from '../../../crypto/shelley/util'
import {generateTransferTxFromMnemonic} from '../../../crypto/shelley/transactions/yoroiTransfer'
import {CARDANO_CONFIG} from '../../../config'
import {NetworkError, ApiError} from '../../../api/errors'
import {errorMessages} from '../../../i18n/global-messages'

import type {Navigation} from '../../../types/navigation'
import type {AddressType} from '../../../crypto/byron/util'
import type {Addressing} from '../../../types/HistoryTransaction'
import type {TransferTx} from '../../../crypto/shelley/transactions/yoroiTransfer'

const RESTORATION_DIALOG_STEPS = {
  CLOSED: 'CLOSED',
  WALLET_VERIFY: 'WALLET_VERIFY',
  CHECK_UPGRADE: 'CHECK_UPGRADE',
  CONFIRM_UPGRADE: 'CONFIRM_UPGRADE',
}
type restorationDialogSteps = $Values<typeof RESTORATION_DIALOG_STEPS>

const displayAddrType: AddressType = 'Internal'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.restorewallet.walletcredentialsscreen.title',
    defaultMessage: '!!!Wallet credentials',
    description: 'some desc',
  },
})

const getAddressing = (
  rawAddr: string,
  addresses: Array<{|address: string, ...Addressing|}>,
): ?{|address: string, ...Addressing|} => {
  for (let i = 0; i < addresses.length; i++) {
    if (rawAddr === addresses[i].address) {
      return addresses[i]
    }
  }
  return null
}

type Props = {
  intl: any,
  navigation: Navigation,
  createWallet: (string, string, string) => any,
}

type State = {
  name: string,
  password: string,
  byronAddress: string,
  shelleyAddressHex: string,
  shelleyAddressBech32: string,
  currentDialogStep: restorationDialogSteps,
  fundedLegacyAddresses: Array<string>,
  balance: ?BigNumber,
  fee: ?BigNumber,
  isProcessing: boolean,
  transferTx: ?TransferTx,
}

class WalletCredentialsScreen extends React.Component<Props, State> {
  state = {
    name: '',
    password: '',
    byronAddress: '',
    shelleyAddressHex: '',
    shelleyAddressBech32: '',
    currentDialogStep: RESTORATION_DIALOG_STEPS.CLOSED,
    fundedLegacyAddresses: [],
    balance: null,
    fee: null,
    isProcessing: false,
    transferTx: null,
  }

  onSubmitWalletCredentials = ({name, password}) => {
    // TODO: make sure this call is executed only once
    const self = this
    this.setState(
      {
        name,
        password,
        // call on next tick because setState is async
      },
      () => self.startWalletRestoration(),
    )
  }

  startWalletRestoration = async () => {
    const isShelleyWallet = this.props.navigation.getParam('isShelleyWallet')
    if (isShelleyWallet === false) {
      this.navigateToWallet()
      return
    }
    this.setState({isProcessing: true})
    const {navigation} = this.props
    const phrase = navigation.getParam('phrase')
    // get first internal byron address
    const byronAddr = await getAddressesFromMnemonics(phrase, displayAddrType, [
      0,
    ])
    // get staking address
    const shelleyAddr = await getFirstInternalAddr(phrase)
    this.setState({
      isProcessing: false,
      byronAddress: byronAddr[0],
      shelleyAddressHex: shelleyAddr.hex,
      shelleyAddressBech32: shelleyAddr.bech32,
      currentDialogStep: RESTORATION_DIALOG_STEPS.WALLET_VERIFY,
    })
  }

  onConfirmVerify = () =>
    this.setState({currentDialogStep: RESTORATION_DIALOG_STEPS.CHECK_UPGRADE})

  onBack = () =>
    this.setState({
      currentDialogStep: RESTORATION_DIALOG_STEPS.CLOSED,
    })

  onCheck = async () => {
    // TODO: there is currently a bug in when displaying the UpgradeCheckModal
    // tapping the 'check' button does not nothing the first time, but works
    // the second time. Figure out why
    const {intl, navigation} = this.props
    const {shelleyAddressHex} = this.state
    const phrase = navigation.getParam('phrase')
    this.setState({isProcessing: true})
    try {
      // here addresses include addressing info
      const usedLegacyAddrs = await mnemonicsToAddresses(
        phrase,
        CARDANO_CONFIG.SHELLEY,
      )
      // get list of addresses with utxo. Doesn't include addressing
      // $FlowFixMe
      const {fundedAddresses, sum} = await balanceForAddresses(
        usedLegacyAddrs.map((addr) => addr.address),
        CARDANO_CONFIG.SHELLEY,
      )
      if (fundedAddresses.length > 0 && sum != null) {
        // get addressing info
        const addressedFundedAddresses = []
        for (let i = 0; i < fundedAddresses.length; i++) {
          const addressedAddr = getAddressing(
            fundedAddresses[i],
            usedLegacyAddrs,
          )
          if (addressedAddr != null) {
            addressedFundedAddresses.push(addressedAddr)
          } else {
            throw new Error('could not retrieve addressing information')
          }
        }
        const transferTx = await generateTransferTxFromMnemonic(
          phrase,
          shelleyAddressHex,
          addressedFundedAddresses,
          CARDANO_CONFIG.SHELLEY,
        )
        this.setState({
          fundedLegacyAddresses: fundedAddresses.map((addr) => addr.address),
          balance: sum,
          transferTx,
        })
      }
      this.setState({
        currentDialogStep: RESTORATION_DIALOG_STEPS.CONFIRM_UPGRADE,
        isProcessing: false,
      })
    } catch (e) {
      this.setState({currentDialogStep: RESTORATION_DIALOG_STEPS.CLOSED})
      if (e instanceof NetworkError) {
        await showErrorDialog(errorMessages.networkError, intl)
      } else if (e instanceof ApiError) {
        await showErrorDialog(errorMessages.apiError, intl)
      } else {
        // TODO: use handleGeneralError once fix is merged
        await showErrorDialog(errorMessages.generalError, intl, {
          message: e.message,
        })
        // handleGeneralError('Could not verify wallet funds', e)
      }
    } finally {
      this.setState({isProcessing: false})
    }
  }

  onConfirmUpgrade = async () => {
    const tx = this.state.transferTx
    const {intl} = this.props
    this.setState({isProcessing: true})
    try {
      if (tx == null) {
        throw new Error('Transaction data not found.')
      }
      await submitShelleyTransferTx(tx.encodedTx)
      this.setState({isProcessing: false})
      this.navigateToWallet()
    } catch (e) {
      if (e instanceof NetworkError) {
        await showErrorDialog(errorMessages.networkError, intl)
      } else if (e instanceof ApiError) {
        await showErrorDialog(errorMessages.apiError, intl)
      } else {
        throw e
      }
    } finally {
      this.setState({isProcessing: false})
    }
  }

  navigateToWallet = async () => {
    const {name, password} = this.state
    const {navigation, createWallet} = this.props
    const phrase = navigation.getParam('phrase')
    await createWallet(name, phrase, password)
    navigation.navigate(ROOT_ROUTES.WALLET)
  }

  render() {
    const {
      currentDialogStep,
      byronAddress,
      shelleyAddressBech32,
      fundedLegacyAddresses,
      balance,
      isProcessing,
      transferTx,
    } = this.state

    const isShelleyWallet = this.props.navigation.getParam('isShelleyWallet')

    const finalBalance =
      transferTx != null
        ? transferTx.recoveredBalance.minus(transferTx.fee)
        : null

    return (
      <>
        <WalletForm onSubmit={this.onSubmitWalletCredentials} />

        {isShelleyWallet && (
          <>
            <WalletVerifyModal
              visible={
                currentDialogStep === RESTORATION_DIALOG_STEPS.WALLET_VERIFY
              }
              onConfirm={this.onConfirmVerify}
              onBack={this.onBack}
              byronAddress={byronAddress}
              shelleyAddress={shelleyAddressBech32}
              onRequestClose={this.onBack}
            />
            <UpgradeCheckModal
              visible={
                currentDialogStep === RESTORATION_DIALOG_STEPS.CHECK_UPGRADE
              }
              disableButtons={isProcessing}
              onCheck={this.onCheck}
              onSkip={this.navigateToWallet}
              onRequestClose={this.onBack}
            />
            <UpgradeConfirmModal
              visible={
                currentDialogStep === RESTORATION_DIALOG_STEPS.CONFIRM_UPGRADE
              }
              disableButtons={isProcessing}
              byronAddresses={fundedLegacyAddresses}
              shelleyAddress={shelleyAddressBech32}
              balance={balance}
              finalBalance={finalBalance}
              fees={transferTx?.fee}
              onCancel={this.navigateToWallet}
              onConfirm={this.onConfirmUpgrade}
              onContinue={this.navigateToWallet}
              onRequestClose={this.onBack}
            />
          </>
        )}
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
