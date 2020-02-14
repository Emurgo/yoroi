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
import {ignoreConcurrentAsync} from '../../../utils/utils'
import {ROOT_ROUTES} from '../../../RoutesList'
import {withNavigationTitle} from '../../../utils/renderUtils'
import WalletForm from '../WalletForm'
import {
  createWallet,
  submitShelleyTx,
  handleGeneralError,
  showErrorDialog,
} from '../../../actions'
import {getAddressesFromMnemonics} from '../../../crypto/byron/util'
import {
  getFirstInternalAddr,
  getGroupAddressesFromMnemonics,
} from '../../../crypto/shelley/util'
import {mnemonicsToAddresses, balanceForAddresses} from '../../../crypto/wallet'
import {generateTransferTxFromMnemonic} from '../../../crypto/shelley/transactions/yoroiTransfer'
import {CARDANO_CONFIG} from '../../../config'
import {NetworkError, ApiError} from '../../../api/errors'
import {InsufficientFunds} from '../../../crypto/errors'
import {errorMessages} from '../../../i18n/global-messages'

import type {Navigation} from '../../../types/navigation'
import type {AddressType} from '../../../crypto/commonUtils'
import type {Addressing} from '../../../types/HistoryTransaction'
import type {TransferTx} from '../../../crypto/shelley/transactions/yoroiTransfer'

const RESTORATION_DIALOG_STEPS = {
  CLOSED: 'CLOSED',
  WALLET_VERIFY: 'WALLET_VERIFY',
  CHECK_UPGRADE: 'CHECK_UPGRADE',
  CONFIRM_UPGRADE: 'CONFIRM_UPGRADE',
}
type restorationDialogSteps = $Values<typeof RESTORATION_DIALOG_STEPS>

