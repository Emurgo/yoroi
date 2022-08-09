import {useNetInfo} from '@react-native-community/netinfo'
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
import {useBalances, useTokenInfo} from '../../hooks'
import {CONFIG, getDefaultAssetByNetworkId} from '../../legacy/config'
import {formatTokenAmount, getAssetDenominationOrId, truncateWithEllipsis} from '../../legacy/format'
import {
  hasPendingOutgoingTransactionSelector,
  isFetchingUtxosSelector,
  lastUtxosFetchErrorSelector,
  utxosSelector,
} from '../../legacy/selectors'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {UtxoAutoRefresher} from '../../UtxoAutoRefresher'
import {YoroiAmounts, YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {parseAmountDecimal} from '../../yoroi-wallets/utils/parsing'
import type {
  AddressValidationErrors,
  AmountValidationErrors,
  BalanceValidationErrors,
} from '../../yoroi-wallets/utils/validators'
import {useSendContext} from '../Context/SendContext'
import {AmountField} from './../AmountField'
import {AvailableAmountBanner} from './AvailableAmountBanner'
import {BalanceAfterTransaction} from './BalanceAfterTransaction'
import {ErrorBanners} from './ErrorBanners'
import {Fee} from './Fee'
import {SendAllWarning} from './SendAllWarning'
import {useStrings} from './strings'
import {getAddressErrorText, getAmountErrorText, hasDomainErrors, isDomain, recomputeAll} from './utils'

export const SendScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
  const navigation = useNavigation()
  const wallet = useSelectedWallet()
  const isFetchingBalance = useSelector(isFetchingUtxosSelector)
  const lastFetchingError = useSelector(lastUtxosFetchErrorSelector)
  const defaultAsset = getDefaultAssetByNetworkId(wallet.networkId)
  const balance = useBalances(wallet, defaultAsset.identifier)
  const utxos = useSelector(utxosSelector)
  const hasPendingOutgoingTransaction = useSelector(hasPendingOutgoingTransactionSelector)
  const netInfo = useNetInfo()
  const isOnline = netInfo.type !== 'none' && netInfo.type !== 'unknown'

  const {selectedTokenIdentifier, sendAll, setSendAll, receivers, amount, addReceiver, setAmount} = useSendContext()

  const defaultAssetAvailableAmount = new BigNumber(balance[defaultAsset.identifier] || '0')
  const selectedAssetAvailableAmount = new BigNumber(balance[selectedTokenIdentifier] || '0')

  const [address, setAddress] = React.useState('')
  const [addressErrors, setAddressErrors] = React.useState<AddressValidationErrors>({addressIsRequired: true})
  const [amountErrors, setAmountErrors] = React.useState<AmountValidationErrors>({amountIsRequired: true})
  const [balanceErrors, setBalanceErrors] = React.useState<BalanceValidationErrors>({})
  const [balanceAfter, setBalanceAfter] = React.useState<BigNumber | null>(null)
  const [yoroiUnsignedTx, setYoroiUnsignedTx] = React.useState<null | YoroiUnsignedTx>(null)
  const [fee, setFee] = React.useState<BigNumber | null>(null)
  const [recomputing, setRecomputing] = React.useState(false)
  const [showSendAllWarning, setShowSendAllWarning] = React.useState(false)

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
      addReceiver(CONFIG.DEBUG.SEND_ADDRESS)
      setAmount(CONFIG.DEBUG.SEND_AMOUNT)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const promiseRef = React.useRef<undefined | Promise<unknown>>()
  React.useEffect(() => {
    setFee(null)
    setBalanceAfter(null)
    setRecomputing(true)

    const promise = recomputeAll({
      wallet,
      utxos,
      addressInput: receivers[0],
      amount,
      sendAll,
      defaultAsset,
      selectedTokenInfo: tokenInfo,
      defaultAssetAvailableAmount,
      selectedAssetAvailableAmount,
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
      setYoroiUnsignedTx(newState.yoroiUnsignedTx)
      setRecomputing(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receivers, amount, selectedTokenIdentifier, sendAll])

  const onConfirm = () => {
    if (sendAll) {
      setShowSendAllWarning(true)
      return
    }
    handleConfirm()
  }

  const handleConfirm = async () => {
    if (!isValid || recomputing || !yoroiUnsignedTx) return

    const defaultAssetAmount = tokenInfo.isDefault
      ? parseAmountDecimal(amount, tokenInfo)
      : // note: inside this if balanceAfter shouldn't be null
        defaultAssetAvailableAmount.minus(balanceAfter ?? 0)

    const tokens: YoroiAmounts = tokenInfo.isDefault
      ? sendAll
        ? Object.fromEntries(Object.entries(balance).filter((entry) => entry[0] !== defaultAsset.identifier))
        : {}
      : {
          [selectedTokenIdentifier]: balance[selectedTokenIdentifier],
        }

    setShowSendAllWarning(false)

    navigation.navigate('app-root', {
      screen: 'main-wallet-routes',
      params: {
        screen: 'history',
        params: {
          screen: 'send-confirm',
          params: {
            availableAmount: defaultAssetAvailableAmount,
            address,
            defaultAssetAmount,
            yoroiUnsignedTx,
            balanceAfterTx: balanceAfter,
            utxos,
            fee,
            tokens,
          },
        },
      },
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
          value={receivers[0]}
          multiline
          errorOnMount
          onChangeText={addReceiver}
          label={strings.addressInputLabel}
          errorText={getAddressErrorText(intl, addressErrors)}
          autoComplete={false}
        />

        {!recomputing &&
          isDomain(receivers[0]) &&
          !hasDomainErrors(addressErrors) &&
          !receivers[0].includes(address) /* HACK */ && (
            <Text ellipsizeMode="middle" numberOfLines={1}>
              {`Resolves to: ${address}`}
            </Text>
          )}

        <AmountField amount={amount} setAmount={setAmount} error={amountErrorText} editable={!sendAll} />

        <TouchableOpacity
          onPress={() => {
            navigation.navigate('app-root', {
              screen: 'main-wallet-routes',
              params: {
                screen: 'history',
                params: {
                  screen: 'select-asset',
                },
              },
            })
          }}
        >
          <TextInput
            right={<Image source={require('../../assets/img/arrow_down_fill.png')} />}
            editable={false}
            label={strings.asset}
            value={`${assetDenomination}: ${formatTokenAmount(selectedAssetAvailableAmount, tokenInfo, 15)}`}
            autoComplete={false}
          />
        </TouchableOpacity>

        <Checkbox
          checked={sendAll}
          onChange={setSendAll}
          text={
            tokenInfo.isDefault ? strings.checkboxSendAllAssets : strings.checkboxSendAll({assetId: assetDenomination})
          }
        />

        {recomputing && (
          <View style={styles.indicator}>
            <ActivityIndicator size="large" color="black" />
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
