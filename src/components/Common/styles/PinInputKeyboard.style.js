// @flow

import {StyleSheet} from 'react-native'

export default StyleSheet.create({
  keyboardSafeAreaView: {
    backgroundColor: '#D8D8D8',
    flex: 1,
  },
  keyboard: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardRow: {
    flex: 1,
    flexDirection: 'row',
  },
  keyboardKey: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 2 * StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: '#B7B7B7',
  },
  keyboardKeyDisabled: {
    backgroundColor: '#D8D8D8',
  },
  keyboardKeyText: {
    fontSize: 30,
    lineHeight: 35,
    textAlign: 'center',
  },
})
