/* eslint-disable @typescript-eslint/no-explicit-any */
import {BigNumber} from 'bignumber.js'
import React, {useEffect} from 'react'
import {useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View, ViewProps} from 'react-native'

import {Banner, Boundary, OfflineBanner, Spacer, StatusBar, Text, ValidatedTextInput} from '../../components'
import {ConfirmTx} from '../../components/ConfirmTx'
import {useTokenInfo} from '../../hooks'
import {Instructions as HWInstructions} from '../../HW'
import globalMessages, {confirmationMessages, errorMessages, txLabels} from '../../i18n/global-messages'
import {CONFIG, getDefaultAssetByNetworkId} from '../../legacy/config'
import {formatTokenWithSymbol, formatTokenWithText} from '../../legacy/format'
import {useParams, useWalletNavigation} from '../../navigation'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {Quantity, TokenId, YoroiAmounts, YoroiUnsignedTx} from '../../yoroi-wallets/types'

export type Params = {
  yoroiUnsignedTx: YoroiUnsignedTx
  defaultAssetAmount: Quantity
  address: string
  balanceAfterTx: Quantity
  availableAmount: Quantity
  fee: Quantity
  selectedTokens: YoroiAmounts
  easyConfirmDecryptKey: string
}

const isParams = (params?: Params | object | undefined): params is Params => {
  return (
    !!params &&
    'yoroiUnsignedTx' in params &&
    typeof params.yoroiUnsignedTx === 'object' &&
    'defaultAssetAmount' in params &&
    typeof params.defaultAssetAmount === 'string' &&
    'address' in params &&
    typeof params.address === 'string' &&
    'balanceAfterTx' in params &&
    typeof params.balanceAfterTx === 'string' &&
    'availableAmount' in params &&
    typeof params.availableAmount === 'string' &&
    'fee' in params &&
    typeof params.fee === 'string' &&
    'selectedTokens' in params &&
    typeof params.selectedTokens === 'object'
  )
}

export const ConfirmScreen = () => {
  const strings = useStrings()
  const {defaultAssetAmount, address, balanceAfterTx, availableAmount, fee, selectedTokens, yoroiUnsignedTx} =
    useParams(isParams)
  const {resetToTxHistory} = useWalletNavigation()
  const wallet = useSelectedWallet()
  const [password, setPassword] = React.useState('')
  const [useUSB, setUseUSB] = React.useState(false)

  useEffect(() => {
    if (CONFIG.DEBUG.PREFILL_FORMS && __DEV__) {
      setPassword(CONFIG.DEBUG.PASSWORD)
    }
  }, [])

  const onSuccess = () => {
    resetToTxHistory()
  }

  return (
    <View style={styles.root}>
      <View style={{flex: 1}}>
        <StatusBar type="dark" />

        <OfflineBanner />

        <Banner
          label={strings.availableFunds}
          text={formatTokenWithText(new BigNumber(availableAmount), getDefaultAssetByNetworkId(wallet.networkId))}
          boldText
        />

        <ScrollView style={styles.container} contentContainerStyle={{padding: 16}}>
          <Text small>
            {strings.fees}: {formatTokenWithSymbol(new BigNumber(fee), getDefaultAssetByNetworkId(wallet.networkId))}
          </Text>

          <Text small>
            {strings.balanceAfterTx}:{' '}
            {formatTokenWithSymbol(new BigNumber(balanceAfterTx), getDefaultAssetByNetworkId(wallet.networkId))}
          </Text>

          <Spacer height={16} />

          <Text>{strings.receiver}</Text>
          <Text>{address}</Text>

          <Spacer height={16} />

          <Text>{strings.total}</Text>
          <Text style={styles.amount}>
            {formatTokenWithSymbol(new BigNumber(defaultAssetAmount), getDefaultAssetByNetworkId(wallet.networkId))}
          </Text>

          {Object.entries(selectedTokens).map(([tokenId, quantity]) => (
            <Boundary key={tokenId}>
              <Entry tokenId={tokenId} quantity={quantity} />
            </Boundary>
          ))}

          {!wallet.isEasyConfirmationEnabled && !wallet.isHW && (
            <>
              <Spacer height={16} />
              <ValidatedTextInput
                secureTextEntry
                value={password}
                label={strings.password}
                onChangeText={setPassword}
              />
            </>
          )}

          {wallet.isHW && <HWInstructions useUSB={useUSB} addMargin />}
        </ScrollView>

        <Actions>
          <ConfirmTx
            onSuccess={onSuccess}
            yoroiUnsignedTx={yoroiUnsignedTx}
            useUSB={useUSB}
            setUseUSB={setUseUSB}
            isProvidingPassword
            providedPassword={password}
          />
        </Actions>
      </View>
    </View>
  )
}

const Entry = ({tokenId, quantity}: {tokenId: TokenId; quantity: Quantity}) => {
  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId})

  return <Text style={styles.amount}>{formatTokenWithText(new BigNumber(quantity), tokenInfo)}</Text>
}

const Actions = (props: ViewProps) => <View {...props} style={{padding: 16}} />

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLORS.WHITE,
    flex: 1,
  },
  container: {
    backgroundColor: COLORS.WHITE,
    flex: 1,
  },
  amount: {
    color: COLORS.POSITIVE_AMOUNT,
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    availableFunds: intl.formatMessage(globalMessages.availableFunds),
    fees: intl.formatMessage(txLabels.fees),
    balanceAfterTx: intl.formatMessage(txLabels.balanceAfterTx),
    receiver: intl.formatMessage(txLabels.receiver),
    total: intl.formatMessage(globalMessages.total),
    password: intl.formatMessage(txLabels.password),
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
    submittingTx: intl.formatMessage(txLabels.submittingTx),
    pleaseWait: intl.formatMessage(globalMessages.pleaseWait),
    generalTxError: {
      title: intl.formatMessage(errorMessages.generalTxError.title),
      message: intl.formatMessage(errorMessages.generalTxError.message),
    },
  }
}
