import * as React from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextProps,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'

import {Button, Spacer, TextInput} from '../../../../../components'
import {AssetItem} from '../../../../../components/AssetItem'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {PairedBalance} from '../../../../../TxHistory/PairedBalance'
import {useTokenInfo} from '../../../../../yoroi-wallets/hooks'
import {Quantity} from '../../../../../yoroi-wallets/types'
import {Quantities} from '../../../../../yoroi-wallets/utils'
import {editedFormatter, pastedFormatter} from '../../../../../yoroi-wallets/utils/amountUtils'
import {useTokenQuantities} from '../../../common/hooks'
import {useSend} from '../../../common/SendContext'
import {useStrings} from '../../../common/strings'
import {useDeleteAmountWhenZeroed} from './DeleteAmountWhenZeroed'

export const EditAmountScreen = () => {
  const strings = useStrings()
  const {selectedTokenId} = useSend()
  const {available, spendable, initialQuantity} = useTokenQuantities(selectedTokenId)

  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: selectedTokenId})
  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id

  const [quantity, setQuantity] = React.useState<Quantity>(initialQuantity)
  const [inputAmount, setInputAmount] = React.useState<string>(
    Quantities.denominated(initialQuantity, tokenInfo.decimals),
  )

  const hasBalance = !Quantities.isGreaterThan(quantity, available)
  const isOverSpendable = isPrimary && Quantities.isGreaterThan(quantity, spendable)

  const onChangeAmount = (text: string) => {
    setInputAmount(text)
    setQuantity(Quantities.atomic(text, tokenInfo.decimals))
  }
  const onMaxBalance = () => setInputAmount(Quantities.denominated(spendable, tokenInfo.decimals))
  const onApply = useDeleteAmountWhenZeroed()

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={86}
      >
        <ScrollView style={styles.scrollView} bounces={false}>
          <Spacer height={16} />

          <AssetItem quantity={available} tokenInfo={tokenInfo} />

          <Spacer height={40} />

          <AmountInput onChange={onChangeAmount} value={inputAmount} ticker={tokenInfo.ticker} />

          <Center>
            {isPrimary && <PairedBalance primaryAmount={{tokenId: tokenInfo.id, quantity}} />}

            <Spacer height={22} />

            {!isPrimary && <MaxBalanceButton onPress={onMaxBalance} />}

            <Spacer height={22} />

            {!hasBalance && <NoBalance />}

            {isOverSpendable && hasBalance && <OverSpendable />}
          </Center>
        </ScrollView>

        <HR />

        <Actions>
          <ApplyButton
            onPress={() => onApply(inputAmount)}
            title={strings.apply.toLocaleUpperCase()}
            shelleyTheme
            disabled={isOverSpendable || !hasBalance}
          />
        </Actions>
      </KeyboardAvoidingView>
    </View>
  )
}

const NoBalance = ({style, ...props}: TextProps) => {
  const strings = useStrings()

  return (
    <Text style={[style, styles.noBalance]} {...props}>
      {strings.noBalance}
    </Text>
  )
}

const OverSpendable = ({style, ...props}: TextProps) => {
  const strings = useStrings()

  return (
    <Text style={[style, styles.overSpendable]} {...props}>
      {strings.minPrimaryBalanceForTokens}
    </Text>
  )
}

const Center = ({style, ...props}: ViewProps) => <View style={[style, styles.center]} {...props} />
const Actions = ({style, ...props}: ViewProps) => <View style={[style, styles.actions]} {...props} />

const MaxBalanceButton = ({onPress}: {onPress(): void}) => {
  const strings = useStrings()

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
const AmountInput = ({value, onChange, ticker}: AmountInputProps) => {
  const onChangeText = (text: string) => {
    const shorterStringLength = Math.min(text.length, value.length)
    const wasPasted =
      Math.abs(value.length - text.length) > 1 ||
      value.substring(0, shorterStringLength) !== text.substring(0, shorterStringLength)

    const formatter = wasPasted ? pastedFormatter : editedFormatter

    onChange(formatter(text) as Quantity)
  }

  return (
    <TextInput
      returnKeyType="done"
      keyboardType="decimal-pad"
      mode="flat"
      autoComplete={false}
      value={value}
      placeholder={value}
      onChangeText={onChangeText}
      focusable
      selectTextOnFocus
      allowFontScaling
      autoFocus
      selectionColor={COLORS.TRANSPARENT_BLACK}
      right={<Ticker ticker={ticker} />}
      style={styles.amount}
      underlineColor="transparent"
      underlineColorAndroid="transparent"
    />
  )
}
const Ticker = ({ticker}: {ticker?: string}) => <Text style={styles.ticker}>{ticker}</Text>

const HR = () => {
  return <View style={styles.hr} />
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  hr: {
    height: 1,
    backgroundColor: COLORS.BORDER_GRAY,
  },
  actions: {
    padding: 16,
  },
  noBalance: {
    color: COLORS.ERROR_TEXT_COLOR,
    textAlign: 'center',
  },
  maxBalance: {
    fontFamily: 'Rubik-Medium',
    color: COLORS.SHELLEY_BLUE,
  },
  overSpendable: {
    color: COLORS.TEXT_INPUT,
    textAlign: 'center',
  },
  amount: {
    fontSize: 24,
    lineHeight: 32,
    borderWidth: 0,
    textAlign: 'right',
    backgroundColor: 'white',
  },
  ticker: {
    fontSize: 24,
    lineHeight: 32,
  },
})

const ApplyButton = Button
