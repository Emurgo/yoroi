// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  stats: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  row: {
    flex: 1,
    paddingVertical: 8,
    flexDirection: 'row',
  },
  icon: {
    paddingLeft: 8,
    paddingRight: 18,
  },
  amountBlock: {
    flexDirection: 'column',
  },
  label: {
    color: COLORS.DARK_TEXT,
    lineHeight: 24,
    fontSize: 14,
  },
  value: {
    color: COLORS.DARK_GRAY,
    lineHeight: 24,
    fontSize: 16,
  },
  withdrawBlock: {
    flex: 1,
    padding: 5,
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  withdrawButton: {
    minHeight: 18,
  },
})
