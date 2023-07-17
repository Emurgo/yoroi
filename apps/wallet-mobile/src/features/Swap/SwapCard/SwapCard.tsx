import {Ionicons} from '@expo/vector-icons'
import {Balance} from '@yoroi/types'
import React, {useRef} from 'react'
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Boundary, Placeholder, Spacer, TokenIcon} from '../../../components'
import {COLORS} from '../../../theme'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {useTokenInfo} from '../../../yoroi-wallets/hooks'
import {Quantities} from '../../../yoroi-wallets/utils'
import {useSwap} from '../common/SwapContext'

type SwapCardProp = {
  label?: string | null
  wallet: YoroiWallet
  amount: Balance.Amount
  onChange(value: string): void
  value?: string
  hasError?: boolean
  navigateTo: () => void
}

export const SwapCard = ({label, onChange, value, wallet, amount, navigateTo, hasError}: SwapCardProp) => {
  const {quantity, tokenId} = amount
  const focusRef = useRef<TextInput>(null)

  const {selectedTokenFromId} = useSwap()
  const tokenInfo = useTokenInfo({wallet, tokenId: selectedTokenFromId !== undefined ? selectedTokenFromId : tokenId})

  const name = tokenInfo.ticker ?? tokenInfo.name
  const denominatedQuantity = Quantities.denominated(quantity, tokenInfo.decimals ?? 0)

  const focusInput = () => {
    if (focusRef?.current) {
      focusRef.current.focus()
    }
  }
  return (
    <>
      <View style={[styles.container, hasError && styles.borderError]}>
        {label != null && <Text style={[styles.label, hasError && styles.labelError]}>{label}</Text>}

        <View style={styles.content}>
          <Pressable style={styles.amountWrapper} onPress={focusInput}>
            <AmountInput onChange={onChange} value={value} inputRef={focusRef} />
          </Pressable>

          <Spacer width={7} />

          <View style={styles.rightSection}>
            <TouchableOpacity onPress={() => navigateTo()}>
              <View style={styles.sectionContainer}>
                <Boundary loading={{fallback: <Placeholder />}} error={{fallback: () => <Placeholder />}}>
                  <TokenIcon wallet={wallet} tokenId={tokenInfo.id} size="small" />
                </Boundary>

                <Spacer width={8} />

                <Text style={styles.adaText}>{name}</Text>

                <Ionicons name="chevron-forward-outline" size={20} color="black" />
              </View>
            </TouchableOpacity>

            <Spacer width={8} />

            <Text style={styles.balanceText}>{`Current balance: ${denominatedQuantity} ADA`}</Text>
          </View>
        </View>
      </View>

      {hasError && (
        <>
          <Spacer height={4} />

          <Text style={styles.errorText}>Not enough balance</Text>
        </>
      )}
    </>
  )
}

type AmountInputProps = {
  value?: string
  onChange(value: string): void
  inputRef?: React.RefObject<TextInput>
}
const AmountInput = ({onChange, value, inputRef}: AmountInputProps) => {
  // TODO add more formatting if is the case
  const onChangeText = (text: string) => {
    onChange(text)
  }

  return (
    <TextInput
      returnKeyType="done"
      keyboardType="numeric"
      mode="flat"
      autoComplete="off"
      value={value}
      placeholder="0"
      onChangeText={onChangeText}
      selectTextOnAutoFocus
      allowFontScaling
      selectionColor={COLORS.TRANSPARENT_BLACK}
      style={styles.amountInput}
      underlineColor="transparent"
      underlineColorAndroid="tra2sparent"
      ref={inputRef}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7AFC0',
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    padding: 10,
    width: '100%',
    height: 86,
  },
  borderError: {
    borderColor: '#FF1351',
  },
  label: {
    position: 'absolute',
    top: -7,
    left: 10,
    backgroundColor: 'white',
    paddingHorizontal: 5,
    fontSize: 12,
    color: '#242838',
  },
  labelError: {
    color: '#FF1351',
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 64,
  },
  amountInput: {
    naxWidth: 100,
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
  adaText: {
    fontSize: 16,
    fontWeight: '400',
  },
  balanceText: {
    fontSize: 12,
    color: '#6B7384',
  },
  errorText: {
    color: '#FF1351',
    fontSize: 12,
  },
})
