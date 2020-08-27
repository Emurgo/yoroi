// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  wrapper: {
    height: 140,
    marginTop: 24,
    marginHorizontal: 16,
  },
  stats: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 24,
    marginBottom: 10,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: 24,
  },
  label: {
    color: COLORS.GRAY,
    marginRight: 12,
    lineHeight: 24,
    fontSize: 14,
  },
  value: {
    lineHeight: 24,
    fontSize: 16,
    color: COLORS.DARK_GRAY,
  },
  timeWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  timeBlock: {
    width: 28,
    lineHeight: 24,
    fontSize: 16,
    color: COLORS.DARK_TEXT,
    marginHorizontal: 4,
    paddingHorizontal: 4,
    borderRadius: 2,
    backgroundColor: COLORS.BANNER_GREY,
    textAlign: 'center',
  },
})
