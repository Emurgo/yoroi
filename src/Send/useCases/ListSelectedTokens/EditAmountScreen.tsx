import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {Text, TextProps, TouchableOpacity, View, ViewProps} from 'react-native'

import {Button, Spacer, TextInput} from '../../../components'
import {AssetItem} from '../../../components/AssetItem'
import {TxHistoryRouteNavigation} from '../../../navigation'
import {useSelectedWallet} from '../../../SelectedWallet'
import {COLORS} from '../../../theme'
import {PairedBalance} from '../../../TxHistory/PairedBalance'
import {useTokenInfo} from '../../../yoroi-wallets/hooks'
import {Quantity} from '../../../yoroi-wallets/types'
import {Quantities} from '../../../yoroi-wallets/utils'
import {editedFormatter, pastedFormatter} from '../../../yoroi-wallets/utils/amountUtils'
import {useTokenQuantities} from '../../shared/hooks'
import {useSend} from '../../shared/SendContext'
import {useStrings} from '../../shared/strings'

export const EditAmountScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const {selectedTokenId, amountChanged} = useSend()
  const {available, locked, spendable, initialQuantity} = useTokenQuantities(selectedTokenId)

  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: selectedTokenId})
  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id

  const [quantity, setQuantity] = React.useState<Quantity>(initialQuantity)
  const [inputAmount, setInputAmount] = React.useState<string>(
    Quantities.denominated(initialQuantity, tokenInfo.decimals),
  )

  const notEnoughBalance = Quantities.isGreaterThan(quantity, spendable)
  const cantKeepAssets = !Quantities.isZero(locked) && Quantities.isGreaterThan(quantity, spendable)

  const onChangeAmount = (text: string) => {
    setInputAmount(text)
    setQuantity(Quantities.atomic(text, tokenInfo.decimals))
  }
  const onMaxBalance = () => setInputAmount(Quantities.denominated(spendable, tokenInfo.decimals))
  const onApply = () => {
    amountChanged(Quantities.atomic(inputAmount, tokenInfo.decimals))
    navigation.navigate('send-selected-tokens')
  }

  return (
    <View style={{padding: 16, flex: 1, backgroundColor: 'white'}}>
      <AssetItem quantity={available} tokenInfo={tokenInfo} />

      <Spacer height={40} />

      <AmountInput onChange={onChangeAmount} value={inputAmount} ticker={tokenInfo.ticker} />

      <Center>
        {isPrimary && <PairedBalance primaryAmount={{tokenId: tokenInfo.id, quantity}} />}

        <Spacer height={22} />

        {!isPrimary && <MaxBalanceButton onPress={onMaxBalance} />}

        <Spacer height={22} />

        {notEnoughBalance && <BalanceError />}

        {isPrimary && cantKeepAssets && !notEnoughBalance && <CantKeepAssetsWarning />}
      </Center>

      <Actions>
        <ApplyButton onPress={() => onApply()} title={strings.apply.toLocaleUpperCase()} shelleyTheme />
      </Actions>
    </View>
  )
}

const BalanceError = ({style, ...props}: TextProps) => {
  const strings = useStrings()
  return (
    <Text style={[style, {color: COLORS.ERROR_TEXT_COLOR, textAlign: 'center'}]} {...props}>
      {strings.insuficientBalance}
    </Text>
  )
}

const CantKeepAssetsWarning = ({style, ...props}: TextProps) => {
  const strings = useStrings()
  return (
    <Text style={[style, {color: COLORS.TEXT_INPUT, textAlign: 'center'}]} {...props}>
      {strings.minPrimaryBalanceForTokens}
    </Text>
  )
}

const Center = ({style, ...props}: ViewProps) => <View style={[style, {alignItems: 'center'}]} {...props} />
const Actions = ({style, ...props}: ViewProps) => <View style={[style, {paddingVertical: 16}]} {...props} />

const MaxBalanceButton = ({onPress}: {onPress(): void}) => {
  const strings = useStrings()

  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={{fontFamily: 'Rubik-Medium', color: COLORS.SHELLEY_BLUE}}>{strings.max.toLocaleUpperCase()}</Text>
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
      accessible
      autoFocus
      selectionColor={COLORS.TRANSPARENT_BLACK}
      right={<Ticker ticker={ticker} />}
      style={{
        fontSize: 24,
        lineHeight: 32,
        borderWidth: 0,
        textAlign: 'right',
        backgroundColor: 'white',
      }}
      underlineColor="transparent"
    />
  )
}
const Ticker = ({ticker}: {ticker?: string}) => <Text style={{fontSize: 24, lineHeight: 32}}>{ticker}</Text>

const ApplyButton = Button
