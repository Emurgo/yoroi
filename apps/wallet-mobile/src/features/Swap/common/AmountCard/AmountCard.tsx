import {Balance} from '@yoroi/types'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Boundary, Icon, Spacer, TokenIcon, TokenIconPlaceholder} from '../../../../components'
import {formatTokenWithText} from '../../../../legacy/format'
import {COLORS} from '../../../../theme'
import {isEmptyString} from '../../../../utils'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useTokenInfo} from '../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../yoroi-wallets/utils'

type Props = {
  label?: string
  wallet: YoroiWallet
  amount: Balance.Amount
  onChange(value: string): void
  value?: string
  navigateTo?: () => void
  touched?: boolean
  inputRef?: React.RefObject<TextInput>
  inputEditable?: boolean
  error?: string
}

export const AmountCard = ({
  label,
  onChange,
  value,
  wallet,
  amount,
  navigateTo,
  touched,
  inputRef,
  inputEditable = true,
  error,
}: Props) => {
  const [isFocused, setIsFocused] = React.useState(false)
  const strings = useStrings()
  const {quantity, tokenId} = amount
  const tokenInfo = useTokenInfo({wallet, tokenId})

  const noTokenSelected = !touched

  const name = tokenInfo.ticker ?? tokenInfo.name
  const formattedAmount = noTokenSelected ? Quantities.zero : formatTokenWithText(quantity, tokenInfo, 18)
  const fallback = React.useCallback(() => <TokenIconPlaceholder />, [])

  const focusInput = () => {
    if (inputRef?.current) {
      inputRef.current.focus()
    }
  }

  return (
    <View>
      <View style={[styles.container, isFocused && styles.active, !isEmptyString(error) && styles.borderError]}>
        {label != null && <Text style={[styles.label, !isEmptyString(error) && styles.labelError]}>{label}</Text>}

        <View style={styles.content}>
          <Pressable style={styles.amountWrapper} onPress={() => (noTokenSelected ? navigateTo?.() : focusInput())}>
            <TextInput
              keyboardType="numeric"
              autoComplete="off"
              value={value}
              placeholder="0"
              placeholderTextColor="#6B7384"
              onChangeText={onChange}
              allowFontScaling
              selectionColor={isFocused ? '#242838' : COLORS.TRANSPARENT_BLACK}
              style={[styles.amountInput, value === '0' && styles.grayText]}
              underlineColorAndroid="transparent"
              ref={inputRef}
              editable={inputEditable && touched}
              selectTextOnFocus
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              {...(noTokenSelected && {onPressIn: navigateTo})}
            />
          </Pressable>

          <Spacer width={7} />

          <View style={styles.rightSection}>
            <TouchableOpacity onPress={navigateTo}>
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

      {!isEmptyString(error) && (
        <View>
          <Spacer height={4} />

          <Text style={styles.errorText}>{error}</Text>
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
})

const useStrings = () => {
  const intl = useIntl()
  return {
    selectToken: intl.formatMessage(messages.selectToken),
    currentBalance: intl.formatMessage(messages.currentBalance),
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
    borderWidth: 2,
  },
  active: {
    borderWidth: 2,
    borderColor: '#242838',
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
    color: '#000000',
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
  grayText: {
    color: '#6B7384',
  },
})
