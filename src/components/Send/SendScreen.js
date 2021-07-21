// @flow

import React, {Component} from 'react'
import {BigNumber} from 'bignumber.js'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {ScrollView, View, ActivityIndicator} from 'react-native'
import _ from 'lodash'
import {SafeAreaView} from 'react-native-safe-area-context'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
/* eslint-disable-next-line camelcase */
import {min_ada_required, BigNum} from '@emurgo/react-native-haskell-shelley'

import {CONFIG} from '../../config/config'
import {isHaskellShelleyNetwork, getCardanoNetworkConfigById} from '../../config/networks'
import {SEND_ROUTES} from '../../RoutesList'
import {Text, Button, OfflineBanner, ValidatedTextInput, StatusBar, Banner, Checkbox} from '../UiKit'
import AssetSelector from '../Common/MultiAsset/AssetSelector'
import DangerousActionModal from '../Common/DangerousActionModal'
import {
  isFetchingUtxosSelector,
  lastUtxosFetchErrorSelector,
  tokenBalanceSelector,
  utxosSelector,
  isOnlineSelector,
  hasPendingOutgoingTransactionSelector,
  tokenInfoSelector,
  defaultNetworkAssetSelector,
  serverStatusSelector,
} from '../../selectors'
import {fetchUTXOs} from '../../actions/utxo'
import {
  normalizeTokenAmount,
  formatTokenAmount,
  formatTokenInteger,
  formatTokenWithText,
  formatTokenWithSymbol,
  getAssetDenominationOrId,
  truncateWithEllipsis,
} from '../../utils/format'
import {parseAmountDecimal, InvalidAssetAmount} from '../../utils/parsing'
import walletManager from '../../crypto/walletManager'
import {validateAmount, validateAddressAsync} from '../../utils/validators'
import AmountField from './AmountField'
import UtxoAutoRefresher from './UtxoAutoRefresher'
import {InsufficientFunds, AssetOverflowError} from '../../crypto/errors'
import {MultiToken} from '../../crypto/MultiToken'
import {cardanoValueFromMultiToken} from '../../crypto/shelley/utils'

import styles from './styles/SendScreen.style'

import type {ServerStatusCache} from '../../state'
import type {Navigation} from '../../types/navigation'
import type {Token, DefaultAsset} from '../../types/HistoryTransaction'
import type {TokenEntry} from '../../crypto/MultiToken'
import type {CreateUnsignedTxResponse} from '../../crypto/shelley/transactionUtils'
import globalMessages, {confirmationMessages} from '../../i18n/global-messages'
import type {RawUtxo} from '../../api/types'
import type {AddressValidationErrors, AmountValidationErrors, BalanceValidationErrors} from '../../utils/validators'
import type {ComponentType} from 'react'

const amountInputErrorMessages = defineMessages({
  INVALID_AMOUNT: {
    id: 'components.send.sendscreen.amountInput.error.INVALID_AMOUNT',
    defaultMessage: '!!!Please enter valid amount',
    description: 'some desc',
  },
  TOO_MANY_DECIMAL_PLACES: {
    id: 'components.send.sendscreen.amountInput.error.TOO_MANY_DECIMAL_PLACES',
    defaultMessage: '!!!Please enter valid amount',
    description: 'some desc',
  },
  TOO_LARGE: {
    id: 'components.send.sendscreen.amountInput.error.TOO_LARGE',
    defaultMessage: '!!!Amount too large',
    description: 'some desc',
  },
  TOO_LOW: {
    id: 'components.send.sendscreen.amountInput.error.TOO_LOW',
    defaultMessage: '!!!Amount is too low',
    description: 'some desc',
  },
  LT_MIN_UTXO: {
    id: 'components.send.sendscreen.amountInput.error.LT_MIN_UTXO',
    defaultMessage: '!!!Cannot send less than {minUtxo} {ticker}',
    description: 'some desc',
  },
  NEGATIVE: {
    id: 'components.send.sendscreen.amountInput.error.NEGATIVE',
    defaultMessage: '!!!Amount must be positive',
    description: 'some desc',
  },
  insufficientBalance: {
    id: 'components.send.sendscreen.amountInput.error.insufficientBalance',
    defaultMessage: '!!!Not enough money to make this transaction',
    description: 'some desc',
  },
  assetOverflow: {
    id: 'components.send.sendscreen.amountInput.error.assetOverflow',
    defaultMessage: '!!!!Maximum value of a token inside a UTXO exceeded (overflow).',
  },
})

