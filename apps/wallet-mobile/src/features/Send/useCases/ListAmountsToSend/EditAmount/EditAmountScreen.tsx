import {useTransfer} from '@yoroi/transfer'
import {Balance} from '@yoroi/types'
import * as React from 'react'
import {ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewProps} from 'react-native'

import {Button, KeyboardAvoidingView, Spacer, TextInput} from '../../../../../components'
import {AmountItem} from '../../../../../components/AmountItem/AmountItem'
import {PairedBalance} from '../../../../../components/PairedBalance/PairedBalance'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {selectFtOrThrow} from '../../../../../yoroi-wallets/cardano/utils'
import {useTokenInfo} from '../../../../../yoroi-wallets/hooks'
import {Logger} from '../../../../../yoroi-wallets/logging'
import {asQuantity, editedFormatter, pastedFormatter, Quantities} from '../../../../../yoroi-wallets/utils'
import {useNavigateTo, useOverridePreviousSendTxRoute} from '../../../common/navigation'
import {useStrings} from '../../../common/strings'
import {useTokenQuantities} from '../../../common/useTokenQuantities'
import {NoBalance} from './ShowError/NoBalance'
import {UnableToSpend} from './ShowError/UnableToSpend'

export const EditAmountScreen = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const {selectedTokenId, amountChanged} = useTransfer()
  const {available, spendable, initialQuantity} = useTokenQuantities(selectedTokenId)

  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: selectedTokenId}, {select: selectFtOrThrow})
  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id

  const [quantity, setQuantity] = React.useState<Balance.Quantity>(initialQuantity)
  const [inputValue, setInputValue] = React.useState<string>(
    Quantities.denominated(initialQuantity, tokenInfo.decimals ?? 0),
  )

  useOverridePreviousSendTxRoute(
    Quantities.isZero(initialQuantity) ? 'send-select-token-from-list' : 'send-list-amounts-to-send',
  )

  React.useEffect(() => {
    setQuantity(initialQuantity)
    setInputValue(Quantities.denominated(initialQuantity, tokenInfo.decimals ?? 0))
  }, [initialQuantity, tokenInfo.decimals])

  const hasBalance = !Quantities.isGreaterThan(quantity, available)
  const isUnableToSpend = isPrimary && Quantities.isGreaterThan(quantity, spendable)
  const isZero = Quantities.isZero(quantity)

  const onChangeQuantity = (text: string) => {
    try {
      const quantity = asQuantity(text.length > 0 ? text : '0')
      setInputValue(text)
      setQuantity(Quantities.integer(quantity, tokenInfo.decimals ?? 0))
    } catch (error) {
      Logger.error('EditAmountScreen::onChangeQuantity', error)
    }
  }
  const onMaxBalance = () => {
    setInputValue(Quantities.denominated(spendable, tokenInfo.decimals ?? 0))
    setQuantity(spendable)
  }
  const onApply = () => {
    amountChanged(quantity)
    navigateTo.selectedTokens()
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{flex: 1}}>
        <ScrollView style={styles.scrollView} bounces={false}>
          <Spacer height={16} />

          <AmountItem amount={{quantity: available, tokenId: tokenInfo.id}} wallet={wallet} />

          <Spacer height={40} />

          <AmountInput onChange={onChangeQuantity} value={inputValue} ticker={tokenInfo.ticker} />

          <Center>
            {isPrimary && <PairedBalance amount={{tokenId: tokenInfo.id, quantity}} />}

            <Spacer height={22} />

            {!isPrimary && <MaxBalanceButton onPress={onMaxBalance} />}

            <Spacer height={22} />

            {!hasBalance && <NoBalance />}

            {isUnableToSpend && hasBalance && <UnableToSpend />}
          </Center>
        </ScrollView>

        <HR />

        <Actions>
          <ApplyButton
            onPress={onApply}
            title={strings.apply.toLocaleUpperCase()}
            shelleyTheme
            disabled={isUnableToSpend || !hasBalance || isZero}
          />
        </Actions>
      </KeyboardAvoidingView>
    </View>
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
const AmountInput = ({onChange, value, ticker}: AmountInputProps) => {
  const onChangeText = (text: string) => {
    const shorterStringLength = Math.min(text.length, value.length)
    const wasPasted =
      Math.abs(value.length - text.length) > 1 ||
      value.substring(0, shorterStringLength) !== text.substring(0, shorterStringLength)

    const formatter = wasPasted ? pastedFormatter : editedFormatter

    onChange(formatter(text))
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  hr: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.BORDER_GRAY,
  },
  actions: {
    padding: 16,
  },
  maxBalance: {
    fontFamily: 'Rubik-Medium',
    color: COLORS.SHELLEY_BLUE,
  },
  amount: {
    fontSize: 24,
    lineHeight: 32,
    borderWidth: 0,
    textAlign: 'right',
    backgroundColor: COLORS.WHITE,
  },
  ticker: {
    fontSize: 24,
    lineHeight: 32,
  },
})

const ApplyButton = Button
