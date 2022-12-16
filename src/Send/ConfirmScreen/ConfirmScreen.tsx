/* eslint-disable @typescript-eslint/no-explicit-any */
import {RouteProp, useRoute} from '@react-navigation/native'
import {BigNumber} from 'bignumber.js'
import React, {useEffect, useRef} from 'react'
import {useIntl} from 'react-intl'
import {Keyboard, ScrollView, StyleSheet, View, ViewProps} from 'react-native'

import {Boundary, KeyboardSpacer, Spacer, StatusBar, Text, ValidatedTextInput} from '../../components'
import {ConfirmTx} from '../../components/ConfirmTx'
import {useBalances, useTokenInfo} from '../../hooks'
import globalMessages, {confirmationMessages, errorMessages, txLabels} from '../../i18n/global-messages'
import {CONFIG} from '../../legacy/config'
import {formatTokenWithSymbol, formatTokenWithText} from '../../legacy/format'
import {TxHistoryRoutes, useWalletNavigation} from '../../navigation'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {YoroiAmount, YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {Amounts, Quantities} from '../../yoroi-wallets/utils'
import {useSend} from '../Context/SendContext'
import {AvailableAmountBanner} from '../SendScreen/AvailableAmountBanner'

export const ConfirmScreen = () => {
  const strings = useStrings()
  const {yoroiUnsignedTx} = useRoute<RouteProp<TxHistoryRoutes, 'send-confirm'>>().params
  const {resetToTxHistory} = useWalletNavigation()
  const wallet = useSelectedWallet()
  const [password, setPassword] = React.useState('')
  const [useUSB, setUseUSB] = React.useState(false)
  const {resetForm, receiver} = useSend()

  useEffect(() => {
    if (CONFIG.DEBUG.PREFILL_FORMS && __DEV__) {
      setPassword(CONFIG.DEBUG.PASSWORD)
    }
  }, [])

  const onSuccess = () => {
    resetToTxHistory()
    resetForm()
  }

  const scrollViewRef = useFlashAndScroll()

  return (
    <View style={styles.root}>
      <StatusBar type="dark" />

      <AvailableAmountBanner />

      <View style={{paddingTop: 16, paddingHorizontal: 16}}>
        <Fees yoroiUnsignedTx={yoroiUnsignedTx} />

        <Spacer height={4} />

        <BalanceAfter yoroiUnsignedTx={yoroiUnsignedTx} />

        <Spacer height={16} />

        <Boundary loading={{size: 'small'}}>
          <Receiver receiver={receiver} />
        </Boundary>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{padding: 16}}
        persistentScrollbar
        ref={scrollViewRef}
      >
        <PrimaryTotal yoroiUnsignedTx={yoroiUnsignedTx} />

        <Spacer height={8} />

        <TokenTotals yoroiUnsignedTx={yoroiUnsignedTx} />

        {!wallet.isEasyConfirmationEnabled && !wallet.isHW && (
          <>
            <ValidatedTextInput
              secureTextEntry
              value={password}
              label={strings.password}
              onChangeText={setPassword}
              testID="spendingPasswordInput"
            />
          </>
        )}

        <KeyboardSpacer />
      </ScrollView>

      <Actions>
        <ConfirmTx
          onSuccess={onSuccess}
          yoroiUnsignedTx={yoroiUnsignedTx}
          useUSB={useUSB}
          setUseUSB={setUseUSB}
          isProvidingPassword
          providedPassword={password}
          chooseTransportOnConfirmation
        />
      </Actions>
    </View>
  )
}

const Fees = ({yoroiUnsignedTx}: {yoroiUnsignedTx: YoroiUnsignedTx}) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const feeAmount = Amounts.getAmount(yoroiUnsignedTx.fee, '')
  const tokenInfo = useTokenInfo({wallet, tokenId: ''})

  return (
    <Text small testID="feesText">
      {strings.fees}: {formatTokenWithSymbol(new BigNumber(feeAmount.quantity), tokenInfo)}
    </Text>
  )
}

const BalanceAfter = ({yoroiUnsignedTx}: {yoroiUnsignedTx: YoroiUnsignedTx}) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: ''})
  const balances = useBalances(wallet)

  // prettier-ignore
  const balancesAfter = Amounts.diff(
    balances,
    Amounts.sum([
      yoroiUnsignedTx.amounts,
      yoroiUnsignedTx.fee,
    ]),
  )
  const primaryAmountAfter = Amounts.getAmount(balancesAfter, '')

  return (
    <Text small testID="balanceAfterTxText">
      {strings.balanceAfterTx}: {formatTokenWithSymbol(new BigNumber(primaryAmountAfter.quantity), tokenInfo)}
    </Text>
  )
}

const Receiver = ({receiver}: {receiver: string}) => {
  const strings = useStrings()

  return (
    <>
      <Text>{strings.receiver}</Text>
      <Text testID="receiverAddressText">{receiver}</Text>
    </>
  )
}

const PrimaryTotal = ({yoroiUnsignedTx}: {yoroiUnsignedTx: YoroiUnsignedTx}) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const primaryAmount = Amounts.getAmount(yoroiUnsignedTx.amounts, '')
  const primaryTokenInfo = useTokenInfo({wallet, tokenId: ''})

  return (
    <>
      <Text>{strings.total}</Text>
      <Text style={styles.amount} testID="totalAmountText">
        {formatTokenWithSymbol(new BigNumber(primaryAmount.quantity), primaryTokenInfo)}
      </Text>
    </>
  )
}

const TokenTotals = ({yoroiUnsignedTx}: {yoroiUnsignedTx: YoroiUnsignedTx}) => {
  const tokens = Amounts.remove(yoroiUnsignedTx.amounts, [''])

  return (
    <>
      {Amounts.toArray(tokens)
        .sort((a, b) => (Quantities.isGreaterThan(a.quantity, b.quantity) ? -1 : 1))
        .map((amount) => (
          <Boundary key={amount.tokenId} loading={{size: 'small'}}>
            <Amount amount={amount} />
          </Boundary>
        ))}
    </>
  )
}

const Amount = ({amount}: {amount: YoroiAmount}) => {
  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: amount.tokenId})

  return <Text style={styles.amount}>{formatTokenWithText(new BigNumber(amount.quantity), tokenInfo)}</Text>
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

const useFlashAndScroll = () => {
  const scrollViewRef = useRef<ScrollView | null>(null)

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.flashScrollIndicators()
    }, 500)

    Keyboard.addListener('keyboardWillShow', () => {
      scrollViewRef.current?.scrollToEnd()
    })
  }, [])

  return scrollViewRef
}