const messages = defineMessages({
  feeLabel: {
    id: 'components.send.sendscreen.feeLabel',
    defaultMessage: '!!!Fee',
    description: 'some desc',
  },
  feeNotAvailable: {
    id: 'components.send.sendscreen.feeNotAvailable',
    defaultMessage: '!!!-',
    description: 'some desc',
  },
  balanceAfterLabel: {
    id: 'components.send.sendscreen.balanceAfterLabel',
    defaultMessage: '!!!Balance after',
    description: 'some desc',
  },
  balanceAfterNotAvailable: {
    id: 'components.send.sendscreen.balanceAfterNotAvailable',
    defaultMessage: '!!!-',
    description: 'some desc',
  },
  availableFundsBannerIsFetching: {
    id: 'components.send.sendscreen.availableFundsBannerIsFetching',
    defaultMessage: '!!!Checking balance...',
    description: 'some desc',
  },
  availableFundsBannerNotAvailable: {
    id: 'components.send.sendscreen.availableFundsBannerNotAvailable',
    defaultMessage: '!!!-',
    description: 'some desc',
  },
  addressInputErrorInvalidAddress: {
    id: 'components.send.sendscreen.addressInputErrorInvalidAddress',
    defaultMessage: '!!!Please enter valid address',
    description: 'some desc',
  },
  addressInputLabel: {
    id: 'components.send.sendscreen.addressInputLabel',
    defaultMessage: '!!!Address',
    description: 'some desc',
  },
  checkboxSendAllAssets: {
    id: 'components.send.sendscreen.checkboxSendAllAssets',
    defaultMessage: '!!!Send all assets (including all tokens)',
    description: 'some desc',
  },
  checkboxSendAll: {
    id: 'components.send.sendscreen.checkboxSendAll',
    defaultMessage: '!!!Send all {assetId}',
    description: 'some desc',
  },
  sendAllWarningTitle: {
    id: 'components.send.sendscreen.sendAllWarningTitle',
    defaultMessage: '!!!Do you really want to send all?',
  },
  sendAllWarningText: {
    id: 'components.send.sendscreen.sendAllWarningText',
    defaultMessage:
      '!!!You have selected the send all option. Please confirm that you understand how this feature works.',
  },
  sendAllWarningAlert1: {
    id: 'components.send.sendscreen.sendAllWarningAlert1',
    defaultMessage: '!!!All you {assetNameOrId} balance will be transferred in this transaction.',
  },
  sendAllWarningAlert2: {
    id: 'components.send.sendscreen.sendAllWarningAlert2',
    defaultMessage:
      '!!!All your tokens, including NFTs and any other native ' +
      'assets in your wallet, will also be transferred in this transaction.',
  },
  sendAllWarningAlert3: {
    id: 'components.send.sendscreen.sendAllWarningAlert3',
    defaultMessage: '!!!After you confirm the transaction in the next screen, your wallet will be emptied.',
  },
  continueButton: {
    id: 'components.send.sendscreen.continueButton',
    defaultMessage: '!!!Continue',
    description: 'some desc',
  },
  errorBannerNetworkError: {
    id: 'components.send.sendscreen.errorBannerNetworkError',
    defaultMessage: '!!!We are experiencing issues with fetching your current balance. Click to retry.',
    description: 'some desc',
  },
  errorBannerPendingOutgoingTransaction: {
    id: 'components.send.sendscreen.errorBannerPendingOutgoingTransaction',
    defaultMessage: 'You cannot send a new transaction while an existing one is still pending',
    description: 'some desc',
  },
})

const Indicator = () => (
  <View style={styles.indicator}>
    <ActivityIndicator size="large" />
  </View>
)

