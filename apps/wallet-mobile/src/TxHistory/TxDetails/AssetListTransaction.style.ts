import {StyleSheet} from 'react-native'

import {brand, COLORS} from '../../theme'

export default StyleSheet.create({
  assetHeading: {
    color: COLORS.BLACK,
    opacity: 0.5,
    fontSize: 12,
  },
  assetMeta: {
    color: COLORS.TEXT_GRAY2,
    opacity: 0.5,
    fontSize: 14,
  },
  assetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  assetTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  assetName: {
    fontFamily: brand.defaultFont,
    fontSize: 14,
    color: COLORS.TEXT_GRAY,
    marginBottom: 2,
  },
  assetBalanceView: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  assetBalance: {
    fontFamily: brand.defaultFont,
    fontSize: 14,
    color: COLORS.BLACK,
  },
  py5: {
    paddingVertical: 10,
  },
  px5: {
    paddingHorizontal: 0,
  },
  rowColor1: {
    backgroundColor: 'transparent',
  },
  rowColor2: {
    backgroundColor: 'transparent',
  },
  tokenMetaView: {
    flex: 2,
  },
})
