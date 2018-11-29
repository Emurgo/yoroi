// @flow
import {StyleSheet} from 'react-native'
import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  root: {
    flex: 1,
  },
  titleContainer: {
    flex: 1,
    backgroundColor: COLORS.DARK_BLUE,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  title: {
    color: COLORS.WHITE,
    fontSize: 23,
    lineHeight: 25,
  },
  subtitle: {
    color: COLORS.WHITE,
    fontSize: 17,
  },
  subtitleContainer: {
    backgroundColor: COLORS.DARK_BLUE,
    alignItems: 'center',
    paddingBottom: 30,
  },
  pinContainer: {
    flex: 0,
    backgroundColor: COLORS.DARK_BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    margin: 15,
    backgroundColor: COLORS.WHITE,
  },
  pinInactive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    margin: 15,
    opacity: 0.5,
    backgroundColor: COLORS.WHITE,
  },
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
    borderColor: '#8C8C8C',
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
