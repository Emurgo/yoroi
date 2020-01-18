// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../../styles/config'

export default StyleSheet.create({
  wrapper: {
    height: 150,
    marginTop: 24,
    marginHorizontal: 16,
    // backgroundColor: 'aquamarine', // TODO: delete
  },
  stats: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginLeft: 24,
    // backgroundColor: 'pink', // TODO: delete
  },
  row: {
    flexDirection: 'row',
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
