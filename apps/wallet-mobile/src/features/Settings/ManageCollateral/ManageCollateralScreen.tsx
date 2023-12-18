import {Balance} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {
  Alert,
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useQuery, UseQueryOptions} from 'react-query'

import {Button, CopyButton, Icon, Spacer, Text} from '../../../components'
import {AmountItem} from '../../../components/AmountItem/AmountItem'
import {ErrorPanel} from '../../../components/ErrorPanel/ErrorPanel'
import {useSelectedWallet} from '../../../SelectedWallet'
import {COLORS} from '../../../theme'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {useCollateralInfo} from '../../../yoroi-wallets/cardano/utxoManager/useCollateralInfo'
import {useSetCollateralId} from '../../../yoroi-wallets/cardano/utxoManager/useSetCollateralId'
import {collateralConfig, utxosMaker} from '../../../yoroi-wallets/cardano/utxoManager/utxos'
import {useBalances, useLockedAmount} from '../../../yoroi-wallets/hooks'
import {RawUtxo, YoroiEntry, YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {Amounts, Quantities} from '../../../yoroi-wallets/utils'
import {useSend} from '../../Send/common/SendContext'
import {usePrivacyMode} from '../PrivacyMode/PrivacyMode'
import {useNavigateTo} from './navigation'
import {useStrings} from './strings'

export const ManageCollateralScreen = () => {
  const wallet = useSelectedWallet()
  const {amount, collateralId, utxo} = useCollateralInfo(wallet)
  const hasCollateral = collateralId !== '' && utxo !== undefined
  const didSpend = collateralId !== '' && utxo === undefined
  const navigateTo = useNavigateTo()
  const strings = useStrings()
  const balances = useBalances(wallet)
  const lockedAmount = useLockedAmount({wallet})

  const {
    reset: resetSendState,
    receiverResolveChanged,
    amountChanged,
    tokenSelectedChanged,
    yoroiUnsignedTxChanged,
  } = useSend()
  const {refetch: createUnsignedTx, isFetching: isLoadingTx} = useSendTx(
    {
      wallet,
      entry: {
        address: wallet.externalAddresses[0],
        amounts: {
          [wallet.primaryTokenInfo.id]: collateralConfig.minLovelace,
        },
      },
    },
    {
      onSuccess: (yoroiUnsignedTx) => yoroiUnsignedTxChanged(yoroiUnsignedTx),
    },
  )

  const {isLoading: isLoadingCollateral, setCollateralId} = useSetCollateralId(wallet)
  const handleRemoveCollateral = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setCollateralId('')
  }
  const handleSetCollateralId = (collateralId: RawUtxo['utxo_id']) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setCollateralId(collateralId)
  }
  const createCollateralTransaction = () => {
    const address = wallet.externalAddresses[0]
    const amount: Balance.Amount = {
      quantity: collateralConfig.minLovelace,
      tokenId: wallet.primaryTokenInfo.id,
    }

    // populate for confirmation screen
    resetSendState()
    receiverResolveChanged(address)
    tokenSelectedChanged(amount.tokenId)
    amountChanged(amount.quantity)

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    Promise.resolve(createUnsignedTx()).then(() => navigateTo.confirmTx())
  }

  const isLoading = isLoadingTx || isLoadingCollateral

  const handleGenerateCollateral = () => {
    const utxos = utxosMaker(wallet.utxos)
    const possibleCollateralId = utxos.drawnCollateral()

    if (possibleCollateralId !== undefined) {
      handleSetCollateralId(possibleCollateralId)
      return
    }

    const primaryTokenBalance = new BigNumber(Amounts.getAmount(balances, wallet.primaryToken.identifier).quantity)
    const lockedBalance = Quantities.isZero(lockedAmount) ? new BigNumber(0) : new BigNumber(lockedAmount)

    if (primaryTokenBalance.minus(lockedBalance).isLessThan(collateralConfig.minLovelace)) {
      Alert.alert(
        strings.notEnoughFundsAlertTitle,
        strings.notEnoughFundsAlertMessage,
        [{text: strings.notEnoughFundsAlertOK, onPress: () => true}],
        {cancelable: false},
      )
      return
    }

    createCollateralTransaction()
  }

  const shouldHideButton = !hasCollateral || didSpend

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ScrollView>
        <Text style={styles.heading}>{strings.lockedAsCollateral}</Text>

        <Spacer height={8} />

        <ActionableAmount
          amount={amount}
          wallet={wallet}
          onRemove={handleRemoveCollateral}
          collateralId={collateralId}
          disabled={isLoading}
        />

        <Spacer height={16} />

        {hasCollateral && (
          <>
            <Row>
              <Text ellipsizeMode="middle" numberOfLines={1} monospace small style={{flex: 1}} secondary>
                {collateralId}
              </Text>

              <CopyButton value={collateralId} />
            </Row>

            <Spacer height={16} />

            <Text>{strings.removeCollateral}</Text>
          </>
        )}

        {didSpend && (
          <ErrorPanel>
            <Text>{strings.collateralSpent}</Text>
          </ErrorPanel>
        )}
      </ScrollView>

      {shouldHideButton && (
        <Button
          title={strings.generateCollateral}
          onPress={handleGenerateCollateral}
          shelleyTheme
          disabled={isLoading}
        />
      )}
    </SafeAreaView>
  )
}

type ActionableAmountProps = {
  collateralId: RawUtxo['utxo_id']
  wallet: YoroiWallet
  amount: Balance.Amount
  onRemove(): void
  disabled?: boolean
}
const ActionableAmount = ({amount, onRemove, wallet, collateralId, disabled}: ActionableAmountProps) => {
  const {isPrivacyOff} = usePrivacyMode()

  const handleRemove = () => onRemove()

  return (
    <View style={styles.amountItem} testID="amountItem">
      <Left>
        <AmountItem amount={amount} wallet={wallet} isPrivacyOff={isPrivacyOff} />
      </Left>

      {collateralId !== '' && (
        <Right>
          <RemoveAmountButton onPress={handleRemove} disabled={disabled} />
        </Right>
      )}
    </View>
  )
}

const Left = ({style, ...props}: ViewProps) => <View style={[style, {flex: 1}]} {...props} />
const Right = ({style, ...props}: ViewProps) => <View style={[style, {paddingLeft: 16}]} {...props} />
const Row = ({style, ...props}: ViewProps) => (
  <View style={[style, {flexDirection: 'row', alignItems: 'center'}]} {...props} />
)

export const RemoveAmountButton = ({disabled, ...props}: TouchableOpacityProps) => {
  return (
    <TouchableOpacity testID="removeAmountButton" {...props} disabled={disabled} style={{opacity: disabled ? 0.5 : 1}}>
      <Icon.CrossCircle size={26} color={COLORS.BLACK} />
    </TouchableOpacity>
  )
}

export const useSendTx = (
  {wallet, entry}: {wallet: YoroiWallet; entry: YoroiEntry},
  options?: UseQueryOptions<YoroiUnsignedTx, Error, YoroiUnsignedTx, [string, 'send-tx']>,
) => {
  const query = useQuery({
    ...options,
    cacheTime: 0,
    suspense: true,
    enabled: false,
    retry: false,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    queryKey: [wallet.id, 'send-tx'],
    queryFn: () => wallet.createUnsignedTx([entry]),
  })

  return {
    ...query,
    unsignedTx: query.data,
  }
}

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: '#fff',
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  amountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    flex: 1,
    alignSelf: 'center',
  },
})
