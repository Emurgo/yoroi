// @flow
import {StyleSheet} from 'react-native'

import stylesConfig, {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  itemContainer: {
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  leftSide: {
    borderRightWidth: 1,
    borderColor: COLORS.DIVIDER,
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'row',
  },
  walletAvatar: {
    marginRight: 12,
  },
  walletDetails: {
    justifyContent: 'space-between',
  },
  walletName: {
    fontFamily: stylesConfig.defaultFont,
    fontSize: 16,
    color: COLORS.WHITE,
  },
  walletMeta: {
    color: COLORS.WHITE,
    opacity: 0.5,
    fontSize: 10,
  },
  rightSide: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    justifyContent: 'center',
    paddingLeft: 16,
  },
  iconWrapper: {
    height: 32,
    width: 32,
    borderWidth: 1,
    borderColor: COLORS.WHITE,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
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
  expandableView: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderColor: COLORS.DIVIDER,
    borderTopWidth: 1,
  },
  walletBalance: {
    flexDirection: 'row',
    marginBottom: 36,
  },
})
