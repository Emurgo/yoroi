// @flow

import {StyleSheet} from 'react-native'

import {COLORS, spacing} from '../../../styles/config'

export default StyleSheet.create({
  content: {
    flex: 1,
    padding: 24,
  },
  heading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.paragraphBottomMargin,
  },
  title: {
    fontSize: 16,
    color: COLORS.SHELLEY_BLUE,
    paddingBottom: spacing.paragraphBottomMargin,
  },
  button: {
    padding: 8,
  },
})
