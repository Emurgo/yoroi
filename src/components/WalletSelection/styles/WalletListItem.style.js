// @flow
import {StyleSheet} from 'react-native'

import stylesConfig, {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  item: {
    // padding: 10,
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 68,
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  leftSide: {
    flexDirection: 'row',
  },
  walletAvatar: {
    height: 32,
    width: 32,
    borderRadius: 4,
    borderColor: COLORS.WHITE,
    borderWidth: 0.5,
    marginRight: 12,
    marginTop: 5,
  },
  walletName: {
    fontFamily: stylesConfig.defaultFont,
    fontSize: 16,
    color: COLORS.WHITE,
    lineHeight: 24,
  },
  walletChecksum: {
    color: COLORS.WHITE,
    opacity: 0.5,
    fontSize: 10,
    lineHeight: 16,
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  iconWrapper: {
    height: 25,
    width: 25,
    padding: 4,
    borderRadius: 8,
    marginBottom: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueBackground: {
    backgroundColor: '#1036A0',
  },
  iconText: {
    color: '#FFF',
    opacity: 0.5,
    fontSize: 10,
    lineHeight: 16,
  },
})
