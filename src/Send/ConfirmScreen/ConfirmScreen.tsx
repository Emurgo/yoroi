/* eslint-disable @typescript-eslint/no-explicit-any */
import {BigNumber} from 'bignumber.js'
import React, {useEffect} from 'react'
import {useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View, ViewProps} from 'react-native'
import {useSelector} from 'react-redux'

import {Banner, Boundary, OfflineBanner, Spacer, StatusBar, Text, ValidatedTextInput} from '../../components'
import {ConfirmTx} from '../../components/ConfirmTx'
import {useTokenInfo} from '../../hooks'
import {Instructions as HWInstructions} from '../../HW'
import globalMessages, {confirmationMessages, errorMessages, txLabels} from '../../i18n/global-messages'
import {CONFIG} from '../../legacy/config'
import {formatTokenWithSymbol, formatTokenWithText} from '../../legacy/format'
import {defaultNetworkAssetSelector} from '../../legacy/selectors'
import {useParams, useWalletNavigation} from '../../navigation'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {TokenEntry} from '../../types'
import type {CreateUnsignedTxResponse} from '../../yoroi-wallets/cardano/shelley/transactionUtils'

export type Params = {
  transactionData: CreateUnsignedTxResponse
  defaultAssetAmount: BigNumber
  address: string
  balanceAfterTx: BigNumber
  availableAmount: BigNumber
  fee: BigNumber
  tokens: TokenEntry[]
  easyConfirmDecryptKey: string
}

const isParams = (params?: Params | object | undefined): params is Params => {
  return (
    !!params &&
    'transactionData' in params &&
    typeof params.transactionData === 'object' &&
    'defaultAssetAmount' in params &&
    params.defaultAssetAmount instanceof BigNumber &&
    'address' in params &&
    typeof params.address === 'string' &&
    'balanceAfterTx' in params &&
    params.balanceAfterTx instanceof BigNumber &&
    'availableAmount' in params &&
    params.availableAmount instanceof BigNumber &&
    'fee' in params &&
    params.fee instanceof BigNumber &&
    'tokens' in params &&
    Array.isArray(params.tokens)
  )
}

export const ConfirmScreen = () => {
  const strings = useStrings()
  const {
    defaultAssetAmount,
    address,
    balanceAfterTx,
    availableAmount,
    fee,
    tokens: tokenEntries,
    transactionData: signRequest,
  } = useParams(isParams)
  const {resetToTxHistory} = useWalletNavigation()
  const wallet = useSelectedWallet()
  const {isHW, isEasyConfirmationEnabled} = wallet
  const defaultAsset = useSelector(defaultNetworkAssetSelector)
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

        <Banner label={strings.availableFunds} text={formatTokenWithText(availableAmount, defaultAsset)} boldText />

        <ScrollView style={styles.container} contentContainerStyle={{padding: 16}}>
          <Text small>
            {strings.fees}: {formatTokenWithSymbol(fee, defaultAsset)}
          </Text>

          <Text small>
            {strings.balanceAfterTx}: {formatTokenWithSymbol(balanceAfterTx, defaultAsset)}
          </Text>

          <Spacer height={16} />

          <Text>{strings.receiver}</Text>
          <Text>{address}</Text>

          <Spacer height={16} />

          <Text>{strings.total}</Text>
          <Text style={styles.amount}>{formatTokenWithSymbol(defaultAssetAmount, defaultAsset)}</Text>

          {tokenEntries.map((entry) => (
            <Boundary key={entry.identifier}>
              <Entry tokenEntry={entry} />
            </Boundary>
          ))}

          {!isEasyConfirmationEnabled && !isHW && (
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

          {isHW && <HWInstructions useUSB={useUSB} addMargin />}
        </ScrollView>

        <Actions>
          <ConfirmTx
            process="signAndSubmit"
            onSuccess={onSuccess}
            txDataSignRequest={signRequest}
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

const Entry = ({tokenEntry}: {tokenEntry: TokenEntry}) => {
  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: tokenEntry.identifier})

  return <Text style={styles.amount}>{formatTokenWithText(tokenEntry.amount, tokenInfo)}</Text>
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
