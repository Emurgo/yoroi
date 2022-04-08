import {useNavigation} from '@react-navigation/native'
import {BigNumber} from 'bignumber.js'
import _ from 'lodash'
import React from 'react'
import {useIntl} from 'react-intl'
import {ActivityIndicator, Image, ScrollView, StyleSheet, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useSelector} from 'react-redux'

import {Button, Checkbox, Spacer, StatusBar, Text, TextInput} from '../../components'
import {useTokenInfo} from '../../hooks'
import {CONFIG, UI_V2} from '../../legacy/config'
import {formatTokenAmount, getAssetDenominationOrId, truncateWithEllipsis} from '../../legacy/format'
import {SEND_ROUTES} from '../../legacy/RoutesList'
import {
  defaultNetworkAssetSelector,
  hasPendingOutgoingTransactionSelector,
  isFetchingUtxosSelector,
  isOnlineSelector,
  lastUtxosFetchErrorSelector,
  tokenBalanceSelector,
  utxosSelector,
  walletMetaSelector,
} from '../../legacy/selectors'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {UtxoAutoRefresher} from '../../UtxoAutoRefresher'
import type {CreateUnsignedTxResponse} from '../../yoroi-wallets/cardano/shelley/transactionUtils'
import {parseAmountDecimal} from '../../yoroi-wallets/utils/parsing'
import type {
  AddressValidationErrors,
  AmountValidationErrors,
  BalanceValidationErrors,
} from '../../yoroi-wallets/utils/validators'
import {AmountField} from './../AmountField'
import {AvailableAmountBanner} from './AvailableAmountBanner'
import {BalanceAfterTransaction} from './BalanceAfterTransaction'
import {ErrorBanners} from './ErrorBanners'
import {Fee} from './Fee'
import {SendAllWarning} from './SendAllWarning'
import {useStrings} from './strings'
import {getAddressErrorText, getAmountErrorText, hasDomainErrors, isDomain, recomputeAll} from './utils'

type Props = {
  selectedTokenIdentifier: string
  sendAll: boolean
  onSendAll: (sendAll: boolean) => void
}

