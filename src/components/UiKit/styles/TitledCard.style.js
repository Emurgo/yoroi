// @flow

import {StyleSheet} from 'react-native'

import {COLORS} from '../../../styles/config'

export default StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    height: 28,
    lineHeight: 24,
    color: COLORS.DARK_GRAY,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    elevation: 2,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 2},
    shadowColor: COLORS.SHADOW_COLOR,
    backgroundColor: COLORS.BACKGROUND,
  },
  poolInfoContent: {
    padding: 0,
    flexDirection: 'column',
  },
})
