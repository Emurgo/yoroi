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
  poolHash: {
    color: COLORS.LIGHT_GRAY_TEXT,
    lineHeight: 22,
    fontSize: 14,
  },
})
