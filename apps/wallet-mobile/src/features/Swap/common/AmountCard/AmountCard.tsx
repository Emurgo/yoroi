import {useSwap} from '@yoroi/swap'
import {Balance} from '@yoroi/types'
import React, {useRef} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Boundary, Icon, Spacer, TokenIcon, TokenIconPlaceholder} from '../../../../components'
import {formatTokenWithText} from '../../../../legacy/format'
import {COLORS} from '../../../../theme'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useTokenInfo} from '../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../yoroi-wallets/utils'

type Props = {
  label?: string
  wallet: YoroiWallet
  amount: Balance.Amount
  onChange(value: string): void
  value?: string
  hasError?: boolean
  navigateTo?: () => void
  touched?: boolean
  inputRef?: React.RefObject<TextInput>
  inputEditable?: boolean
}

export const AmountCard = ({
  label,
  onChange,
  value,
  wallet,
  amount,
  navigateTo,
  hasError,
  touched,
  inputRef,
  inputEditable = true,
}: Props) => {
  const strings = useStrings()
  const {quantity, tokenId} = amount
  const amountInputRef = useRef<TextInput>(inputRef?.current ?? null)

  const tokenInfo = useTokenInfo({wallet, tokenId})
  const {createOrder} = useSwap()

  const isSell = tokenId === createOrder.amounts.sell.tokenId

  const noTokenSelected = !touched

  const name = tokenInfo.ticker ?? tokenInfo.name
  const formattedAmount = noTokenSelected ? Quantities.zero : formatTokenWithText(quantity, tokenInfo, 18)
  const fallback = React.useCallback(() => <TokenIconPlaceholder />, [])

  const focusInput = () => {
    if (amountInputRef?.current) {
      amountInputRef.current.focus()
    }
  }
  return (
    <View>
      <View style={[styles.container, hasError && styles.borderError]}>
        {label != null && <Text style={[styles.label, hasError && styles.labelError]}>{label}</Text>}

        <View style={styles.content}>
          <Pressable style={styles.amountWrapper} onPress={focusInput}>
            <TextInput
              keyboardType="numeric"
              autoComplete="off"
              value={value}
              placeholder="0"
              onChangeText={onChange}
              allowFontScaling
              selectionColor={COLORS.TRANSPARENT_BLACK}
              style={styles.amountInput}
              underlineColorAndroid="transparent"
              ref={amountInputRef}
              editable={inputEditable}
              selectTextOnFocus
            />
          </Pressable>

          <Spacer width={7} />

          <View style={styles.rightSection}>
            <TouchableOpacity onPress={() => navigateTo?.()}>
              <View style={styles.sectionContainer}>
                <Boundary loading={{fallback: <TokenIconPlaceholder />}} error={{fallback}}>
                  {noTokenSelected ? (
                    <Icon.Coins size={24} color={COLORS.TEXT_GRAY3} />
                  ) : (
                    <TokenIcon wallet={wallet} tokenId={tokenInfo.id} variant="swap" />
                  )}
                </Boundary>

                <Spacer width={8} />

                <Text style={styles.coinName}>{noTokenSelected ? strings.selectToken : name}</Text>

                <Icon.Chevron direction="right" size={20} color="black" />
              </View>
            </TouchableOpacity>

            <Spacer width={8} />

            <View style={styles.sectionContainer}>
              <Text
                ellipsizeMode="middle"
                style={styles.balanceText}
              >{`${strings.currentBalance}: ${formattedAmount}`}</Text>
            </View>
          </View>
        </View>
      </View>

      {hasError && (
        <View>
          <Spacer height={4} />

          <Text style={styles.errorText}>
            {createOrder.selectedPool === undefined
              ? strings.noPool
              : isSell
              ? strings.notEnoughBalance
              : strings.notEnoughSupply}
          </Text>
        </View>
      )}
    </View>
  )
}

const messages = defineMessages({
  selectToken: {
    id: 'swap.swapScreen.selectToken',
    defaultMessage: '!!!Select token',
  },
  currentBalance: {
    id: 'swap.swapScreen.currentBalance',
    defaultMessage: '!!!Current Balance',
  },
  notEnoughBalance: {
    id: 'swap.swapScreen.notEnoughBalance',
    defaultMessage: '!!!Not enough balance',
  },
  notEnoughSupply: {
    id: 'swap.swapScreen.notEnoughSupply',
    defaultMessage: '!!!Not enough supply in the pool',
  },
  noPool: {
    id: 'swap.swapScreen.noPool',
    defaultMessage: '!!! This pair is not available in any liquidity pool',
  },
})

const useStrings = () => {
  const intl = useIntl()
  return {
    selectToken: intl.formatMessage(messages.selectToken),
    currentBalance: intl.formatMessage(messages.currentBalance),
    notEnoughBalance: intl.formatMessage(messages.notEnoughBalance),
    notEnoughSupply: intl.formatMessage(messages.notEnoughSupply),
    noPool: intl.formatMessage(messages.noPool),
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.TEXT_GRAY3,
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    padding: 10,
    height: 86,
  },
  borderError: {
    borderColor: COLORS.ALERT_TEXT_COLOR,
  },
  label: {
    position: 'absolute',
    top: -7,
    left: 10,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 5,
    fontSize: 12,
    color: COLORS.ERROR_TEXT_COLOR_DARK,
  },
  labelError: {
    color: COLORS.ALERT_TEXT_COLOR,
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 64,
  },
  amountInput: {
    paddingVertical: 0,
    minWidth: 120,
    maxWidth: 200,
    height: 34,
    fontSize: 16,
  },
  amountWrapper: {
    flex: 1,
  },
  rightSection: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  sectionContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  coinName: {
    fontSize: 16,
    fontWeight: '400',
  },
  balanceText: {
    fontSize: 12,
    color: COLORS.TEXT_INPUT,
  },
  errorText: {
    color: COLORS.ALERT_TEXT_COLOR,
    fontSize: 12,
  },
})
