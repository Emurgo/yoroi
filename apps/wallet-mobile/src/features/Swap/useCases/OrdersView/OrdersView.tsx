import React from 'react'
import {GestureResponderEvent, KeyboardAvoidingView, Platform, StyleSheet, View} from 'react-native'

import {COLORS} from '../../../../theme'
import {ButtonGroup} from '../../common/ButtonGroup'
import {useStrings} from '../../common/strings'

export const OrdersView = () => {
  const strings = useStrings()

  const handleButtonClick = (event: GestureResponderEvent) => {
    console.log('Button clicked!', event)
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboard}
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
  keyboard: {
    flex: 1,
  },
})
