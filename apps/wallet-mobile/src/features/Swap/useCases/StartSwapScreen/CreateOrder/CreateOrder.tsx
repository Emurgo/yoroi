import {usePoolsByPair, useSwap} from '@yoroi/swap'
import React, {useEffect} from 'react'
import {KeyboardAvoidingView, Platform, StyleSheet, View, ViewProps} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Button, Icon, Spacer} from '../../../../../components'
import {COLORS} from '../../../../../theme'
import {Quantities} from '../../../../../yoroi-wallets/utils'
import {ButtonGroup} from '../../../common/ButtonGroup/ButtonGroup'
import {useNavigateTo} from '../../../common/navigation'
import {useStrings} from '../../../common/strings'
import {EditBuyAmount} from './EditBuyAmount/EditBuyAmount'
import {EditMarketPrice} from './EditMarketPrice'
import {ShowPoolActions} from './EditPool/ShowPoolActions'
import {EditSellAmount} from './EditSellAmount/EditSellAmount'
import {EditSlippage} from './EditSlippage/EditSlippage'
import {ShowTokenActions} from './ShowTokenActions/ShowTokenActions'
import {useSwapTouched} from './TouchedContext'

export const CreateOrder = () => {
  const strings = useStrings()
  const navigation = useNavigateTo()
  const {orderTypeChanged, createOrder, selectedPoolChanged} = useSwap()
  const {isBuyTouched, isSellTouched} = useSwapTouched()
  const {poolList} = usePoolsByPair({
    tokenA: createOrder.amounts.sell.tokenId,
    tokenB: createOrder.amounts.buy.tokenId,
  })

  useEffect(() => {
    poolList !== undefined && selectedPoolChanged(poolList[0])
  }, [poolList, selectedPoolChanged])

  const orderTypeLabels = [strings.marketButton, strings.limitButton]
  const orderTypeIndex = createOrder.type === 'market' ? 0 : 1
  const handleSelectOrderType = (index: number) => {
    orderTypeChanged(index === 0 ? 'market' : 'limit')
  }
  const disabled =
    !isBuyTouched ||
    !isSellTouched ||
    Quantities.isZero(createOrder.amounts.buy.quantity) ||
    Quantities.isZero(createOrder.amounts.sell.quantity)

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={86}
      >
          <View style={styles.buttonsGroup}>
            <ButtonGroup labels={orderTypeLabels} onSelect={handleSelectOrderType} selected={orderTypeIndex} />

            <TouchableOpacity>
              <Icon.Refresh size={24} />
            </TouchableOpacity>
          </View>

          <EditSellAmount />

          <Spacer height={16} />

          <ShowTokenActions />

          <Spacer height={16} />

          <EditBuyAmount />

          <Spacer height={20} />

          <EditMarketPrice disabled={createOrder.type === 'market'} />

          <EditSlippage />

          <ShowPoolActions />

          <Actions>
            <Button
              testID="swapButton"
              shelleyTheme
              title={strings.swapTitle}
              onPress={navigation.confirmTx}
              disabled={disabled}
            />
          </Actions>
      </KeyboardAvoidingView>
    </View>
  )
}

const Actions = ({style, ...props}: ViewProps) => <View style={[styles.actions, style]} {...props} />

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  buttonsGroup: {
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
  },
  actions: {
    paddingVertical: 16,
  },
})
