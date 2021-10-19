// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  wrapper: {
    height: 86,
    marginTop: 24,
    marginHorizontal: 16,
  },
  wrapperWithDisclaimer: {
    height: 110,
  },
  simpleWrapper: {
    marginHorizontal: 16,
  },
  stats: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
    height: 24,
  },
  label: {
    color: COLORS.DARK_TEXT,
    marginRight: 12,
    lineHeight: 24,
    fontSize: 14,
  },
  value: {
    lineHeight: 24,
    fontSize: 16,
    color: COLORS.DARK_TEXT,
  },
  disclaimerText: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 14,
    fontStyle: 'italic',
  },
})
