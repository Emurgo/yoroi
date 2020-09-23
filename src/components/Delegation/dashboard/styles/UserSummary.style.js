// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  wrapper: {
    height: 244,
    marginTop: 24,
    marginHorizontal: 16,
  },
  stats: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  row: {
    flexDirection: 'row',
    height: 46,
  },
  icon: {
    marginLeft: 8,
    marginRight: 18,
  },
  amountBlock: {
    flexDirection: 'column',
  },
  label: {
    color: COLORS.DARK_TEXT,
    marginRight: 12,
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
