import {useSwap} from '@yoroi/swap'
import React from 'react'
import {KeyboardAvoidingView, Platform, StyleSheet, View, ViewProps} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Button, Icon, Spacer} from '../../../../../components'
import {COLORS} from '../../../../../theme'
import {ButtonGroup} from '../../../common/ButtonGroup/ButtonGroup'
import {MarketPrice} from '../../../common/MarketPriceCard'
import {useNavigateTo} from '../../../common/navigation'
import {ChoosePoolSection} from '../../../common/SelectPool'
import {SlippageTolerance} from '../../../common/SlippageTolerance'
import {useStrings} from '../../../common/strings'
import {AddTokenFromCard} from './AddTokenFromCard'
import {AddTokenToCard} from './AddTokenToCard'
import {SwitchAndClear} from './SwitchAndClear'

export const CreateOrder = () => {
  const strings = useStrings()
  const navigation = useNavigateTo()
  const {orderTypeChanged, createOrder} = useSwap()
  const orderTypes = [strings.marketButton, strings.limitButton]

  const handlePressOrderType = (index: number) => {
    orderTypeChanged(index === 0 ? 'market' : 'limit')
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={86}
      >
        <View style={styles.buttonsGroup}>
          {/* TODO: add the initial state / index initial */}
          <ButtonGroup buttons={orderTypes} onPress={handlePressOrderType} />

          <TouchableOpacity>
            <Icon.Refresh size={24} />
          </TouchableOpacity>
        </View>

        <AddTokenFromCard />

        <Spacer height={16} />

        <SwitchAndClear />

        <Spacer height={16} />

        <AddTokenToCard />

        <Spacer height={20} />

        <MarketPrice disabled={createOrder.type === 'market'} />

        <SlippageTolerance />

        <ChoosePoolSection />

        <Actions>
          <Button
            testID="swapButton"
            shelleyTheme
            title={strings.swapTitle}
            onPress={() => navigation.confirmationOrder()}
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
