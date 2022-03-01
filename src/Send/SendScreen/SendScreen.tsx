import {useNavigation} from '@react-navigation/native'
import {BigNumber} from 'bignumber.js'
import _ from 'lodash'
import React from 'react'
import {useIntl} from 'react-intl'
import {ActivityIndicator, Image, ScrollView, StyleSheet, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useSelector} from 'react-redux'

import {showErrorDialog} from '../../../legacy/actions'
import UtxoAutoRefresher from '../../../legacy/components/Send/UtxoAutoRefresher'
import {Button, Checkbox, StatusBar, Text, TextInput} from '../../../legacy/components/UiKit'
import {CONFIG, UI_V2} from '../../../legacy/config/config'
import {MultiToken} from '../../../legacy/crypto/MultiToken'
import type {CreateUnsignedTxResponse} from '../../../legacy/crypto/shelley/transactionUtils'
import {SystemAuthDisabled} from '../../../legacy/crypto/walletManager'
import {ensureKeysValidity} from '../../../legacy/helpers/deviceSettings'
import {errorMessages} from '../../../legacy/i18n/global-messages'
import {SEND_ROUTES, WALLET_ROOT_ROUTES} from '../../../legacy/RoutesList'
import {
  defaultNetworkAssetSelector,
  hasPendingOutgoingTransactionSelector,
  isFetchingUtxosSelector,
  isOnlineSelector,
  lastUtxosFetchErrorSelector,
  tokenBalanceSelector,
  utxosSelector,
  walletMetaSelector,
} from '../../../legacy/selectors'
import {COLORS} from '../../../legacy/styles/config'
import {formatTokenAmount, getAssetDenominationOrId, truncateWithEllipsis} from '../../../legacy/utils/format'
import {parseAmountDecimal} from '../../../legacy/utils/parsing'
import type {
  AddressValidationErrors,
  AmountValidationErrors,
  BalanceValidationErrors,
} from '../../../legacy/utils/validators'
import {Spacer} from '../../components'
import {useCloseWallet, useTokenInfo} from '../../hooks'
import {useSelectedWallet, useSetSelectedWallet, useSetSelectedWalletMeta} from '../../SelectedWallet'
import type {TokenEntry} from '../../types/cardano'
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
  const [unsignedTx, setUnsignedTx] = React.useState<CreateUnsignedTxResponse>(null)
  const [fee, setFee] = React.useState<MultiToken | null>(null)
  const [recomputing, setRecomputing] = React.useState(false)
  const [showSendAllWarning, setShowSendAllWarning] = React.useState(false)

  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: selectedTokenIdentifier})
  const setSelectedWallet = useSetSelectedWallet()
  const setSelectedWalletMeta = useSetSelectedWalletMeta()
  const {closeWallet} = useCloseWallet({
    onSuccess: () => {
      setSelectedWallet(undefined)
      setSelectedWalletMeta(undefined)
    },
  })
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

    const tokens: Array<TokenEntry> = await (async () => {
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

    if (wallet.isEasyConfirmationEnabled) {
      try {
        await ensureKeysValidity(wallet.id)
        navigation.navigate(SEND_ROUTES.BIOMETRICS_SIGNING, {
          keyId: wallet.id,
          onSuccess: async (decryptedKey) => {
            navigation.navigate(UI_V2 ? 'send-confirm' : SEND_ROUTES.CONFIRM, {
              availableAmount: tokenBalance.getDefault(),
              address,
              defaultAssetAmount,
              transactionData: unsignedTx,
              balanceAfterTx: balanceAfter,
              utxos,
              fee,
              tokens,
              easyConfirmDecryptKey: decryptedKey,
            })
          },
          onFail: () => navigation.goBack(),
        })
      } catch (err) {
        if (err instanceof SystemAuthDisabled) {
          await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
          navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)
          setTimeout(() => closeWallet(), 1000)
          return
        } else {
          throw err
        }
      }
      return
    }

    navigation.navigate(UI_V2 ? 'send-confirm' : SEND_ROUTES.CONFIRM, {
      availableAmount: tokenBalance.getDefault(),
      address,
      defaultAssetAmount,
      transactionData: unsignedTx,
      balanceAfterTx: balanceAfter,
      utxos,
      fee,
      tokens,
      easyConfirmDecryptKey: '',
    })
    return
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
            right={<Image source={require('../../../legacy/assets/img/arrow_down_fill.png')} />}
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
            <ActivityIndicator size="large" />
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
