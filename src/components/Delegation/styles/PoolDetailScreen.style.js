// @flow

import {StyleSheet} from 'react-native'

import {spacing, COLORS} from '../../../styles/config'

export default StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: 24,
  },
  heading: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.paragraphBottomMargin,
  },
  title: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
    color: COLORS.SHELLEY_BLUE,
    marginBottom: spacing.paragraphBottomMargin,
  },
  button: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  buttons: {
    flexDirection: 'row',
    paddingTop: 12,
  },
})