const getMinAda = async (selectedToken: Token, defaultAsset: DefaultAsset) => {
  const networkConfig = getCardanoNetworkConfigById(defaultAsset.networkId)
  const fakeAmount = new BigNumber('0') // amount doesn't matter for calculating min UTXO amount
  const fakeMultitoken = new MultiToken(
    [
      {
        identifier: defaultAsset.identifier,
        networkId: defaultAsset.networkId,
        amount: fakeAmount,
      },
      {
        identifier: selectedToken.identifier,
        networkId: selectedToken.networkId,
        amount: fakeAmount,
      },
    ],
    {
      defaultNetworkId: defaultAsset.networkId,
      defaultIdentifier: defaultAsset.identifier,
    },
  )
  const minAmount = await min_ada_required(
    await cardanoValueFromMultiToken(fakeMultitoken),
    await BigNum.from_str(networkConfig.MINIMUM_UTXO_VAL),
  )
  // if the user is sending a token, we need to make sure the resulting utxo
  // has at least the minimum amount of ADA in it
  return minAmount.to_str()
}

const getTransactionData = async (
  utxos: Array<RawUtxo>,
  address: string,
  amount: string,
  sendAll: boolean,
  defaultAsset: DefaultAsset,
  selectedToken: Token,
  serverTime: Date | void,
): Promise<CreateUnsignedTxResponse> => {
  const defaultTokenEntry = {
    defaultNetworkId: defaultAsset.networkId,
    defaultIdentifier: defaultAsset.identifier,
  }
  const sendTokenList = []

  if (sendAll) {
    sendTokenList.push({
      token: selectedToken,
      shouldSendAll: true,
    })
  } else {
    const amountBigNum = parseAmountDecimal(amount, selectedToken)
    sendTokenList.push({
      token: selectedToken,
      amount: amountBigNum.toString(),
    })
  }
  if (!selectedToken.isDefault && isHaskellShelleyNetwork(selectedToken.networkId)) {
    sendTokenList.push({
      token: defaultAsset,
      amount: await getMinAda(selectedToken, defaultAsset),
    })
  }
  return await walletManager.createUnsignedTx(utxos, address, sendTokenList, defaultTokenEntry, serverTime)
}

const recomputeAll = async ({amount, address, utxos, sendAll, defaultAsset, selectedTokenMeta, tokenBalance}) => {
  let amountErrors = validateAmount(amount, selectedTokenMeta)
  const addressErrors = await validateAddressAsync(address)
  let balanceErrors = Object.freeze({})
  let fee = null
  let balanceAfter = null
  let recomputedAmount = amount

  if (_.isEmpty(addressErrors) && utxos) {
    try {
      let _fee: ?MultiToken

      // we'll substract minAda from ADA balance if we are sending a token
      const minAda =
        !selectedTokenMeta.isDefault && isHaskellShelleyNetwork(selectedTokenMeta.networkId)
          ? new BigNumber(await getMinAda(selectedTokenMeta, defaultAsset))
          : new BigNumber('0')

      if (sendAll) {
        const unsignedTx = await getTransactionData(utxos, address, amount, sendAll, defaultAsset, selectedTokenMeta)
        _fee = await unsignedTx.fee()

        if (selectedTokenMeta.isDefault) {
          recomputedAmount = normalizeTokenAmount(
            tokenBalance.getDefault().minus(_fee.getDefault()),
            selectedTokenMeta,
          ).toString()
          balanceAfter = new BigNumber('0')
        } else {
          const selectedTokenBalance = tokenBalance.get(selectedTokenMeta.identifier)
          if (selectedTokenBalance == null) {
            throw new Error('selectedTokenBalance is null, shouldnt happen')
          }
          recomputedAmount = normalizeTokenAmount(selectedTokenBalance, selectedTokenMeta).toString()
          balanceAfter = tokenBalance.getDefault().minus(_fee.getDefault()).minus(minAda)
        }

        // for sendAll we set the amount so the format is error-free
        amountErrors = Object.freeze({})
      } else if (_.isEmpty(amountErrors)) {
        const parsedAmount = selectedTokenMeta.isDefault
          ? parseAmountDecimal(amount, selectedTokenMeta)
          : new BigNumber('0')
        const unsignedTx = await getTransactionData(utxos, address, amount, false, defaultAsset, selectedTokenMeta)
        _fee = await unsignedTx.fee()
        balanceAfter = tokenBalance.getDefault().minus(parsedAmount).minus(minAda).minus(_fee.getDefault())
      }
      // now we can update fee as well
      fee = _fee != null ? _fee.getDefault() : null
    } catch (err) {
      if (err instanceof InsufficientFunds) {
        balanceErrors = {insufficientBalance: true}
      } else if (err instanceof AssetOverflowError) {
        balanceErrors = {assetOverflow: true}
      }
    }
  }
  return {
    amount: recomputedAmount,
    amountErrors,
    addressErrors,
    balanceErrors,
    fee,
    balanceAfter,
  }
}

