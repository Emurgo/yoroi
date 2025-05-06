import {isPrimaryTokenInfo} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Platform, Pressable, StyleSheet, Text, TextInput, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Button, ButtonType} from '../../../../components/Button/Button'
import {Icon} from '../../../../components/Icon'
import {Outline} from '../../../../components/Outline'
import {PairedBalance} from '../../../../components/PairedBalance/PairedBalance'
import {isEmptyString} from '../../../../kernel/utils'
import {formatTokenWithText} from '../../../../yoroi-wallets/utils/format'
import {usePortfolioBalances} from '../../../Portfolio/common/hooks/usePortfolioBalances'
import {TokenInfoIcon} from '../../../Portfolio/common/TokenAmountItem/TokenInfoIcon'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {undefinedToken} from '../constants'
import {useNavigateTo} from '../navigation'
import {useStrings} from '../strings'
import {useSwap} from '../SwapProvider'

export const AmountCard = ({direction}: {direction: 'in' | 'out'}) => {
  const [isFocused, setIsFocused] = React.useState(false)
  const strings = useStrings()
  const {styles, colors} = useStyles()
  const {isDark} = useTheme()
  const {wallet} = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})
  const swapForm = useSwap()
  const navigate = useNavigateTo()
  const navigateTo = direction === 'in' ? navigate.selectTokenIn : navigate.selectTokenOut
  const tokenInput = swapForm[direction === 'in' ? 'tokenInInput' : 'tokenOutInput']

  const amount = {
    info: swapForm.tokenInfos.get(tokenInput.tokenId ?? undefinedToken),
    quantity: balances.records.get(tokenInput.tokenId ?? undefinedToken)?.quantity,
  }
  const info = amount.info

  const decimals = info?.decimals ?? 0
  const value = tokenInput.value
  const quantity = BigInt(Math.floor(Number(value ?? 0) * 10 ** (info?.decimals ?? 0)))
  const touched = tokenInput.isTouched
  const inputRef = direction === 'in' ? swapForm.tokenInInputRef : swapForm.tokenOutInputRef
  const error = direction === 'in' ? tokenInput.error : null
  const testID = direction === 'in' ? 'swap:sell-edit' : 'swap:buy-edit'

  const noTokenSelected = !touched
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const name = info?.ticker || info?.name || ''
  const formattedAmount =
    !info || (amount?.quantity ?? 0n) === 0n ? '0' : formatTokenWithText(amount?.quantity ?? 0n, info, 18)

  const focusInput = () => {
    if (inputRef?.current) {
      inputRef.current.focus()
    }
  }

  return (
    <View style={[styles.container, direction === 'out' && styles.background]}>
      <Outline
        isFocused={isFocused}
        color={!isEmptyString(error) ? colors.error : colors.border}
        activeColor={!isEmptyString(error) ? colors.error : colors.gray}
        style={styles.outline}
      />

      <View style={styles.between}>
        <Text style={styles.label}>{direction === 'in' ? strings.from : strings.to}</Text>

        {direction === 'in' && info && !isPrimaryTokenInfo(info) && (
          <View>
            <Button
              title={strings.max}
              type={ButtonType.Text}
              size="S"
              onPress={() =>
                swapForm.action({
                  type: 'TokenInAmountChanged',
                  value: (Number(amount.quantity) / 10 ** decimals).toFixed(decimals),
                })
              }
            />
          </View>
        )}
      </View>

      <View style={styles.between}>
        <TouchableOpacity onPress={navigateTo}>
          <View style={styles.token}>
            <TokenInfoIcon info={info} size="md" />

            <Text style={styles.coinName}>{noTokenSelected || !info ? strings.selectToken : name}</Text>

            <Icon.Chevron direction="down" size={24} color={colors.gray} />
          </View>
        </TouchableOpacity>

        <Pressable
          style={styles.amountWrapper}
          onPress={() => (!info ? navigateTo?.() : focusInput())}
          testID={`${testID}-token-input`}
        >
          <TextInput
            keyboardType="numeric"
            autoComplete="off"
            value={value}
            placeholder="0"
            placeholderTextColor={colors.placeholder}
            onChangeText={(value) =>
              swapForm.action({type: direction === 'in' ? 'TokenInAmountChanged' : 'TokenOutAmountChanged', value})
            }
            allowFontScaling
            selectionColor={isFocused ? colors.focused : colors.blur}
            style={[styles.amountInput, value === '0' && styles.grayText, !isEmptyString(error) && styles.errorText]}
            underlineColorAndroid="transparent"
            ref={inputRef}
            editable={touched}
            selectTextOnFocus
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            testID={`${testID}-amount-input`}
            keyboardAppearance={isDark ? 'dark' : 'light'} // ios feature
            {...(!info && {onPressIn: navigateTo})}
          />
        </Pressable>
      </View>

      <View style={styles.between}>
        {!isEmptyString(error) ? (
          <View style={styles.balance}>
            <Icon.Warning size={15} color={colors.error} />

            <Text style={[styles.text, styles.errorText]}>{error}</Text>
          </View>
        ) : (
          <View style={styles.balance}>
            <Icon.Portfolio2 size={15} color={colors.placeholder} />

            <Text ellipsizeMode="middle" style={[styles.text, styles.grayText]}>
              {formattedAmount}
            </Text>
          </View>
        )}

        {info && (
          <PairedBalance
            amount={{
              info,
              quantity,
            }}
          />
        )}
      </View>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    outline: {
      borderRadius: 8,
    },
    container: {
      borderRadius: 8,
      ...atoms.p_lg,
      ...atoms.gap_lg,
    },
    background: {
      backgroundColor: color.bg_color_min,
    },
    between: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    label: {
      ...atoms.body_2_md_medium,
      ...atoms.py_xs,
      color: color.gray_900,
    },
    amountInput: {
      ...atoms.py_0,
      ...atoms.heading_3_medium,
      textAlign: 'right',
      color: color.gray_900,
      ...(Platform.OS === 'ios' ? {lineHeight: 22} : {}),
    },
    amountWrapper: {
      ...atoms.flex_1,
      ...atoms.flex_row,
      ...atoms.justify_end,
      ...atoms.align_center,
    },
    token: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    coinName: {
      ...atoms.pr_xs,
      ...atoms.pl_md,
      ...atoms.body_1_lg_medium,
      color: color.text_gray_medium,
    },
    balance: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.gap_sm,
    },
    text: {
      ...atoms.body_2_md_regular,
    },
    errorText: {
      color: color.sys_magenta_500,
    },
    grayText: {
      color: color.gray_600,
    },
  })

  const colors = {
    placeholder: color.text_gray_medium,
    focused: color.input_selected,
    blur: color.black_static,
    noSelected: color.gray_400,
    border: color.bg_color_min,
    gray: color.gray_max,
    error: color.sys_magenta_500,
  }
  return {styles, colors} as const
}
