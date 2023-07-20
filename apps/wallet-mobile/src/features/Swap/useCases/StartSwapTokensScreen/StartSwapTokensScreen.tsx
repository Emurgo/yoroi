import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {GestureResponderEvent, KeyboardAvoidingView, Platform, StyleSheet, View, ViewProps} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Button, Icon, Spacer} from '../../../../components'
import {COLORS} from '../../../../theme'
import ButtonGroup from '../../common/ButtonGroup/ButtonGroup'
import {MarketPrice} from '../../common/MarketPriceCard'
import {ChoosePoolSection} from '../../common/SelectPool'
import {SlippageTolerance} from '../../common/SlippageTolerance'
import {AddTokenFromCard} from '../AddTokens/AddTokenFromCard'
import {AddTokenToCard} from '../AddTokens/AddTokenToCard'
import {SwitchAndClear} from '../SwitchAndClear/SwitchAndClear'

export const StartSwapTokensScreen = () => {
  const strings = useStrings()

  const handleButtonClick = (event: GestureResponderEvent) => {
    console.log('Button clicked!', event)
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={86}
      >
        <View style={styles.buttonsGroup}>
          <ButtonGroup buttons={[strings.marketButton, strings.limitButton]} onButtonPress={handleButtonClick} />

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

        <MarketPrice disabled={true} />

        <SlippageTolerance />

        <ChoosePoolSection />

        <Actions>
          <Button testID="swapButton" shelleyTheme title={strings.swap} />
        </Actions>
      </KeyboardAvoidingView>
    </View>
  )
}

const Actions = ({style, ...props}: ViewProps) => <View style={[styles.actions, style]} {...props} />

const messages = defineMessages({
  marketButton: {
    id: 'swap.swapScreen.marketButton',
    defaultMessage: '!!!Market Button',
  },
  limitButton: {
    id: 'swap.swapScreen.limitButton',
    defaultMessage: '!!!Limit Button',
  },
  swap: {
    id: 'swap.swapScreen.swapTitle',
    defaultMessage: '!!!Swap',
  },
})

const useStrings = () => {
  const intl = useIntl()
  return {
    marketButton: intl.formatMessage(messages.marketButton),
    limitButton: intl.formatMessage(messages.limitButton),
    swap: intl.formatMessage(messages.swap),
  }
}

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
