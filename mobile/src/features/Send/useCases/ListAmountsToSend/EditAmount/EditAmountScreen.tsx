import {Quantities} from '@yoroi/cardano-wallet'
import {atomicBreakdown} from '@yoroi/common'
import {isPrimaryToken} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import {Portfolio} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import {useIsFocused} from '@react-navigation/native'
import * as React from 'react'
import {
  InteractionManager,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'

import {usePortfolioBalances} from '~/features/Portfolio/common/hooks/usePortfolioBalances'
import {usePortfolioPrimaryBreakdown} from '~/features/Portfolio/common/hooks/usePortfolioPrimaryBreakdown'
import {useNavigateTo} from '~/features/Send/common/navigation'
import {useLanguage} from '~/kernel/i18n/LanguageProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useParams} from '~/kernel/navigation/hooks/useParams'
import {Button, ButtonType} from '~/ui/Button/Button'
import {PairedBalance} from '~/ui/PairedBalance/PairedBalance'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {TokenAmountItem} from '~/ui/TokenAmountItem/TokenAmountItem'

import {NoBalance} from './ShowError/NoBalance'
import {UnableToSpend} from './ShowError/UnableToSpend'

const isEditAmountParams = (
  params: object,
): params is {amount: Portfolio.Token.Amount} => {
  return 'amount' in params && params.amount != null
}

export const EditAmountScreen = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const navigateTo = useNavigateTo()
  const {numberLocale} = useLanguage()

  const {wallet} = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})
  const primaryBreakdown = usePortfolioPrimaryBreakdown({wallet})

  const {amountRemoved, amountChanged, allocated, selectedTargetIndex} =
    useTransfer()

  const params = useParams(isEditAmountParams)
  const amount = params.amount
  const selectedTokenId = amount.info.id

  const available =
    (balances.records.get(selectedTokenId)?.quantity ?? BigInt(0)) -
    (allocated.get(selectedTargetIndex)?.get(selectedTokenId) ?? BigInt(0))
  const isPrimary = isPrimaryToken(amount.info)
  // Calculate spendable amount accounting for locked deposit only
  // Fee subtraction is handled by the transaction builder when subtractFeeFromAmount is true
  const spendable = isPrimary
    ? available - primaryBreakdown.lockedAsStorageCost
    : available

  const [quantity, setQuantity] = React.useState(amount.quantity)
  const [inputValue, setInputValue] = React.useState(
    amount.quantity === BigInt(0)
      ? ''
      : atomicBreakdown(amount.quantity, amount.info.decimals).str,
  )
  const textInputRef = React.useRef<TextInput>(null)

  // Update state when amount prop changes
  React.useEffect(() => {
    setQuantity(amount.quantity)
    setInputValue(
      amount.quantity === BigInt(0)
        ? ''
        : atomicBreakdown(amount.quantity, amount.info.decimals).str,
    )
  }, [amount.quantity, amount.info.decimals])

  const isFocused = useIsFocused()
  React.useEffect(() => {
    return () => {
      if (quantity === BigInt(0) && !isFocused) {
        InteractionManager.runAfterInteractions(() => {
          amountRemoved(selectedTokenId)
        })
      }
    }
  }, [quantity, amountRemoved, isFocused, selectedTokenId])

  const hasBalance = available >= quantity
  // primary can have locked amount
  const isUnableToSpend = isPrimary && quantity > spendable
  const isZero = quantity === BigInt(0)

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

  const handleOnFocus = React.useCallback(() => {
    if (textInputRef.current && inputValue) {
      textInputRef.current.setSelection(0, inputValue.length)
    }
  }, [inputValue])

  const handleOnMaxBalance = React.useCallback(() => {
    setInputValue(atomicBreakdown(spendable, amount.info.decimals).str)
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
    <SafeArea>
      <ScrollView
        contentContainerStyle={[a.px_lg]}
        bounces={false}
        style={[a.pt_lg]}
      >
        <TokenAmountItem
          amount={{
            info: amount.info,
            quantity: spendable,
          }}
          ignorePrivacy
        />

        <Space.Height.xl />

        <View style={[a.flex_row, a.align_center, a.justify_end]}>
          <TextInput
            ref={textInputRef}
            keyboardType="decimal-pad"
            inputMode="decimal"
            autoComplete="off"
            value={inputValue}
            placeholder="0"
            placeholderTextColor={p.text_gray_low}
            onChangeText={handleOnChangeQuantity}
            onFocus={handleOnFocus}
            autoFocus
            allowFontScaling={false}
            style={[ta.text_gray_max, a.heading_2_regular]}
            underlineColorAndroid="transparent"
            selectionColor={p.input_selected}
            cursorColor={p.el_gray_max}
          />
          <Text style={[ta.text_gray_max, a.heading_2_regular, {padding: 10}]}>
            {amount.info.ticker}
          </Text>
        </View>

        <View style={[a.align_center]}>
          {isPrimary && (
            <PairedBalance
              amount={{
                info: amount.info,
                quantity,
              }}
              ignorePrivacy
            />
          )}

          <Space.Height.md />

          {spendable > BigInt(0) && (
            <Button
              title={strings.send.max.toLocaleUpperCase()}
              onPress={handleOnMaxBalance}
              type={ButtonType.Text}
              size="M"
              style={{minHeight: 44, minWidth: 88}}
            />
          )}

          <Space.Height.md />

          {!hasBalance && <NoBalance />}

          {isUnableToSpend && hasBalance && <UnableToSpend />}
        </View>
      </ScrollView>

      <SafeArea.Footer>
        <Button
          onPress={handleOnApply}
          title={strings.send.apply.toLocaleUpperCase()}
          disabled={isUnableToSpend || !hasBalance || isZero}
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}