const getAmountErrorText = (intl, amountErrors, balanceErrors, defaultAsset) => {
  if (amountErrors.invalidAmount != null) {
    const msgOptions = {}
    if (amountErrors.invalidAmount === InvalidAssetAmount.ERROR_CODES.LT_MIN_UTXO) {
      const networkConfig = getCardanoNetworkConfigById(defaultAsset.networkId)
      const amount = new BigNumber(networkConfig.MINIMUM_UTXO_VAL)
      // remove decimal part if it's equal to 0
      const decimalPart = amount.modulo(Math.pow(10, defaultAsset.metadata.numberOfDecimals))
      const minUtxo = decimalPart.eq('0')
        ? formatTokenInteger(amount, defaultAsset)
        : formatTokenAmount(amount, defaultAsset)
      const ticker = defaultAsset.metadata.ticker
      Object.assign(msgOptions, {minUtxo, ticker})
    }
    return intl.formatMessage(amountInputErrorMessages[amountErrors.invalidAmount], msgOptions)
  }
  if (balanceErrors.insufficientBalance === true) {
    return intl.formatMessage(amountInputErrorMessages.insufficientBalance)
  }
  if (balanceErrors.assetOverflow === true) {
    return intl.formatMessage(amountInputErrorMessages.assetOverflow)
  }
  return null
}

type Props = {
  navigation: Navigation,
  intl: IntlShape,
  tokenBalance: MultiToken,
  isFetchingBalance: boolean,
  lastFetchingError: any,
  tokenMetadata: Dict<Token>,
  defaultAsset: DefaultAsset,
  utxos: ?Array<RawUtxo>,
  isOnline: boolean,
  hasPendingOutgoingTransaction: boolean,
  fetchUTXOs: () => void,
  serverStatus: ServerStatusCache,
}

type State = {
  address: string,
  addressErrors: AddressValidationErrors,
  amount: string,
  amountErrors: AmountValidationErrors,
  balanceErrors: BalanceValidationErrors,
  fee: ?BigNumber,
  balanceAfter: ?BigNumber,
  sendAll: boolean,
  selectedAsset: TokenEntry,
  recomputing: boolean,
  showSendAllWarning: boolean,
}

class SendScreen extends Component<Props, State> {
  state = {
    address: '',
    addressErrors: {addressIsRequired: true},
    amount: '',
    amountErrors: {amountIsRequired: true},
    fee: null,
    balanceAfter: null,
    balanceErrors: Object.freeze({}),
    sendAll: false,
    selectedAsset: this.props.tokenBalance.getDefaultEntry(),
    recomputing: false,
    showSendAllWarning: false,
  }

  componentDidMount() {
    if (CONFIG.DEBUG.PREFILL_FORMS) {
      if (!__DEV__) throw new Error('using debug data in non-dev env')
      this.handleAddressChange(CONFIG.DEBUG.SEND_ADDRESS)
      this.handleAmountChange(CONFIG.DEBUG.SEND_AMOUNT)
    }
    this.props.navigation.setParams({onScanAddress: this.handleAddressChange})
    this.props.navigation.setParams({onScanAmount: this.handleAmountChange})
  }

