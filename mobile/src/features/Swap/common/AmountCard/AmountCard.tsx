import {atomicToDecimal, parseNumberFromText} from '@yoroi/common'
import {isPrimaryToken, isPrimaryTokenInfo} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Branded} from '@yoroi/types'

import * as React from 'react'
import {Platform, Pressable, Text, TextInput, View} from 'react-native'

import {usePortfolioBalances} from '~/features/Portfolio/common/hooks/usePortfolioBalances'
import {useNavigateTo} from '~/features/Swap/common/navigation'
import {useSwap} from '~/features/Swap/common/useSwap'
import {useSwapTokenActivity} from '~/features/Swap/common/useSwapTokenActivity'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {PairedBalance} from '~/ui/PairedBalance/PairedBalance'
import {TokenInfoIcon} from '~/ui/TokenInfoIcon/TokenInfoIcon'
import {formatTokenWithText} from '~/wallets/utils/format'

export const AmountCard = ({direction}: {direction: 'in' | 'out'}) => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()
  const swapForm = useSwap()
  const navigateTo = useNavigateTo()
  const {wallet} = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})

  const amount =
    direction === 'in' ? swapForm.tokenInInput : swapForm.tokenOutInput
  const info = amount.tokenId
    ? swapForm.tokenInfos.get(amount.tokenId)
    : undefined
  const quantity = parseNumberFromText({
    text: amount.value,
    denomination: info?.decimals ?? 0,
  }).quantity

  // Fetch price for this token if it's not a primary token
  const tokenIds = React.useMemo(() => {
    if (!info || isPrimaryToken(info)) return []
    return [info.id]
  }, [info])

  const {data: tokenActivity = {}} = useSwapTokenActivity(tokenIds)

  // Only show errors for input direction (insufficient balance, etc.)
  const error = direction === 'in' ? amount.error : null

  // Get balance for Max button
  const balance = info ? balances.records.get(info.id)?.quantity : undefined
  const decimals = info?.decimals ?? 0

  // Format balance like rn71: show actual balance amount
  const formattedAmount =
    !info || (balance ?? 0n) === 0n
      ? '0'
      : formatTokenWithText(balance ?? 0n, info, 18)

  const focusInput = () => {
    const inputRef =
      direction === 'in' ? swapForm.tokenInInputRef : swapForm.tokenOutInputRef
    if (inputRef?.current) {
      inputRef.current.focus()
    }
  }

  const navigateToTokenSelection = () => {
    if (direction === 'in') {
      navigateTo.selectTokenIn()
    } else {
      navigateTo.selectTokenOut()
    }
  }

  const handleAmountChange = (value: string) => {
    if (direction === 'in') {
      swapForm.action({type: 'TokenInAmountChanged', value})
    } else {
      swapForm.action({type: 'TokenOutAmountChanged', value})
    }
  }

  const handleMaxPress = () => {
    if (balance && info) {
      const decimalValue = atomicToDecimal({
        value: balance,
        decimals: decimals,
      })
      const maxAmount = decimalValue.toFixed(decimals)
      swapForm.action({type: 'TokenInAmountChanged', value: maxAmount})
    }
  }

  return (
    <Pressable
      style={[a.rounded_sm, a.p_lg, a.gap_lg, ta.bg_color_min]}
      onPress={() => (info ? focusInput() : navigateToTokenSelection())}
    >
      <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
        {direction === 'in' ? strings.swap.from : strings.swap.to}
      </Text>

      {direction === 'in' && info && !isPrimaryTokenInfo(info) && (
        <View style={[a.absolute, {right: 8, top: 8}]}>
          <Button
            title={strings.swap.max}
            type="Text"
            size="S"
            onPress={handleMaxPress}
          />
        </View>
      )}

      <View style={[a.flex_row, a.justify_between]}>
        <Pressable
          style={[a.flex_row, a.align_center]}
          onPress={(e) => {
            e.stopPropagation()
            navigateToTokenSelection()
          }}
        >
          <TokenInfoIcon info={info} size="md" />

          <Text
            style={[
              a.pr_xs,
              a.pl_md,
              a.body_1_lg_medium,
              {color: p.text_gray_medium},
            ]}
          >
            {info?.name ?? strings.swap.selectToken}
          </Text>

          <Icon.Chevron direction="down" size={24} color={p.gray_max} />
        </Pressable>

        <View style={[a.flex_1, a.flex_row, a.justify_end, a.align_center]}>
          <TextInput
            keyboardType="numeric"
            autoComplete="off"
            value={amount.value}
            placeholder="0"
            placeholderTextColor={p.text_gray_medium}
            onChangeText={handleAmountChange}
            allowFontScaling
            selectionColor={p.input_selected}
            style={[
              a.py_0,
              a.heading_3_medium,
              a.text_right,
              a.flex_1,
              {color: p.gray_900},
              Platform.OS === 'ios' ? {lineHeight: 22} : {},
            ]}
            underlineColorAndroid="transparent"
            editable={Boolean(info)}
            onPressIn={(e) => {
              e.stopPropagation()
              if (!info) {
                navigateToTokenSelection()
              }
            }}
            ref={
              direction === 'in'
                ? swapForm.tokenInInputRef
                : swapForm.tokenOutInputRef
            }
          />
        </View>
      </View>

      {error ? (
        <View style={[a.flex_row, a.align_center, a.gap_sm]}>
          <Icon.Portfolio2 size={16} color={p.sys_magenta_500} />

          <Text style={[a.body_2_md_regular, {color: p.sys_magenta_500}]}>
            {error}
          </Text>
        </View>
      ) : (
        <View style={[a.flex_row, a.justify_between, a.align_center]}>
          <View style={[a.flex_row, a.align_center, a.gap_sm]}>
            <Icon.Portfolio2 size={16} color={p.text_gray_low} />

            <Text
              ellipsizeMode="middle"
              style={[a.body_2_md_regular, ta.text_gray_low]}
            >
              {formattedAmount}
            </Text>
          </View>

          {info && (
            <PairedBalance
              amount={{
                info,
                quantity: BigInt(quantity ?? Branded.ZERO_QUANTITY),
              }}
              textStyle={a.body_2_md_regular}
              tokenActivity={tokenActivity}
            />
          )}
        </View>
      )}
    </Pressable>
  )
}
