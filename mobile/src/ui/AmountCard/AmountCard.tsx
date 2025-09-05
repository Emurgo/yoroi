import {toBigInt} from '@yoroi/common'
import {isPrimaryTokenInfo} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Platform, Pressable, Text, TextInput, View} from 'react-native'

import {usePortfolioBalances} from '~/features/Portfolio/common/hooks/usePortfolioBalances'
import {useNavigateTo} from '~/features/Swap/common/navigation'
import {useSwap} from '~/features/Swap/common/useSwap'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {formatTokenWithText} from '~/wallets/utils/format'

import {PairedBalance} from '../PairedBalance/PairedBalance'
import {TokenInfoIcon} from '../TokenInfoIcon/TokenInfoIcon'

export const AmountCard = ({direction}: {direction: 'in' | 'out'}) => {
  const {atoms: ta, palette: p} = useTheme()
  const swapForm = useSwap()
  const navigateTo = useNavigateTo()
  const {wallet} = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})
  const [isFocused, setIsFocused] = React.useState(false)

  const amount =
    direction === 'in' ? swapForm.tokenInInput : swapForm.tokenOutInput
  const info = amount.tokenId
    ? swapForm.tokenInfos.get(amount.tokenId)
    : undefined
  const quantity = amount.value
  // Only show errors for input direction (insufficient balance, etc.)
  const error = direction === 'in' ? amount.error : null
  const touched = amount.isTouched

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
      const maxAmount = (Number(balance) / 10 ** decimals).toFixed(decimals)
      swapForm.action({type: 'TokenInAmountChanged', value: maxAmount})
    }
  }

  return (
    <View style={[a.rounded_sm, a.p_lg, a.gap_lg, ta.bg_color_min]}>
      <View style={[a.flex_row, a.justify_between]}>
        <Pressable
          style={[a.flex_row, a.align_center]}
          onPress={navigateToTokenSelection}
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
            {info?.name ?? 'Select Token'}
          </Text>

          <Icon.Chevron direction="down" size={24} color={p.gray_max} />
        </Pressable>

        {direction === 'in' && info && !isPrimaryTokenInfo(info) && (
          <Button title="Max" type="Text" size="S" onPress={handleMaxPress} />
        )}

        <Pressable
          style={[a.flex_1, a.flex_row, a.justify_end, a.align_center]}
          onPress={() => (info ? focusInput() : navigateToTokenSelection())}
        >
          <TextInput
            keyboardType="numeric"
            autoComplete="off"
            value={quantity}
            placeholder="0"
            placeholderTextColor={p.text_gray_medium}
            onChangeText={handleAmountChange}
            allowFontScaling
            selectionColor={isFocused ? p.input_selected : p.black_static}
            style={[
              a.py_0,
              a.heading_3_medium,
              a.text_right,
              {color: p.gray_900},
              Platform.OS === 'ios' ? {lineHeight: 22} : {},
            ]}
            underlineColorAndroid="transparent"
            editable={touched}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            ref={
              direction === 'in'
                ? swapForm.tokenInInputRef
                : swapForm.tokenOutInputRef
            }
          />
        </Pressable>
      </View>

      {error ? (
        <View style={[a.flex_row, a.align_center, a.gap_sm]}>
          <Icon.Portfolio2 size={15} color={p.sys_magenta_500} />

          <Text style={[a.body_2_md_regular, {color: p.sys_magenta_500}]}>
            {error}
          </Text>
        </View>
      ) : (
        <View style={[a.flex_row, a.justify_between, a.align_center]}>
          <View style={[a.flex_row, a.align_center, a.gap_sm]}>
            <Icon.Portfolio2 size={15} color={p.text_gray_medium} />

            <Text
              ellipsizeMode="middle"
              style={[a.body_2_md_regular, ta.text_gray_medium]}
            >
              {formattedAmount}
            </Text>
          </View>

          {info && (
            <PairedBalance
              amount={{
                info,
                quantity: BigInt(
                  Math.floor(Number(quantity || '0') * 10 ** decimals),
                ),
              }}
            />
          )}
        </View>
      )}
    </View>
  )
}
