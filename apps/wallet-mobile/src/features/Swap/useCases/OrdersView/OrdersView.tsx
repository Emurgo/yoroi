import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {GestureResponderEvent, KeyboardAvoidingView, Platform, StyleSheet, View} from 'react-native'

import {COLORS} from '../../../../theme'
import {ButtonGroup} from '../../common/ButtonGroup'

export const OrdersView = () => {
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
          <ButtonGroup buttons={[strings.openOrders, strings.completedOrders]} onButtonPress={handleButtonClick} />
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const messages = defineMessages({
  openOrders: {
    id: 'swap.swapScreen.openOrders',
    defaultMessage: '!!!Open orders',
  },
  completedOrders: {
    id: 'swap.swapScreen.completedOrders',
    defaultMessage: '!!!Completed orders',
  },
})

const useStrings = () => {
  const intl = useIntl()
  return {
    openOrders: intl.formatMessage(messages.openOrders),
    completedOrders: intl.formatMessage(messages.completedOrders),
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
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
})
