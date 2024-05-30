import {toBigInt} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import {Balance, Portfolio} from '@yoroi/types'
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
import {useMutation} from 'react-query'

import {Button, CopyButton, Icon, Spacer, Text} from '../../../components'
import {AmountItem} from '../../../components/AmountItem/AmountItem'
import {ErrorPanel} from '../../../components/ErrorPanel/ErrorPanel'
import {SettingsStackRoutes, useUnsafeParams} from '../../../kernel/navigation'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {useCollateralInfo} from '../../../yoroi-wallets/cardano/utxoManager/useCollateralInfo'
import {useSetCollateralId} from '../../../yoroi-wallets/cardano/utxoManager/useSetCollateralId'
import {collateralConfig, utxosMaker} from '../../../yoroi-wallets/cardano/utxoManager/utxos'
import {useBalances} from '../../../yoroi-wallets/hooks'
import {RawUtxo, YoroiEntry} from '../../../yoroi-wallets/types'
import {Amounts, asQuantity, Quantities} from '../../../yoroi-wallets/utils'
import {useSelectedWallet} from '../../WalletManager/context/SelectedWalletContext'
import {usePrivacyMode} from '../PrivacyMode/PrivacyMode'
import {createCollateralEntry} from './helpers'
import {useNavigateTo} from './navigation'
import {useStrings} from './strings'

export const ManageCollateralScreen = () => {
  const {styles} = useStyles()
  const wallet = useSelectedWallet()
  const {amount, collateralId, utxo} = useCollateralInfo(wallet)
  const hasCollateral = collateralId !== '' && utxo !== undefined
  const didSpend = collateralId !== '' && utxo === undefined
  const navigateTo = useNavigateTo()
  const strings = useStrings()
  const balances = useBalances(wallet)
  const lockedAmount = asQuantity(wallet.primaryBreakdown.lockedAsStorageCost.toString())

  const params = useUnsafeParams<SettingsStackRoutes['manage-collateral']>()

  const {
    reset: resetSendState,
    receiverResolveChanged,
    amountChanged,
    tokenSelectedChanged,
    unsignedTxChanged: yoroiUnsignedTxChanged,
  } = useTransfer()
  const {mutate: createUnsignedTx, isLoading: isLoadingTx} = useMutation({
    mutationFn: (entries: YoroiEntry[]) => wallet.createUnsignedTx(entries),
    retry: false,
    useErrorBoundary: true,
  })

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
    const amount: Portfolio.Token.Amount = {
      quantity: toBigInt(collateralConfig.minLovelace, wallet.portfolioPrimaryTokenInfo.decimals),
      info: wallet.portfolioPrimaryTokenInfo,
    }

    // populate for confirmation screen
    resetSendState()
    receiverResolveChanged(address)
    tokenSelectedChanged(amount.info.id)
    amountChanged(amount)

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

    createUnsignedTx([createCollateralEntry(wallet)], {
      onSuccess: (yoroiUnsignedTx) => {
        yoroiUnsignedTxChanged(yoroiUnsignedTx)
        navigateTo.confirmTx()
      },
    })
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

  const shouldShowPrimaryButton = !hasCollateral || didSpend
  const shouldShowBackButton = !shouldShowPrimaryButton && !!params?.backButton

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

      {shouldShowPrimaryButton && (
        <Button
          title={strings.generateCollateral}
          onPress={handleGenerateCollateral}
          shelleyTheme
          disabled={isLoading}
        />
      )}

      {shouldShowBackButton && params?.backButton && (
        <Button title={params.backButton.content} onPress={params.backButton.onPress} shelleyTheme />
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
  const {styles} = useStyles()
  const {isPrivacyActive} = usePrivacyMode()

  const handleRemove = () => onRemove()

  return (
    <View style={styles.amountItem} testID="amountItem">
      <Left>
        <AmountItem amount={amount} wallet={wallet} isPrivacyActive={isPrivacyActive} />
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
  const {colors} = useStyles()

  return (
    <TouchableOpacity testID="removeAmountButton" {...props} disabled={disabled} style={{opacity: disabled ? 0.5 : 1}}>
      <Icon.CrossCircle size={26} color={colors.iconColor} />
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      backgroundColor: color.gray_cmin,
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
  const colors = {
    iconColor: color.gray_cmax,
  }

  return {styles, colors}
}
