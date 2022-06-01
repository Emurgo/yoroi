import {BigNumber} from 'bignumber.js'
import React from 'react'
import {useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View, ViewProps} from 'react-native'
import {useSelector} from 'react-redux'

import {Banner, Boundary, OfflineBanner, Spacer, StatusBar, Text} from '../../components'
import {ConfirmTx} from '../../Dashboard/WithdrawStakingRewards/ConfirmTx'
import {useTokenInfo} from '../../hooks'
import globalMessages, {confirmationMessages, errorMessages, txLabels} from '../../i18n/global-messages'
import {formatTokenWithSymbol, formatTokenWithText} from '../../legacy/format'
import {defaultNetworkAssetSelector} from '../../legacy/selectors'
import {useParams, useWalletNavigation} from '../../navigation'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {TokenEntry} from '../../types'
import {YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {Entries} from '../../yoroi-wallets/utils'

export type Params = {
  yoroiUnsignedTx: YoroiUnsignedTx
  balanceAfterTx: BigNumber
  availableAmount: BigNumber
  easyConfirmDecryptKey: string
}

const isParams = (params?: Params | object | undefined): params is Params => {
  return (
    !!params &&
    'yoroiUnsignedTx' in params &&
    typeof params.yoroiUnsignedTx === 'object' &&
    'balanceAfterTx' in params &&
    params.balanceAfterTx instanceof BigNumber &&
    'availableAmount' in params &&
    params.availableAmount instanceof BigNumber &&
    'easyConfirmDecryptKey' in params &&
    typeof params.easyConfirmDecryptKey === 'string'
  )
}

export const ConfirmScreen = () => {
  const strings = useStrings()
  const {balanceAfterTx, availableAmount, yoroiUnsignedTx} = useParams(isParams)
  const {resetToTxHistory} = useWalletNavigation()
  const wallet = useSelectedWallet()
  const defaultAsset = useSelector(defaultNetworkAssetSelector)

  const onSuccess = () => {
    resetToTxHistory()
  }

  const entry = Entries.first(yoroiUnsignedTx.entries)
  const secondaryAmounts = Object.entries(yoroiUnsignedTx.amounts).filter(([tokenId]) => tokenId !== '')

  return (
    <View style={styles.root}>
      <View style={{flex: 1}}>
        <StatusBar type="dark" />

        <OfflineBanner />

        <Banner label={strings.availableFunds} text={formatTokenWithText(availableAmount, defaultAsset)} boldText />

        <ScrollView style={styles.container} contentContainerStyle={{padding: 16}}>
          <Text small>
            {strings.fees}: {formatTokenWithSymbol(new BigNumber(yoroiUnsignedTx.fee['']), defaultAsset)}
          </Text>

          <Text small>
            {strings.balanceAfterTx}: {formatTokenWithSymbol(balanceAfterTx, defaultAsset)}
          </Text>

          <Spacer height={16} />

          <Text>{strings.receiver}</Text>
          <Text>{entry.address}</Text>

          <Spacer height={16} />

          <Text>{strings.total}</Text>
          <Text style={styles.amount}>{formatTokenWithSymbol(new BigNumber(entry.amounts['']), defaultAsset)}</Text>

          {secondaryAmounts.map(([tokenId, amount]) => (
            <Boundary key={tokenId}>
              <Entry tokenEntry={{identifier: tokenId, amount: new BigNumber(amount), networkId: 1}} />
            </Boundary>
          ))}
        </ScrollView>

        <Actions>
          <ConfirmTx
            onCancel={function (): void {
              throw new Error('Function not implemented.')
            }}
            onSuccess={onSuccess}
            unsignedTx={unsignedTx}
            wallet={wallet}
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
