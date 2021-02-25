// @flow
import {StyleSheet} from 'react-native'

import stylesConfig, {COLORS} from '../../../../styles/config'

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
    fontFamily: stylesConfig.defaultFont,
    fontSize: 14,
    color: COLORS.TEXT_GRAY,
    marginBottom: 2,
  },
  assetBalance: {
    fontFamily: stylesConfig.defaultFont,
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
  tokenMeta: {
    width: '80%',
  },
})
