// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  wrapper: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  topBlock: {
    backgroundColor: COLORS.BACKGROUND_LIGHT_GRAY,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  pooName: {
    lineHeight: 24,
    fontSize: 16,
  },
  poolHashBlock: {
    flexDirection: 'row',
    marginTop: 6,
  },
  poolHash: {
    color: COLORS.LIGHT_GRAY_TEXT,
    lineHeight: 22,
    fontSize: 14,
    width: 200,
  },
  bottomBlock: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
})
