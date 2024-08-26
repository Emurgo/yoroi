import {useNavigation} from '@react-navigation/native'
import {atomicBreakdown, parseDecimal} from '@yoroi/common'
import {isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import * as React from 'react'
import {
  InteractionManager,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, KeyboardAvoidingView, Spacer, TextInput} from '../../../../../components'
import {PairedBalance} from '../../../../../components/PairedBalance/PairedBalance'
import {Space} from '../../../../../components/Space/Space'
import {useLanguage} from '../../../../../kernel/i18n'
import {logger} from '../../../../../kernel/logger/logger'
import {BackButton} from '../../../../../kernel/navigation'
import {editedFormatter, pastedFormatter} from '../../../../../yoroi-wallets/utils'
import {usePortfolioBalances} from '../../../../Portfolio/common/hooks/usePortfolioBalances'
import {usePortfolioPrimaryBreakdown} from '../../../../Portfolio/common/hooks/usePortfolioPrimaryBreakdown'
import {TokenAmountItem} from '../../../../Portfolio/common/TokenAmountItem/TokenAmountItem'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {useNavigateTo, useOverridePreviousSendTxRoute} from '../../../common/navigation'
import {useStrings} from '../../../common/strings'
import {NoBalance} from './ShowError/NoBalance'
import {UnableToSpend} from './ShowError/UnableToSpend'

export const EditAmountScreen = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  const navigateTo = useNavigateTo()
  const {numberLocale} = useLanguage()
  const navigation = useNavigation()

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
    atomicBreakdown(initialQuantity, amount.info.decimals).bn.toFormat(),
  )
  const spendable = isPrimary ? available - primaryBreakdown.lockedAsStorageCost : available

  useOverridePreviousSendTxRoute(initialQuantity === 0n ? 'send-select-token-from-list' : 'send-list-amounts-to-send')

  React.useEffect(() => {
    setQuantity(initialQuantity)
    setInputValue(atomicBreakdown(initialQuantity, amount.info.decimals).bn.toFormat())
  }, [amount.info.decimals, initialQuantity])

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: (props: TouchableOpacityProps) => (
        <BackButton
          {...props}
          onPress={() => {
            navigation.goBack()

            if (quantity === 0n) {
              InteractionManager.runAfterInteractions(() => {
                amountRemoved(selectedTokenId)
              })
            }
          }}
        />
      ),
    })
  }, [amountRemoved, navigation, quantity, selectedTokenId])

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
            shelleyTheme
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
      backgroundColor: color.bg_color_high,
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
      backgroundColor: color.gray_c200,
    },
    actions: {
      ...atoms.px_lg,
    },
    maxBalance: {
      color: color.primary_c600,
      ...atoms.body_1_lg_medium,
    },
    amount: {
      backgroundColor: color.bg_color_high,
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
    black: color.gray_cmax,
    selected: color.text_gray_normal,
  }
  return {styles, colors} as const
}

const ApplyButton = Button
