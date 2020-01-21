// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  wrapper: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  text: {
    textAlign: 'center',
    color: COLORS.DARK_TEXT,
    lineHeight: 22,
  },
  textFirstLine: {
    fontSize: 16,
    marginBottom: 12,
  },
  textSecondLine: {
    fontSize: 14,
    marginBottom: 16,
  },
})
