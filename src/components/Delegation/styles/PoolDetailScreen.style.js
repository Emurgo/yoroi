// @flow

import {StyleSheet} from 'react-native'

import {spacing, COLORS} from '../../../styles/config'

export default StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 32,
  },
  heading: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.paragraphBottomMargin,
  },
  title: {
    fontSize: 16,
    color: COLORS.SHELLEY_BLUE,
    marginBottom: spacing.paragraphBottomMargin,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  buttons: {
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
})
