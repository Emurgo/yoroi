// @flow
import {StyleSheet} from 'react-native'
import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  root: {
    flex: 1,
  },
  infoContainer: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: COLORS.WHITE,
    fontSize: 23,
    lineHeight: 25,
  },
  subtitle: {
    color: COLORS.WHITE,
    fontSize: 14,
    marginVertical: 5,
    maxWidth: '60%',
    minHeight: 30,
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    width: 12,
    height: 12,
    borderRadius: 10,
    marginHorizontal: 15,
    backgroundColor: COLORS.WHITE,
  },
  pinInactive: {
    opacity: 0.5,
  },
  keyboardSafeAreaView: {
    backgroundColor: '#D8D8D8',
    flex: 2,
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
