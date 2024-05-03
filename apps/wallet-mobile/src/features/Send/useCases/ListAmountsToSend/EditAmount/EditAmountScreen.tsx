import {parseInputToBigInt, splitBigInt} from '@yoroi/common'
import {isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import * as React from 'react'
import {ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewProps} from 'react-native'

import {Button, KeyboardAvoidingView, Spacer, TextInput} from '../../../../../components'
import {useLanguage} from '../../../../../i18n'
import {Logger} from '../../../../../yoroi-wallets/logging'
import {editedFormatter, pastedFormatter} from '../../../../../yoroi-wallets/utils'
import {usePortfolioBalances} from '../../../../Portfolio/common/hooks/usePortfolioBalances'
import {usePortfolioPrimaryBreakdown} from '../../../../Portfolio/common/hooks/usePortfolioPrimaryBreakdown'
import {TokenAmountItem} from '../../../../Portfolio/common/TokenAmountItem/TokenAmountItem'
import {useSelectedWallet} from '../../../../WalletManager/Context'
import {useNavigateTo, useOverridePreviousSendTxRoute} from '../../../common/navigation'
import {useStrings} from '../../../common/strings'
import {NoBalance} from './ShowError/NoBalance'
import {UnableToSpend} from './ShowError/UnableToSpend'

export const EditAmountScreen = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  const navigateTo = useNavigateTo()
  const {numberLocale} = useLanguage()

  const wallet = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})
  const primaryBreakdown = usePortfolioPrimaryBreakdown({wallet})

  const {selectedTokenId, amountChanged, allocated, selectedTargetIndex, targets} = useTransfer()

  const amount = targets[selectedTargetIndex].entry.amounts[selectedTokenId]
  const initialQuantity = amount.quantity
  const available =
    (balances.records.get(selectedTokenId)?.quantity ?? 0n) -
    (allocated.get(selectedTargetIndex)?.get(selectedTokenId) ?? 0n)
  const isPrimary = isPrimaryToken(amount.info)

  const [quantity, setQuantity] = React.useState(initialQuantity)
  const [inputValue, setInputValue] = React.useState(splitBigInt(initialQuantity, amount.info.decimals).bn.toFormat())
  const spendable = available - primaryBreakdown.lockedAsStorageCost

  useOverridePreviousSendTxRoute(initialQuantity === 0n ? 'send-select-token-from-list' : 'send-list-amounts-to-send')

  React.useEffect(() => {
    setQuantity(initialQuantity)
    setInputValue(splitBigInt(initialQuantity, amount.info.decimals).bn.toFormat())
  }, [amount.info.decimals, initialQuantity])

  const hasBalance = available >= quantity
  // primary can have locked amount
  const isUnableToSpend = isPrimary && quantity > spendable
  const isZero = quantity === 0n

  const onChangeQuantity = (text: string) => {
    try {
      const [newInputValue, newQuantity] = parseInputToBigInt({
        input: text,
        decimalPlaces: amount.info.decimals,
        format: numberLocale,
      })
      setInputValue(newInputValue)
      setQuantity(newQuantity)
    } catch (error) {
      Logger.error('EditAmountScreen::onChangeQuantity', error)
    }
  }
  const onMaxBalance = () => {
    const [newInputValue, newQuantity] = parseInputToBigInt({
      input: spendable.toString(),
      decimalPlaces: amount.info.decimals,
      format: numberLocale,
    })
    setInputValue(newInputValue)
    setQuantity(newQuantity)
  }
  const onApply = () => {
    amountChanged({
      info: amount.info,
      quantity,
    })
    navigateTo.selectedTokens()
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{flex: 1}}>
        <ScrollView style={styles.scrollView} bounces={false}>
          <Spacer height={16} />

          <TokenAmountItem amount={amount} isPrivacyOff network={wallet.network} privacyPlaceholder="" />

          <Spacer height={40} />

          <AmountInput onChange={onChangeQuantity} value={inputValue} ticker={amount.info.ticker} />

          <Center>
            {/* {isPrimary && <PairedBalance amount={{tokenId: tokenInfo.id, quantity}} />} */}

            <Spacer height={22} />

            {!isPrimary && <MaxBalanceButton onPress={onMaxBalance} />}

            <Spacer height={22} />

            {!hasBalance && <NoBalance />}

            {isUnableToSpend && hasBalance && <UnableToSpend />}
          </Center>
        </ScrollView>

        <HR />

        <Actions>
          <ApplyButton
            onPress={onApply}
            title={strings.apply.toLocaleUpperCase()}
            shelleyTheme
            disabled={isUnableToSpend || !hasBalance || isZero}
          />
        </Actions>
      </KeyboardAvoidingView>
    </View>
  )
}

const Center = ({style, ...props}: ViewProps) => {
  const {styles} = useStyles()
  return <View style={[style, styles.center]} {...props} />
}
const Actions = ({style, ...props}: ViewProps) => {
  const {styles} = useStyles()
  return <View style={[style, styles.actions]} {...props} />
}

const MaxBalanceButton = ({onPress}: {onPress(): void}) => {
  const strings = useStrings()
  const {styles} = useStyles()

  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.maxBalance}>{strings.max.toLocaleUpperCase()}</Text>
    </TouchableOpacity>
  )
}

type AmountInputProps = {
  value: string
  onChange(value: string): void
  ticker: string | undefined
}
const AmountInput = ({onChange, value, ticker}: AmountInputProps) => {
  const {styles, colors} = useStyles()

  const onChangeText = (text: string) => {
    const shorterStringLength = Math.min(text.length, value.length)
    const wasPasted =
      Math.abs(value.length - text.length) > 1 ||
      value.substring(0, shorterStringLength) !== text.substring(0, shorterStringLength)

    const formatter = wasPasted ? pastedFormatter : editedFormatter

    onChange(formatter(text))
  }

  return (
    <TextInput
      returnKeyType="done"
      keyboardType="numeric"
      mode="flat"
      autoComplete="off"
      value={value}
      placeholder="0"
      onChangeText={onChangeText}
      selectTextOnAutoFocus
      allowFontScaling
      selectionColor={colors.black}
      right={<Ticker ticker={ticker} />}
      style={styles.amount}
      underlineColor="transparent"
      underlineColorAndroid="transparent"
    />
  )
}
const Ticker = ({ticker}: {ticker?: string}) => {
  const {styles} = useStyles()
  return <Text style={styles.ticker}>{ticker}</Text>
}

const HR = () => {
  const {styles} = useStyles()
  return <View style={styles.hr} />
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    center: {
      alignItems: 'center',
    },
    container: {
      flex: 1,
      backgroundColor: color.gray_cmin,
    },
    scrollView: {
      flex: 1,
      ...atoms.px_lg,
    },
    hr: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: color.gray_c200,
    },
    actions: {
      ...atoms.p_lg,
    },
    maxBalance: {
      color: color.primary_c600,
      ...atoms.body_1_lg_medium,
    },
    amount: {
      ...atoms.heading_2_regular,
      backgroundColor: color.gray_cmin,
      borderWidth: 0,
      textAlign: 'right',
    },
    ticker: {
      ...atoms.heading_2_regular,
    },
  })

  const colors = {
    black: color.gray_cmax,
  }
  return {styles, colors}
}

const ApplyButton = Button