  async componentDidUpdate(prevProps, prevState) {
    const utxos = this.props.utxos
    const {address, amount, sendAll, selectedAsset} = this.state

    const prevUtxos = prevProps.utxos
    const {address: prevAddress, amount: prevAmount, sendAll: prevSendAll, selectedAsset: prevSelectedAsset} = prevState

    if (
      prevUtxos !== utxos ||
      prevAddress !== address ||
      prevAmount !== amount ||
      prevSendAll !== sendAll ||
      prevSelectedAsset !== selectedAsset
    ) {
      await this.revalidate({utxos, address, amount, sendAll, selectedAsset})
    }
  }

  async revalidate({utxos, address, amount, sendAll, selectedAsset}) {
    this.setState({
      fee: null,
      balanceAfter: null,
      recomputing: true,
    })
    const {defaultAsset, tokenMetadata, tokenBalance} = this.props
    if (tokenMetadata[selectedAsset.identifier] == null) {
      throw new Error('revalidate: no asset metadata found for the asset selected')
    }
    const newState = await recomputeAll({
      utxos,
      address,
      amount,
      sendAll,
      defaultAsset,
      selectedTokenMeta: tokenMetadata[selectedAsset.identifier],
      tokenBalance,
    })

    if (
      this.state.address !== address ||
      this.state.amount !== amount ||
      this.state.sendAll !== sendAll ||
      this.props.utxos !== utxos
    ) {
      return
    }

    this.setState({
      ...newState,
      recomputing: false,
    })
  }

  handleAddressChange: (string) => void = (address) => this.setState({address})

  onAssetSelect: (TokenEntry | void) => void = (token) => {
    if (token === undefined) {
      this.setState({selectedAsset: this.props.tokenBalance.getDefaultEntry()})
    } else {
      this.setState({selectedAsset: token})
    }
  }

  handleAmountChange: (string) => void = (amount) => this.setState({amount})

  handleCheckBoxChange: (boolean) => void = (sendAll) => this.setState({sendAll})

  openSendAllWarning: () => void = () => this.setState({showSendAllWarning: true})

  closeSendAllWarning: () => void = () => this.setState({showSendAllWarning: false})

  onConfirm: () => Promise<void> = async () => {
    if (this.state.sendAll) {
      this.openSendAllWarning()
      return
    }
    await this.handleConfirm()
  }

  handleConfirm: () => Promise<void> = async () => {
    const {navigation, utxos, tokenBalance, defaultAsset, tokenMetadata, serverStatus} = this.props
    const {address, amount, sendAll, selectedAsset} = this.state

    const selectedTokenMeta = tokenMetadata[selectedAsset.identifier]
    if (selectedTokenMeta == null) {
      throw new Error('SendScreen::handleConfirm: no asset metadata found for the asset selected')
    }

    const {addressErrors, amountErrors, balanceErrors, balanceAfter} = await recomputeAll({
      amount,
      address,
      utxos,
      sendAll,
      defaultAsset,
      selectedTokenMeta,
      tokenBalance,
    })

    // Note(ppershing): use this.props as they might have
    // changed during await
    const isValid =
      this.props.isOnline &&
      !this.props.hasPendingOutgoingTransaction &&
      !this.props.isFetchingBalance &&
      utxos &&
      _.isEmpty(addressErrors) &&
      _.isEmpty(amountErrors) &&
      _.isEmpty(balanceErrors) &&
      this.state.amount === amount &&
      this.state.address === address &&
      this.state.selectedAsset === selectedAsset &&
      this.props.utxos === utxos

    if (isValid === true) {
      /* :: if (!utxos) throw 'assert' */
      const transactionData = await getTransactionData(
        utxos,
        address,
        amount,
        sendAll,
        defaultAsset,
        selectedTokenMeta,
        serverStatus.serverTime,
      )
      const fee = (await transactionData.fee()).getDefault()

      const defaultAssetAmount = selectedTokenMeta.isDefault
        ? parseAmountDecimal(amount, selectedTokenMeta)
        : // note: inside this if balanceAfter shouldn't be null
          tokenBalance.getDefault().minus(balanceAfter ?? 0)

      const tokens: Array<TokenEntry> = await (async () => {
        if (sendAll) {
          return (await transactionData.totalOutput()).nonDefaultEntries()
        }
        if (!selectedTokenMeta.isDefault) {
          return [
            {
              identifier: selectedTokenMeta.identifier,
              networkId: selectedTokenMeta.networkId,
              amount: parseAmountDecimal(amount, selectedTokenMeta),
            },
          ]
        }
        return []
      })()

      this.closeSendAllWarning()

      navigation.navigate(SEND_ROUTES.CONFIRM, {
        availableAmount: tokenBalance.getDefault(),
        address,
        defaultAssetAmount,
        transactionData,
        balanceAfterTx: balanceAfter,
        utxos,
        fee,
        tokens,
      })
    }
  }

