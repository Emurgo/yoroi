import {atomicBreakdown} from '@yoroi/common'
import {isPrimaryToken} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import {Portfolio} from '@yoroi/types'

import {useIsFocused} from '@react-navigation/native'
import * as React from 'react'
import {
  InteractionManager,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {usePortfolioBalances} from '~/features/Portfolio/common/hooks/usePortfolioBalances'
import {usePortfolioPrimaryBreakdown} from '~/features/Portfolio/common/hooks/usePortfolioPrimaryBreakdown'
import {useNavigateTo} from '~/features/Send/common/navigation'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useLanguage} from '~/kernel/i18n/LanguageProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useParams} from '~/kernel/navigation/hooks/useParams'
import {Button, ButtonType} from '~/ui/Button/Button'
import {KeyboardAvoidingView} from '~/ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {PairedBalance} from '~/ui/PairedBalance/PairedBalance'
import {Space} from '~/ui/Space/Space'
import {TokenAmountItem} from '~/ui/TokenAmountItem/TokenAmountItem'
import {Quantities} from '~/wallets/utils/utils'

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

  const initialQuantity = amount.quantity
  const available =
    (balances.records.get(selectedTokenId)?.quantity ?? BigInt(0)) -
    (allocated.get(selectedTargetIndex)?.get(selectedTokenId) ?? BigInt(0))
  const isPrimary = isPrimaryToken(amount.info)

  const [quantity, setQuantity] = React.useState(initialQuantity)
  const [inputValue, setInputValue] = React.useState(
    initialQuantity === BigInt(0)
      ? ''
      : atomicBreakdown(initialQuantity, amount.info.decimals).bn.toFormat(),
  )
  const spendable = isPrimary
    ? available - primaryBreakdown.lockedAsStorageCost
    : available

  React.useEffect(() => {
    setQuantity(initialQuantity)
    setInputValue(
      initialQuantity === BigInt(0)
        ? ''
        : atomicBreakdown(initialQuantity, amount.info.decimals).bn.toFormat(),
    )
  }, [amount.info.decimals, initialQuantity])

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
    <KeyboardAvoidingView style={[a.flex_1, ta.bg_color_max]}>
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

          <View style={[a.flex_row, a.align_center, a.justify_end]}>
            <TextInput
              keyboardType="decimal-pad"
              inputMode="decimal"
              autoComplete="off"
              value={inputValue}
              placeholder="0"
              placeholderTextColor={p.text_gray_low}
              onChangeText={handleOnChangeQuantity}
              selectTextOnFocus
              autoFocus
              allowFontScaling={false}
              style={[ta.text_gray_max, a.heading_2_regular]}
              underlineColorAndroid="transparent"
              selectionColor={p.input_selected}
              cursorColor={p.el_gray_max}
            />
            <Text
              style={[ta.text_gray_max, a.heading_2_regular, {padding: 10}]}
            >
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

            {!isPrimary && (
              <Button
                title={strings.send.max.toLocaleUpperCase()}
                onPress={handleOnMaxBalance}
                type={ButtonType.Text}
              />
            )}

            <Space.Height.md />

            {!hasBalance && <NoBalance />}

            {isUnableToSpend && hasBalance && <UnableToSpend />}
          </View>
        </ScrollView>

        <View style={{height: 1, backgroundColor: p.gray_200}} />

        <View style={[a.px_lg]}>
          <Button
            onPress={handleOnApply}
            title={strings.send.apply.toLocaleUpperCase()}
            disabled={isUnableToSpend || !hasBalance || isZero}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}