const displayAddrType: AddressType = 'External'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.restorewallet.walletcredentialsscreen.title',
    defaultMessage: '!!!Wallet credentials',
    description: 'some desc',
  },
  walletCheckError: {
    id:
      'components.walletinit.restorewallet.walletcredentialsscreen.walletCheckError',
    defaultMessage: '!!!Could not verify wallet funds',
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

const handleApiError = async (
  error: Error,
  intl: any,
  fallbackMsg: string,
): Promise<void> => {
  if (error instanceof NetworkError) {
    await showErrorDialog(errorMessages.networkError, intl)
  } else if (error instanceof ApiError) {
    await showErrorDialog(errorMessages.apiError, intl)
  } else {
    await handleGeneralError(fallbackMsg, error, intl)
  }
}

type Props = {
  intl: any,
  navigation: Navigation,
  createWallet: (string, string, string, boolean) => any,
}

type State = {
  name: string,
  password: string,
  byronAddress: string,
  shelleyAddress: string,
  currentDialogStep: restorationDialogSteps,
  fundedLegacyAddresses: Array<string>,
  outputAddressInfo: ?{bech32: string, hex: string},
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
    shelleyAddress: '',
    currentDialogStep: RESTORATION_DIALOG_STEPS.CLOSED,
    fundedLegacyAddresses: [],
    outputAddressInfo: null,
    balance: null,
    fee: null,
    isProcessing: false,
    transferTx: null,
  }

  navigateToWallet = ignoreConcurrentAsync(async (): Promise<void> => {
    this.setState({isProcessing: true})
    const {name, password} = this.state
    const {navigation, createWallet} = this.props
    const phrase = navigation.getParam('phrase')
    const isShelleyWallet = !!navigation.getParam('isShelleyWallet')
    await createWallet(name, phrase, password, isShelleyWallet)
    this.setState({isProcessing: false})
    const route = isShelleyWallet
      ? ROOT_ROUTES.SHELLEY_WALLET
      : ROOT_ROUTES.WALLET
    navigation.navigate(route)
  }, 1000)

  onSubmitWalletCredentials = ({name, password}) => {
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
    const {navigation, intl} = this.props
    const isShelleyWallet = navigation.getParam('isShelleyWallet')
    if (isShelleyWallet === false) {
      this.navigateToWallet()
      return
    }
    this.setState({isProcessing: true})
    const phrase = navigation.getParam('phrase')
    try {
      // get first external byron address
      const byronAddr = await getAddressesFromMnemonics(
        phrase,
        displayAddrType,
        [0],
      )
      // get first external group address (bech32)
      const shelleyAddr = await getGroupAddressesFromMnemonics(
        phrase,
        displayAddrType,
        [0],
      )
      this.setState({
        isProcessing: false,
        byronAddress: byronAddr[0],
        shelleyAddress: shelleyAddr[0],
        currentDialogStep: RESTORATION_DIALOG_STEPS.WALLET_VERIFY,
      })
    } catch (e) {
      this.setState({
        currentDialogStep: RESTORATION_DIALOG_STEPS.CLOSED,
        isProcessing: false,
      })
      await showErrorDialog(errorMessages.generalError, intl, {
        message: e.message,
      })
    }
  }

  onConfirmVerify = () =>
    this.setState({currentDialogStep: RESTORATION_DIALOG_STEPS.CHECK_UPGRADE})

  onBack = () =>
    this.setState({
      currentDialogStep: RESTORATION_DIALOG_STEPS.CLOSED,
    })

  onCheck = async () => {
    // TODO: there is currently a bug when displaying the UpgradeCheckModal
    // tapping the 'check' button does nothing the first time, but works
    // the second time. Figure out why
    const {intl, navigation} = this.props
    const phrase = navigation.getParam('phrase')
    this.setState({isProcessing: true})
    try {
      // here addresses include addressing info
      const usedLegacyAddrs = await mnemonicsToAddresses(
        phrase,
        CARDANO_CONFIG.SHELLEY,
      )
      // get list of addresses with utxo. Doesn't include addressing
      const {fundedAddresses, sum} = await balanceForAddresses(
        usedLegacyAddrs.map((addr) => addr.address),
        CARDANO_CONFIG.SHELLEY,
      )
      let outputAddressInfo, transferTx
      if (fundedAddresses.length > 0 && sum != null) {
        // 1. get funded addresses with addressing info
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
        // 2. get destination address
        outputAddressInfo = await getFirstInternalAddr(phrase)
        // 3. generate transfer tx
        transferTx = await generateTransferTxFromMnemonic(
          phrase,
          outputAddressInfo.hex,
          addressedFundedAddresses,
          CARDANO_CONFIG.SHELLEY,
        )
      }
      this.setState({
        outputAddressInfo,
        transferTx,
        fundedLegacyAddresses: fundedAddresses || [],
        balance: sum,
        currentDialogStep: RESTORATION_DIALOG_STEPS.CONFIRM_UPGRADE,
        isProcessing: false,
      })
    } catch (e) {
      this.setState({currentDialogStep: RESTORATION_DIALOG_STEPS.CLOSED})
      if (e instanceof InsufficientFunds) {
        await showErrorDialog(errorMessages.insufficientBalance, intl)
      } else {
        handleApiError(e, intl, 'Could not check wallet')
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
      const {name, password} = this.state
      const {navigation, createWallet} = this.props
      const phrase = navigation.getParam('phrase')
      await createWallet(name, phrase, password, true)
      if (tx == null) {
        throw new Error('Transaction data not found.')
      }
      await submitShelleyTx(tx.encodedTx)
      this.setState({isProcessing: false})
      navigation.navigate(ROOT_ROUTES.SHELLEY_WALLET)
    } catch (e) {
      handleApiError(e, intl, 'Could not upgrade wallet')
    } finally {
      this.setState({isProcessing: false})
    }
  }

  render() {
    const {
      currentDialogStep,
      byronAddress,
      shelleyAddress,
      fundedLegacyAddresses,
      outputAddressInfo,
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
              shelleyAddress={shelleyAddress}
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
              shelleyAddress={outputAddressInfo?.bech32}
              balance={balance}
              finalBalance={finalBalance}
              fees={transferTx?.fee}
              onCancel={this.onBack}
              onConfirm={this.onConfirmUpgrade}
              onContinue={this.navigateToWallet}
              onRequestClose={this.onBack}
              txId={transferTx?.id}
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