  renderBalanceAfterTransaction = () => {
    const {balanceAfter} = this.state
    const {intl, tokenMetadata, tokenBalance} = this.props
    const assetMetaData = tokenMetadata[tokenBalance.getDefaultId()]

    const value = balanceAfter
      ? formatTokenWithSymbol(balanceAfter, assetMetaData)
      : intl.formatMessage(messages.balanceAfterNotAvailable)

    return (
      <Text small>
        {intl.formatMessage(messages.balanceAfterLabel)}
        {': '}
        {value}
      </Text>
    )
  }

  renderFee = () => {
    const {fee} = this.state
    const {intl, defaultAsset} = this.props

    const value = fee ? formatTokenWithSymbol(fee, defaultAsset) : intl.formatMessage(messages.feeNotAvailable)

    return (
      <Text small>
        {intl.formatMessage(messages.feeLabel)}
        {': '}
        {value}
      </Text>
    )
  }

  renderAvailableAmountBanner = () => {
    const {isFetchingBalance, tokenBalance, tokenMetadata, intl} = this.props
    const assetMetaData = tokenMetadata[tokenBalance.getDefaultId()]

    return (
      <Banner
        label={intl.formatMessage(globalMessages.availableFunds)}
        text={
          isFetchingBalance
            ? intl.formatMessage(messages.availableFundsBannerIsFetching)
            : tokenBalance
            ? formatTokenWithText(tokenBalance.getDefault(), assetMetaData)
            : intl.formatMessage(messages.availableFundsBannerNotAvailable)
        }
        boldText
      />
    )
  }

  renderErrorBanners = () => {
    const {intl, isOnline, lastFetchingError, isFetchingBalance, hasPendingOutgoingTransaction, fetchUTXOs} = this.props

    if (!isOnline) {
      return <OfflineBanner />
    } else if (lastFetchingError && !isFetchingBalance) {
      return <Banner error onPress={fetchUTXOs} text={intl.formatMessage(messages.errorBannerNetworkError)} />
    } else if (hasPendingOutgoingTransaction) {
      return <Banner error text={intl.formatMessage(messages.errorBannerPendingOutgoingTransaction)} />
    } else {
      return null
    }
  }

  renderSendAllWarning = () => {
    const {intl, tokenMetadata} = this.props
    const {showSendAllWarning, selectedAsset} = this.state

    const selectedTokenMeta = tokenMetadata[selectedAsset.identifier]
    const isDefault = selectedTokenMeta.isDefault
    const assetNameOrId = truncateWithEllipsis(getAssetDenominationOrId(selectedTokenMeta), 20)
    /* eslint-disable indent */
    const alertBoxContent = {
      content: isDefault
        ? [
            intl.formatMessage(messages.sendAllWarningAlert1, {
              assetNameOrId,
            }),
            intl.formatMessage(messages.sendAllWarningAlert2),
            intl.formatMessage(messages.sendAllWarningAlert3),
          ]
        : [
            intl.formatMessage(messages.sendAllWarningAlert1, {
              assetNameOrId,
            }),
          ],
    }
    /* eslint-enable indent */
    return (
      <DangerousActionModal
        visible={showSendAllWarning}
        onRequestClose={this.closeSendAllWarning}
        showCloseIcon
        title={intl.formatMessage(messages.sendAllWarningTitle)}
        primaryButton={{
          label: intl.formatMessage(confirmationMessages.commonButtons.backButton),
          onPress: this.closeSendAllWarning,
        }}
        secondaryButton={{
          label: intl.formatMessage(confirmationMessages.commonButtons.continueButton),
          onPress: this.handleConfirm,
        }}
        alertBox={alertBoxContent}
      >
        <Text>{intl.formatMessage(messages.sendAllWarningText)}</Text>
      </DangerousActionModal>
    )
  }