export const SendScreen = ({selectedTokenIdentifier, sendAll, onSendAll}: Props) => {
  const intl = useIntl()
  const strings = useStrings()
  const navigation = useNavigation()

  const tokenBalance = useSelector(tokenBalanceSelector)
  const isFetchingBalance = useSelector(isFetchingUtxosSelector)
  const lastFetchingError = useSelector(lastUtxosFetchErrorSelector)
  const defaultAsset = useSelector(defaultNetworkAssetSelector)
  const utxos = useSelector(utxosSelector)
  const hasPendingOutgoingTransaction = useSelector(hasPendingOutgoingTransactionSelector)
  const isOnline = useSelector(isOnlineSelector)
  const walletMetadata = useSelector(walletMetaSelector)
  const selectedAsset = tokenBalance.values.find(({identifier}) => identifier === selectedTokenIdentifier)

  if (!selectedAsset) {
    throw new Error('Invalid token')
  }

  const [address, setAddress] = React.useState('')
  const [addressInput, setAddressInput] = React.useState('')
  const [addressErrors, setAddressErrors] = React.useState<AddressValidationErrors>({addressIsRequired: true})
  const [amount, setAmount] = React.useState('')
  const [amountErrors, setAmountErrors] = React.useState<AmountValidationErrors>({amountIsRequired: true})
  const [balanceErrors, setBalanceErrors] = React.useState<BalanceValidationErrors>({})
  const [balanceAfter, setBalanceAfter] = React.useState<BigNumber | null>(null)
  const [unsignedTx, setUnsignedTx] = React.useState<null | CreateUnsignedTxResponse>(null)
  const [fee, setFee] = React.useState<BigNumber | null>(null)
  const [recomputing, setRecomputing] = React.useState(false)
  const [showSendAllWarning, setShowSendAllWarning] = React.useState(false)

  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: selectedTokenIdentifier})
  const assetDenomination = truncateWithEllipsis(getAssetDenominationOrId(tokenInfo), 20)
  const amountErrorText = getAmountErrorText(intl, amountErrors, balanceErrors, defaultAsset)
  const isValid =
    isOnline &&
    !hasPendingOutgoingTransaction &&
    !isFetchingBalance &&
    !lastFetchingError &&
    utxos &&
    _.isEmpty(addressErrors) &&
    _.isEmpty(amountErrors) &&
    _.isEmpty(balanceErrors)

  React.useEffect(() => {
    if (CONFIG.DEBUG.PREFILL_FORMS) {
      if (!__DEV__) throw new Error('using debug data in non-dev env')
      setAddressInput(CONFIG.DEBUG.SEND_ADDRESS)
      setAmount(CONFIG.DEBUG.SEND_AMOUNT)
    }
    navigation.setParams({onScanAddress: setAddressInput})
    navigation.setParams({onScanAmount: setAmount})
  }, [navigation])

  const promiseRef = React.useRef<undefined | Promise<unknown>>()
  React.useEffect(() => {
    setFee(null)
    setBalanceAfter(null)
    setRecomputing(true)

    const promise = recomputeAll({
      utxos,
      addressInput,
      amount,
      sendAll,
      defaultAsset,
      selectedTokenInfo: tokenInfo,
      tokenBalance,
      walletMetadata,
    })

    promiseRef.current = promise

    promise.then((newState) => {
      if (promise !== promiseRef.current) return // abort if newer promise

      setAddress(newState.address)
      setAddressErrors(newState.addressErrors)
      setAmount(newState.amount)
      setAmountErrors(newState.amountErrors)
      setBalanceErrors(newState.balanceErrors)
      setFee(newState.fee)
      setBalanceAfter(newState.balanceAfter)
      setUnsignedTx(newState.unsignedTx)
      setRecomputing(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressInput, amount, selectedTokenIdentifier, sendAll])

  const onConfirm = () => {
    if (sendAll) {
      setShowSendAllWarning(true)
      return
    }
    handleConfirm()
  }

  const handleConfirm = async () => {
    if (!isValid || recomputing || !unsignedTx) return

    const defaultAssetAmount = tokenInfo.isDefault
      ? parseAmountDecimal(amount, tokenInfo)
      : // note: inside this if balanceAfter shouldn't be null
        tokenBalance.getDefault().minus(balanceAfter ?? 0)

    const tokens = await (async () => {
      if (tokenInfo.isDefault) {
        return sendAll ? (await unsignedTx.totalOutput()).nonDefaultEntries() : []
      }

      if (!tokenInfo.isDefault) {
        return [
          {
            identifier: tokenInfo.identifier,
            networkId: tokenInfo.networkId,
            amount: parseAmountDecimal(amount, tokenInfo),
          },
        ]
      }
    })()

    setShowSendAllWarning(false)

    navigation.navigate(UI_V2 ? 'send-confirm' : SEND_ROUTES.CONFIRM, {
      availableAmount: tokenBalance.getDefault(),
      address,
      defaultAssetAmount,
      transactionData: unsignedTx,
      balanceAfterTx: balanceAfter,
      utxos,
      fee,
      tokens,
    })
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
      <StatusBar type="dark" />

      <UtxoAutoRefresher />
      <ErrorBanners />
      <AvailableAmountBanner />

      <ScrollView style={styles.content} keyboardDismissMode="on-drag">
        <BalanceAfterTransaction balanceAfter={balanceAfter} />
        <Fee fee={fee} />

        <Spacer height={16} />

        <TextInput
          value={addressInput || ''}
          multiline
          errorOnMount
          onChangeText={setAddressInput}
          label={strings.addressInputLabel}
          errorText={getAddressErrorText(intl, addressErrors)}
        />

        {!recomputing &&
          isDomain(addressInput) &&
          !hasDomainErrors(addressErrors) &&
          !addressInput.includes(address) /* HACK */ && (
            <Text ellipsizeMode="middle" numberOfLines={1}>
              {`Resolves to: ${address}`}
            </Text>
          )}

        <AmountField amount={amount} setAmount={setAmount} error={amountErrorText} editable={!sendAll} />

        <TouchableOpacity onPress={() => navigation.navigate('select-asset')}>
          <TextInput
            right={<Image source={require('../../assets/img/arrow_down_fill.png')} />}
            editable={false}
            label={strings.asset}
            value={`${assetDenomination}: ${formatTokenAmount(
              tokenBalance.get(selectedTokenIdentifier) || new BigNumber('0'),
              tokenInfo,
              15,
            )}`}
          />
        </TouchableOpacity>

        <Checkbox
          checked={sendAll}
          onChange={onSendAll}
          text={
            tokenInfo.isDefault ? strings.checkboxSendAllAssets : strings.checkboxSendAll({assetId: assetDenomination})
          }
        />

        {recomputing && (
          <View style={styles.indicator}>
            <ActivityIndicator size="large" color={'black'} />
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <Button onPress={onConfirm} title={strings.continueButton} disabled={!isValid || fee == null} />
      </View>

      <SendAllWarning
        showSendAllWarning={showSendAllWarning}
        onCancel={() => setShowSendAllWarning(false)}
        selectedTokenIdentifier={selectedTokenIdentifier}
        onConfirm={handleConfirm}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  content: {
    padding: 16,
  },
  actions: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  indicator: {
    marginTop: 26,
  },
})
