import {useIsFocused} from '@react-navigation/native'
import {atomicBreakdown} from '@yoroi/common'
import {isPrimaryToken} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import * as React from 'react'
import {
  InteractionManager,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useLanguage} from '~/kernel/i18n'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {Button} from '~/ui/Button/Button'
import {KeyboardAvoidingView} from '~/ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {PairedBalance} from '~/ui/PairedBalance/PairedBalance'
import {Space} from '~/ui/Space/Space'
import {TextInput} from '~/ui/TextInput/TextInput'
import {Quantities} from '~/wallets/utils/utils'
import {useNavigateTo} from '../../common/navigation'
import {TokenAmountItem} from '../Portfolio/common/TokenAmountItem/TokenAmountItem'
import {usePortfolioBalances} from '../Portfolio/common/hooks/usePortfolioBalances'
import {usePortfolioPrimaryBreakdown} from '../Portfolio/common/hooks/usePortfolioPrimaryBreakdown'
import {NoBalance} from './ShowError/NoBalance'
import {UnableToSpend} from './ShowError/UnableToSpend'

export const EditAmountScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const navigateTo = useNavigateTo()
  const {numberLocale} = useLanguage()

  const {wallet} = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})
  const primaryBreakdown = usePortfolioPrimaryBreakdown({wallet})

  const {
    selectedTokenId,
    amountRemoved,
    amountChanged,
    allocated,
    selectedTargetIndex,
    targets,
  } = useTransfer()

  const amount = targets[selectedTargetIndex].entry.amounts[selectedTokenId]
  const initialQuantity = amount.quantity
  const available =
    (balances.records.get(selectedTokenId)?.quantity ?? 0n) -
    (allocated.get(selectedTargetIndex)?.get(selectedTokenId) ?? 0n)
  const isPrimary = isPrimaryToken(amount.info)

  const [quantity, setQuantity] = React.useState(initialQuantity)
  const [inputValue, setInputValue] = React.useState(
    initialQuantity === 0n
      ? ''
      : atomicBreakdown(initialQuantity, amount.info.decimals).bn.toFormat(),
  )
  const spendable = isPrimary
    ? available - primaryBreakdown.lockedAsStorageCost
    : available

  React.useEffect(() => {
    setQuantity(initialQuantity)
    setInputValue(
      initialQuantity === 0n
        ? ''
        : atomicBreakdown(initialQuantity, amount.info.decimals).bn.toFormat(),
    )
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
        const [input, quantity] = Quantities.parseFromText(
          text,
          amount.info.decimals ?? 0,
          numberLocale,
        )

        setInputValue(input)
        setQuantity(BigInt(quantity))
      } catch (error) {
        logger.error(
          'EditAmountScreen: handleOnChangeQuantity error parsing input',
          {error},
        )
      }
    },
    [amount.info.decimals, numberLocale],
  )

  const handleOnMaxBalance = React.useCallback(() => {
    setInputValue(
      atomicBreakdown(spendable, amount.info.decimals).bn.toFormat(),
    )
    setQuantity(spendable)
  }, [amount.info.decimals, spendable])

  const handleOnApply = React.useCallback(() => {
    amountChanged({
      info: amount.info,
      quantity,
    })
    navigateTo.selectedTokens()
  }, [amount.info, amountChanged, navigateTo, quantity])

  return (
    <KeyboardAvoidingView style={[a.flex_1, {backgroundColor: p.bg_color_max}]}>
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        style={[a.flex_1, a.gap_lg, a.py_lg]}
      >
        <ScrollView style={[a.px_lg]} bounces={false}>
          <TokenAmountItem
            amount={{
              info: amount.info,
              quantity: spendable,
            }}
            ignorePrivacy
          />

          <Space.Height.xl />

          <AmountInput
            onChange={handleOnChangeQuantity}
            value={inputValue}
            ticker={amount.info.ticker}
          />

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
            title={strings.send.apply.toLocaleUpperCase()}
            disabled={isUnableToSpend || !hasBalance || isZero}
          />
        </Actions>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const Center = ({style, ...props}: ViewProps) => {
  return <View style={[style, a.align_center]} {...props} />
}
const Actions = ({style, ...props}: ViewProps) => {
  return <View style={[style, a.px_lg]} {...props} />
}

const MaxBalanceButton = ({onPress}: {onPress(): void}) => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={[{color: p.primary_600}, a.body_1_lg_medium]}>
        {strings.send.max.toLocaleUpperCase()}
      </Text>
    </TouchableOpacity>
  )
}

type AmountInputProps = {
  value: string
  onChange(value: string): void
  ticker: string | undefined
}
const AmountInput = ({onChange, value, ticker}: AmountInputProps) => {
  const {palette: p} = useTheme()

  return (
    <TextInput
      keyboardType="numeric"
      mode="flat"
      autoComplete="off"
      value={value}
      placeholder="0"
      onChangeText={onChange}
      selectTextOnAutoFocus
      allowFontScaling
      right={<Ticker ticker={ticker} />}
      style={[
        {backgroundColor: p.bg_color_max},
        a.heading_2_regular,
        a.border_0,
        a.text_right,
      ]}
      underlineColor="transparent"
      underlineColorAndroid="transparent"
      activeUnderlineColor="transparent"
      selectionColor={p.input_selected}
      cursorColor={p.el_gray_max}
      noHelper
    />
  )
}
const Ticker = ({ticker}: {ticker?: string}) => {
  const {palette: p} = useTheme()
  return (
    <Text style={[{color: p.text_gray_max}, a.heading_2_regular]}>
      {ticker}
    </Text>
  )
}

const HR = () => {
  const {palette: p} = useTheme()
  return <View style={{height: 1, backgroundColor: p.gray_200}} />
}

const ApplyButton = Button