  render() {
    const {
      intl,
      isFetchingBalance,
      lastFetchingError,
      utxos,
      isOnline,
      hasPendingOutgoingTransaction,
      defaultAsset,
      tokenBalance,
      tokenMetadata,
    } = this.props

    const {address, amount, amountErrors, addressErrors, balanceErrors, sendAll, selectedAsset} = this.state

    const isValid =
      isOnline &&
      !hasPendingOutgoingTransaction &&
      !isFetchingBalance &&
      !lastFetchingError &&
      utxos &&
      _.isEmpty(addressErrors) &&
      _.isEmpty(amountErrors) &&
      _.isEmpty(balanceErrors)

    const amountErrorText = getAmountErrorText(intl, amountErrors, balanceErrors, defaultAsset)

    const selectedAssetMeta = tokenMetadata[selectedAsset.identifier]

    const assetDenomination = truncateWithEllipsis(getAssetDenominationOrId(selectedAssetMeta), 20)

    return (
      <SafeAreaView edges={['left', 'right']} style={styles.container}>
        <StatusBar type="dark" />

        <UtxoAutoRefresher />
        {this.renderErrorBanners()}
        {this.renderAvailableAmountBanner()}

        <ScrollView style={styles.content} keyboardDismissMode="on-drag">
          {this.renderBalanceAfterTransaction()}
          {this.renderFee()}

          <ValidatedTextInput
            multiline
            style={styles.address}
            value={address}
            label={intl.formatMessage(messages.addressInputLabel)}
            onChangeText={this.handleAddressChange}
            blurOnSubmit
            error={
              addressErrors.invalidAddress === true && intl.formatMessage(messages.addressInputErrorInvalidAddress)
            }
          />
          <AmountField
            amount={amount}
            setAmount={this.handleAmountChange}
            error={amountErrorText}
            editable={!sendAll}
          />
          <Checkbox
            disabled={false}
            checked={sendAll}
            onChange={this.handleCheckBoxChange}
            text={
              selectedAssetMeta.isDefault
                ? intl.formatMessage(messages.checkboxSendAllAssets)
                : intl.formatMessage(messages.checkboxSendAll, {assetId: assetDenomination})
            }
          />
          <AssetSelector
            onSelect={this.onAssetSelect}
            selectedAsset={selectedAsset}
            label={'Asset'}
            assets={tokenBalance.values}
            assetsMetadata={tokenMetadata}
            unselectEnabled={false}
          />
          {this.state.recomputing && <Indicator />}
        </ScrollView>
        <View style={styles.actions}>
          <Button
            onPress={this.onConfirm}
            title={intl.formatMessage(messages.continueButton)}
            disabled={!isValid || this.state.fee == null}
          />
        </View>
        {this.renderSendAllWarning()}
      </SafeAreaView>
    )
  }
}

type ExternalProps = {|
  navigation: Navigation,
  route: any,
  intl: IntlShape,
|}

export default injectIntl(
  (compose(
    connect(
      (state) => ({
        tokenBalance: tokenBalanceSelector(state),
        isFetchingBalance: isFetchingUtxosSelector(state),
        lastFetchingError: lastUtxosFetchErrorSelector(state),
        tokenMetadata: tokenInfoSelector(state),
        defaultAsset: defaultNetworkAssetSelector(state),
        utxos: utxosSelector(state),
        hasPendingOutgoingTransaction: hasPendingOutgoingTransactionSelector(state),
        isOnline: isOnlineSelector(state),
        serverStatus: serverStatusSelector(state),
      }),
      {
        fetchUTXOs,
      },
    ),
  )(SendScreen): ComponentType<ExternalProps>),
)
