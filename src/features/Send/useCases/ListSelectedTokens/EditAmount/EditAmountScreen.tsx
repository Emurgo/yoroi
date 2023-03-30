import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'

import {Button, Spacer, TextInput} from '../../../../../components'
import {AssetItem} from '../../../../../components/AssetItem'
import {TxHistoryRouteNavigation} from '../../../../../navigation'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {PairedBalance} from '../../../../../TxHistory/PairedBalance'
import {useTokenInfo} from '../../../../../yoroi-wallets/hooks'
import {Logger} from '../../../../../yoroi-wallets/logging'
import {Quantity} from '../../../../../yoroi-wallets/types'
import {asQuantity, Quantities} from '../../../../../yoroi-wallets/utils'
import {editedFormatter, pastedFormatter} from '../../../../../yoroi-wallets/utils/amountUtils'
import {useTokenQuantities} from '../../../common/hooks'
import {useSend} from '../../../common/SendContext'
import {useStrings} from '../../../common/strings'
import {NoBalance} from './ShowError/NoBalance'
import {UnableToSpend} from './ShowError/UnableToSpend'

export const EditAmountScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const {selectedTokenId, amountChanged} = useSend()
  const {available, spendable, initialQuantity} = useTokenQuantities(selectedTokenId)

  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: selectedTokenId})
  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id

  const [quantity, setQuantity] = React.useState<Quantity>(initialQuantity)
  const [inputQuantity, setInputQuantity] = React.useState<Quantity>(
    Quantities.denominated(initialQuantity, tokenInfo.decimals),
  )

  const hasBalance = !Quantities.isGreaterThan(quantity, available)
  const isUnableToSpend = isPrimary && Quantities.isGreaterThan(quantity, spendable)
  const isZero = Quantities.isZero(quantity)

  const onChangeQuantity = (text: string) => {
    try {
      const quantity = asQuantity(text)
      setInputQuantity(quantity)
      setQuantity(Quantities.integer(quantity, tokenInfo.decimals))
    } catch (error) {
      Logger.error('EditAmountScreen::onChangeQuantity', error)
    }
  }
  const onMaxBalance = () => {
    setInputQuantity(Quantities.denominated(spendable, tokenInfo.decimals))
    setQuantity(spendable)
  }
  const onApply = (quantity: Quantity) => {
    amountChanged(Quantities.integer(quantity, tokenInfo.decimals))
    navigation.navigate('send-list-selected-tokens')
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={86}
      >
        <ScrollView style={styles.scrollView} bounces={false}>
          <Spacer height={16} />

          <AssetItem amount={{quantity: available, tokenId: tokenInfo.id}} wallet={wallet} />

          <Spacer height={40} />

          <AmountInput onChange={onChangeQuantity} value={inputQuantity} ticker={tokenInfo.ticker} />

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
            onPress={() => onApply(inputQuantity)}
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
const AmountInput = ({value, onChange, ticker}: AmountInputProps) => {
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
