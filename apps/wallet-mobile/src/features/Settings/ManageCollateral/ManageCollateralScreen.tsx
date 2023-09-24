import {Balance} from '@yoroi/types'
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

import {Button, CopyButton, Icon, Spacer, Text} from '../../../components'
import {AmountItem} from '../../../components/AmountItem/AmountItem'
import {ErrorPanel} from '../../../components/ErrorPanel/ErrorPanel'
import {useSelectedWallet} from '../../../SelectedWallet'
import {COLORS} from '../../../theme'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {useCollateralInfo} from '../../../yoroi-wallets/cardano/utxoManager/useCollateralInfo'
import {useSetCollateralId} from '../../../yoroi-wallets/cardano/utxoManager/useSetCollateralId'
import {utxosMaker} from '../../../yoroi-wallets/cardano/utxoManager/utxos'
import {RawUtxo} from '../../../yoroi-wallets/types'
import {usePrivacyMode} from '../PrivacyMode/PrivacyMode'

export const ManageCollateralScreen = () => {
  const wallet = useSelectedWallet()
  const {amount, collateralId, utxo} = useCollateralInfo(wallet)
  const hasCollateral = collateralId !== '' && utxo !== undefined
  const didSpend = collateralId !== '' && utxo === undefined

  const {isLoading, setCollateralId} = useSetCollateralId(wallet)
  const handleRemoveCollateral = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setCollateralId('')
  }
  const handleSetCollateralId = (collateralId: RawUtxo['utxo_id']) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setCollateralId(collateralId)
  }

  const handleAutoDrawnCollateral = () => {
    const utxos = utxosMaker(wallet.utxos)
    const possibleCollateralId = utxos.drawnCollateral()

    if (possibleCollateralId !== undefined) {
      Alert.alert(
        '@t Collateral Found',
        '@t We found a collateral that can be used, do you want confirm?',
        [
          {text: '@t OK', onPress: () => handleSetCollateralId(possibleCollateralId)},
          {text: '@t Cancel', onPress: () => true},
        ],
        {cancelable: true, onDismiss: () => true},
      )
    } else {
      Alert.alert(
        '@t No Collateral Found',
        '@t We could not find a collateral that can be used, please use the create collateral transaction.',
        [{text: '@t OK', onPress: () => true}],
        {cancelable: true, onDismiss: () => true},
      )
    }
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ScrollView>
        <Text style={{flex: 1, alignSelf: 'center'}}>@t Locked as collateral</Text>

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

            <Text>@t If you want to return the amount locked as collateral to your balance press the remove icon.</Text>
          </>
        )}

        {didSpend && (
          <ErrorPanel>
            <Text>@t Your collateral is gone, please try auto assigning, or create one by creating a transaction.</Text>
          </ErrorPanel>
        )}
      </ScrollView>

      <Button title="@ Create collateral transaction" onPress={() => true} outlineShelley disabled={isLoading} />

      <Spacer height={8} />

      <Button title="@ Auto assign collateral" onPress={handleAutoDrawnCollateral} shelleyTheme disabled={isLoading} />
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
})
