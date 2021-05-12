// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  topBlock: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  poolName: {
    lineHeight: 24,
    fontSize: 16,
  },
  poolHashBlock: {
    flexDirection: 'row',
  },
  poolHash: {
    color: COLORS.LIGHT_GRAY_TEXT,
    lineHeight: 22,
    fontSize: 14,
    width: 200,
  },
  spacedElem: {
    paddingLeft: 5,
  },
  image: {
    width: 24,
    height: 24,
  },

  bottomBlock: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  warning: {
    padding: 8,
  },
  warningText: {
    fontStyle: 'italic',
    fontSize: 12,
    lineHeight: 14,
  },
})
