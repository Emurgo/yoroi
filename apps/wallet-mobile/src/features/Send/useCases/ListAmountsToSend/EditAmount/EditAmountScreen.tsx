import {useIsFocused} from '@react-navigation/native'
import {atomicBreakdown, parseDecimal} from '@yoroi/common'
import {isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import * as React from 'react'
import {InteractionManager, ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../../components/Button/Button'
import {KeyboardAvoidingView} from '../../../../../components/KeyboardAvoidingView/KeyboardAvoidingView'
import {PairedBalance} from '../../../../../components/PairedBalance/PairedBalance'
import {Space} from '../../../../../components/Space/Space'
import {Spacer} from '../../../../../components/Spacer/Spacer'
import {TextInput} from '../../../../../components/TextInput/TextInput'
import {useLanguage} from '../../../../../kernel/i18n'
import {logger} from '../../../../../kernel/logger/logger'
import {editedFormatter, pastedFormatter} from '../../../../../yoroi-wallets/utils/amountUtils'
import {usePortfolioBalances} from '../../../../Portfolio/common/hooks/usePortfolioBalances'
import {usePortfolioPrimaryBreakdown} from '../../../../Portfolio/common/hooks/usePortfolioPrimaryBreakdown'
import {TokenAmountItem} from '../../../../Portfolio/common/TokenAmountItem/TokenAmountItem'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {useNavigateTo} from '../../../common/navigation'
import {useStrings} from '../../../common/strings'
import {NoBalance} from './ShowError/NoBalance'
import {UnableToSpend} from './ShowError/UnableToSpend'

export const EditAmountScreen = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  const navigateTo = useNavigateTo()
  const {numberLocale} = useLanguage()

  const {wallet} = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})
  const primaryBreakdown = usePortfolioPrimaryBreakdown({wallet})

  const {selectedTokenId, amountRemoved, amountChanged, allocated, selectedTargetIndex, targets} = useTransfer()

  const amount = targets[selectedTargetIndex].entry.amounts[selectedTokenId]
  const initialQuantity = amount.quantity
  const available =
    (balances.records.get(selectedTokenId)?.quantity ?? 0n) -
    (allocated.get(selectedTargetIndex)?.get(selectedTokenId) ?? 0n)
  const isPrimary = isPrimaryToken(amount.info)

  const [quantity, setQuantity] = React.useState(initialQuantity)
  const [inputValue, setInputValue] = React.useState(
    initialQuantity === 0n ? '' : atomicBreakdown(initialQuantity, amount.info.decimals).bn.toFormat(),
  )
  const spendable = isPrimary ? available - primaryBreakdown.lockedAsStorageCost : available

  React.useEffect(() => {
    setQuantity(initialQuantity)
    setInputValue(initialQuantity === 0n ? '' : atomicBreakdown(initialQuantity, amount.info.decimals).bn.toFormat())
  }, [amount.info.decimals, initialQuantity])

  const isFocused = useIsFocused()
  React.useEffect(() => {
    return () => {
      if (amount.quantity === 0n && !isFocused) {
        InteractionManager.runAfterInteractions(() => {
          amountRemoved(selectedTokenId)
        })
      }
    }
  }, [amount.quantity, amountRemoved, isFocused, selectedTokenId])

  const hasBalance = available >= quantity
  // primary can have locked amount
  const isUnableToSpend = isPrimary && quantity > spendable
  const isZero = quantity === 0n

  const handleOnChangeQuantity = React.useCallback(
    (text: string) => {
      try {
        const {text: newInputValue, bi: newQuantity} = parseDecimal({
          value: text,
          decimalPlaces: amount.info.decimals,
          format: numberLocale,
        })
        setInputValue(newInputValue)
        setQuantity(newQuantity)
      } catch (error) {
        logger.error('EditAmountScreen: handleOnChangeQuantity error parsing input', {error})
      }
    },
    [amount.info.decimals, numberLocale],
  )

  const handleOnMaxBalance = React.useCallback(() => {
    const {text: newInputValue, bi: newQuantity} = parseDecimal({
      value: spendable.toString(),
      decimalPlaces: amount.info.decimals,
      format: numberLocale,
    })
    setInputValue(newInputValue)
    setQuantity(newQuantity)
  }, [amount.info.decimals, numberLocale, spendable])

  const handleOnApply = React.useCallback(() => {
    amountChanged({
      info: amount.info,
      quantity,
    })
    navigateTo.selectedTokens()
  }, [amount.info, amountChanged, navigateTo, quantity])

  return (
    <KeyboardAvoidingView style={[styles.flex, styles.root]}>
      <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.flex, styles.safeAreaView]}>
        <ScrollView style={styles.scrollView} bounces={false}>
          <TokenAmountItem
            amount={{
              info: amount.info,
              quantity: spendable,
            }}
            ignorePrivacy
          />

          <Spacer height={46} />

          <AmountInput onChange={handleOnChangeQuantity} value={inputValue} ticker={amount.info.ticker} />

          <Center>
            {isPrimary && (
              <PairedBalance
                amount={{
                  info: amount.info,
                  quantity,
                }}
                ignorePrivacy
              />
            )}

            <Space />

            {!isPrimary && <MaxBalanceButton onPress={handleOnMaxBalance} />}

            <Space />

            {!hasBalance && <NoBalance />}

            {isUnableToSpend && hasBalance && <UnableToSpend />}
          </Center>
        </ScrollView>

        <HR />

        <Actions>
          <ApplyButton
            onPress={handleOnApply}
            title={strings.apply.toLocaleUpperCase()}
            disabled={isUnableToSpend || !hasBalance || isZero}
          />
        </Actions>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
      keyboardType="numeric"
      mode="flat"
      autoComplete="off"
      value={value}
      placeholder="0"
      onChangeText={onChangeText}
      selectTextOnAutoFocus
      allowFontScaling
      right={<Ticker ticker={ticker} />}
      style={styles.amount}
      underlineColor="transparent"
      underlineColorAndroid="transparent"
      activeUnderlineColor="transparent"
      selectionColor={colors.selected}
      cursorColor={colors.cursor}
      noHelper
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
    root: {
      backgroundColor: color.bg_color_max,
    },
    safeAreaView: {
      ...atoms.gap_lg,
      ...atoms.py_lg,
    },
    scrollView: {
      ...atoms.px_lg,
    },
    center: {
      ...atoms.align_center,
    },
    flex: {
      ...atoms.flex_1,
    },
    hr: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: color.gray_200,
    },
    actions: {
      ...atoms.px_lg,
    },
    maxBalance: {
      color: color.primary_600,
      ...atoms.body_1_lg_medium,
    },
    amount: {
      backgroundColor: color.bg_color_max,
      ...atoms.heading_2_regular,
      ...atoms.border_0,
      ...atoms.text_right,
    },
    ticker: {
      color: color.text_gray_max,
      ...atoms.heading_2_regular,
    },
  })
  const colors = {
    cursor: color.el_gray_max,
    selected: color.input_selected,
  }
  return {styles, colors} as const
}

const ApplyButton = Button
