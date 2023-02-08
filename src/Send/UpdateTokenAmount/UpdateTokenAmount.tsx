import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Text, TextProps, TouchableOpacity, View, ViewProps} from 'react-native'

import {Spacer, TextInput} from '../../components'
import {AssetItem} from '../../components/AssetItem'
import globalMessages from '../../i18n/global-messages'
import {COLORS} from '../../theme'
import {PairedBalance} from '../../TxHistory/PairedBalance'
import {Quantity, TokenInfo} from '../../yoroi-wallets/types'
import {Quantities} from '../../yoroi-wallets/utils'
import {editedFormatter, pastedFormatter} from '../../yoroi-wallets/utils/amountUtils'

type Props = {
  tokenInfo: TokenInfo
  balance: Quantity

  notEnoughBalance?: boolean
  cantKeepAssets?: boolean

  quantity: Quantity
  onChange(quantity: Quantity): void
}
export const UpdateTokenAmount = ({
  //
  tokenInfo,
  balance,
  quantity,
  onChange,
  notEnoughBalance,
  cantKeepAssets,
}: Props) => {
  const [value, seValue] = React.useState<string>(Quantities.denominated(quantity, tokenInfo.decimals))

  const onChangeAmount = (text: string) => {
    seValue(text)
    onChange(Quantities.atomic(text, tokenInfo.decimals))
  }
  const onPressMaxBalance = () => onChange(Quantities.denominated(balance, tokenInfo.decimals))

  return (
    <View style={{padding: 16, flex: 1}}>
      <AssetItem balance={balance} tokenInfo={tokenInfo} />

      <Spacer height={40} />

      <AmountInput onChange={onChangeAmount} value={value} ticker={tokenInfo.ticker} />

      <Center>
        <PairedBalance primaryAmount={{tokenId: tokenInfo.id, quantity}} />

        <Spacer height={22} />

        <MaxBalanceLink onPress={onPressMaxBalance} />

        <Spacer height={22} />

        {notEnoughBalance && <BalanceError />}

        {cantKeepAssets && !notEnoughBalance && <CantKeepAssetsWarning />}
      </Center>
    </View>
  )
}

const BalanceError = ({style, ...props}: TextProps) => {
  const strings = useStrings()
  return (
    <Text style={[style, {color: COLORS.ERROR_TEXT_COLOR, textAlign: 'center'}]} {...props}>
      {strings.insufficientBalance}
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

const MaxBalanceLink = ({onPress}: {onPress(): void}) => {
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
      style={{fontSize: 24, lineHeight: 32, borderWidth: 0, textAlign: 'right'}}
    />
  )
}
const Ticker = ({ticker}: {ticker?: string}) => <Text style={{fontSize: 24, lineHeight: 32}}>{ticker}</Text>

const messages = defineMessages({
  insufficientBalance: {
    id: 'global.error.insufficientBalance',
    defaultMessage: '!!!Insufficient balance',
  },
  minPrimaryBalanceForTokens: {
    id: 'global.info.minPrimaryBalanceForTokens',
    defaultMessage: '!!!Keep some balance for tokens',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    max: intl.formatMessage(globalMessages.max),
    insufficientBalance: intl.formatMessage(messages.insufficientBalance),
    minPrimaryBalanceForTokens: intl.formatMessage(messages.minPrimaryBalanceForTokens),
  }
}
