import {useSwap} from '@yoroi/swap'
import React from 'react'
import {KeyboardAvoidingView, Platform, StyleSheet, View, ViewProps} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Button, Icon, Spacer} from '../../../../../components'
import {COLORS} from '../../../../../theme'
import {ButtonGroup} from '../../../common/ButtonGroup/ButtonGroup'
import {useNavigateTo} from '../../../common/navigation'
import {useStrings} from '../../../common/strings'
import {ChoosePoolSection} from './ChoosePoolSection'
import {EditBuyAmount} from './EditBuyAmount'
import {EditSellAmount} from './EditSellAmount'
import {MarketPrice} from './MarketPrice'
import {SlippageTolerance} from './SlippageTolerance'
import {SwitchAndClear} from './SwitchAndClear'

export const CreateOrder = () => {
  const strings = useStrings()
  const navigation = useNavigateTo()
  const {orderTypeChanged, createOrder} = useSwap()

  const [inputSellValue, setInputSellValue] = React.useState<string>('')
  const [inputBuyValue, setInputBuyValue] = React.useState<string>('')

  const orderTypeLabels = [strings.marketButton, strings.limitButton]
  const orderTypeIndex = createOrder.type === 'market' ? 0 : 1
  const handleSelectOrderType = (index: number) => {
    orderTypeChanged(index === 0 ? 'market' : 'limit')
  }

  const clearFormInputs = () => {
    setInputSellValue('0')
    setInputBuyValue('0')
  }

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

        <EditSellAmount inputValue={inputSellValue} setInputValue={setInputSellValue} />

        <Spacer height={16} />

        <SwitchAndClear onClear={clearFormInputs} />

        <Spacer height={16} />

        <EditBuyAmount inputValue={inputBuyValue} setInputValue={setInputBuyValue} />

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
