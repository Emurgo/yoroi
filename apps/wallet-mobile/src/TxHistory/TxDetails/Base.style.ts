import {StyleSheet} from 'react-native'

import {brand, COLORS} from '../../theme'

export default StyleSheet.create({
  assetHeading: {
    color: COLORS.WHITE,
    opacity: 0.5,
    fontSize: 10,
  },
  assetMeta: {
    color: COLORS.WHITE,
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
  assetBalanceView: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  assetName: {
    fontFamily: brand.defaultFont,
    fontSize: 14,
    color: COLORS.WHITE,
    marginBottom: 2,
  },
  assetBalance: {
    fontFamily: brand.defaultFont,
    fontSize: 14,
    color: COLORS.WHITE,
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
